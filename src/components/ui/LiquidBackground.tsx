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
      {/* Layer 0: Base Light Background (#F8F4E9 / #FFFFFF with subtle warm gradients) */}
      <div className="absolute inset-0 bg-[#F8F4E9] z-0" />
      <div
        className="absolute inset-0 z-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, #FFFFFF 0%, #FDFBF7 45%, #F8F4E9 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(246, 219, 192, 0.2) 0%, rgba(255, 255, 255, 0) 35%, rgba(147, 80, 115, 0.05) 70%, rgba(248, 244, 233, 0.8) 100%)",
        }}
      />

      {/* Layer 1: Ambient Glow Orbs */}
      <AmbientGlow />

      {/* Layer 2: Animated Particle Field */}
      <ParticleField />

      {/* Layer 3: Existing Organic Liquid Ribbons & Subtle Analog Texture */}
      <div className="absolute inset-0 z-[3] pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full opacity-30 mix-blend-multiply motion-reduce:animate-none animate-ribbon-drift"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="softRibbon1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F6DBC0" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#935073" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#502D55" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="softRibbon2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#935073" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#502D55" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F6DBC0" stopOpacity="0.1" />
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
