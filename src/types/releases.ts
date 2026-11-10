export type ReleaseChannel = "stable" | "beta";

export type ReleaseStatus = "draft" | "published" | "archived" | "rolled_back";

export type ReleaseHostingProvider = "github" | "storage" | "custom";

export interface ApkParsedMetadata {
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdkVersion: number;
  minAndroidVersion: string;
  targetSdkVersion: number;
  targetAndroidVersion: string;
  permissions: string[];
  fileSize: number;
  fileSizeFormatted: string;
  sha256: string;
  fileName: string;
  isProductionSigned: boolean;
  isSigned: boolean;
  isDebugSigned: boolean;
  signingScheme: "v1" | "v2" | "v3" | "none";
  certificateSubject: string;
  certificateIssuer: string;
  certificateFingerprintSha256: string;
  certificateValidFrom?: string;
  certificateValidTo?: string;
  signatureErrors?: string[];
}

export interface ApkValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: ApkParsedMetadata;
}

export interface AppReleaseDocument {
  id: string; // e.g., "wishmusic_100" or "{appId}_{versionCode}"
  appId: string; // e.g., "wishmusic"
  appName: string; // e.g., "WishMusic"
  packageName: string; // e.g., "com.imdad.wishmusic"
  versionName: string; // e.g., "1.0.0"
  versionCode: number; // e.g., 100
  releaseTitle: string; // e.g., "WishMusic v1.0.0 Official Launch"
  releaseNotes: string; // Full markdown or text changelog
  channel: ReleaseChannel;
  status: ReleaseStatus;
  isLatestStable: boolean;

  // Binary Metadata
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  sha256: string;
  minSdkVersion: number;
  minAndroidVersion: string;
  targetSdkVersion: number;
  targetAndroidVersion: string;
  permissions: string[];

  // Security & Signatures
  certificateFingerprintSha256: string;
  certificateSubject: string;
  isProductionSigned: boolean;

  // Distribution
  hostingProvider: ReleaseHostingProvider;
  downloadUrl: string;
  githubReleaseId?: number;
  githubTag?: string;
  githubAssetId?: number;

  // Audit
  uploadedBy: string;
  createdAt: string;
  publishedAt?: string;
  updatedAt: string;
  verificationTrust?: string;
  verifiedAt?: string;
}

export interface StructuredReleaseManifest {
  appId: string;
  appName: string;
  githubReleaseId: number;
  releaseTag: string;
  releaseName: string;
  assetId: number;
  assetFileName: string;
  assetDownloadUrl: string;
  assetSize: number;
  assetSizeFormatted: string;
  sha256: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdkVersion: number;
  minAndroidVersion?: string;
  targetSdkVersion: number;
  targetAndroidVersion?: string;
  certificateFingerprintSha256: string;
  certificateSubject: string;
  isProductionSigned: boolean;
  signingScheme: string;
  publishedAt: string;
  verifiedLocallyBy: "apksigner" | "node-apk-parser";
}

export interface ReleaseAuditLogDocument {
  id: string;
  appId: string;
  releaseId?: string;
  action: "upload" | "validate" | "publish" | "rollback" | "archive" | "download";
  performedBy: string;
  details: Record<string, unknown> | string;
  timestamp: string;
}
