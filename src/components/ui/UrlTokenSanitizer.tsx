"use client";

import { useEffect } from "react";

/**
 * URL Token Sanitizer
 * Automatically strips sensitive query tokens (?token=, &token=) from the browser address bar
 * and browser history using window.history.replaceState immediately on page mount.
 *
 * Prevents access tokens and verification keys from leaking into:
 * - Browser history & bookmarks
 * - Analytics trackers (e.g. Google Analytics page_path)
 * - Outbound HTTP Referer headers when navigating external links
 */
export function UrlTokenSanitizer() {
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.search) return;

    try {
      const url = new URL(window.location.href);
      const params = url.searchParams;

      let hasSensitiveParam = false;
      const sensitiveKeys = ["token", "accessToken", "x-order-token", "otp", "key", "secret"];

      for (const k of sensitiveKeys) {
        if (params.has(k)) {
          params.delete(k);
          hasSensitiveParam = true;
        }
      }

      if (hasSensitiveParam) {
        const cleanSearch = params.toString() ? `?${params.toString()}` : "";
        const cleanUrl = `${url.pathname}${cleanSearch}${url.hash}`;
        window.history.replaceState(window.history.state, "", cleanUrl);
      }
    } catch {
      // Silent error handler for URL sanitization
    }
  }, []);

  return null;
}
