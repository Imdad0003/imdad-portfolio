"use client";

import React, { useState } from "react";
import { Maximize2, X, ChevronLeft, ChevronRight, Film, Image as ImageIcon } from "lucide-react";
import { GalleryItem } from "@/types/cms";

interface ProjectGalleryLightboxProps {
  items: GalleryItem[];
  coverImageUrl?: string;
  projectName: string;
}

export function ProjectGalleryLightbox({
  items,
  coverImageUrl,
  projectName,
}: ProjectGalleryLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!items || items.length === 0) {
    return null;
  }

  const activeItem = selectedIndex !== null ? items[selectedIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item, index) => {
          const isVideo = item.fileType?.startsWith("video/") || item.url.match(/\.(mp4|webm)(\?.*)?$/i);

          return (
            <div
              key={item.id || index}
              onClick={() => setSelectedIndex(index)}
              className="group relative rounded-2xl bg-white border border-[#502D55]/12 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <div className="aspect-4/3 bg-gray-100 overflow-hidden relative">
                {isVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                    <Film className="w-8 h-8 opacity-70" />
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.caption || `${projectName} screenshot ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}

                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 className="w-5 h-5 drop-shadow" />
                </div>
              </div>

              {item.caption && (
                <div className="p-3 text-xs text-[#56475C] font-medium border-t border-[#502D55]/10 truncate">
                  {item.caption}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeItem && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Arrows */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Media Container */}
          <div
            className="relative max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {activeItem.fileType?.startsWith("video/") || activeItem.url.match(/\.(mp4|webm)(\?.*)?$/i) ? (
              <video
                src={activeItem.url}
                controls
                autoPlay
                className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl"
              />
            ) : (
              <img
                src={activeItem.url}
                alt={activeItem.caption || projectName}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />
            )}

            {/* Caption & Counter */}
            <div className="mt-3 text-center text-white/90 text-xs sm:text-sm font-medium">
              {activeItem.caption && <p>{activeItem.caption}</p>}
              <p className="text-[11px] font-mono text-white/50 mt-1">
                {selectedIndex + 1} of {items.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
