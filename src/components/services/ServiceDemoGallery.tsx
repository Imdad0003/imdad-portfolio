"use client";

import React, { useState } from "react";
import { ServiceDemoItem } from "@/types/cms";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, Eye, Play, Sparkles, X } from "lucide-react";

interface ServiceDemoGalleryProps {
  demos: ServiceDemoItem[];
  serviceTitle: string;
}

export function ServiceDemoGallery({ demos, serviceTitle }: ServiceDemoGalleryProps) {
  const [previewDemo, setPreviewDemo] = useState<ServiceDemoItem | null>(null);

  if (!demos || demos.length === 0) {
    return null;
  }

  return (
    <section id="demos" className="mb-14 scroll-mt-24">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAECE4]/85 border border-[#F0CFC0] text-[11px] font-semibold text-[#B4583F] uppercase tracking-wider mb-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
            Live Demos &amp; Samples
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#332924]">
            {serviceTitle} Work Preview &amp; Demos
          </h2>
          <p className="mt-1.5 text-sm text-[#5F534D]">
            Inspect real examples, live previews, and studio sample deliverables for this service.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demos.map((demo) => {
          const isImage = demo.mediaType === "image" && (demo.mediaUrl || demo.thumbnailUrl);
          const isVideo = demo.mediaType === "video" && demo.mediaUrl;
          const previewSrc = demo.mediaUrl || demo.thumbnailUrl;
          const targetLink = demo.demoLink || (demo.mediaType === "link" ? demo.mediaUrl : undefined);
          const isInternal = targetLink && (targetLink.startsWith("/") || targetLink.startsWith("#"));

          return (
            <div
              key={demo.id}
              className="group relative rounded-[28px] m3-surface-1 m3-card-interactive overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Preview Thumbnail / Media Area */}
                <div className="relative h-48 bg-gradient-to-br from-[#FAF7F2] via-[#FAECE4]/65 to-[#F3ECE4] border-b border-[#E8DFD5] overflow-hidden flex items-center justify-center">
                  {isVideo && previewSrc ? (
                    <video
                      src={previewSrc}
                      poster={demo.thumbnailUrl}
                      controls
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewSrc}
                      alt={demo.title}
                      className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                        previewSrc.includes("imdad-logo") ? "object-contain p-10 opacity-85" : "object-cover"
                      }`}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#C96A50]/70 gap-2">
                      <div className="w-12 h-12 m3-icon-squircle bg-white border border-[#E8DFD5] flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#C96A50]" />
                      </div>
                      <span className="text-xs font-medium text-[#8A7C75]">Studio Demo</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    {demo.category ? (
                      <Badge variant="default" size="sm">
                        {demo.category}
                      </Badge>
                    ) : (
                      <span />
                    )}
                    {demo.metricsLabel && (
                      <Badge variant="peach" size="sm">
                        {demo.metricsLabel}
                      </Badge>
                    )}
                  </div>

                  {/* Quick Preview Trigger for Image/Video */}
                  {(isImage || demo.thumbnailUrl) && (
                    <button
                      type="button"
                      onClick={() => setPreviewDemo(demo)}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white/95 hover:bg-[#C96A50] text-[#332924] hover:text-white border border-[#E8DFD5] text-[11px] font-semibold shadow-sm inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
                    >
                      {isVideo ? <Play className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>Preview</span>
                    </button>
                  )}
                </div>

                {/* Details */}
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-[#332924] group-hover:text-[#B4583F] transition-colors">
                    {demo.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#5F534D] leading-relaxed">
                    {demo.description}
                  </p>
                </div>
              </div>

              {targetLink && (
                <div className="px-6 pb-6 pt-2">
                  <Button
                    href={targetLink}
                    variant="tonal"
                    size="sm"
                    target={isInternal ? undefined : "_blank"}
                    rel={isInternal ? undefined : "noopener noreferrer"}
                    className="w-full justify-between"
                  >
                    <span>Open Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {previewDemo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#332924]/65 backdrop-blur-md"
          onClick={() => setPreviewDemo(null)}
        >
          <div
            className="w-full max-w-3xl rounded-[28px] bg-white border border-[#E8DFD5] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#E8DFD5] flex items-center justify-between bg-[#FAF7F2]">
              <div>
                <h3 className="font-display font-bold text-base text-[#332924]">
                  {previewDemo.title}
                </h3>
                {previewDemo.category && (
                  <p className="text-xs text-[#8A7C75]">{previewDemo.category}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewDemo(null)}
                className="w-9 h-9 rounded-full bg-white border border-[#E8DFD5] flex items-center justify-center text-[#5F534D] hover:text-[#332924] cursor-pointer"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAF7F2] p-4 flex items-center justify-center max-h-[70vh] overflow-auto">
              {previewDemo.mediaType === "video" && previewDemo.mediaUrl ? (
                <video
                  src={previewDemo.mediaUrl}
                  controls
                  autoPlay
                  className="max-h-[60vh] w-full rounded-2xl"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewDemo.mediaUrl || previewDemo.thumbnailUrl || "/imdad-logo.png"}
                  alt={previewDemo.title}
                  className="max-h-[60vh] w-auto rounded-2xl object-contain"
                />
              )}
            </div>

            <div className="px-6 py-4 bg-white border-t border-[#E8DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-[#5F534D]">{previewDemo.description}</p>
              {previewDemo.demoLink && (
                <Button
                  href={previewDemo.demoLink}
                  variant="primary"
                  size="sm"
                  target={previewDemo.demoLink.startsWith("/") ? undefined : "_blank"}
                  rel={previewDemo.demoLink.startsWith("/") ? undefined : "noopener noreferrer"}
                  className="shrink-0"
                >
                  <span>Visit Demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
