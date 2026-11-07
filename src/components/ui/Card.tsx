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
      "bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(10,25,47,0.04),inset_0_1px_0_0_rgba(255,255,255,0.9)] text-[#0A192F]",
    elevated:
      "bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-[0_20px_45px_-10px_rgba(10,25,47,0.07),inset_0_1px_0_0_rgba(255,255,255,1)] text-[#0A192F]",
    accent:
      "bg-gradient-to-br from-white via-sky-50/40 to-blue-50/30 backdrop-blur-xl border border-sky-300/40 shadow-[0_15px_35px_-5px_rgba(2,132,199,0.08),inset_0_1px_0_0_rgba(255,255,255,1)] text-[#0A192F]",
    subtle:
      "bg-white/60 backdrop-blur-lg border border-slate-200/60 shadow-[0_8px_20px_-5px_rgba(10,25,47,0.03)] text-[#0A192F]",
  };

  const hoverClass = hoverEffect
    ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#0284C7]/40 hover:shadow-[0_20px_40px_-10px_rgba(10,25,47,0.08),0_0_25px_-5px_rgba(2,132,199,0.15)]"
    : "";

  return (
    <div
      className={`rounded-2xl p-6 sm:p-8 ${variantStyles[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
