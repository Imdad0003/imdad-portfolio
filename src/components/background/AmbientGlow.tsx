"use client";

import React from "react";

export function AmbientGlow() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Top-Left Electric Blue Ambient Orb */}
      <div
        className="absolute -top-24 -left-16 w-[320px] h-[320px] sm:w-[800px] sm:h-[800px] rounded-full bg-gradient-to-br from-[#0284C7]/08 via-[#38BDF8]/04 to-transparent blur-[100px] sm:blur-[200px]"
      />

      {/* 2. Top-Right Soft Ice-Blue & Cyan Accent */}
      <div
        className="absolute top-[4%] -right-20 w-[280px] h-[280px] sm:w-[750px] sm:h-[750px] rounded-full bg-gradient-to-bl from-[#BAE6FD]/30 via-[#0EA5E9]/06 to-transparent blur-[90px] sm:blur-[220px]"
      />

      {/* 3. Subtle Bottom Clean Sky Orb */}
      <div
        className="absolute bottom-[-100px] right-[10%] w-[300px] h-[300px] sm:w-[650px] sm:h-[650px] rounded-full bg-gradient-to-t from-[#0284C7]/05 to-transparent blur-[100px] sm:blur-[220px]"
      />
    </div>
  );
}
