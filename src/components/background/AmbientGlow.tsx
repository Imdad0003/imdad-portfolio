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
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetX = nx * 25;
      targetY = ny * 25;
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
      {/* 1. Top-Left Restrained Violet Orb */}
      <div
        className="absolute -top-24 -left-16 w-[320px] h-[320px] sm:w-[800px] sm:h-[800px] rounded-full bg-gradient-to-br from-[#502D55]/07 to-transparent blur-[100px] sm:blur-[200px]"
      />

      {/* 2. Top-Right Restrained Studio Rose & Peach Accent */}
      <div
        className="absolute top-[4%] -right-20 w-[280px] h-[280px] sm:w-[750px] sm:h-[750px] rounded-full bg-gradient-to-bl from-[#F6DBC0]/20 via-[#935073]/06 to-transparent blur-[90px] sm:blur-[220px]"
      />

      {/* 3. Subtle Bottom Grounding Orb */}
      <div
        className="absolute bottom-[-100px] right-[10%] w-[300px] h-[300px] sm:w-[650px] sm:h-[650px] rounded-full bg-gradient-to-t from-[#935073]/05 to-transparent blur-[100px] sm:blur-[220px]"
      />
    </div>
  );
}
