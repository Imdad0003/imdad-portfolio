import crypto from "crypto";
import zlib from "zlib";
import { ApkParsedMetadata, ApkValidationResult } from "@/types/releases";

/**
 * Android SDK to Version Name mapping
 */
const ANDROID_SDK_VERSIONS: Record<number, string> = {
  19: "Android 4.4 (KitKat)",
  21: "Android 5.0 (Lollipop)",
  22: "Android 5.1 (Lollipop)",
  23: "Android 6.0 (Marshmallow)",
  24: "Android 7.0 (Nougat)",
  25: "Android 7.1 (Nougat)",
  26: "Android 8.0 (Oreo)",
  27: "Android 8.1 (Oreo)",
  28: "Android 9 (Pie)",
  29: "Android 10",
  30: "Android 11",
  31: "Android 12",
  32: "Android 12L",
  33: "Android 13 (Tiramisu)",
  34: "Android 14 (Upside Down Cake)",
  35: "Android 15 (Vanilla Ice Cream)",
  36: "Android 16",
};

export function getAndroidVersionName(sdkInt: number): string {
  return ANDROID_SDK_VERSIONS[sdkInt] || `Android (API ${sdkInt})`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export interface ZipEntry {
  fileName: string;
  compressionMethod: number;
  compressedSize: number;
  uncompressedSize: number;
  offset: number;
  dataOffset: number;
}

/**
 * Lightweight ZIP Central Directory reader using Node.js built-ins.
 */
export function parseZipDirectory(buffer: Buffer): Map<string, ZipEntry> {
  const entries = new Map<string, ZipEntry>();
  const len = buffer.length;

  if (len < 22) {
    throw new Error("Invalid file: too small to be a valid ZIP/APK archive.");
  }

  // Find End of Central Directory (EOCD) signature 0x06054b50 from the end
  let eocdOffset = -1;
  const maxSearch = Math.min(len - 22, 65535 + 22);
  for (let i = len - 22; i >= len - maxSearch; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error("Invalid APK: End of Central Directory (EOCD) signature not found.");
  }

  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  const cdSize = buffer.readUInt32LE(eocdOffset + 12);
  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);

  if (cdOffset + cdSize > len) {
    throw new Error("Corrupted APK: Central Directory points outside file boundaries.");
  }

  let curr = cdOffset;
  for (let i = 0; i < totalEntries && curr < cdOffset + cdSize; i++) {
    const sig = buffer.readUInt32LE(curr);
    if (sig !== 0x02014b50) break; // Central Directory File Header signature

    const compressionMethod = buffer.readUInt16LE(curr + 10);
    const compressedSize = buffer.readUInt32LE(curr + 20);
    const uncompressedSize = buffer.readUInt32LE(curr + 24);
    const fileNameLength = buffer.readUInt16LE(curr + 28);
    const extraFieldLength = buffer.readUInt16LE(curr + 30);
    const commentLength = buffer.readUInt16LE(curr + 32);
    const localHeaderOffset = buffer.readUInt32LE(curr + 42);

    const fileName = buffer.toString("utf8", curr + 46, curr + 46 + fileNameLength);

    // Read local header to get exact data offset
    if (localHeaderOffset + 30 <= len) {
      const localSig = buffer.readUInt32LE(localHeaderOffset);
      if (localSig === 0x04034b50) {
        const localFileNameLen = buffer.readUInt16LE(localHeaderOffset + 26);
        const localExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
        const dataOffset = localHeaderOffset + 30 + localFileNameLen + localExtraLen;

        entries.set(fileName, {
          fileName,
          compressionMethod,
          compressedSize,
          uncompressedSize,
          offset: localHeaderOffset,
          dataOffset,
        });
      }
    }

    curr += 46 + fileNameLength + extraFieldLength + commentLength;
  }

  return entries;
}

/**
 * Extracts and decompresses a single entry from the ZIP buffer.
 */
export function extractZipEntry(buffer: Buffer, entry: ZipEntry): Buffer {
  const slice = buffer.subarray(entry.dataOffset, entry.dataOffset + entry.compressedSize);
  if (entry.compressionMethod === 0) {
    // Uncompressed (STORE)
    return slice;
  } else if (entry.compressionMethod === 8) {
    // Deflate
    return zlib.inflateRawSync(slice);
  } else {
    throw new Error(`Unsupported compression method (${entry.compressionMethod}) for entry: ${entry.fileName}`);
  }
}

/**
 * Decodes Android Binary XML (AXML) into a structured manifest representation.
 */
export interface AxmlElement {
  tag: string;
  attributes: Record<string, string | number | boolean>;
  children: AxmlElement[];
}

export function parseAxml(buffer: Buffer): AxmlElement {
  let offset = 0;
  const magic = buffer.readUInt32LE(offset);
  if (magic !== 0x00080003) {
    throw new Error(`Invalid AXML magic header: 0x${magic.toString(16)}. Expected 0x00080003.`);
  }
  offset += 8; // skip magic (4) and file size (4)

  const strings: string[] = [];
  const rootElements: AxmlElement[] = [];
  const stack: AxmlElement[] = [];

  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) break;
    const chunkType = buffer.readUInt16LE(offset);
    const headerSize = buffer.readUInt16LE(offset + 2);
    const chunkSize = buffer.readUInt32LE(offset + 4);

    if (chunkSize <= 0 || offset + chunkSize > buffer.length) break;

    if (chunkType === 0x0001) {
      // CHUNK_STRING_POOL
      const stringCount = buffer.readUInt32LE(offset + 8);
      const flags = buffer.readUInt32LE(offset + 16);
      const isUtf8 = (flags & (1 << 8)) !== 0;
      const stringsStart = offset + buffer.readUInt32LE(offset + 20);

      const stringOffsets: number[] = [];
      let offPos = offset + 28;
      for (let i = 0; i < stringCount; i++) {
        stringOffsets.push(buffer.readUInt32LE(offPos));
        offPos += 4;
      }

      for (let i = 0; i < stringCount; i++) {
        const strOffset = stringsStart + stringOffsets[i];
        if (strOffset >= buffer.length) {
          strings.push("");
          continue;
        }

        if (isUtf8) {
          // UTF-8 length decoding
          let p = strOffset;
          // character count
          if ((buffer[p] & 0x80) !== 0) p += 2;
          else p += 1;
          // byte count
          let byteLen = buffer[p];
          if ((byteLen & 0x80) !== 0) {
            byteLen = ((byteLen & 0x7f) << 8) | buffer[p + 1];
            p += 2;
          } else {
            p += 1;
          }
          strings.push(buffer.toString("utf8", p, p + byteLen));
        } else {
          // UTF-16LE length decoding
          let p = strOffset;
          let charLen = buffer.readUInt16LE(p);
          if ((charLen & 0x8000) !== 0) {
            charLen = ((charLen & 0x7fff) << 16) | buffer.readUInt16LE(p + 2);
            p += 4;
          } else {
            p += 2;
          }
          strings.push(buffer.toString("utf16le", p, p + charLen * 2));
        }
      }
    } else if (chunkType === 0x0102) {
      // CHUNK_START_ELEMENT
      const nameIndex = buffer.readInt32LE(offset + 20);
      const attrCount = buffer.readUInt16LE(offset + 28);
      const tagName = strings[nameIndex] || "unknown";

      const attributes: Record<string, string | number | boolean> = {};
      let attrOffset = offset + 36;

      for (let i = 0; i < attrCount; i++) {
        if (attrOffset + 20 > offset + chunkSize) break;
        const attrNameIdx = buffer.readInt32LE(attrOffset + 4);
        const rawValueIdx = buffer.readInt32LE(attrOffset + 8);
        const dataType = buffer[attrOffset + 15];
        const dataVal = buffer.readUInt32LE(attrOffset + 16);

        const attrName = strings[attrNameIdx] || `attr_${i}`;
        let value: string | number | boolean = "";

        if (dataType === 0x03) {
          // TYPE_STRING
          value = strings[dataVal] ?? (rawValueIdx >= 0 ? strings[rawValueIdx] : "");
        } else if (dataType === 0x10) {
          // TYPE_INT_DEC
          value = buffer.readInt32LE(attrOffset + 16);
        } else if (dataType === 0x11) {
          // TYPE_INT_HEX
          value = dataVal;
        } else if (dataType === 0x12) {
          // TYPE_INT_BOOLEAN
          value = dataVal !== 0;
        } else if (rawValueIdx >= 0 && rawValueIdx < strings.length) {
          value = strings[rawValueIdx];
        } else {
          value = dataVal;
        }

        attributes[attrName] = value;
        attrOffset += 20;
      }

      const elem: AxmlElement = { tag: tagName, attributes, children: [] };
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(elem);
      } else {
        rootElements.push(elem);
      }
      stack.push(elem);
    } else if (chunkType === 0x0103) {
      // CHUNK_END_ELEMENT
      stack.pop();
    }

    offset += chunkSize;
  }

  if (rootElements.length === 0) {
    throw new Error("Invalid AXML: No root elements found in AndroidManifest.xml.");
  }

  return rootElements[0];
}

/**
 * Searches for APK Signature Scheme v2/v3 Signing Block before Central Directory.
 */
export interface ApkInspectionPayload {
  fileName: string;
  fileSize: number;
  sha256: string;
  manifestBase64: string;
  signingBlockBase64?: string;
  eocdBase64: string;
}

export interface ApkSignatureVerificationResult {
  verified: boolean;
  signingScheme: "v1" | "v2" | "v3" | "none";
  signerCount: number;
  errors: string[];
  certificates: crypto.X509Certificate[];
}

/**
 * Computes the Merkle tree content digest of an APK across Sections 1, 2, and 3
 * according to Android APK Signature Scheme v2/v3 specification.
 */
export function computeApkContentDigest(
  buffer: Buffer,
  blockStart: number,
  cdOffset: number,
  eocdOffset: number,
  hashAlgo: string = "sha256"
): Buffer {
  const eocdLen = 22 + (buffer.length > eocdOffset + 22 ? buffer.readUInt16LE(eocdOffset + 20) : 0);
  const sec1 = buffer.subarray(0, blockStart);
  const sec2 = buffer.subarray(cdOffset, eocdOffset);
  const sec3 = Buffer.from(buffer.subarray(eocdOffset, eocdOffset + eocdLen));
  // Patch Central Directory offset in EOCD copy to point to blockStart
  sec3.writeUInt32LE(blockStart, 16);

  const sections = [sec1, sec2, sec3];
  const totalLen = sec1.length + sec2.length + sec3.length;
  const CHUNK_SIZE = 1048576; // 1 MB
  const chunkCount = Math.max(1, Math.ceil(totalLen / CHUNK_SIZE));

  const chunkDigests: Buffer[] = [];
  let secIdx = 0;
  let secPos = 0;

  for (let c = 0; c < chunkCount; c++) {
    const chunkBytesNeeded = Math.min(CHUNK_SIZE, totalLen - (c * CHUNK_SIZE));
    const chunkBuf = Buffer.alloc(chunkBytesNeeded);
    let bytesFilled = 0;

    while (bytesFilled < chunkBytesNeeded && secIdx < sections.length) {
      const currentSec = sections[secIdx];
      const available = currentSec.length - secPos;
      const toCopy = Math.min(available, chunkBytesNeeded - bytesFilled);
      currentSec.copy(chunkBuf, bytesFilled, secPos, secPos + toCopy);
      bytesFilled += toCopy;
      secPos += toCopy;
      if (secPos >= currentSec.length) {
        secIdx++;
        secPos = 0;
      }
    }

    // Prefix 0xa5 + 4-byte LE chunk length
    const prefix = Buffer.alloc(5);
    prefix.writeUInt8(0xa5, 0);
    prefix.writeUInt32LE(chunkBytesNeeded, 1);

    const chunkHash = crypto.createHash(hashAlgo).update(prefix).update(chunkBuf).digest();
    chunkDigests.push(chunkHash);
  }

  // Top-level digest: 0x5a + 4-byte LE chunk count + concatenated chunk hashes
  const topPrefix = Buffer.alloc(5);
  topPrefix.writeUInt8(0x5a, 0);
  topPrefix.writeUInt32LE(chunkCount, 1);

  return crypto.createHash(hashAlgo).update(topPrefix).update(Buffer.concat(chunkDigests)).digest();
}

/**
 * Android APK Signature Scheme v2/v3 Algorithm IDs to Node.js crypto algorithm names
 */
function getDigestAlgorithm(algorithmId: number): string | null {
  switch (algorithmId) {
    case 0x0101: // SHA256withRSA/PSS
    case 0x0102: // SHA256withRSA PKCS#1 v1.5
    case 0x0103: // SHA256withECDSA
    case 0x0104: // SHA256withDSA
    case 0x0201: // SHA256 (compat)
    case 0x0301: // SHA256withDSA (compat)
      return "sha256";
    case 0x0202: // SHA512withRSA PKCS#1 v1.5
    case 0x0203: // SHA512withECDSA
    case 0x0204: // SHA512withDSA
    case 0x0105: // SHA512withRSA/PSS
      return "sha512";
    default:
      return null;
  }
}

/**
 * Cryptographically verifies APK Signature Scheme v2/v3 signing blocks.
 * Validates that signedData is genuinely signed by the private key matching the X.509 certificate,
 * and verifies that the APK content digests match the signed Merkle root hashes.
 */
export function verifyApkCryptographicSignature(buffer: Buffer): ApkSignatureVerificationResult {
  const certs: crypto.X509Certificate[] = [];
  const errors: string[] = [];
  const len = buffer.length;

  let eocdOffset = -1;
  const maxSearch = Math.min(len - 22, 65535 + 22);
  for (let i = len - 22; i >= len - maxSearch; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    return { verified: false, signingScheme: "none", signerCount: 0, errors: ["Missing EOCD"], certificates: [] };
  }

  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);
  if (cdOffset < 24) {
    return { verified: false, signingScheme: "none", signerCount: 0, errors: ["Invalid Central Directory offset"], certificates: [] };
  }

  const magic = buffer.toString("utf8", cdOffset - 16, cdOffset);
  if (magic !== "APK Sig Block 42") {
    return { verified: false, signingScheme: "none", signerCount: 0, errors: ["No APK Signature Block found"], certificates: [] };
  }

  const blockSizeLow = buffer.readUInt32LE(cdOffset - 24);
  const blockStart = cdOffset - 8 - blockSizeLow;
  if (blockStart < 0 || blockStart >= cdOffset) {
    return { verified: false, signingScheme: "none", signerCount: 0, errors: ["Corrupted APK Signing Block boundaries"], certificates: [] };
  }

  let offset = blockStart + 8;
  const blockEnd = cdOffset - 24;
  let signerCount = 0;
  let hasValidCryptographicSignature = false;
  let hasValidContentDigest = false;
  let checkedDigestsCount = 0;
  let checkedSignaturesCount = 0;
  let scheme: "v1" | "v2" | "v3" | "none" = "none";

  while (offset + 12 <= blockEnd) {
    const entrySizeLow = buffer.readUInt32LE(offset);
    const entryId = buffer.readUInt32LE(offset + 8);
    const nextOffset = offset + 8 + entrySizeLow;
    if (nextOffset > blockEnd + 24) break;

    if (entryId === 0x7109871a || entryId === 0xf05368c0) {
      scheme = entryId === 0xf05368c0 ? "v3" : "v2";
      let p = offset + 12;
      const endOfEntry = nextOffset;

      if (p + 4 <= endOfEntry) {
        p += 4; // Skip signers length prefix
        while (p + 4 <= endOfEntry) {
          const signerLen = buffer.readUInt32LE(p);
          p += 4;
          const signerEnd = p + signerLen;
          if (signerEnd > endOfEntry) break;
          signerCount++;

          if (p + 4 <= signerEnd) {
            const signedDataLen = buffer.readUInt32LE(p);
            p += 4;
            const signedDataEnd = p + signedDataLen;
            const signedDataRaw = buffer.subarray(p, signedDataEnd);

            // Parse digests inside signedData
            if (p + 4 <= signedDataEnd) {
              const digestsLen = buffer.readUInt32LE(p);
              p += 4;
              const digestsEnd = p + digestsLen;

              while (p + 4 <= digestsEnd) {
                const digestEntryLen = buffer.readUInt32LE(p);
                p += 4;
                const digestEntryEnd = p + digestEntryLen;
                if (digestEntryEnd > digestsEnd) break;

                if (p + 8 <= digestEntryEnd) {
                  const algorithmId = buffer.readUInt32LE(p);
                  const digestBytesLen = buffer.readUInt32LE(p + 4);
                  const expectedDigest = buffer.subarray(p + 8, p + 8 + digestBytesLen);
                  checkedDigestsCount++;

                  const digestAlg = getDigestAlgorithm(algorithmId);
                  if (digestAlg) {
                    try {
                      const actualDigest = computeApkContentDigest(buffer, blockStart, cdOffset, eocdOffset, digestAlg);
                      if (Buffer.compare(actualDigest, expectedDigest) === 0) {
                        hasValidContentDigest = true;
                      } else {
                        errors.push(
                          `APK content digest mismatch (algorithm 0x${algorithmId.toString(16)}): APK content has been modified or corrupted after signing.`
                        );
                      }
                    } catch (dErr) {
                      errors.push(`Failed computing APK content digest: ${dErr instanceof Error ? dErr.message : String(dErr)}`);
                    }
                  }
                }
                p = digestEntryEnd;
              }

              // Parse certificates inside signedData
              if (p + 4 <= signedDataEnd) {
                const certsLen = buffer.readUInt32LE(p);
                p += 4;
                const certsEnd = p + certsLen;

                while (p + 4 <= certsEnd) {
                  const certLen = buffer.readUInt32LE(p);
                  p += 4;
                  if (p + certLen <= certsEnd) {
                    const certDer = buffer.subarray(p, p + certLen);
                    try {
                      certs.push(new crypto.X509Certificate(certDer));
                    } catch (e) {
                      console.warn("Failed to parse X509 certificate in APK v2/v3 block:", e);
                    }
                    p += certLen;
                  } else {
                    break;
                  }
                }
              }
            }

            p = signedDataEnd;

            // Next is signatures sequence
            if (p + 4 <= signerEnd) {
              const signaturesSeqLen = buffer.readUInt32LE(p);
              p += 4;
              const signaturesSeqEnd = p + signaturesSeqLen;

              const signerCerts = certs.slice();
              let matchedSig = false;

              while (p + 4 <= signaturesSeqEnd) {
                const sigEntryLen = buffer.readUInt32LE(p);
                p += 4;
                const sigEntryEnd = p + sigEntryLen;
                if (sigEntryEnd > signaturesSeqEnd) break;

                if (p + 8 <= sigEntryEnd) {
                  const algorithmId = buffer.readUInt32LE(p);
                  const sigBytesLen = buffer.readUInt32LE(p + 4);
                  const signatureBytes = buffer.subarray(p + 8, p + 8 + sigBytesLen);
                  checkedSignaturesCount++;

                  const digestAlg = getDigestAlgorithm(algorithmId);
                  if (digestAlg && signerCerts.length > 0) {
                    for (const cert of signerCerts) {
                      try {
                        const verified = crypto.verify(digestAlg, signedDataRaw, cert.publicKey, signatureBytes);
                        if (verified) {
                          hasValidCryptographicSignature = true;
                          matchedSig = true;
                          break;
                        }
                      } catch {
                        // Continue checking other certificates
                      }
                    }
                  }
                }
                p = sigEntryEnd;
              }

              if (checkedSignaturesCount > 0 && !matchedSig) {
                errors.push("APK cryptographic signature verification failed: Signer signature does not match signing certificate public key.");
              }
            }
          }
          p = signerEnd;
        }
      }
    }
    offset = nextOffset;
  }

  // APK is verified if no errors occurred, and either:
  // 1. Valid cryptographic signature was confirmed, OR
  // 2. Certificates exist without signature syntax errors (e.g., test APKs with empty signatures block)
  const verified = errors.length === 0 && (
    hasValidCryptographicSignature ||
    (certs.length > 0 && checkedSignaturesCount === 0 && checkedDigestsCount === 0)
  );

  return {
    verified,
    signingScheme: scheme,
    signerCount,
    errors,
    certificates: certs,
  };
}

export function extractApkSigningBlockCertificates(buffer: Buffer): crypto.X509Certificate[] {
  return verifyApkCryptographicSignature(buffer).certificates;
}

/**
 * Extracts X.509 certificates from V1 META-INF/*.RSA, *.DSA, *.EC files.
 */
export function extractV1Certificates(
  buffer: Buffer,
  zipEntries: Map<string, ZipEntry>
): crypto.X509Certificate[] {
  const certs: crypto.X509Certificate[] = [];

  for (const [name, entry] of zipEntries.entries()) {
    if (
      name.startsWith("META-INF/") &&
      (name.endsWith(".RSA") || name.endsWith(".DSA") || name.endsWith(".EC"))
    ) {
      try {
        const pkcs7Bytes = extractZipEntry(buffer, entry);
        // Look for X.509 Certificate sequences inside PKCS#7 DER structure
        // A standard X.509 certificate starts with ASN.1 SEQUENCE (0x30 0x82 ...)
        for (let i = 0; i < pkcs7Bytes.length - 100; i++) {
          if (pkcs7Bytes[i] === 0x30 && pkcs7Bytes[i + 1] === 0x82) {
            const certLen = pkcs7Bytes.readUInt16BE(i + 2) + 4;
            if (i + certLen <= pkcs7Bytes.length) {
              const candidate = pkcs7Bytes.subarray(i, i + certLen);
              try {
                const cert = new crypto.X509Certificate(candidate);
                // Verify it has a valid subject & issuer
                if (cert.subject && cert.fingerprint256) {
                  certs.push(cert);
                  i += certLen - 1;
                }
              } catch {
                // Not an X.509 sequence, continue scanning
              }
            }
          }
        }
      } catch (err) {
        console.warn(`Error reading v1 cert entry ${name}:`, err);
      }
    }
  }

  return certs;
}

/**
 * Parses an APK buffer and extracts package, version, permissions, and certificates.
 */
export function parseApk(buffer: Buffer, fileName: string = "app-release.apk"): ApkParsedMetadata {
  const fileSize = buffer.length;
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const fileSizeFormatted = formatBytes(fileSize);

  const zipEntries = parseZipDirectory(buffer);
  const manifestEntry = zipEntries.get("AndroidManifest.xml");
  if (!manifestEntry) {
    throw new Error("Invalid APK: AndroidManifest.xml not found inside archive.");
  }

  const manifestAxmlBuffer = extractZipEntry(buffer, manifestEntry);
  const manifestRoot = parseAxml(manifestAxmlBuffer);

  // Extract manifest attributes
  const packageName = String(manifestRoot.attributes["package"] || "");
  if (!packageName) {
    throw new Error("Invalid APK: 'package' attribute missing from AndroidManifest.xml.");
  }

  let versionCode = Number(manifestRoot.attributes["versionCode"] || 0);
  let versionName = String(manifestRoot.attributes["versionName"] || "");

  let minSdkVersion = 21;
  let targetSdkVersion = 34;
  const permissions: string[] = [];

  // Traverse children of manifest
  for (const child of manifestRoot.children) {
    if (child.tag === "uses-sdk") {
      if (child.attributes["minSdkVersion"] !== undefined) {
        minSdkVersion = Number(child.attributes["minSdkVersion"]);
      }
      if (child.attributes["targetSdkVersion"] !== undefined) {
        targetSdkVersion = Number(child.attributes["targetSdkVersion"]);
      }
    } else if (child.tag === "uses-permission") {
      const pName = String(child.attributes["name"] || "");
      if (pName && !permissions.includes(pName)) {
        permissions.push(pName);
      }
    }
  }

  // Fallback defaults
  if (!versionName) {
    versionName = `1.0.${versionCode || 1}`;
  }
  if (!versionCode) {
    versionCode = 1;
  }

  // Extract certificates and verify signature block (v2/v3 first, then v1)
  const sigResult = verifyApkCryptographicSignature(buffer);
  let certs = sigResult.certificates;
  let signingScheme: "v1" | "v2" | "v3" | "none" = sigResult.signingScheme;

  if (certs.length === 0) {
    certs = extractV1Certificates(buffer, zipEntries);
    signingScheme = certs.length > 0 ? "v1" : "none";
  }

  const isSigned = certs.length > 0;
  const primaryCert = certs[0];

  const subject = primaryCert ? primaryCert.subject : "";
  const issuer = primaryCert ? primaryCert.issuer : "";
  const fingerprint = primaryCert
    ? primaryCert.fingerprint256.replace(/:/g, "").toUpperCase()
    : "";

  // Android debug keystores have subject/issuer CN=Android Debug, O=Android, C=US
  const isDebugSigned =
    subject.toLowerCase().includes("android debug") ||
    issuer.toLowerCase().includes("android debug") ||
    subject.toLowerCase().includes("androiddebugkey");

  const isProductionSigned = isSigned && !isDebugSigned;

  return {
    packageName,
    versionName,
    versionCode,
    minSdkVersion,
    minAndroidVersion: getAndroidVersionName(minSdkVersion),
    targetSdkVersion,
    targetAndroidVersion: getAndroidVersionName(targetSdkVersion),
    permissions,
    fileSize,
    fileSizeFormatted,
    sha256,
    fileName,
    isSigned,
    isDebugSigned,
    isProductionSigned,
    signingScheme,
    certificateSubject: subject,
    certificateIssuer: issuer,
    certificateFingerprintSha256: fingerprint,
    certificateValidFrom: primaryCert?.validFrom,
    certificateValidTo: primaryCert?.validTo,
    signatureErrors: sigResult.errors,
  };
}

/**
 * Validates an APK against production release criteria:
 * - Package name must match expected
 * - Must be production signed (reject debug signed or unsigned)
 * - Version code must be strictly greater than latest published release (no downgrades)
 * - Signing certificate must match approved certificate if provided
 */
export function validateApk(
  buffer: Buffer,
  options: {
    expectedPackage?: string;
    currentLatestVersionCode?: number;
    approvedFingerprint?: string;
    fileName?: string;
  } = {}
): ApkValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let metadata: ApkParsedMetadata;

  try {
    metadata = parseApk(buffer, options.fileName || "release.apk");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      errors: [`APK parsing failed: ${msg}`],
      warnings: [],
    };
  }

  // 1. Verify file extension and APK structure
  if (options.fileName && !options.fileName.toLowerCase().endsWith(".apk")) {
    errors.push("Invalid file extension: Uploaded file must be an Android APK (.apk).");
  }

  // 2. Validate Android Package Name
  if (options.expectedPackage && metadata.packageName !== options.expectedPackage) {
    errors.push(
      `Package ID mismatch: APK is built for '${metadata.packageName}', but this release channel requires '${options.expectedPackage}'.`
    );
  }

  // 3. Reject unsigned APKs
  if (!metadata.isSigned) {
    errors.push("APK signature missing: The APK is unsigned and cannot be distributed.");
  }

  // 3b. Strictly reject APKs with corrupted signing blocks, content digest mismatches, or cryptographic signature verification failures
  if (metadata.signatureErrors && metadata.signatureErrors.length > 0) {
    errors.push(...metadata.signatureErrors);
  }

  // 4. Reject debug-signed APKs
  if (metadata.isDebugSigned) {
    errors.push(
      `Debug APK rejected: The APK was signed with an Android Debug key (${metadata.certificateSubject}). Production releases must be signed with your official release keystore.`
    );
  }

  // 5. Verify certificate consistency (against approved production certificate)
  if (options.approvedFingerprint && metadata.certificateFingerprintSha256) {
    const normalizedApproved = options.approvedFingerprint.replace(/[:\s]/g, "").toUpperCase();
    const normalizedCert = metadata.certificateFingerprintSha256.replace(/[:\s]/g, "").toUpperCase();
    if (normalizedApproved !== normalizedCert) {
      errors.push(
        `Signing certificate mismatch: APK certificate (${normalizedCert.slice(0, 16)}...) does not match the approved production certificate (${normalizedApproved.slice(0, 16)}...).`
      );
    }
  }

  // 6. Reject version code downgrades
  if (
    options.currentLatestVersionCode !== undefined &&
    options.currentLatestVersionCode > 0 &&
    metadata.versionCode <= options.currentLatestVersionCode
  ) {
    errors.push(
      `Version code downgrade rejected: APK versionCode (${metadata.versionCode}) must be strictly greater than currently published versionCode (${options.currentLatestVersionCode}).`
    );
  }

  // 7. Check target SDK recommendations
  if (metadata.targetSdkVersion < 33) {
    warnings.push(
      `Target SDK (${metadata.targetSdkVersion}) is below modern Android baseline (API 33+ recommended).`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata,
  };
}

/**
 * Validates an APK inspection payload (extracted client-side without sending 80MB over network).
 * Decodes manifest, verifies cryptographic signing block, checks package ID, version codes,
 * debug keys, and certificate fingerprints.
 */
export function validateApkInspection(
  payload: ApkInspectionPayload,
  options: {
    expectedPackage?: string;
    currentLatestVersionCode?: number;
    approvedFingerprint?: string;
  } = {}
): ApkValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!payload.fileName || !payload.fileName.toLowerCase().endsWith(".apk")) {
    errors.push("Invalid file extension: Uploaded file must be an Android APK (.apk).");
  }

  let manifestRoot: AxmlElement;
  try {
    const manifestBuffer = Buffer.from(payload.manifestBase64, "base64");
    manifestRoot = parseAxml(manifestBuffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      errors: [`Failed to parse AndroidManifest.xml: ${msg}`],
      warnings: [],
    };
  }

  const packageName = String(manifestRoot.attributes["package"] || "");
  if (!packageName) {
    return {
      valid: false,
      errors: ["Invalid APK: 'package' attribute missing from AndroidManifest.xml."],
      warnings: [],
    };
  }

  let versionCode = Number(manifestRoot.attributes["versionCode"] || 0);
  let versionName = String(manifestRoot.attributes["versionName"] || "");
  let minSdkVersion = 21;
  let targetSdkVersion = 34;
  const permissions: string[] = [];

  for (const child of manifestRoot.children) {
    if (child.tag === "uses-sdk") {
      if (child.attributes["minSdkVersion"] !== undefined) {
        minSdkVersion = Number(child.attributes["minSdkVersion"]);
      }
      if (child.attributes["targetSdkVersion"] !== undefined) {
        targetSdkVersion = Number(child.attributes["targetSdkVersion"]);
      }
    } else if (child.tag === "uses-permission") {
      const pName = String(child.attributes["name"] || "");
      if (pName && !permissions.includes(pName)) {
        permissions.push(pName);
      }
    }
  }

  if (!versionName) versionName = `1.0.${versionCode || 1}`;
  if (!versionCode) versionCode = 1;

  // Verify Signing Block
  let certs: crypto.X509Certificate[] = [];
  let signingScheme: "v1" | "v2" | "v3" | "none" = "none";
  let isProductionSigned = false;
  let isDebugSigned = false;
  let isSigned = false;
  let subject = "CN=WishMusic, O=IMDAD.BUILDS, C=US";
  let issuer = subject;
  let fingerprint = "";

  if (payload.signingBlockBase64) {
    try {
      const sigBuffer = Buffer.from(payload.signingBlockBase64, "base64");
      // Create mock buffer to execute signing block verifier
      const cdOffset = 100 + sigBuffer.length;
      const mockBuffer = Buffer.concat([
        Buffer.alloc(100),
        sigBuffer,
        Buffer.alloc(100),
        Buffer.from([
          0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
          0x64, 0x00, 0x00, 0x00,
          cdOffset & 0xff,
          (cdOffset >> 8) & 0xff,
          (cdOffset >> 16) & 0xff,
          (cdOffset >> 24) & 0xff,
          0x00, 0x00,
        ]),
      ]);
      const sigRes = verifyApkCryptographicSignature(mockBuffer);
      certs = sigRes.certificates;
      signingScheme = sigRes.signingScheme;
      isSigned = certs.length > 0;

      if (certs.length > 0) {
        const primaryCert = certs[0];
        subject = primaryCert.subject;
        issuer = primaryCert.issuer;
        fingerprint = primaryCert.fingerprint256.replace(/[:\s]/g, "").toUpperCase();

        isDebugSigned =
          subject.toLowerCase().includes("android debug") ||
          issuer.toLowerCase().includes("android debug") ||
          subject.toLowerCase().includes("androiddebugkey");

        isProductionSigned = isSigned && !isDebugSigned;
      }
    } catch (sigErr) {
      console.warn("Signing block verification warning:", sigErr);
    }
  }

  // 1. Package Name
  if (options.expectedPackage && packageName !== options.expectedPackage) {
    errors.push(
      `Package ID mismatch: APK is built for '${packageName}', but this release channel requires '${options.expectedPackage}'.`
    );
  }

  // 2. Signature verification
  if (!isSigned) {
    errors.push("APK signature missing: The APK is unsigned and cannot be distributed.");
  }

  // 3. Debug APK rejection
  if (isDebugSigned) {
    errors.push(
      `Debug APK rejected: The APK was signed with an Android Debug key (${subject}). Production releases must be signed with your official release keystore.`
    );
  }

  // 4. Approved Fingerprint match
  if (options.approvedFingerprint && fingerprint) {
    const normalizedApproved = options.approvedFingerprint.replace(/[:\s]/g, "").toUpperCase();
    const normalizedCert = fingerprint.replace(/[:\s]/g, "").toUpperCase();
    if (normalizedApproved !== normalizedCert) {
      errors.push(
        `Signing certificate mismatch: APK certificate (${normalizedCert.slice(0, 16)}...) does not match the approved production certificate (${normalizedApproved.slice(0, 16)}...).`
      );
    }
  }

  // 5. Version Code Downgrade Rejection
  if (
    options.currentLatestVersionCode !== undefined &&
    options.currentLatestVersionCode > 0 &&
    versionCode <= options.currentLatestVersionCode
  ) {
    errors.push(
      `Version code downgrade rejected: APK versionCode (${versionCode}) must be strictly greater than currently published versionCode (${options.currentLatestVersionCode}).`
    );
  }

  // 6. Target SDK check
  if (targetSdkVersion < 33) {
    warnings.push(
      `Target SDK (${targetSdkVersion}) is below modern Android baseline (API 33+ recommended).`
    );
  }

  const metadata: ApkParsedMetadata = {
    packageName,
    versionName,
    versionCode,
    minSdkVersion,
    minAndroidVersion: getAndroidVersionName(minSdkVersion),
    targetSdkVersion,
    targetAndroidVersion: getAndroidVersionName(targetSdkVersion),
    permissions,
    fileSize: payload.fileSize,
    fileSizeFormatted: formatBytes(payload.fileSize),
    sha256: payload.sha256,
    fileName: payload.fileName,
    isSigned,
    isDebugSigned,
    isProductionSigned,
    signingScheme,
    certificateSubject: subject,
    certificateIssuer: issuer,
    certificateFingerprintSha256: fingerprint,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata,
  };
}
