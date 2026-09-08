"use client";

import React, { useEffect, useState } from "react";

export function AmbientGlow() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (prefersReducedMotion || isTouch) return;

    let frameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized offset from center [-1, 1]
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetX = nx * 35; // max 35px shift
      targetY = ny * 35;
    };

    const updatePosition = () => {
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;
      setMouseOffset({ x: currentX, y: currentY });
      frameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    frameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden transition-transform duration-700 ease-out"
      style={{
        transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
      }}
      aria-hidden="true"
    >
      {/* 1. Top-Left / Center-Left Soft Violet Orb */}
      <div
        className="absolute -top-32 -left-20 w-[650px] h-[650px] sm:w-[850px] sm:h-[850px] rounded-full bg-gradient-to-br from-[#935073]/12 via-[#502D55]/08 to-transparent blur-[180px] sm:blur-[220px] motion-reduce:animate-none animate-liquid-pulse"
        style={{ animationDuration: "14s" }}
      />

      {/* 2. Hero Center-Right Warm Peach & Rose Orb */}
      <div
        className="absolute top-[8%] -right-24 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full bg-gradient-to-bl from-[#F6DBC0]/40 via-[#eab8a5]/25 to-transparent blur-[180px] sm:blur-[240px] motion-reduce:animate-none animate-liquid-pulse"
        style={{ animationDuration: "16s", animationDelay: "-4s" }}
      />

      {/* 3. Central Ambient Sky Blue Hue (ultra-subtle atmospheric breath) */}
      <div
        className="absolute top-[28%] left-[25%] w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-gradient-to-tr from-[#9bbce8]/18 via-[#b8d4f6]/10 to-transparent blur-[200px] sm:blur-[260px] motion-reduce:animate-none animate-liquid-pulse"
        style={{ animationDuration: "18s", animationDelay: "-8s" }}
      />

      {/* 4. Lower-Page Rose & Soft Lavender Bloom */}
      <div
        className="absolute top-[58%] -left-32 w-[700px] h-[700px] sm:w-[900px] sm:h-[900px] rounded-full bg-gradient-to-tr from-[#e6b3cb]/20 via-[#c39ac7]/15 to-transparent blur-[200px] sm:blur-[250px] motion-reduce:animate-none animate-liquid-pulse"
        style={{ animationDuration: "20s", animationDelay: "-11s" }}
      />

      {/* 5. Footer / Bottom Warm Peach Grounding */}
      <div
        className="absolute bottom-[-100px] right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-t from-[#F6DBC0]/30 to-transparent blur-[200px] pointer-events-none"
      />
    </div>
  );
}
