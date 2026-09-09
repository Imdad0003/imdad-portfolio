import React from "react";
import { Badge } from "./Badge";

interface SectionHeadingProps {
  badgeText?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  badgeText,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const alignClass =
    align === "center"
      ? "text-center mx-auto items-center"
      : "text-left items-start";

  return (
    <div
      className={`flex flex-col max-w-3xl mb-8 sm:mb-16 ${alignClass} ${className}`}
    >
      {badgeText && (
        <Badge variant="peach" size="md" className="mb-3 sm:mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d97746] animate-pulse shadow-[0_0_8px_rgba(217,119,70,0.6)]" />
          {badgeText}
        </Badge>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#180D1D]">
        {title}
      </h2>
      {description && (
        <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-[#56475C] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
