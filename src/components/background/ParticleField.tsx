"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  colorRgb: string;
}

// Studio restrained palette: warm violet-night, muted studio rose, subtle warm taupe
const STUDIO_PALETTE = [
  "24, 13, 29",   // Night Violet (subtle dark)
  "80, 45, 85",   // Deep Studio Violet
  "147, 80, 115", // Muted Studio Rose
  "184, 104, 144",// Soft Rose Accent
];

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let scrollY = window.scrollY;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Restrained count for studio cleanliness and peak battery/CPU performance
    const getParticleCount = (w: number) => {
      if (w < 640) return 20;
      if (w < 1024) return 40;
      return 65;
    };

    let particles: Particle[] = [];

    const initParticles = () => {
      const count = getParticleCount(width);
      particles = [];

      for (let i = 0; i < count; i++) {
        const size = 1.0 + Math.random() * 1.5;
        const baseAlpha = 0.08 + Math.random() * 0.18;
        const colorRgb =
          STUDIO_PALETTE[Math.floor(Math.random() * STUDIO_PALETTE.length)];

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -0.1 - Math.random() * 0.2, // gentle upward drift
          size,
          alpha: baseAlpha,
          baseAlpha,
          colorRgb,
        });
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      initParticles();

      if (prefersReducedMotion) {
        draw(true);
      }
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleResize();

    const draw = (staticOnly = false) => {
      // Fade out as user scrolls deeply into content
      const scrollFade = Math.max(0, 1 - scrollY / 900);
      ctx.clearRect(0, 0, width, height);

      if (scrollFade <= 0.01) {
        if (!staticOnly) {
          animationFrameId = requestAnimationFrame(() => draw(false));
        }
        return;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!staticOnly) {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap boundaries gently
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        const currentAlpha = p.alpha * scrollFade;
        ctx.fillStyle = `rgba(${p.colorRgb}, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!staticOnly) {
        animationFrameId = requestAnimationFrame(() => draw(false));
      }
    };

    if (prefersReducedMotion) {
      draw(true);
    } else {
      animationFrameId = requestAnimationFrame(() => draw(false));
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[2]"
      aria-hidden="true"
    />
  );
}
