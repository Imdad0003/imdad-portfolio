import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: "default" | "narrow" | "wide";
  children: React.ReactNode;
}

export function Container({
  className = "",
  size = "default",
  children,
  ...props
}: ContainerProps) {
  const sizeClasses = {
    narrow: "max-w-4xl",
    default: "max-w-7xl",
    wide: "max-w-[1400px]",
  };

  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
