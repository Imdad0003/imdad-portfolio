/**
 * Asset Sanitizer and Security Validator for IMDAD.BUILDS
 *
 * Enforces strict MIME and payload validation for digital assets.
 * Inspects SVGs for stored XSS vectors (script tags, event handlers, javascript: URIs).
 */

export interface AssetValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFileName: string;
  detectedType: string;
}

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

export const ALLOWED_MEDIA_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "video/mp4",
  "video/webm",
];

export const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * Strips directory traversal, special characters, and normalizes file names.
 */
export function sanitizeFileName(name: string): string {
  // Strip path segments
  const baseName = name.replace(/^.*[\\/]/, "");
  // Replace characters outside alphanumeric, dot, dash, underscore
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Prevent double dots
  return sanitized.replace(/\.{2,}/g, ".");
}

/**
 * Decodes XML / HTML character entity references to detect obfuscated XSS payloads.
 */
function decodeXmlEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-fA-F]+);?/g, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return "";
      }
    })
    .replace(/&#([0-9]+);?/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return "";
      }
    })
    .replace(/&colon;/gi, ":")
    .replace(/&tab;/gi, "\t")
    .replace(/&newline;/gi, "\n");
}

/**
 * Validates SVG content against active content vectors (XSS, scripts, foreign objects).
 */
export function validateSvgContent(svgText: string): { safe: boolean; reason?: string } {
  // Check both raw text and decoded text to defeat entity-encoded obfuscation
  const decoded = decodeXmlEntities(svgText);
  const lowerRaw = svgText.toLowerCase();
  const lowerDecoded = decoded.toLowerCase();

  // Basic check that it looks like XML / SVG
  if (!lowerRaw.includes("<svg") && !lowerDecoded.includes("<svg")) {
    return { safe: false, reason: "File does not contain a valid <svg> element." };
  }

  // Check for dangerous tags (in raw or decoded content)
  const dangerousTags = [
    "<script",
    "<iframe",
    "<object",
    "<embed",
    "<foreignobject",
    "<applet",
    "<meta",
    "<link",
    "<form",
    "<base",
  ];
  for (const tag of dangerousTags) {
    if (lowerRaw.includes(tag) || lowerDecoded.includes(tag)) {
      return {
        safe: false,
        reason: `SVG contains unsafe tag '${tag.replace("<", "")}'. Only clean vector graphics are permitted.`,
      };
    }
  }

  // Check for inline event handlers (e.g. onload, onerror, onclick)
  const eventHandlerPattern = /\bon[a-z]{3,}\s*=/i;
  if (eventHandlerPattern.test(svgText) || eventHandlerPattern.test(decoded)) {
    return {
      safe: false,
      reason: "SVG contains inline JavaScript event handlers (e.g. onload/onerror).",
    };
  }

  // Check for javascript: or vbscript: or data:text/html URIs in attributes
  const dangerousUriPattern = /(javascript|vbscript|data\s*:\s*text\/html)\s*:/i;
  // Strip whitespace inside URI strings to catch 'j a v a s c r i p t :'
  const collapsed = lowerDecoded.replace(/[\s\r\n\t]/g, "");
  if (dangerousUriPattern.test(svgText) || dangerousUriPattern.test(decoded) || dangerousUriPattern.test(collapsed)) {
    return {
      safe: false,
      reason: "SVG contains executable URI scheme (javascript: or data:text/html).",
    };
  }

  // Check <style> contents for @import or expressions or javascript:
  if (lowerDecoded.includes("<style")) {
    if (
      lowerDecoded.includes("@import") ||
      lowerDecoded.includes("expression(") ||
      lowerDecoded.includes("javascript:")
    ) {
      return {
        safe: false,
        reason: "SVG contains unsafe CSS rules (@import, expression, or javascript in <style>).",
      };
    }
  }

  return { safe: true };
}

/**
 * Comprehensive client-side validation for media uploads.
 */
export async function validateMediaFile(
  file: File,
  options?: { allowVideo?: boolean }
): Promise<AssetValidationResult> {
  const sanitizedName = sanitizeFileName(file.name);
  const allowVideo = options?.allowVideo ?? true;
  const allowedTypes = allowVideo ? ALLOWED_MEDIA_TYPES : ALLOWED_IMAGE_TYPES;

  // 1. Extension check
  const extMatch = sanitizedName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "";
  const validExtensions = allowVideo
    ? ["jpg", "jpeg", "png", "webp", "svg", "mp4", "webm"]
    : ["jpg", "jpeg", "png", "webp", "svg"];

  if (!validExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file extension '.${ext}'. Allowed: ${validExtensions.join(", ")}.`,
      sanitizedFileName: sanitizedName,
      detectedType: file.type || "unknown",
    };
  }

  // 2. MIME type check
  const type = file.type || (ext === "svg" ? "image/svg+xml" : `image/${ext === "jpg" ? "jpeg" : ext}`);
  if (!allowedTypes.some((t) => t === type || (t.startsWith("image/") && type.startsWith("image/")))) {
    return {
      valid: false,
      error: `Unsupported MIME type '${type}'.`,
      sanitizedFileName: sanitizedName,
      detectedType: type,
    };
  }

  // 3. File size check
  const isVideo = type.startsWith("video/") || ["mp4", "webm"].includes(ext);
  const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (file.size > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum limit of ${maxMb} MB.`,
      sanitizedFileName: sanitizedName,
      detectedType: type,
    };
  }

  // 4. SVG Content Sanitization
  if (ext === "svg" || type === "image/svg+xml") {
    try {
      const text = await file.text();
      const svgCheck = validateSvgContent(text);
      if (!svgCheck.safe) {
        return {
          valid: false,
          error: svgCheck.reason || "SVG failed security inspection.",
          sanitizedFileName: sanitizedName,
          detectedType: type,
        };
      }
    } catch {
      return {
        valid: false,
        error: "Could not read SVG content for security validation.",
        sanitizedFileName: sanitizedName,
        detectedType: type,
      };
    }
  }

  return {
    valid: true,
    sanitizedFileName: sanitizedName,
    detectedType: type,
  };
}
