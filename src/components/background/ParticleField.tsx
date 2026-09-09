"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  layer: 1 | 2 | 3;
  baseAngle: number;
  angularVelocity: number;
  baseRadius: number;
  radiusAmp: number;
  radialFreq: number;
  radialPhase: number;
  size: number;
  colorRgb: string; // e.g. "168, 85, 145"
  baseAlpha: number;
  alphaSpeed: number;
  alphaPhase: number;
  aspectSkew: number; // slight elliptical shape
  offsetX: number;
  offsetY: number;
}

const PASTEL_PALETTE = [
  "147, 80, 115", // Soft Violet
  "120, 70, 155", // Soft Purple
  "225, 130, 165", // Rose Pink
  "245, 175, 140", // Warm Peach
  "245, 145, 105", // Soft Coral Orange
  "130, 180, 240", // Soft Sky Blue
  "235, 110, 125", // Soft Crimson / Red
  "175, 140, 220", // Lavender
  "210, 160, 185", // Muted Orchid
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

    // Mouse tracking with smooth lerp
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    let currentMouseX = -1000;
    let currentMouseY = -1000;
    let isMouseActive = false;

    // Scroll tracking
    let scrollY = window.scrollY;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Determine particle count based on screen width (optimized for mobile performance)
    const getParticleCount = (w: number) => {
      if (w < 640) return 35; // Lightweight on mobile CPU/GPU
      if (w < 1024) return 90;
      return 200;
    };

    let particles: Particle[] = [];

    const initParticles = () => {
      const count = getParticleCount(width);
      particles = [];

      // Hero center area exclusion
      const isMobile = width < 768;
      const minRadius = isMobile ? 90 : 200;
      const maxRadius = Math.max(width, height) * 0.75;

      for (let i = 0; i < count; i++) {
        // Layer distribution: 60% Layer 1 (tiny, slow), 28% Layer 2 (medium), 12% Layer 3 (soft glow)
        const rand = Math.random();
        let layer: 1 | 2 | 3 = 1;
        let size = 1.0;
        let baseAlpha = 0.5;

        if (rand < 0.6) {
          layer = 1;
          size = 0.8 + Math.random() * 0.8; // 0.8 - 1.6px
          baseAlpha = 0.35 + Math.random() * 0.35;
        } else if (rand < 0.88) {
          layer = 2;
          size = 1.6 + Math.random() * 1.2; // 1.6 - 2.8px
          baseAlpha = 0.45 + Math.random() * 0.4;
        } else {
          layer = 3;
          size = 3.2 + Math.random() * 2.2; // 3.2 - 5.4px (blurred glow)
          baseAlpha = 0.2 + Math.random() * 0.3;
        }

        const distanceFactor = Math.pow(Math.random(), 0.75);
        const baseRadius = minRadius + distanceFactor * (maxRadius - minRadius);

        const speedDir = Math.random() > 0.45 ? 1 : -1;
        const baseSpeed =
          layer === 1
            ? 0.0004 + Math.random() * 0.0006
            : layer === 2
            ? 0.0006 + Math.random() * 0.0008
            : 0.0003 + Math.random() * 0.0005;

        const colorRgb =
          PASTEL_PALETTE[Math.floor(Math.random() * PASTEL_PALETTE.length)];

        particles.push({
          layer,
          baseAngle: Math.random() * Math.PI * 2,
          angularVelocity: baseSpeed * speedDir,
          baseRadius,
          radiusAmp: 15 + Math.random() * 40,
          radialFreq: 0.0008 + Math.random() * 0.0015,
          radialPhase: Math.random() * Math.PI * 2,
          size,
          colorRgb,
          baseAlpha,
          alphaSpeed: 0.001 + Math.random() * 0.002,
          alphaPhase: Math.random() * Math.PI * 2,
          aspectSkew: 0.85 + Math.random() * 0.3,
          offsetX: 0,
          offsetY: 0,
        });
      }
    };

    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const isMobileScreen = width < 768;
      // Clamp DPR to 1.5 on mobile to avoid high-DPI GPU fill-rate strain
      dpr = Math.min(window.devicePixelRatio || 1, isMobileScreen ? 1.5 : 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      initParticles();

      if (prefersReducedMotion) {
        draw(0, true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
      isMouseActive = true;
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("resize", handleResize);
    if (!isTouchDevice) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.addEventListener("mouseleave", handleMouseLeave);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    handleResize();

    let lastTime = performance.now();

    const draw = (currentTime: number, staticOnly = false) => {
      const delta = Math.min(currentTime - lastTime, 100);
      lastTime = currentTime;

      // Scroll fade: particles fade out gracefully as user scrolls down beyond hero
      const scrollFade = Math.max(0, 1 - scrollY / 750);
      if (scrollFade <= 0.02) {
        ctx.clearRect(0, 0, width, height);
        if (!staticOnly) {
          animationFrameId = requestAnimationFrame(draw);
        }
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      if (isMouseActive) {
        currentMouseX += (targetMouseX - currentMouseX) * 0.06;
        currentMouseY += (targetMouseY - currentMouseY) * 0.06;
      }

      // Hero anchor center: horizontally centered, vertical ~42% of viewport height
      const originX = width * 0.5;
      const originY = Math.min(height * 0.42, 380);

      // Render each particle
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!staticOnly) {
          p.baseAngle += p.angularVelocity * delta;
          p.radialPhase += p.radialFreq * delta;
          p.alphaPhase += p.alphaSpeed * delta;
        }

        // Radial oscillation (gentle wave movement)
        const currentR =
          p.baseRadius + Math.sin(p.radialPhase) * p.radiusAmp;

        // Position in orbital ellipse
        let x = originX + Math.cos(p.baseAngle) * currentR * p.aspectSkew;
        let y = originY + Math.sin(p.baseAngle) * currentR;

        // Subtle mouse reaction
        if (isMouseActive && !staticOnly) {
          const dx = x - currentMouseX;
          const dy = y - currentMouseY;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180;

          if (distToMouse < maxDist && distToMouse > 0) {
            const force = (1 - distToMouse / maxDist) * 18;
            const nx = dx / distToMouse;
            const ny = dy / distToMouse;
            p.offsetX += (nx * force - p.offsetX) * 0.08;
            p.offsetY += (ny * force - p.offsetY) * 0.08;
          } else {
            p.offsetX *= 0.94;
            p.offsetY *= 0.94;
          }
        } else {
          p.offsetX *= 0.94;
          p.offsetY *= 0.94;
        }

        x += p.offsetX;
        y += p.offsetY;

        // Dynamic alpha: gentle pulsing
        const alphaSine = 0.5 + 0.5 * Math.sin(p.alphaPhase);
        const dynamicAlpha =
          (p.baseAlpha * (0.7 + 0.3 * alphaSine)) * scrollFade;

        if (dynamicAlpha <= 0.01) continue;

        // Draw particle based on layer
        ctx.save();
        if (p.layer === 3) {
          // Soft blurred particle
          const glowGrad = ctx.createRadialGradient(
            x,
            y,
            0,
            x,
            y,
            p.size * 2.2
          );
          glowGrad.addColorStop(
            0,
            `rgba(${p.colorRgb}, ${dynamicAlpha * 0.9})`
          );
          glowGrad.addColorStop(
            0.5,
            `rgba(${p.colorRgb}, ${dynamicAlpha * 0.4})`
          );
          glowGrad.addColorStop(1, `rgba(${p.colorRgb}, 0)`);

          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(x, y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Sharp, crisp particle (Layer 1 or 2)
          ctx.fillStyle = `rgba(${p.colorRgb}, ${dynamicAlpha})`;
          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (!staticOnly) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    if (prefersReducedMotion) {
      draw(0, true);
    } else {
      animationFrameId = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
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
