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
      "bg-white/75 backdrop-blur-xl border border-[#502D55]/08 shadow-[0_10px_30px_-5px_rgba(80,45,85,0.04),inset_0_1px_0_0_rgba(255,255,255,0.9)] text-[#180D1D]",
    elevated:
      "bg-white/90 backdrop-blur-2xl border border-[#502D55]/12 shadow-[0_20px_45px_-10px_rgba(80,45,85,0.07),inset_0_1px_0_0_rgba(255,255,255,1)] text-[#180D1D]",
    accent:
      "bg-gradient-to-br from-white/90 via-[#FDF9F5]/85 to-[#FAF0F4]/75 backdrop-blur-xl border border-[#935073]/20 shadow-[0_15px_35px_-5px_rgba(147,80,115,0.08),inset_0_1px_0_0_rgba(255,255,255,1)] text-[#180D1D]",
    subtle:
      "bg-white/60 backdrop-blur-lg border border-[#502D55]/06 shadow-[0_8px_20px_-5px_rgba(80,45,85,0.03)] text-[#180D1D]",
  };

  const hoverClass = hoverEffect
    ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#935073]/30 hover:shadow-[0_20px_40px_-10px_rgba(80,45,85,0.08),0_0_25px_-5px_rgba(246,219,192,0.4)]"
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
