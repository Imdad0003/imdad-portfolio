"use client";

import React from "react";
import { AmbientGlow } from "@/components/background/AmbientGlow";
import { ParticleField } from "@/components/background/ParticleField";

export function LiquidBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Layer 0: Base Clean Light Background (#F8FAFC / #FFFFFF with subtle ice-blue gradients) */}
      <div className="absolute inset-0 bg-[#F8FAFC] z-0" />
      <div
        className="absolute inset-0 z-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, #FFFFFF 0%, #F0F9FF 50%, #F8FAFC 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(224, 242, 254, 0.3) 0%, rgba(255, 255, 255, 0) 35%, rgba(14, 165, 233, 0.04) 70%, rgba(248, 250, 252, 0.8) 100%)",
        }}
      />

      {/* Layer 1: Ambient Glow Orbs */}
      <AmbientGlow />

      {/* Layer 2: Animated Particle Field */}
      <ParticleField />

      {/* Layer 3: Organic Technical Ribbons & Subtle Texture */}
      <div className="absolute inset-0 z-[3] pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full opacity-35 mix-blend-multiply motion-reduce:animate-none animate-ribbon-drift"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="softRibbon1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#0284C7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="softRibbon2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          <path
            d="M-100,200 C300,80 600,320 1000,160 C1250,50 1400,240 1600,120"
            fill="none"
            stroke="url(#softRibbon1)"
            strokeWidth="1.8"
            filter="blur(1px)"
          />

          <path
            d="M-80,650 C320,500 720,780 1150,580 C1380,460 1480,680 1620,560"
            fill="none"
            stroke="url(#softRibbon2)"
            strokeWidth="1.5"
            filter="blur(1px)"
          />
        </svg>

        {/* Subtle Noise Texture for tactile finish */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.018] mix-blend-multiply">
          <filter id="calmNoise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#calmNoise)" />
        </svg>
      </div>
    </div>
  );
}
