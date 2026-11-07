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
export function extractApkSigningBlockCertificates(buffer: Buffer): crypto.X509Certificate[] {
  const certs: crypto.X509Certificate[] = [];
  const len = buffer.length;

  // Locate EOCD
  let eocdOffset = -1;
  const maxSearch = Math.min(len - 22, 65535 + 22);
  for (let i = len - 22; i >= len - maxSearch; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) return certs;

  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);
  if (cdOffset < 24) return certs;

  // Check magic "APK Sig Block 42" at (cdOffset - 16)
  const magic = buffer.toString("utf8", cdOffset - 16, cdOffset);
  if (magic !== "APK Sig Block 42") {
    return certs;
  }

  // Size of block (uint64) at cdOffset - 24
  const blockSizeLow = buffer.readUInt32LE(cdOffset - 24);
  const blockStart = cdOffset - 8 - blockSizeLow;
  if (blockStart < 0 || blockStart >= cdOffset) return certs;

  // Verify first 8 bytes of block also match blockSize
  const startSizeLow = buffer.readUInt32LE(blockStart);
  if (startSizeLow !== blockSizeLow) return certs;

  let offset = blockStart + 8;
  const blockEnd = cdOffset - 24;

  while (offset + 12 <= blockEnd) {
    const entrySizeLow = buffer.readUInt32LE(offset);
    const entryId = buffer.readUInt32LE(offset + 8);
    const nextOffset = offset + 8 + entrySizeLow;
    if (nextOffset > blockEnd + 24) break;

    // 0x7109871a = APK Sig Scheme v2; 0xf05368c0 = APK Sig Scheme v3
    if (entryId === 0x7109871a || entryId === 0xf05368c0) {
      let p = offset + 12;
      const endOfEntry = nextOffset;
      if (p + 4 <= endOfEntry) {
        // Signers length-prefixed sequence
        p += 4;
        while (p + 4 <= endOfEntry) {
          const signerLen = buffer.readUInt32LE(p);
          p += 4;
          const signerEnd = p + signerLen;
          if (signerEnd > endOfEntry) break;

          // Inside signer: signedData length-prefix
          if (p + 4 <= signerEnd) {
            const signedDataLen = buffer.readUInt32LE(p);
            p += 4;
            const signedDataEnd = p + signedDataLen;

            // Inside signedData: digests length-prefix
            if (p + 4 <= signedDataEnd) {
              const digestsLen = buffer.readUInt32LE(p);
              p += 4 + digestsLen;

              // Next is certificates length-prefix
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
                      console.warn("Failed to parse X509 certificate in APK v2 block:", e);
                    }
                    p += certLen;
                  } else {
                    break;
                  }
                }
              }
            }
          }
          p = signerEnd;
        }
      }
    }
    offset = nextOffset;
  }

  return certs;
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

  // Extract certificates (v2/v3 first, then v1)
  let certs = extractApkSigningBlockCertificates(buffer);
  let signingScheme: "v1" | "v2" | "v3" | "none" = "v2";

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
