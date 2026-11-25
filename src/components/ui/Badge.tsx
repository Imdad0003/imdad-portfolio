import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "default" | "peach" | "rose" | "violet" | "outline" | "emerald";
  size?: "sm" | "md";
  pulse?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  pulse = false,
  className = "",
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2.5 py-0.5 font-medium",
    md: "text-xs px-3.5 py-1 font-semibold",
  };

  const variantClasses = {
    default:
      "bg-white/90 backdrop-blur-md text-[#332924] border border-[#E8DFD5] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_8px_-2px_rgba(51,41,36,0.06)]",
    peach:
      "bg-[#FAECE4]/90 backdrop-blur-md text-[#B4583F] border border-[#F0CFC0] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_12px_-4px_rgba(201,106,80,0.18)]",
    rose:
      "bg-[#F6EAEF]/90 backdrop-blur-md text-[#8E5568] border border-[#E6CDD7] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_12px_-4px_rgba(154,91,107,0.16)]",
    violet:
      "bg-[#F4EFE8]/90 backdrop-blur-md text-[#332924] border border-[#E8DFD5] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_2px_8px_-2px_rgba(51,41,36,0.05)]",
    outline:
      "bg-white/75 backdrop-blur-md text-[#5F534D] border border-[#E8DFD5] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]",
    emerald:
      "bg-[#FDF4EA]/90 backdrop-blur-md text-[#9A6324] border border-[#F3DCBE] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C96A50] opacity-65" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C96A50]" />
        </span>
      )}
      {children}
    </span>
  );
}
