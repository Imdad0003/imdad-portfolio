import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "default" | "peach" | "rose" | "violet" | "outline" | "emerald";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: "text-[11px] px-2.5 py-0.5 font-medium tracking-wide",
    md: "text-xs px-3 py-1 font-semibold tracking-wide",
  };

  const variantClasses = {
    default:
      "bg-white/80 text-[#180D1D] border border-[#502D55]/12 backdrop-blur-md shadow-sm",
    peach:
      "bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0] backdrop-blur-md shadow-[0_2px_10px_rgba(246,219,192,0.5)]",
    rose:
      "bg-[#FAF0F4] text-[#78284C] border border-[#d69fb5]/40 backdrop-blur-md shadow-sm",
    violet:
      "bg-[#F5EFF6] text-[#502D55] border border-[#935073]/25 backdrop-blur-md shadow-sm",
    outline:
      "bg-white/50 text-[#56475C] border border-[#502D55]/15 backdrop-blur-sm",
    emerald:
      "bg-[#FAF2EA] text-[#7A3F26] border border-[#F6DBC0] backdrop-blur-md shadow-[0_2px_10px_rgba(246,219,192,0.5)]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full transition-all duration-200 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
