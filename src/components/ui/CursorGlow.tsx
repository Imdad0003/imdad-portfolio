"use client";

import React, { useEffect, useState } from "react";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check for touch screens or reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (prefersReducedMotion || isTouch) return;

    let frameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      frameId = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
        if (!visible) setVisible(true);
      });
    };

    const handleMouseLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(frameId);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[4] transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: "480px",
        height: "480px",
        background:
          "radial-gradient(circle, rgba(246, 219, 192, 0.18) 0%, rgba(147, 80, 115, 0.05) 50%, transparent 75%)",
        borderRadius: "50%",
      }}
      aria-hidden="true"
    />
  );
}
