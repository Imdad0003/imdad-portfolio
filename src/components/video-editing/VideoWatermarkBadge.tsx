import React from "react";
import { WatermarkConfig } from "@/types/video-editing";

interface VideoWatermarkBadgeProps {
  config: WatermarkConfig;
  className?: string;
}

export function VideoWatermarkBadge({ config, className = "" }: VideoWatermarkBadgeProps) {
  if (!config.enabled) return null;

  // Position mapping
  const positionClasses = {
    "top-left": "top-2.5 left-2.5",
    "top-right": "top-2.5 right-2.5",
    "bottom-left": "bottom-2.5 left-2.5",
    "bottom-right": "bottom-2.5 right-2.5",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  }[config.position || "bottom-right"];

  const opacityStyle = {
    opacity: (config.opacity || 80) / 100,
  };

  return (
    <div
      className={`absolute z-20 pointer-events-none select-none ${positionClasses} ${className}`}
      style={opacityStyle}
    >
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse shrink-0" />
        <div className="flex flex-col text-left leading-none">
          <span className="font-mono text-[9px] sm:text-[10px] font-black tracking-wider uppercase text-white drop-shadow-sm">
            {config.text || "IMDAD.BUILDS // VIDEO LAB"}
          </span>
          {config.subtext && (
            <span className="font-mono text-[7px] text-white/70 uppercase tracking-widest mt-0.5">
              {config.subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
