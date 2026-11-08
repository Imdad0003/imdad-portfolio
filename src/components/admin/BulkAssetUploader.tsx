"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  FolderUp,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trash2,
  GripVertical,
  Maximize2,
  Sparkles,
  Image as ImageIcon,
  Film,
  ArrowUp,
  ArrowDown,
  Star,
  FileCheck,
  Pause,
  Play,
  Info,
} from "lucide-react";
import { GalleryItem } from "@/types/cms";
import {
  uploadStudioAssetResumable,
  deleteStudioAsset,
  ResumableUploadHandle,
  UploadProgressInfo,
} from "@/lib/storage";
import { validateMediaFile, sanitizeFileName } from "@/lib/asset-sanitizer";

export interface UploadQueueItem {
  id: string;
  file: File;
  relativePath: string;
  previewUrl: string;
  status: "pending" | "uploading" | "completed" | "error" | "cancelled";
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  error?: string;
  downloadUrl?: string;
  handle?: ResumableUploadHandle;
}

interface BulkAssetUploaderProps {
  category?: "projects" | "apps" | "services" | "general";
  subfolder?: string;
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  coverImageUrl?: string;
  onSetCoverImage?: (url: string) => void;
  maxFiles?: number;
  concurrency?: number;
}

export function BulkAssetUploader({
  category = "projects",
  subfolder,
  items,
  onChange,
  coverImageUrl,
  onSetCoverImage,
  maxFiles = 50,
  concurrency = 3,
}: BulkAssetUploaderProps) {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [activeUploads, setActiveUploads] = useState<number>(0);
  const [concurrencyLimit, setConcurrencyLimit] = useState<number>(concurrency);
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState<string>("");

  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const isProcessingQueueRef = useRef(false);

  // Clean up object URLs when unmounting or item cleared
  useEffect(() => {
    return () => {
      queue.forEach((q) => {
        if (q.previewUrl && q.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(q.previewUrl);
        }
      });
    };
  }, [queue]);

  // Queue orchestrator: processes pending items up to concurrencyLimit
  const processNextInQueue = useCallback(async () => {
    if (isProcessingQueueRef.current) return;
    isProcessingQueueRef.current = true;

    try {
      setQueue((prevQueue) => {
        const uploadingCount = prevQueue.filter((i) => i.status === "uploading").length;
        const slotsAvailable = concurrencyLimit - uploadingCount;

        if (slotsAvailable <= 0) return prevQueue;

        const nextPending = prevQueue.filter((i) => i.status === "pending").slice(0, slotsAvailable);
        if (nextPending.length === 0) return prevQueue;

        // Mark them uploading
        return prevQueue.map((item) => {
          if (nextPending.some((np) => np.id === item.id)) {
            return { ...item, status: "uploading", progress: 0 };
          }
          return item;
        });
      });
    } finally {
      isProcessingQueueRef.current = false;
    }
  }, [concurrencyLimit]);

  // Launch upload for items currently set to "uploading" without an active handle
  useEffect(() => {
    const uploadingItems = queue.filter((i) => i.status === "uploading" && !i.handle);
    if (uploadingItems.length === 0) return;

    uploadingItems.forEach((item) => {
      startSingleUpload(item);
    });
  }, [queue]);

  const startSingleUpload = (item: UploadQueueItem) => {
    try {
      const handle = uploadStudioAssetResumable(item.file, category, {
        subfolder,
        allowVideo: true,
        onProgress: (p: UploadProgressInfo) => {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? {
                    ...q,
                    progress: p.percentage,
                    bytesTransferred: p.bytesTransferred,
                    totalBytes: p.totalBytes,
                  }
                : q
            )
          );
        },
      });

      // Attach handle to item
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, handle } : q))
      );

      handle.promise
        .then((downloadUrl) => {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: "completed", progress: 100, downloadUrl, handle: undefined }
                : q
            )
          );

          // Add to items list if not already present
          const newItem: GalleryItem = {
            id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            url: downloadUrl,
            fileName: item.file.name,
            fileSize: item.file.size,
            fileType: item.file.type,
            sortOrder: items.length,
            caption: item.relativePath || item.file.name.replace(/\.[^/.]+$/, ""),
          };

          onChange([...items, newItem]);

          // Automatically set first image as cover image if none exists
          if (!coverImageUrl && onSetCoverImage && item.file.type.startsWith("image/")) {
            onSetCoverImage(downloadUrl);
          }

          // Trigger next
          setTimeout(processNextInQueue, 50);
        })
        .catch((err) => {
          const errMsg = err instanceof Error ? err.message : String(err);
          const isCancelled = err?.code === "storage/canceled" || errMsg.includes("cancel");

          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? {
                    ...q,
                    status: isCancelled ? "cancelled" : "error",
                    error: isCancelled ? "Cancelled" : errMsg,
                    handle: undefined,
                  }
                : q
            )
          );

          setTimeout(processNextInQueue, 50);
        });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: "error", error: errMsg } : q
        )
      );
      setTimeout(processNextInQueue, 50);
    }
  };

  // Add files to upload queue with duplicate check and validation
  const addFilesToQueue = async (fileList: Array<{ file: File; relativePath?: string }>) => {
    const newItems: UploadQueueItem[] = [];

    for (const { file, relativePath } of fileList) {
      // Check existing in gallery or queue
      const existingInGallery = items.some((g) => g.fileName === file.name && g.fileSize === file.size);
      const existingInQueue = queue.some((q) => q.file.name === file.name && q.file.size === file.size);

      if (existingInGallery || existingInQueue) {
        console.warn(`Skipping duplicate file: ${file.name}`);
        continue;
      }

      // Check max files
      if (items.length + queue.length + newItems.length >= maxFiles) {
        alert(`Maximum ${maxFiles} assets allowed. Additional files skipped.`);
        break;
      }

      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
      newItems.push({
        id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        relativePath: relativePath || file.name,
        previewUrl,
        status: "pending",
        progress: 0,
        bytesTransferred: 0,
        totalBytes: file.size,
      });
    }

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
      setTimeout(processNextInQueue, 50);
    }
  };

  // File input change handlers
  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).map((f) => ({
      file: f,
      relativePath: (f as any).webkitRelativePath || f.name,
    }));
    addFilesToQueue(files);
    e.target.value = "";
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).map((f) => ({
      file: f,
      relativePath: (f as any).webkitRelativePath || f.name,
    }));
    addFilesToQueue(files);
    e.target.value = "";
  };

  // Drag and drop recursively reading directory entries
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items) return;

    const filesWithPaths: Array<{ file: File; relativePath?: string }> = [];

    const readEntry = async (entry: any, currentPath = ""): Promise<void> => {
      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file((file: File) => {
            filesWithPaths.push({
              file,
              relativePath: currentPath ? `${currentPath}/${file.name}` : file.name,
            });
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        return new Promise((resolve) => {
          const readAllEntries = () => {
            dirReader.readEntries(async (entries: any[]) => {
              if (entries.length === 0) {
                resolve();
              } else {
                for (const subEntry of entries) {
                  await readEntry(subEntry, currentPath ? `${currentPath}/${entry.name}` : entry.name);
                }
                readAllEntries();
              }
            });
          };
          readAllEntries();
        });
      }
    };

    const promises: Promise<void>[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry?.();
        if (entry) {
          promises.push(readEntry(entry));
        } else {
          const file = item.getAsFile();
          if (file) filesWithPaths.push({ file, relativePath: file.name });
        }
      }
    }

    await Promise.all(promises);
    if (filesWithPaths.length > 0) {
      addFilesToQueue(filesWithPaths);
    }
  };

  // Cancel item
  const cancelItem = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (item?.handle) {
      item.handle.cancel();
    } else {
      setQueue((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "cancelled", error: "Cancelled" } : q))
      );
    }
  };

  // Retry item
  const retryItem = (id: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "pending", progress: 0, error: undefined } : q))
    );
    setTimeout(processNextInQueue, 50);
  };

  // Remove from queue
  const removeFromQueue = (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (item?.handle) {
      item.handle.cancel();
    }
    if (item?.previewUrl && item.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  // Clear completed from queue
  const clearCompletedQueue = () => {
    setQueue((prev) => prev.filter((q) => q.status !== "completed"));
  };

  // Cancel all in queue
  const cancelAllQueue = () => {
    queue.forEach((q) => {
      if (q.handle) q.handle.cancel();
    });
    setQueue((prev) =>
      prev.map((q) =>
        q.status === "uploading" || q.status === "pending"
          ? { ...q, status: "cancelled", error: "Cancelled" }
          : q
      )
    );
  };

  // Gallery item manipulations
  const moveItem = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[target];
    reordered[target] = temp;
    // update sortOrder
    const updated = reordered.map((item, idx) => ({ ...item, sortOrder: idx }));
    onChange(updated);
  };

  const deleteGalleryItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (confirm(`Remove asset "${item.caption || item.fileName || 'Image'}"?`)) {
      // Fire-and-forget deletion from storage
      deleteStudioAsset(item.url).catch(console.warn);
      const filtered = items.filter((i) => i.id !== id);
      onChange(filtered.map((it, idx) => ({ ...it, sortOrder: idx })));
      if (coverImageUrl === item.url && onSetCoverImage) {
        onSetCoverImage(filtered[0]?.url || "");
      }
    }
  };

  const saveCaption = (id: string) => {
    const updated = items.map((i) =>
      i.id === id ? { ...i, caption: captionInput } : i
    );
    onChange(updated);
    setEditingCaptionId(null);
  };

  // Queue metrics
  const totalQueueBytes = queue.reduce((acc, q) => acc + q.totalBytes, 0);
  const transferredQueueBytes = queue.reduce((acc, q) => acc + q.bytesTransferred, 0);
  const totalProgressPercent =
    totalQueueBytes > 0 ? Math.round((transferredQueueBytes / totalQueueBytes) * 100) : 0;
  const completedCount = queue.filter((q) => q.status === "completed").length;
  const inProgressCount = queue.filter((q) => q.status === "uploading").length;
  const errorCount = queue.filter((q) => q.status === "error").length;

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone & Action Bar */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all text-center ${
          isDragging
            ? "border-[#935073] bg-[#FAF4F9] scale-[1.005]"
            : "border-[#502D55]/20 bg-[#FAF4F9]/40 hover:bg-[#FAF4F9]/80"
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#502D55]/15 shadow-sm flex items-center justify-center mx-auto text-[#935073]">
            <Upload className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#180D1D]">
              Drag & Drop Project Folder or Media Files
            </h4>
            <p className="text-xs text-[#56475C] mt-1">
              Supports bulk folder upload with preserved paths. JPG, PNG, WEBP, sanitized SVG, MP4. Up to 15MB/image, 50MB/video.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => filesInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#180D1D] text-white hover:bg-[#2B1435] transition-all cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Select Files</span>
            </button>

            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0] hover:bg-[#F3E5D8] transition-all cursor-pointer shadow-xs"
            >
              <FolderUp className="w-3.5 h-3.5" />
              <span>Upload Entire Folder</span>
            </button>

            {/* Hidden native inputs */}
            <input
              ref={filesInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,video/webm"
              className="hidden"
              onChange={handleFilesSelect}
            />
            <input
              ref={folderInputRef}
              type="file"
              // @ts-expect-error webkitdirectory is standard in WebKit/Blink/Firefox
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
              onChange={handleFolderSelect}
            />
          </div>

          {/* Concurrency and limits controls */}
          <div className="flex items-center justify-center gap-4 pt-2 text-[11px] font-mono text-[#56475C]">
            <span className="flex items-center gap-1">
              <span>Concurrency:</span>
              <select
                value={concurrencyLimit}
                onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
                className="bg-white border border-[#502D55]/20 rounded-md px-1.5 py-0.5 text-[10px]"
              >
                <option value={1}>1 (Sequential)</option>
                <option value={2}>2 Parallel</option>
                <option value={3}>3 Parallel (Recommended)</option>
                <option value={5}>5 Parallel (Fast)</option>
              </select>
            </span>
            <span>•</span>
            <span>Total Assets: {items.length} / {maxFiles}</span>
          </div>
        </div>
      </div>

      {/* Active Upload Queue View */}
      {queue.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-[#502D55]/15 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#502D55]/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#180D1D]">
                Upload Queue ({completedCount}/{queue.length})
              </span>
              {inProgressCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{inProgressCount} uploading</span>
                </span>
              )}
              {errorCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-50 text-red-700 border border-red-200">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errorCount} failed</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {inProgressCount > 0 && (
                <button
                  type="button"
                  onClick={cancelAllQueue}
                  className="text-[11px] font-mono text-red-600 hover:underline cursor-pointer"
                >
                  Cancel All
                </button>
              )}
              {completedCount > 0 && inProgressCount === 0 && (
                <button
                  type="button"
                  onClick={clearCompletedQueue}
                  className="text-[11px] font-mono text-[#56475C] hover:text-[#180D1D] cursor-pointer"
                >
                  Clear Completed
                </button>
              )}
            </div>
          </div>

          {/* Total Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-[#56475C]">
              <span>Overall Progress</span>
              <span>
                {totalProgressPercent}% ({(transferredQueueBytes / (1024 * 1024)).toFixed(1)} / {(totalQueueBytes / (1024 * 1024)).toFixed(1)} MB)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#935073] to-[#502D55] transition-all duration-300"
                style={{ width: `${totalProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Queue Item Rows */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[#502D55]/10 pr-1 space-y-1">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 text-xs gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-8 h-8 rounded-lg object-cover shrink-0 border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      {item.file.type.startsWith("video/") ? (
                        <Film className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-bold text-[#180D1D] truncate text-[11px]">
                      {item.relativePath || item.file.name}
                    </p>
                    <p className="text-[10px] font-mono text-[#56475C]">
                      {(item.file.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                      {item.status === "completed" && (
                        <span className="text-emerald-600 font-bold">Uploaded</span>
                      )}
                      {item.status === "uploading" && (
                        <span className="text-blue-600 font-bold">{item.progress}%</span>
                      )}
                      {item.status === "pending" && <span className="text-gray-400">Queued</span>}
                      {item.status === "cancelled" && <span className="text-orange-600">Cancelled</span>}
                      {item.status === "error" && (
                        <span className="text-red-600 font-bold">{item.error || "Failed"}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Progress bar and control buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "uploading" && (
                    <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-200"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}

                  {item.status === "uploading" && (
                    <button
                      type="button"
                      onClick={() => cancelItem(item.id)}
                      className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-100 cursor-pointer"
                      title="Cancel upload"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {item.status === "completed" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}

                  {(item.status === "error" || item.status === "cancelled") && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => retryItem(item.id)}
                        className="p-1 rounded-md text-blue-600 hover:bg-blue-50 cursor-pointer"
                        title="Retry upload"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromQueue(item.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 cursor-pointer"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Gallery Grid (Reorder, Captions, Cover, Delete, Full-screen) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#56475C] font-bold">
            Project Gallery & Assets ({items.length})
          </h4>
          <span className="text-[11px] text-[#56475C]">
            Use arrows to reorder • Tap image for full-screen • Mark cover image
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-dashed border-[#502D55]/15 text-center text-xs text-[#56475C]">
            No assets uploaded yet. Drag a folder or click above to upload gallery images.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {items.map((item, index) => {
              const isCover = coverImageUrl === item.url;
              const isVideo = item.fileType?.startsWith("video/") || item.url.match(/\.(mp4|webm)(\?.*)?$/i);

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl bg-white border overflow-hidden shadow-xs transition-all hover:shadow-md ${
                    isCover
                      ? "border-[#935073] ring-2 ring-[#935073]/30"
                      : "border-[#502D55]/15 hover:border-[#502D55]/40"
                  }`}
                >
                  {/* Media Thumbnail */}
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden cursor-pointer"
                    onClick={() => setPreviewModalUrl(item.url)}
                  >
                    {isVideo ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                        <Film className="w-8 h-8 opacity-70" />
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.caption || item.fileName || "Project Asset"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}

                    {/* Cover Badge */}
                    {isCover && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#935073] text-white shadow-xs">
                        COVER
                      </span>
                    )}

                    {/* Preview overlay button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-5 h-5 drop-shadow" />
                    </div>
                  </div>

                  {/* Caption & Controls */}
                  <div className="p-2.5 space-y-2 bg-white">
                    {editingCaptionId === item.id ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={captionInput}
                          onChange={(e) => setCaptionInput(e.target.value)}
                          placeholder="Caption / description"
                          className="w-full px-2 py-1 rounded-md text-[10px] border border-[#502D55]/20 bg-[#FAF4F9]"
                          autoFocus
                        />
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingCaptionId(null)}
                            className="px-1.5 py-0.5 text-[9px] text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveCaption(item.id)}
                            className="px-2 py-0.5 text-[9px] font-bold bg-[#180D1D] text-white rounded-md"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingCaptionId(item.id);
                          setCaptionInput(item.caption || "");
                        }}
                        className="text-[11px] text-[#180D1D] font-medium truncate cursor-pointer hover:underline"
                        title={item.caption || "Click to add caption"}
                      >
                        {item.caption || <span className="text-gray-400 italic">Add caption...</span>}
                      </div>
                    )}

                    {/* Action Toolbar */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#502D55]/10 text-gray-500">
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveItem(index, "up")}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-20 cursor-pointer"
                          title="Move left/up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(index, "down")}
                          disabled={index === items.length - 1}
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-20 cursor-pointer"
                          title="Move right/down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Set as cover */}
                        {onSetCoverImage && !isCover && (
                          <button
                            type="button"
                            onClick={() => onSetCoverImage(item.url)}
                            className="p-1 rounded text-gray-400 hover:text-[#935073] hover:bg-pink-50 cursor-pointer"
                            title="Set as Project Cover"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                        )}

                        {/* Delete asset */}
                        <button
                          type="button"
                          onClick={() => deleteGalleryItem(item.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          title="Delete asset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Full-screen Preview Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-transparent rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {previewModalUrl.match(/\.(mp4|webm)(\?.*)?$/i) ? (
              <video
                src={previewModalUrl}
                controls
                autoPlay
                className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl"
              />
            ) : (
              <img
                src={previewModalUrl}
                alt="Full Preview"
                className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
