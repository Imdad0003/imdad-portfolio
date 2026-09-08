import React from "react";

interface ButtonBaseProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
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

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus-ring disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:scale-[0.98]";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 gap-1.5 font-medium",
    md: "text-sm px-5 py-2.5 gap-2 font-semibold",
    lg: "text-base px-7 py-3.5 gap-2.5 font-bold tracking-tight",
  };

  const variantStyles = {
    primary:
      "bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] font-bold shadow-[0_4px_20px_-2px_rgba(24,13,29,0.25)] hover:shadow-[0_8px_30px_-4px_rgba(80,45,85,0.35)] hover:scale-[1.02] border border-[#502D55]/30",
    secondary:
      "bg-white/80 hover:bg-white text-[#180D1D] border border-[#502D55]/15 hover:border-[#935073]/35 backdrop-blur-md shadow-[0_4px_16px_-2px_rgba(80,45,85,0.06)] hover:scale-[1.01]",
    outline:
      "bg-transparent hover:bg-white/70 text-[#180D1D] border border-[#502D55]/20 hover:border-[#935073]/50 backdrop-blur-sm shadow-sm",
    glass:
      "bg-white/70 hover:bg-white/95 text-[#180D1D] border border-white/80 hover:border-[#935073]/30 backdrop-blur-xl shadow-[0_8px_25px_0_rgba(80,45,85,0.06)]",
    ghost:
      "bg-transparent hover:bg-[#502D55]/08 text-[#56475C] hover:text-[#180D1D]",
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (props.href) {
    return (
      <a className={combinedClasses} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button
      className={combinedClasses}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
