"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";

interface ButtonBaseProps {
  variant?: "primary" | "secondary" | "tonal" | "outline" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  morph?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

interface RippleItem {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function Button({
  variant = "primary",
  size = "md",
  morph = true,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<RippleItem[]>([]);

  const triggerRipple = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleSize = Math.max(rect.width, rect.height) * 1.15;
    const id = Date.now() + Math.random();

    setRipples((prev) => [...prev.slice(-3), { id, x, y, size: rippleSize }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((item) => item.id !== id));
    }, 600);
  }, []);

  const shapeClasses = morph
    ? "rounded-full hover:rounded-[20px] active:rounded-[14px]"
    : "rounded-full";

  const baseStyles = `group relative overflow-hidden inline-flex items-center justify-center font-medium ${shapeClasses} transition-[transform,box-shadow,border-radius,background-color,border-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-ring disabled:opacity-50 disabled:pointer-events-none cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] select-none`;

  const sizeStyles = {
    sm: "text-xs px-4 py-2 min-h-[38px] font-semibold",
    md: "text-sm px-5 py-2.5 min-h-[44px] font-semibold",
    lg: "text-sm sm:text-base px-7 py-3.5 min-h-[52px] font-semibold",
  };

  const innerGapStyles = {
    sm: "gap-1.5",
    md: "gap-2",
    lg: "gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-b from-[#D5775C] to-[#BE5D43] hover:from-[#C96A50] hover:to-[#AF5138] text-white border border-[#B95B42] shadow-[inset_0_1.5px_0_rgba(255,255,255,0.35),0_8px_20px_-5px_rgba(201,106,80,0.48),0_2px_6px_-1px_rgba(51,41,36,0.12)] hover:shadow-[inset_0_1.5px_0_rgba(255,255,255,0.42),0_14px_30px_-6px_rgba(201,106,80,0.58),0_4px_12px_-2px_rgba(51,41,36,0.15)]",
    secondary:
      "bg-white/90 hover:bg-[#FFF9F6] backdrop-blur-md text-[#332924] border border-[#E2D6CA] hover:border-[#D8A999] shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),0_4px_14px_-4px_rgba(51,41,36,0.08),0_1px_3px_rgba(51,41,36,0.04)] hover:shadow-[inset_0_1.5px_0_rgba(255,255,255,1),0_12px_26px_-8px_rgba(201,106,80,0.2)]",
    tonal:
      "bg-[#FAECE4]/90 hover:bg-[#F6DED1] backdrop-blur-md text-[#A94E36] border border-[#F0CFC0] hover:border-[#E2B5A0] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_4px_14px_-4px_rgba(201,106,80,0.16)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_24px_-6px_rgba(201,106,80,0.26)]",
    outline:
      "bg-white/45 hover:bg-white/90 backdrop-blur-sm text-[#332924] border border-[#DDD2C6] hover:border-[#C96A50] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_8px_-2px_rgba(51,41,36,0.04)] hover:shadow-[0_10px_24px_-8px_rgba(201,106,80,0.18)]",
    glass:
      "bg-white/75 hover:bg-white/95 backdrop-blur-xl text-[#332924] border border-white/80 hover:border-[#D8A999] shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),0_8px_24px_-8px_rgba(51,41,36,0.1)] hover:shadow-[inset_0_1.5px_0_rgba(255,255,255,1),0_14px_30px_-8px_rgba(201,106,80,0.2)]",
    ghost:
      "bg-transparent hover:bg-[#F3ECE4]/85 text-[#5F534D] hover:text-[#332924]",
  };

  const rippleColor =
    variant === "primary" ? "bg-white/35" : "bg-[#C96A50]/20";

  const innerEffects = (
    <>
      {/* Subtle Expressive Specular Sheen on Hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      {/* Android 17 Tactile Ripple Waves */}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className={`pointer-events-none absolute rounded-full ${rippleColor} animate-m3-ripple`}
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
          }}
        />
      ))}
      <span className={`relative z-10 inline-flex items-center justify-center ${innerGapStyles[size]}`}>
        {children}
      </span>
    </>
  );

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (props.href) {
    const { onPointerDown, href, ...restAnchorProps } =
      props as React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

    const handleAnchorPointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
      triggerRipple(e);
      onPointerDown?.(e);
    };

    const isInternal =
      (href.startsWith("/") || href.startsWith("#")) &&
      !href.startsWith("//");

    if (isInternal) {
      return (
        <Link
          href={href}
          className={combinedClasses}
          onPointerDown={handleAnchorPointerDown}
          {...restAnchorProps}
        >
          {innerEffects}
        </Link>
      );
    }

    return (
      <a
        href={href}
        className={combinedClasses}
        onPointerDown={handleAnchorPointerDown}
        {...restAnchorProps}
      >
        {innerEffects}
      </a>
    );
  }

  const { onPointerDown, ...restButtonProps } =
    props as React.ButtonHTMLAttributes<HTMLButtonElement>;

  const handleButtonPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    triggerRipple(e);
    onPointerDown?.(e);
  };

  return (
    <button
      className={combinedClasses}
      onPointerDown={handleButtonPointerDown}
      {...restButtonProps}
    >
      {innerEffects}
    </button>
  );
}
