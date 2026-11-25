import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  variant?: "glass" | "elevated" | "accent" | "subtle";
  className?: string;
}

export function Card({
  children,
  hoverEffect = true,
  variant = "glass",
  className = "",
  ...props
}: CardProps) {
  const variantStyles = {
    glass:
      "m3-surface-1 text-[#332924]",
    elevated:
      "m3-surface-2 text-[#332924]",
    accent:
      "m3-surface-tonal text-[#332924]",
    subtle:
      "bg-[#F4EFE8]/80 backdrop-blur-md border border-[#E8DFD5]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_4px_14px_-4px_rgba(51,41,36,0.05)] text-[#332924]",
  };

  const hoverClass = hoverEffect ? "m3-card-interactive" : "";

  return (
    <div
      className={`rounded-[28px] p-6 sm:p-8 ${variantStyles[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
