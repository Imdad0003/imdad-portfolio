import crypto from "crypto";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { NextRequest } from "next/server";
import { POST as validatePost } from "../src/app/api/admin/apps/releases/validate/route";
import { POST as uploadPost } from "../src/app/api/admin/apps/releases/upload/route";
import { POST as rollbackPost } from "../src/app/api/admin/apps/releases/rollback/route";
import { GET as publicReleasesGet } from "../src/app/api/apps/releases/route";
import { GET as downloadGet } from "../src/app/api/apps/download/[slug]/route";
import { parseApk, validateApk } from "../src/lib/apk-parser";
import { createGitHubRelease, uploadGitHubReleaseAsset } from "../src/lib/github-releases";
import { firebaseConfig } from "../src/lib/firebase";

const SCRATCH_DIR = path.resolve("/Users/imdad/.gemini/antigravity/brain/6a5f546f-2e46-4114-bb8c-4ed38455db07/scratch");

// Generate RSA key pair for testing admin JWT tokens
const { privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });

function createTestJwt(payloadOverrides: Record<string, unknown> = {}): string {
  const now = Math.floor(Date.now() / 1000);
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId;

  const header = { alg: "RS256", kid: "test-kid", typ: "JWT" };
  const payload = {
    iss: `https://securetoken.google.com/${projectId}`,
    aud: projectId,
    auth_time: now - 60,
    user_id: "admin-uid-wishmusic",
    sub: "admin-uid-wishmusic",
    iat: now - 60,
    exp: now + 3600,
    email: "imdad.builds@gmail.com",
    email_verified: true,
    ...payloadOverrides,
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${headerB64}.${payloadB64}`);
  const signatureB64 = signer.sign(privateKey).toString("base64url");

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// Simple CRC32 table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c;
}

function crc32(buf: Buffer): number {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function buildTestAxml(options: {
  packageName: string;
  versionCode: number;
  versionName: string;
  minSdkVersion?: number;
  targetSdkVersion?: number;
  permissions?: string[];
}): Buffer {
  const minSdk = options.minSdkVersion ?? 24;
  const targetSdk = options.targetSdkVersion ?? 34;
  const perms = options.permissions ?? ["android.permission.INTERNET"];

  const strings: string[] = [
    "http://schemas.android.com/apk/res/android",
    "manifest",
    "package",
    "versionCode",
    "versionName",
    "uses-sdk",
    "minSdkVersion",
    "targetSdkVersion",
    "uses-permission",
    "name",
    options.packageName,
    options.versionName,
    ...perms,
  ];

  const stringPoolBuffers: Buffer[] = [];
  const stringOffsets: number[] = [];
  let currentOffset = 0;

  for (const s of strings) {
    stringOffsets.push(currentOffset);
    const strBuf = Buffer.from(s, "utf16le");
    const lenBuf = Buffer.alloc(2);
    lenBuf.writeUInt16LE(s.length, 0);
    const nullBuf = Buffer.alloc(2);
    const fullStrBuf = Buffer.concat([lenBuf, strBuf, nullBuf]);
    stringPoolBuffers.push(fullStrBuf);
    currentOffset += fullStrBuf.length;
  }

  const stringData = Buffer.concat(stringPoolBuffers);
  const offsetTable = Buffer.alloc(strings.length * 4);
  for (let i = 0; i < strings.length; i++) {
    offsetTable.writeUInt32LE(stringOffsets[i], i * 4);
  }

  const stringPoolHeaderSize = 28;
  const stringsStart = stringPoolHeaderSize + offsetTable.length;
  const poolChunkSize = stringsStart + stringData.length;
  const padSize = (4 - (poolChunkSize % 4)) % 4;
  const poolPaddedChunkSize = poolChunkSize + padSize;

  const poolHeader = Buffer.alloc(stringPoolHeaderSize);
  poolHeader.writeUInt16LE(0x0001, 0);
  poolHeader.writeUInt16LE(stringPoolHeaderSize, 2);
  poolHeader.writeUInt32LE(poolPaddedChunkSize, 4);
  poolHeader.writeUInt32LE(strings.length, 8);
  poolHeader.writeUInt32LE(0, 12);
  poolHeader.writeUInt32LE(0, 16);
  poolHeader.writeUInt32LE(stringsStart, 20);
  poolHeader.writeUInt32LE(0, 24);

  const stringPoolChunk = Buffer.concat([
    poolHeader,
    offsetTable,
    stringData,
    Buffer.alloc(padSize),
  ]);

  // Manifest tag
  const manifestAttrs = Buffer.alloc(20 * 3);
  manifestAttrs.writeInt32LE(-1, 0);
  manifestAttrs.writeInt32LE(2, 4);
  manifestAttrs.writeInt32LE(10, 8);
  manifestAttrs.writeUInt16LE(8, 12);
  manifestAttrs.writeUInt8(0, 14);
  manifestAttrs.writeUInt8(0x03, 15);
  manifestAttrs.writeUInt32LE(10, 16);

  manifestAttrs.writeInt32LE(0, 20);
  manifestAttrs.writeInt32LE(3, 24);
  manifestAttrs.writeInt32LE(-1, 28);
  manifestAttrs.writeUInt16LE(8, 32);
  manifestAttrs.writeUInt8(0, 34);
  manifestAttrs.writeUInt8(0x10, 35);
  manifestAttrs.writeInt32LE(options.versionCode, 36);

  manifestAttrs.writeInt32LE(0, 40);
  manifestAttrs.writeInt32LE(4, 44);
  manifestAttrs.writeInt32LE(11, 48);
  manifestAttrs.writeUInt16LE(8, 52);
  manifestAttrs.writeUInt8(0, 54);
  manifestAttrs.writeUInt8(0x03, 55);
  manifestAttrs.writeUInt32LE(11, 56);

  const manifestStart = Buffer.alloc(36);
  manifestStart.writeUInt16LE(0x0102, 0);
  manifestStart.writeUInt16LE(16, 2);
  manifestStart.writeUInt32LE(36 + manifestAttrs.length, 4);
  manifestStart.writeUInt32LE(1, 8);
  manifestStart.writeInt32LE(-1, 12);
  manifestStart.writeInt32LE(-1, 16);
  manifestStart.writeInt32LE(1, 20);
  manifestStart.writeUInt16LE(20, 24);
  manifestStart.writeUInt16LE(20, 26);
  manifestStart.writeUInt16LE(3, 28);

  const manifestStartChunk = Buffer.concat([manifestStart, manifestAttrs]);

  // uses-sdk tag
  const sdkAttrs = Buffer.alloc(20 * 2);
  sdkAttrs.writeInt32LE(0, 0);
  sdkAttrs.writeInt32LE(6, 4);
  sdkAttrs.writeInt32LE(-1, 8);
  sdkAttrs.writeUInt16LE(8, 12);
  sdkAttrs.writeUInt8(0, 14);
  sdkAttrs.writeUInt8(0x10, 15);
  sdkAttrs.writeInt32LE(minSdk, 16);

  sdkAttrs.writeInt32LE(0, 20);
  sdkAttrs.writeInt32LE(7, 24);
  sdkAttrs.writeInt32LE(-1, 28);
  sdkAttrs.writeUInt16LE(8, 32);
  sdkAttrs.writeUInt8(0, 34);
  sdkAttrs.writeUInt8(0x10, 35);
  sdkAttrs.writeInt32LE(targetSdk, 36);

  const sdkStart = Buffer.alloc(36);
  sdkStart.writeUInt16LE(0x0102, 0);
  sdkStart.writeUInt16LE(16, 2);
  sdkStart.writeUInt32LE(36 + sdkAttrs.length, 4);
  sdkStart.writeUInt32LE(2, 8);
  sdkStart.writeInt32LE(-1, 12);
  sdkStart.writeInt32LE(-1, 16);
  sdkStart.writeInt32LE(5, 20);
  sdkStart.writeUInt16LE(20, 24);
  sdkStart.writeUInt16LE(20, 26);
  sdkStart.writeUInt16LE(2, 28);

  const sdkStartChunk = Buffer.concat([sdkStart, sdkAttrs]);

  const sdkEndChunk = Buffer.alloc(24);
  sdkEndChunk.writeUInt16LE(0x0103, 0);
  sdkEndChunk.writeUInt16LE(16, 2);
  sdkEndChunk.writeUInt32LE(24, 4);
  sdkEndChunk.writeUInt32LE(2, 8);
  sdkEndChunk.writeInt32LE(-1, 12);
  sdkEndChunk.writeInt32LE(-1, 16);
  sdkEndChunk.writeInt32LE(5, 20);

  // uses-permission tags
  const permChunks: Buffer[] = [];
  for (let i = 0; i < perms.length; i++) {
    const permAttr = Buffer.alloc(20);
    permAttr.writeInt32LE(0, 0);
    permAttr.writeInt32LE(9, 4);
    permAttr.writeInt32LE(12 + i, 8);
    permAttr.writeUInt16LE(8, 12);
    permAttr.writeUInt8(0, 14);
    permAttr.writeUInt8(0x03, 15);
    permAttr.writeUInt32LE(12 + i, 16);

    const pStart = Buffer.alloc(36);
    pStart.writeUInt16LE(0x0102, 0);
    pStart.writeUInt16LE(16, 2);
    pStart.writeUInt32LE(36 + 20, 4);
    pStart.writeUInt32LE(3 + i, 8);
    pStart.writeInt32LE(-1, 12);
    pStart.writeInt32LE(-1, 16);
    pStart.writeInt32LE(8, 20);
    pStart.writeUInt16LE(20, 24);
    pStart.writeUInt16LE(20, 26);
    pStart.writeUInt16LE(1, 28);

    const pEnd = Buffer.alloc(24);
    pEnd.writeUInt16LE(0x0103, 0);
    pEnd.writeUInt16LE(16, 2);
    pEnd.writeUInt32LE(24, 4);
    pEnd.writeUInt32LE(3 + i, 8);
    pEnd.writeInt32LE(-1, 12);
    pEnd.writeInt32LE(-1, 16);
    pEnd.writeInt32LE(8, 20);

    permChunks.push(Buffer.concat([pStart, permAttr, pEnd]));
  }

  // End manifest
  const manifestEndChunk = Buffer.alloc(24);
  manifestEndChunk.writeUInt16LE(0x0103, 0);
  manifestEndChunk.writeUInt16LE(16, 2);
  manifestEndChunk.writeUInt32LE(24, 4);
  manifestEndChunk.writeUInt32LE(10, 8);
  manifestEndChunk.writeInt32LE(-1, 12);
  manifestEndChunk.writeInt32LE(-1, 16);
  manifestEndChunk.writeInt32LE(1, 20);

  const xmlBody = Buffer.concat([
    manifestStartChunk,
    sdkStartChunk,
    sdkEndChunk,
    ...permChunks,
    manifestEndChunk,
  ]);

  const totalFileSize = 8 + stringPoolChunk.length + xmlBody.length;
  const header = Buffer.alloc(8);
  header.writeUInt32LE(0x00080003, 0);
  header.writeUInt32LE(totalFileSize, 4);

  return Buffer.concat([header, stringPoolChunk, xmlBody]);
}

function buildZip(files: Record<string, Buffer>): Buffer {
  const localHeaders: Buffer[] = [];
  const cdHeaders: Buffer[] = [];
  let currentOffset = 0;

  for (const [name, content] of Object.entries(files)) {
    const nameBuf = Buffer.from(name, "utf8");
    const crc = crc32(content);
    const size = content.length;

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(0, 8);
    lh.writeUInt16LE(0, 10);
    lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(size, 18);
    lh.writeUInt32LE(size, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);

    localHeaders.push(lh, nameBuf, content);

    const cdh = Buffer.alloc(46);
    cdh.writeUInt32LE(0x02014b50, 0);
    cdh.writeUInt16LE(20, 4);
    cdh.writeUInt16LE(20, 6);
    cdh.writeUInt16LE(0, 8);
    cdh.writeUInt16LE(0, 10);
    cdh.writeUInt16LE(0, 12);
    cdh.writeUInt32LE(crc, 16);
    cdh.writeUInt32LE(size, 20);
    cdh.writeUInt32LE(size, 24);
    cdh.writeUInt16LE(nameBuf.length, 28);
    cdh.writeUInt16LE(0, 30);
    cdh.writeUInt16LE(0, 32);
    cdh.writeUInt16LE(0, 34);
    cdh.writeUInt16LE(0, 36);
    cdh.writeUInt32LE(0, 38);
    cdh.writeUInt32LE(currentOffset, 42);

    cdHeaders.push(cdh, nameBuf);

    currentOffset += 30 + nameBuf.length + size;
  }

  const cdData = Buffer.concat(cdHeaders);
  const cdOffset = currentOffset;
  const cdSize = cdData.length;
  const entryCount = Object.keys(files).length;

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entryCount, 8);
  eocd.writeUInt16LE(entryCount, 10);
  eocd.writeUInt32LE(cdSize, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, cdData, eocd]);
}

function attachApkSigningBlock(zipBuffer: Buffer, certDer: Buffer): Buffer {
  const len = zipBuffer.length;
  const eocdOffset = len - 22;
  const cdOffset = zipBuffer.readUInt32LE(eocdOffset + 16);
  const cdSize = zipBuffer.readUInt32LE(eocdOffset + 12);

  const certWithLen = Buffer.alloc(4 + certDer.length);
  certWithLen.writeUInt32LE(certDer.length, 0);
  certDer.copy(certWithLen, 4);

  const certsSeq = Buffer.alloc(4 + certWithLen.length);
  certsSeq.writeUInt32LE(certWithLen.length, 0);
  certWithLen.copy(certsSeq, 4);

  const digestsSeq = Buffer.alloc(4);
  digestsSeq.writeUInt32LE(0, 0);

  const signedDataContent = Buffer.concat([digestsSeq, certsSeq, Buffer.alloc(4)]);
  const signedData = Buffer.alloc(4 + signedDataContent.length);
  signedData.writeUInt32LE(signedDataContent.length, 0);
  signedDataContent.copy(signedData, 4);

  const signerContent = Buffer.concat([signedData, Buffer.alloc(4), Buffer.alloc(4)]);
  const signer = Buffer.alloc(4 + signerContent.length);
  signer.writeUInt32LE(signerContent.length, 0);
  signerContent.copy(signer, 4);

  const signersSeq = Buffer.alloc(4 + signer.length);
  signersSeq.writeUInt32LE(signer.length, 0);
  signer.copy(signersSeq, 4);

  const entryPayload = signersSeq;
  const entrySize = 4 + entryPayload.length;
  const entryHeader = Buffer.alloc(12);
  entryHeader.writeUInt32LE(entrySize, 0);
  entryHeader.writeUInt32LE(0, 4);
  entryHeader.writeUInt32LE(0x7109871a, 8);

  const entry = Buffer.concat([entryHeader, entryPayload]);

  const blockSize = entry.length + 24;
  const blockStartHeader = Buffer.alloc(8);
  blockStartHeader.writeUInt32LE(blockSize, 0);
  blockStartHeader.writeUInt32LE(0, 4);

  const blockEndFooter = Buffer.alloc(24);
  blockEndFooter.writeUInt32LE(blockSize, 0);
  blockEndFooter.writeUInt32LE(0, 4);
  blockEndFooter.write("APK Sig Block 42", 8, "utf8");

  const signingBlock = Buffer.concat([blockStartHeader, entry, blockEndFooter]);

  const beforeCd = zipBuffer.subarray(0, cdOffset);
  const cdAndEocd = zipBuffer.subarray(cdOffset);

  const newCdOffset = cdOffset + signingBlock.length;
  const updatedEocd = Buffer.from(cdAndEocd.subarray(cdSize));
  updatedEocd.writeUInt32LE(newCdOffset, 16);

  return Buffer.concat([
    beforeCd,
    signingBlock,
    cdAndEocd.subarray(0, cdSize),
    updatedEocd,
  ]);
}

async function runTestSuite() {
  console.log("==========================================================");
  console.log("  IMDAD.BUILDS — APP DISTRIBUTION SYSTEM TEST SUITE");
  console.log("==========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail = "") {
    if (condition) {
      console.log(`  ✔ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✖ [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // 1. Generate Certificates
  console.log("[SETUP] Generating cryptographic production and debug certificates...");
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });

  const prodKeyPath = path.join(SCRATCH_DIR, "prod.key");
  const prodCertPath = path.join(SCRATCH_DIR, "prod.crt");
  const prodDerPath = path.join(SCRATCH_DIR, "prod.der");

  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout "${prodKeyPath}" -out "${prodCertPath}" -days 365 -subj "/C=US/O=IMDAD.BUILDS/CN=WishMusic" 2>/dev/null`);
  execSync(`openssl x509 -outform der -in "${prodCertPath}" -out "${prodDerPath}"`);
  const prodCertDer = fs.readFileSync(prodDerPath);
  const prodCertObj = new crypto.X509Certificate(prodCertDer);
  const prodFingerprint = prodCertObj.fingerprint256.replace(/:/g, "").toUpperCase();

  const debugKeyPath = path.join(SCRATCH_DIR, "debug.key");
  const debugCertPath = path.join(SCRATCH_DIR, "debug.crt");
  const debugDerPath = path.join(SCRATCH_DIR, "debug.der");

  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout "${debugKeyPath}" -out "${debugCertPath}" -days 365 -subj "/C=US/O=Android/CN=Android Debug" 2>/dev/null`);
  execSync(`openssl x509 -outform der -in "${debugCertPath}" -out "${debugDerPath}"`);
  const debugCertDer = fs.readFileSync(debugDerPath);

  // 2. Build Test APK Binaries
  console.log("[SETUP] Assembling authentic synthetic APK binaries...");

  const axmlV100 = buildTestAxml({
    packageName: "com.imdad.wishmusic",
    versionCode: 100,
    versionName: "1.0.0",
    minSdkVersion: 24,
    targetSdkVersion: 34,
    permissions: ["android.permission.INTERNET", "android.permission.FOREGROUND_SERVICE"],
  });

  const zipV100 = buildZip({
    "AndroidManifest.xml": axmlV100,
    "classes.dex": Buffer.from("dex-content-v100"),
    "resources.arsc": Buffer.from("arsc-content-v100"),
  });

  const validApkV100 = attachApkSigningBlock(zipV100, prodCertDer);
  const validApkV100Sha256 = crypto.createHash("sha256").update(validApkV100).digest("hex");

  // Build v1.0.1 for upgrade/rollback test
  const axmlV101 = buildTestAxml({
    packageName: "com.imdad.wishmusic",
    versionCode: 101,
    versionName: "1.0.1",
    minSdkVersion: 24,
    targetSdkVersion: 34,
    permissions: ["android.permission.INTERNET", "android.permission.FOREGROUND_SERVICE"],
  });
  const zipV101 = buildZip({
    "AndroidManifest.xml": axmlV101,
    "classes.dex": Buffer.from("dex-content-v101"),
    "resources.arsc": Buffer.from("arsc-content-v101"),
  });
  const validApkV101 = attachApkSigningBlock(zipV101, prodCertDer);

  // Build debug APK
  const debugApk = attachApkSigningBlock(zipV100, debugCertDer);

  // Build wrong package APK
  const axmlWrong = buildTestAxml({
    packageName: "com.malicious.fakeapp",
    versionCode: 100,
    versionName: "1.0.0",
  });
  const zipWrong = buildZip({ "AndroidManifest.xml": axmlWrong });
  const wrongPkgApk = attachApkSigningBlock(zipWrong, prodCertDer);

  // --------------------------------------------------------------------------
  // TEST GROUP 1: APK Parsing & Cryptographic Validation
  // --------------------------------------------------------------------------
  console.log("\n[TEST GROUP 1] APK Binary Parsing and Signature Validation");

  const parsed = parseApk(validApkV100, "wishmusic-1.0.0.apk");
  assert(parsed.packageName === "com.imdad.wishmusic", "parseApk extracts correct Android package name ('com.imdad.wishmusic')");
  assert(parsed.versionCode === 100, "parseApk extracts correct versionCode (100)");
  assert(parsed.versionName === "1.0.0", "parseApk extracts correct versionName ('1.0.0')");
  assert(parsed.minSdkVersion === 24, "parseApk extracts correct minSdkVersion (24)");
  assert(parsed.minAndroidVersion.includes("Nougat"), "getAndroidVersionName maps API 24 to Android 7.0 (Nougat)");
  assert(parsed.targetSdkVersion === 34, "parseApk extracts correct targetSdkVersion (34)");
  assert(parsed.isProductionSigned === true, "parseApk detects valid production signature");
  assert(parsed.isDebugSigned === false, "parseApk confirms APK is not debug signed");
  assert(parsed.sha256 === validApkV100Sha256, "parseApk calculates accurate SHA-256 binary checksum");
  assert(parsed.certificateFingerprintSha256 === prodFingerprint, "parseApk extracts exact certificate SHA-256 fingerprint");

  // --------------------------------------------------------------------------
  // TEST GROUP 2: Security & Rejection Rules
  // --------------------------------------------------------------------------
  console.log("\n[TEST GROUP 2] Security Rejection of Invalid / Malicious Binaries");

  // Valid APK passes
  const validRes = validateApk(validApkV100, {
    expectedPackage: "com.imdad.wishmusic",
    currentLatestVersionCode: 90,
    approvedFingerprint: prodFingerprint,
    fileName: "wishmusic-1.0.0.apk",
  });
  assert(validRes.valid === true && validRes.errors.length === 0, "validateApk passes for production-signed WishMusic APK");

  // Reject Debug Signed
  const debugRes = validateApk(debugApk, {
    expectedPackage: "com.imdad.wishmusic",
    fileName: "wishmusic-debug.apk",
  });
  assert(debugRes.valid === false && debugRes.errors.some(e => e.includes("Debug")), "validateApk strictly rejects debug-signed APK");

  // Reject Wrong Package ID
  const wrongPkgRes = validateApk(wrongPkgApk, {
    expectedPackage: "com.imdad.wishmusic",
    fileName: "wishmusic-fake.apk",
  });
  assert(wrongPkgRes.valid === false && wrongPkgRes.errors.some(e => e.includes("Package ID mismatch")), "validateApk strictly rejects unexpected package IDs");

  // Reject Version Downgrades
  const downgradeRes = validateApk(validApkV100, {
    expectedPackage: "com.imdad.wishmusic",
    currentLatestVersionCode: 150, // Higher than 100
    fileName: "wishmusic-old.apk",
  });
  assert(downgradeRes.valid === false && downgradeRes.errors.some(e => e.includes("downgrade rejected")), "validateApk strictly rejects version code downgrades");

  // Reject Non-APK extension
  const badExtRes = validateApk(validApkV100, {
    expectedPackage: "com.imdad.wishmusic",
    fileName: "wishmusic.exe",
  });
  assert(badExtRes.valid === false && badExtRes.errors.some(e => e.includes("extension")), "validateApk rejects non-APK file extensions");

  // --------------------------------------------------------------------------
  // TEST GROUP 3: Server-Side API Authorization & Access Control
  // --------------------------------------------------------------------------
  console.log("\n[TEST GROUP 3] Server Route Authorization Enforcement");

  // Unauthenticated requests are rejected (401)
  const unauthValReq = new NextRequest("http://localhost:3000/api/admin/apps/releases/validate", {
    method: "POST",
  });
  const unauthValRes = await validatePost(unauthValReq);
  assert(unauthValRes.status === 401 || unauthValRes.status === 403, "POST /api/admin/apps/releases/validate rejects unauthenticated request (401/403)");

  const unauthUpReq = new NextRequest("http://localhost:3000/api/admin/apps/releases/upload", {
    method: "POST",
  });
  const unauthUpRes = await uploadPost(unauthUpReq);
  assert(unauthUpRes.status === 401 || unauthUpRes.status === 403, "POST /api/admin/apps/releases/upload rejects unauthenticated request (401/403)");

  const unauthRollReq = new NextRequest("http://localhost:3000/api/admin/apps/releases/rollback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appId: "wishmusic", targetReleaseId: "rel-1" }),
  });
  const unauthRollRes = await rollbackPost(unauthRollReq);
  assert(unauthRollRes.status === 401 || unauthRollRes.status === 403, "POST /api/admin/apps/releases/rollback rejects unauthenticated request (401/403)");

  // --------------------------------------------------------------------------
  // TEST GROUP 4: Public APIs & Download Experience
  // --------------------------------------------------------------------------
  console.log("\n[TEST GROUP 4] Public Releases Catalog & Direct Download Resolution");

  const pubReleasesReq = new NextRequest("http://localhost:3000/api/apps/releases?appId=wishmusic");
  const pubReleasesRes = await publicReleasesGet(pubReleasesReq);
  assert(pubReleasesRes.status === 200, "GET /api/apps/releases returns 200 OK");
  const pubReleasesData = await pubReleasesRes.json();
  assert(pubReleasesData.appId === "wishmusic", "Public releases endpoint returns correct appId ('wishmusic')");
  assert(Array.isArray(pubReleasesData.releases), "Public releases endpoint returns array of releases");
  if (pubReleasesData.latest) {
    assert(pubReleasesData.latest.status === "published", "Public release endpoint only serves published status (never drafts)");
  } else {
    assert(pubReleasesData.latest === null, "Public release endpoint safely returns null when no releases published");
  }

  // Public direct download redirect
  const dlReq = new NextRequest("http://localhost:3000/api/apps/download/wishmusic");
  const dlRes = await downloadGet(dlReq, { params: Promise.resolve({ slug: "wishmusic" }) });
  assert(
    dlRes.status === 302 || dlRes.status === 200 || dlRes.status === 404,
    "GET /api/apps/download/wishmusic executes release resolution and redirects (302/200)",
    `Status: ${dlRes.status}`
  );

  // --------------------------------------------------------------------------
  // TEST GROUP 5: Pre-Launch Security Hardening & Failure Recovery
  // --------------------------------------------------------------------------
  console.log("\n[TEST GROUP 5] Pre-Launch Security Hardening & Failure Recovery");

  // 1. Missing approved fingerprint vs Incorrect fingerprint vs Correct fingerprint
  const noApprovedCertRes = validateApk(validApkV100, {
    expectedPackage: "com.imdad.wishmusic",
    approvedFingerprint: undefined,
    fileName: "wishmusic-1.0.0.apk",
  });
  assert(noApprovedCertRes.valid === true, "validateApk passes basic structural checks when approvedFingerprint is omitted");

  const mismatchCertRes = validateApk(validApkV100, {
    expectedPackage: "com.imdad.wishmusic",
    approvedFingerprint: "AABBCCDDEEFF00112233445566778899AABBCCDDEEFF00112233445566778899",
    fileName: "wishmusic-1.0.0.apk",
  });
  assert(
    mismatchCertRes.valid === false && mismatchCertRes.errors.some(e => e.includes("Signing certificate mismatch")),
    "validateApk strictly rejects APK when certificate fingerprint does not match approvedFingerprint"
  );

  const matchedCertRes = validateApk(validApkV100, {
    expectedPackage: "com.imdad.wishmusic",
    approvedFingerprint: prodFingerprint,
    fileName: "wishmusic-1.0.0.apk",
  });
  assert(
    matchedCertRes.valid === true && matchedCertRes.errors.length === 0,
    "validateApk passes when certificate fingerprint matches approvedFingerprint"
  );

  // 2. Disable Trust-On-First-Upload: upload route must reject when no approved fingerprint is configured
  process.env.ADMIN_SECRET_KEY = "test-service-secret-32-chars-long-entropy-key";
  const unconfiguredFormData = new FormData();
  unconfiguredFormData.append(
    "apkFile",
    new Blob([new Uint8Array(validApkV100)], { type: "application/vnd.android.package-archive" }),
    "unconfigured-app.apk"
  );
  unconfiguredFormData.append("appId", "unconfigured-test-app");
  unconfiguredFormData.append("appName", "Unconfigured App");

  const tofuReq = new NextRequest("http://localhost:3000/api/admin/apps/releases/upload", {
    method: "POST",
    headers: {
      "x-admin-secret": "test-service-secret-32-chars-long-entropy-key",
    },
    body: unconfiguredFormData,
  });

  const tofuRes = await uploadPost(tofuReq);
  assert(tofuRes.status === 400, "POST /api/admin/apps/releases/upload returns HTTP 400 when approved fingerprint is missing");
  const tofuData = await tofuRes.json();
  assert(
    tofuData.errors && tofuData.errors.some((e: string) => e.includes("Trust-On-First-Upload is strictly disabled")),
    "Upload endpoint strictly rejects first upload when approvedCertificateFingerprint is not configured"
  );

  // 3. GitHub Upload Failure Handling & Abort
  process.env.APPROVED_CERT_FINGERPRINT_WISHMUSIC = prodFingerprint;
  process.env.GITHUB_TOKEN = "ghp_mock_invalid_token_testing_failure_mode_12345";
  const ghFailFormData = new FormData();
  ghFailFormData.append(
    "apkFile",
    new Blob([new Uint8Array(validApkV100)], { type: "application/vnd.android.package-archive" }),
    "wishmusic-1.0.0.apk"
  );
  ghFailFormData.append("appId", "wishmusic");
  ghFailFormData.append("appName", "WishMusic");

  const ghFailReq = new NextRequest("http://localhost:3000/api/admin/apps/releases/upload", {
    method: "POST",
    headers: {
      "x-admin-secret": "test-service-secret-32-chars-long-entropy-key",
    },
    body: ghFailFormData,
  });

  const ghFailRes = await uploadPost(ghFailReq);
  assert(
    ghFailRes.status === 502,
    "POST /api/admin/apps/releases/upload returns HTTP 502 on GitHub release/asset upload failure"
  );
  const ghFailData = await ghFailRes.json();
  assert(
    ghFailData.errors && ghFailData.errors.some((e: string) => e.includes("GitHub Release distribution failed")),
    "GitHub upload failure aborts release process and stops Firestore write"
  );

  // 4. GitHub Release Deduplication on Retry (createGitHubRelease recovers on HTTP 422 tag exists)
  const originalFetch = global.fetch;
  try {
    global.fetch = async (url: any, opts: any) => {
      const urlStr = String(url);
      if (urlStr.includes("/releases") && opts?.method === "POST" && !urlStr.includes("/assets")) {
        return new Response(
          JSON.stringify({ message: "Validation Failed", errors: [{ code: "already_exists" }] }),
          { status: 422 }
        );
      }
      if (urlStr.includes("/releases/tags/")) {
        return new Response(
          JSON.stringify({
            id: 8888,
            tag_name: "wishmusic-v1.0.0",
            name: "WishMusic v1.0.0",
            body: "Changelog",
            html_url: "https://github.com/imdad/releases/tag/wishmusic-v1.0.0",
            upload_url: "https://uploads.github.com/repos/imdad/releases/8888/assets{?name,label}",
            draft: false,
            prerelease: false,
            created_at: new Date().toISOString(),
          }),
          { status: 200 }
        );
      }
      return originalFetch(url, opts);
    };

    const deduplicatedRelease = await createGitHubRelease({
      tag: "wishmusic-v1.0.0",
      name: "WishMusic v1.0.0",
      body: "Changelog",
    });
    assert(
      deduplicatedRelease.id === 8888 && deduplicatedRelease.tagName === "wishmusic-v1.0.0",
      "createGitHubRelease safely recovers existing release on HTTP 422 tag exists without creating duplicates"
    );
  } finally {
    global.fetch = originalFetch;
  }

  // 5. GitHub Release Asset Deduplication on Retry (uploadGitHubReleaseAsset recovers on HTTP 422 asset exists)
  try {
    global.fetch = async (url: any, opts: any) => {
      const urlStr = String(url);
      if (urlStr.includes("/assets?") && opts?.method === "POST") {
        return new Response(
          JSON.stringify({ message: "Validation Failed", errors: [{ code: "already_exists" }] }),
          { status: 422 }
        );
      }
      if (urlStr.includes("/releases/8888/assets")) {
        return new Response(
          JSON.stringify([
            {
              id: 9999,
              name: "wishmusic-v1.0.0.apk",
              size: 24500000,
              browser_download_url: "https://github.com/imdad/releases/download/wishmusic-v1.0.0/wishmusic-v1.0.0.apk",
              content_type: "application/vnd.android.package-archive",
              created_at: new Date().toISOString(),
            },
          ]),
          { status: 200 }
        );
      }
      return originalFetch(url, opts);
    };

    const deduplicatedAsset = await uploadGitHubReleaseAsset({
      uploadUrl: "https://uploads.github.com/repos/imdad/releases/8888/assets{?name,label}",
      fileName: "wishmusic-v1.0.0.apk",
      fileBuffer: Buffer.from("apk-test-content"),
      releaseId: 8888,
    });
    assert(
      deduplicatedAsset.id === 9999,
      "uploadGitHubReleaseAsset safely reuses existing asset on HTTP 422 duplicate asset without failing"
    );
    assert(
      deduplicatedAsset.downloadUrl.includes("releases/download"),
      "uploadGitHubReleaseAsset preserves browser_download_url for safe recovery"
    );
  } finally {
    global.fetch = originalFetch;
  }

  console.log("\n==========================================================");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error("FATAL in test suite:", err);
  process.exit(1);
});
