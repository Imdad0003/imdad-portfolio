import { doc, setDoc, Firestore } from "firebase/firestore";

export interface ChunkErrorDetails {
  chunkIndex: number;
  totalChunks: number;
  errorMessage: string;
  retryAttempt: number;
  maxRetries: number;
  timestamp: number;
  isTerminal?: boolean;
}

export interface UploadProgressInfo {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  completedChunks: number;
  totalChunks: number;
  speedMBps: number;
  speedFormatted: string;
  activeConcurrency: number;
  estimatedSecondsRemaining: number;
  isStalled: boolean;
  stalledSeconds: number;
  retriedChunks: number;
  lastError?: ChunkErrorDetails | null;
}

export interface ChunkUploaderOptions {
  file: File;
  sessionId: string;
  chunkSize: number;
  totalChunks: number;
  idToken: string;
  signal: AbortSignal;
  db?: Firestore | null;
  writeChunk?: (chunkIndex: number, base64Data: string, size: number) => Promise<void>;
  initialConcurrency?: number;
  minConcurrency?: number;
  maxConcurrency?: number;
  onProgress?: (info: UploadProgressInfo) => void;
  onLog?: (message: string) => void;
}

/**
 * Fast, memory-efficient Base64 conversion.
 * In browser environments, uses native C++ FileReader for sub-millisecond conversion
 * without creating intermediate JavaScript number arrays or triggering GC pauses.
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  if (typeof FileReader !== "undefined") {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (!result) {
          reject(new Error("FileReader produced an empty result."));
          return;
        }
        const commaIndex = result.indexOf(",");
        resolve(commaIndex >= 0 ? result.substring(commaIndex + 1) : result);
      };
      reader.onerror = () => {
        reject(reader.error || new Error("FileReader failed to convert chunk."));
      };
      reader.readAsDataURL(blob);
    });
  }

  // Node.js or Web Worker fallback
  const arrayBuf = await blob.arrayBuffer();
  return Buffer.from(arrayBuf).toString("base64");
}

/**
 * High-Throughput Concurrent Chunk Uploader
 *
 * Implements bounded adaptive concurrency (4 -> 6 -> 8 workers), independent per-chunk
 * retries with exponential backoff, sliding-window throughput calculation, and stalled-upload
 * detection. Bypasses Vercel request limits by uploading directly to Firestore with server route fallback.
 */
export class ConcurrentChunkUploader {
  private file: File;
  private sessionId: string;
  private chunkSize: number;
  private totalChunks: number;
  private idToken: string;
  private signal: AbortSignal;
  private db?: Firestore | null;
  private writeChunk?: (chunkIndex: number, base64Data: string, size: number) => Promise<void>;

  private currentConcurrency: number;
  private minConcurrency: number;
  private maxConcurrency: number;

  private pendingQueue: number[] = [];
  private inFlight: Set<number> = new Set();
  private completed: Set<number> = new Set();
  private retryCounts: Map<number, number> = new Map();
  private chunkDurations: number[] = []; // Latency history of recent chunks in ms
  private recentTransfers: { time: number; bytes: number }[] = []; // Rolling 5-second window
  private totalRetriedChunks: number = 0;

  private startTime: number = 0;
  private lastProgressTime: number = 0;
  private isStalled: boolean = false;
  private stalledSeconds: number = 0;
  private lastError: ChunkErrorDetails | null = null;
  private monitorInterval: NodeJS.Timeout | null = null;

  private onProgress?: (info: UploadProgressInfo) => void;
  private onLog?: (message: string) => void;

  constructor(options: ChunkUploaderOptions) {
    this.file = options.file;
    this.sessionId = options.sessionId;
    this.chunkSize = options.chunkSize;
    this.totalChunks = options.totalChunks;
    this.idToken = options.idToken;
    this.signal = options.signal;
    this.db = options.db;
    this.writeChunk = options.writeChunk;

    // Begin with 1 worker to ensure the first chunk write succeeds reliably,
    // then evaluateAdaptiveConcurrency() ramps up to 4, 6, and 8.
    this.initialConcurrency = options.initialConcurrency ?? 1;
    this.currentConcurrency = this.initialConcurrency;
    this.minConcurrency = options.minConcurrency ?? 1;
    this.maxConcurrency = options.maxConcurrency ?? 8;

    this.onProgress = options.onProgress;
    this.onLog = options.onLog;

    // Populate initial pending chunk indices (0 to totalChunks - 1)
    for (let i = 0; i < this.totalChunks; i++) {
      this.pendingQueue.push(i);
    }
  }

  private initialConcurrency: number;

  /**
   * Starts the concurrent upload pipeline and resolves when all chunks have landed in Firestore.
   */
  public async start(): Promise<void> {
    this.startTime = Date.now();
    this.lastProgressTime = Date.now();

    // Start 500ms ticker for rolling speed calculation, ETA, and stalled detection
    this.startMonitor();

    try {
      await this.runWorkerPool();

      // Ensure 100% completion before returning
      if (this.completed.size !== this.totalChunks) {
        throw new Error(
          `Incomplete upload: ${this.completed.size} of ${this.totalChunks} chunks succeeded.`
        );
      }

      this.emitProgress(100);
    } finally {
      this.stopMonitor();
    }
  }

  /**
   * Spawns and manages workers up to currentConcurrency until all chunks succeed.
   */
  private async runWorkerPool(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let activeWorkers = 0;
      let hasError = false;
      let terminalError: Error | null = null;

      const checkNext = () => {
        if (hasError) return;

        if (this.signal.aborted) {
          hasError = true;
          reject(new Error("Upload cancelled by administrator."));
          return;
        }

        // All chunks finished!
        if (this.completed.size === this.totalChunks) {
          resolve();
          return;
        }

        // Spawn workers up to current concurrency limit
        while (
          activeWorkers < this.currentConcurrency &&
          this.pendingQueue.length > 0 &&
          !hasError
        ) {
          const chunkIndex = this.pendingQueue.shift();
          if (chunkIndex === undefined) break;

          activeWorkers++;
          this.inFlight.add(chunkIndex);

          this.uploadSingleChunk(chunkIndex)
            .then(() => {
              activeWorkers--;
              this.inFlight.delete(chunkIndex);
              this.completed.add(chunkIndex);
              this.lastProgressTime = Date.now();
              this.isStalled = false;
              this.stalledSeconds = 0;
              this.lastError = null;

              // Check if we should dynamically scale concurrency
              this.evaluateAdaptiveConcurrency();

              this.emitProgress();
              checkNext();
            })
            .catch((err: unknown) => {
              activeWorkers--;
              this.inFlight.delete(chunkIndex);

              if (this.signal.aborted) {
                hasError = true;
                reject(new Error("Upload cancelled by administrator."));
                return;
              }

              const errorMsg = err instanceof Error ? err.message : String(err);
              const retries = (this.retryCounts.get(chunkIndex) || 0) + 1;
              this.retryCounts.set(chunkIndex, retries);
              this.totalRetriedChunks++;

              this.lastError = {
                chunkIndex,
                totalChunks: this.totalChunks,
                errorMessage: errorMsg,
                retryAttempt: retries,
                maxRetries: 4,
                timestamp: Date.now(),
              };
              this.emitProgress();

              // Adaptive throttling: If network rate-limiting or timeout, reduce concurrency
              if (
                errorMsg.includes("429") ||
                errorMsg.includes("resource-exhausted") ||
                errorMsg.includes("timeout") ||
                errorMsg.includes("quota")
              ) {
                this.currentConcurrency = Math.max(
                  this.minConcurrency,
                  this.currentConcurrency - 2
                );
                this.log(
                  `[Chunk ${chunkIndex + 1}] Throttled: reduced concurrency to ${this.currentConcurrency}`
                );
              }

              if (retries <= 4) {
                // Exponential backoff with jitter: 800ms * 1.5^retries + 0-400ms jitter
                const backoffMs = Math.min(
                  8000,
                  Math.floor(800 * Math.pow(1.5, retries) + Math.random() * 400)
                );
                this.log(
                  `[Chunk ${chunkIndex + 1}/${this.totalChunks}] Upload failed (${errorMsg}). Retrying in ${backoffMs}ms (attempt ${retries}/4)...`
                );

                setTimeout(() => {
                  if (!hasError && !this.signal.aborted) {
                    this.pendingQueue.push(chunkIndex);
                    checkNext();
                  }
                }, backoffMs);
              } else {
                hasError = true;
                this.lastError = {
                  chunkIndex,
                  totalChunks: this.totalChunks,
                  errorMessage: errorMsg,
                  retryAttempt: retries,
                  maxRetries: 4,
                  timestamp: Date.now(),
                  isTerminal: true,
                };
                this.emitProgress();
                terminalError = new Error(
                  `Failed uploading chunk ${chunkIndex + 1}/${this.totalChunks} after 4 attempts: ${errorMsg}`
                );
                reject(terminalError);
              }
            });
        }
      };

      // Kick off initial workers
      checkNext();
    });
  }

  /**
   * Uploads an individual chunk via direct Firestore Web SDK write, with fallback to server endpoint.
   */
  private async uploadSingleChunk(chunkIndex: number): Promise<void> {
    const chunkStartMs = Date.now();
    const start = chunkIndex * this.chunkSize;
    const end = Math.min(start + this.chunkSize, this.file.size);
    const chunkBlob = this.file.slice(start, end);
    const chunkSizeActual = end - start;

    if (this.signal.aborted) {
      throw new Error("Upload cancelled by administrator.");
    }

    // Custom injected writer (used in testing or direct staging)
    if (this.writeChunk) {
      const chunkBase64 = await blobToBase64(chunkBlob);
      if (this.signal.aborted) {
        throw new Error("Upload cancelled by administrator.");
      }
      await this.writeChunk(chunkIndex, chunkBase64, chunkSizeActual);
      this.recordSuccess(chunkSizeActual, Date.now() - chunkStartMs);
      return;
    }

    let directWriteError: string | null = null;

    // Primary Path: Direct authenticated client write to Firestore
    if (this.db) {
      try {
        const chunkBase64 = await blobToBase64(chunkBlob);

        if (this.signal.aborted) {
          throw new Error("Upload cancelled by administrator.");
        }

        let timeoutId: NodeJS.Timeout | null = null;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("Direct Firestore write timed out after 12s."));
          }, 12000);
        });

        try {
          await Promise.race([
            setDoc(
              doc(this.db, "stagingReleaseSessions", this.sessionId, "chunks", String(chunkIndex)),
              {
                index: chunkIndex,
                data: chunkBase64,
                size: chunkSizeActual,
                receivedAt: Date.now(),
              }
            ),
            timeoutPromise,
          ]);
        } finally {
          if (timeoutId) clearTimeout(timeoutId);
        }

        this.recordSuccess(chunkSizeActual, Date.now() - chunkStartMs);
        return;
      } catch (err: unknown) {
        directWriteError = err instanceof Error ? err.message : String(err);
      }
    }

    // Secondary Path: Upload through authenticated server route
    try {
      const formData = new FormData();
      formData.append("sessionId", this.sessionId);
      formData.append("chunkIndex", String(chunkIndex));
      formData.append("totalChunks", String(this.totalChunks));
      formData.append("chunk", chunkBlob, `chunk_${chunkIndex}.bin`);

      const res = await fetch("/api/admin/apps/releases/chunk", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.idToken}`,
        },
        body: formData,
        signal: this.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error || `Server chunk endpoint returned HTTP ${res.status}`
        );
      }

      this.recordSuccess(chunkSizeActual, Date.now() - chunkStartMs);
    } catch (err: unknown) {
      if (this.signal.aborted) throw err;
      const fallbackMsg = err instanceof Error ? err.message : String(err);
      throw new Error(
        directWriteError
          ? `Direct: ${directWriteError} | Fallback: ${fallbackMsg}`
          : fallbackMsg
      );
    }
  }

  /**
   * Records chunk completion metrics for throughput and adaptive concurrency.
   */
  private recordSuccess(bytes: number, durationMs: number): void {
    const now = Date.now();
    this.chunkDurations.push(durationMs);
    if (this.chunkDurations.length > 12) {
      this.chunkDurations.shift();
    }

    this.recentTransfers.push({ time: now, bytes });
    // Keep only transfers within the last 5000ms
    const cutoff = now - 5000;
    while (this.recentTransfers.length > 0 && this.recentTransfers[0].time < cutoff) {
      this.recentTransfers.shift();
    }
  }

  /**
   * Dynamically increases concurrency:
   * First ensures ONE chunk write succeeds reliably, then scales to 4, followed by 6 and 8.
   */
  private evaluateAdaptiveConcurrency(): void {
    if (this.currentConcurrency >= this.maxConcurrency) return;

    // Requirement: "First make ONE chunk write succeed reliably. Then test 4 workers, followed by 6 and 8."
    if (this.completed.size >= 1 && this.currentConcurrency < 4) {
      this.currentConcurrency = Math.min(this.maxConcurrency, 4);
      this.log(`Initial chunk verified successfully: scaled concurrency to ${this.currentConcurrency} workers.`);
      return;
    }

    if (this.chunkDurations.length >= 4) {
      const recentLatencies = this.chunkDurations.slice(-4);
      const avgLatency =
        recentLatencies.reduce((sum, d) => sum + d, 0) / recentLatencies.length;

      if (avgLatency < 1500 && this.currentConcurrency < 6) {
        this.currentConcurrency = Math.min(this.maxConcurrency, 6);
        this.log(
          `Low latency detected (avg ${avgLatency.toFixed(0)}ms): scaled concurrency to 6 workers.`
        );
      } else if (avgLatency < 1200 && this.currentConcurrency < 8) {
        this.currentConcurrency = Math.min(this.maxConcurrency, 8);
        this.log(
          `Optimal latency detected (avg ${avgLatency.toFixed(0)}ms): scaled concurrency to 8 workers.`
        );
      }
    }
  }

  /**
   * Computes the current rolling upload speed and ETA.
   */
  private calculateMetrics(): {
    speedMBps: number;
    speedFormatted: string;
    estimatedSecondsRemaining: number;
  } {
    const now = Date.now();
    const cutoff = now - 5000;

    // Prune old transfer records
    while (this.recentTransfers.length > 0 && this.recentTransfers[0].time < cutoff) {
      this.recentTransfers.shift();
    }

    let speedMBps = 0;

    if (this.recentTransfers.length >= 2) {
      const windowBytes = this.recentTransfers.reduce((acc, t) => acc + t.bytes, 0);
      const timeSpanSec = (now - this.recentTransfers[0].time) / 1000;
      if (timeSpanSec > 0.3) {
        speedMBps = windowBytes / (1024 * 1024) / timeSpanSec;
      }
    }

    // Fall back to overall elapsed speed if rolling window hasn't built up
    if (speedMBps <= 0) {
      const elapsedTotalSec = (now - this.startTime) / 1000;
      const completedBytes = this.getCompletedBytes();
      if (elapsedTotalSec > 0 && completedBytes > 0) {
        speedMBps = completedBytes / (1024 * 1024) / elapsedTotalSec;
      }
    }

    const completedBytes = this.getCompletedBytes();
    const remainingBytes = Math.max(0, this.file.size - completedBytes);
    const estimatedSecondsRemaining =
      speedMBps > 0.01 ? Math.ceil(remainingBytes / (1024 * 1024) / speedMBps) : 0;

    return {
      speedMBps,
      speedFormatted: `${speedMBps.toFixed(2)} MB/s`,
      estimatedSecondsRemaining,
    };
  }

  private getCompletedBytes(): number {
    let bytes = 0;
    for (const chunkIndex of this.completed) {
      const start = chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, this.file.size);
      bytes += end - start;
    }
    return bytes;
  }

  private emitProgress(forcePercentage?: number): void {
    if (!this.onProgress) return;

    const completedBytes = this.getCompletedBytes();
    const rawPct = (completedBytes / this.file.size) * 100;
    const percentage =
      forcePercentage !== undefined
        ? forcePercentage
        : Math.min(99, Math.round(rawPct));

    const { speedMBps, speedFormatted, estimatedSecondsRemaining } =
      this.calculateMetrics();

    this.onProgress({
      bytesTransferred: completedBytes,
      totalBytes: this.file.size,
      percentage,
      completedChunks: this.completed.size,
      totalChunks: this.totalChunks,
      speedMBps,
      speedFormatted,
      activeConcurrency: this.currentConcurrency,
      estimatedSecondsRemaining,
      isStalled: this.isStalled,
      stalledSeconds: this.stalledSeconds,
      retriedChunks: this.totalRetriedChunks,
      lastError: this.lastError,
    });
  }

  private startMonitor(): void {
    this.monitorInterval = setInterval(() => {
      const now = Date.now();
      const idleTimeMs = now - this.lastProgressTime;

      if (idleTimeMs >= 15000 && this.completed.size < this.totalChunks) {
        this.isStalled = true;
        this.stalledSeconds = Math.floor(idleTimeMs / 1000);
      } else {
        this.isStalled = false;
        this.stalledSeconds = 0;
      }

      this.emitProgress();
    }, 500);
  }

  private stopMonitor(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  private log(message: string): void {
    if (this.onLog) this.onLog(message);
  }
}
