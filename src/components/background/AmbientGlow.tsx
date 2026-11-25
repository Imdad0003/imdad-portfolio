"use client";

import React from "react";

export function AmbientGlow() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden"
      aria-hidden="true"
    >
      {/* Top-Left Warm Peach Material You Wash */}
      <div
        className="absolute -top-32 -left-24 w-[360px] h-[360px] sm:w-[740px] sm:h-[740px] rounded-full blur-[120px] animate-m3-aurora"
        style={{
          background:
            "radial-gradient(circle, rgba(250, 214, 196, 0.55) 0%, rgba(250, 236, 228, 0.25) 60%, transparent 100%)",
        }}
      />

      {/* Top-Right Soft Terracotta & Rose Tonal Accent */}
      <div
        className="hidden sm:block absolute top-16 -right-32 w-[520px] h-[520px] rounded-full blur-[130px] animate-m3-aurora"
        style={{
          animationDelay: "-6s",
          background:
            "radial-gradient(circle, rgba(235, 192, 182, 0.35) 0%, rgba(246, 234, 239, 0.28) 55%, transparent 100%)",
        }}
      />

      {/* Bottom-Right Soft Apricot Wash */}
      <div
        className="absolute -bottom-36 -right-24 w-[340px] h-[340px] sm:w-[700px] sm:h-[700px] rounded-full blur-[135px] animate-m3-aurora"
        style={{
          animationDelay: "-12s",
          background:
            "radial-gradient(circle, rgba(253, 228, 200, 0.62) 0%, rgba(253, 244, 234, 0.3) 60%, transparent 100%)",
        }}
      />
    </div>
  );
}
