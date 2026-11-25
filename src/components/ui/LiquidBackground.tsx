"use client";

import React from "react";
import { AmbientGlow } from "@/components/background/AmbientGlow";

export function LiquidBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Calm Warm Cream Paper Background — Zero distracting particles or cold tints */}
      <div className="absolute inset-0 bg-[#FAF7F2] z-0" />
      <div
        className="absolute inset-0 z-0 opacity-85"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, #FFFFFF 0%, #FAF7F2 65%, #F4EFE8 100%)",
        }}
      />
      <AmbientGlow />
    </div>
  );
}
