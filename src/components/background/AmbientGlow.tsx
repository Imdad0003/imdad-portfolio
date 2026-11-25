"use client";

import React from "react";

export function AmbientGlow() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden"
      aria-hidden="true"
    >
      {/* Lightweight warm wash for phones; animated blurred aurora reserved for desktop */}
      <div
        className="md:hidden absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 45% at 15% 0%, rgba(250, 214, 196, 0.38) 0%, transparent 70%), radial-gradient(ellipse 85% 45% at 90% 100%, rgba(253, 228, 200, 0.35) 0%, transparent 70%)",
        }}
      />

      {/* Top-Left Warm Peach Material You Wash */}
      <div
        className="hidden md:block absolute -top-32 -left-24 w-[740px] h-[740px] rounded-full blur-[120px] animate-m3-aurora"
        style={{
          background:
            "radial-gradient(circle, rgba(250, 214, 196, 0.55) 0%, rgba(250, 236, 228, 0.25) 60%, transparent 100%)",
        }}
      />

      {/* Top-Right Soft Terracotta & Rose Tonal Accent */}
      <div
        className="hidden md:block absolute top-16 -right-32 w-[520px] h-[520px] rounded-full blur-[130px] animate-m3-aurora"
        style={{
          animationDelay: "-6s",
          background:
            "radial-gradient(circle, rgba(235, 192, 182, 0.35) 0%, rgba(246, 234, 239, 0.28) 55%, transparent 100%)",
        }}
      />

      {/* Bottom-Right Soft Apricot Wash */}
      <div
        className="hidden md:block absolute -bottom-36 -right-24 w-[700px] h-[700px] rounded-full blur-[135px] animate-m3-aurora"
        style={{
          animationDelay: "-12s",
          background:
            "radial-gradient(circle, rgba(253, 228, 200, 0.62) 0%, rgba(253, 244, 234, 0.3) 60%, transparent 100%)",
        }}
      />
    </div>
  );
}
