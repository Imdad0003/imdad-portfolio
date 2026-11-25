import React from "react";
import { Badge } from "./Badge";

interface SectionHeadingProps {
  badgeText?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  badgeText,
  title,
  description,
  align = "left",
  className = "",
  as: HeadingTag = "h2",
}: SectionHeadingProps) {
  const alignClass =
    align === "center"
      ? "text-center mx-auto items-center"
      : "text-left items-start";

  return (
    <div
      className={`flex flex-col max-w-3xl mb-8 sm:mb-12 ${alignClass} ${className}`}
    >
      {badgeText && (
        <Badge variant="peach" size="md" className="mb-3 sm:mb-4">
          {badgeText}
        </Badge>
      )}
      <HeadingTag className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink-primary,#332924)] leading-[1.15]">
        {title}
      </HeadingTag>
      {description && (
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[var(--ink-body,#5F534D)] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
