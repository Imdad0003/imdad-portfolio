"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  VideoSampleItem,
  VideoCategory,
  WatermarkConfig,
} from "@/types/video-editing";
import { VideoWatermarkBadge } from "./VideoWatermarkBadge";
import {
  Play,
  Pause,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  ExternalLink,
  Tag,
  ArrowRight,
  Film,
  Layers,
} from "lucide-react";
import { getWhatsAppUrl } from "@/data/config";

interface VideoPortfolioGalleryProps {
  samples: VideoSampleItem[];
  categories: VideoCategory[];
  watermark: WatermarkConfig;
}

export function VideoPortfolioGallery({
  samples,
  categories,
  watermark,
}: VideoPortfolioGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<VideoCategory>("All");
  const [activeModalSample, setActiveModalSample] = useState<VideoSampleItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Filter samples by active category
  const filteredSamples = useMemo(() => {
    if (activeCategory === "All") return samples;
    return samples.filter((s) => s.category === activeCategory);
  }, [samples, activeCategory]);

  const openPreviewModal = (sample: VideoSampleItem) => {
    setActiveModalSample(sample);
    setIsPlaying(true);
  };

  const closePreviewModal = () => {
    setActiveModalSample(null);
  };

  return (
    <section id="portfolio" className="py-16 sm:py-24 bg-white/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-[10px] sm:text-[11px] font-mono text-[#0284C7] font-bold mb-3 uppercase tracking-wider">
              <Film className="w-3.5 h-3.5" />
              <span>PORTFOLIO SHOWCASE // WATERMARKED EDITS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0A192F] tracking-tight">
              Selected Video Editing Work
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl">
              Explore recent vertical reels, long-form YouTube essays, and cinematic commercial pieces. Every preview carries the studio verification watermark.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Showing {filteredSamples.length} of {samples.length} Samples</span>
          </div>
        </div>

        {/* Category Filter Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-10 border-b border-slate-200">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#0A192F] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-[#0A192F]"
                }`}
              >
                {cat === "Reels" ? "Reels (9:16)" : cat === "YouTube" ? "YouTube (16:9)" : cat}
              </button>
            );
          })}
        </div>

        {/* Portfolio Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {filteredSamples.map((sample) => {
            const isVertical = sample.aspectRatio === "9:16" || sample.aspectRatio === "4:5";

            return (
              <div
                key={sample.id}
                onClick={() => openPreviewModal(sample)}
                className="group relative rounded-3xl bg-white border border-slate-200 hover:border-[#0284C7]/50 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
              >
                {/* Media Container with Dynamic Aspect Ratio */}
                <div
                  className={`relative w-full overflow-hidden bg-slate-900 ${
                    isVertical ? "aspect-[9/16]" : "aspect-[16/9]"
                  }`}
                >
                  <img
                    src={sample.thumbnailUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient dark vignette over thumbnail */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* IMDAD.BUILDS Watermark Overlay */}
                  <VideoWatermarkBadge config={watermark} />

                  {/* Duration Pill */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white">
                    <Clock className="w-2.5 h-2.5 text-sky-400" />
                    <span>{sample.duration}</span>
                  </div>

                  {/* Hover Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 backdrop-blur-md text-[#0A192F] group-hover:bg-[#0284C7] group-hover:text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Thumbnail Overlay Info */}
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    {sample.badge && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-mono font-bold text-white mb-1.5 border border-white/20">
                        {sample.badge}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-sky-300 transition-colors">
                      {sample.title}
                    </h3>
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                      <span className="font-bold text-[#0284C7] uppercase">{sample.category}</span>
                      {sample.clientOrBrand && <span>{sample.clientOrBrand}</span>}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>

                  {/* Tags Strip */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    {sample.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Interactive Video Playback Modal / Lightbox */}
      {activeModalSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white z-20">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0A192F] line-clamp-1">
                    {activeModalSample.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                    <span>{activeModalSample.category}</span>
                    <span>•</span>
                    <span>{activeModalSample.duration}</span>
                    {activeModalSample.clientOrBrand && (
                      <>
                        <span>•</span>
                        <span>{activeModalSample.clientOrBrand}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closePreviewModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Video Player Viewport */}
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[420px]">
              <img
                src={activeModalSample.thumbnailUrl}
                alt={activeModalSample.title}
                className="w-full h-full object-contain max-h-[55vh]"
              />

              {/* Watermark in Modal */}
              <VideoWatermarkBadge config={watermark} />

              {/* Simulated Waveform & Playback HUD */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-black/30">
                <div className="flex items-center justify-between text-white text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-black/60 border border-white/20">
                    LIVE SIMULATED PREVIEW
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/60 border border-white/20">
                    PRO GRADE AUDIO
                  </span>
                </div>

                {/* Bottom Scrub Control Bar */}
                <div className="space-y-2 pointer-events-auto">
                  {/* Waveform Scrubber Bars */}
                  <div className="h-6 flex items-end gap-1 px-1">
                    {[45, 60, 85, 30, 95, 75, 40, 85, 90, 65, 40, 70, 85, 50, 65, 90, 40, 80, 55, 70, 35, 60, 80, 95, 45, 70, 85, 40, 60, 75, 90, 45].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          i < 18 ? "bg-sky-400" : isPlaying ? "bg-white/30" : "bg-white/10"
                        }`}
                        style={{ height: `${isPlaying ? h : Math.max(20, h * 0.4)}%` }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
                      </button>
                      <span className="font-mono text-[11px] text-white/80">
                        {isPlaying ? "0:14" : "0:00"} / {activeModalSample.duration}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] text-sky-400 font-bold">
                      IMDAD.BUILDS • 24 FPS
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions & Details */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
                  TECHNIQUES APPLIED
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalSample.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const prompt = `I would like to order a video edit similar to your portfolio sample "${activeModalSample.title}" (${activeModalSample.category}, aspect ratio: ${activeModalSample.aspectRatio}). Please guide me through the order details.`;
                    window.dispatchEvent(
                      new CustomEvent("open-chat", {
                        detail: {
                          prompt,
                          referenceTitle: activeModalSample.title,
                          category: activeModalSample.category,
                          aspectRatio: activeModalSample.aspectRatio,
                        },
                      })
                    );
                    closePreviewModal();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                  <span>Order with AI</span>
                </button>

                <a
                  href={getWhatsAppUrl(`Hi Imdad! I saw the "${activeModalSample.title}" video sample in your portfolio and want a similar edit. Can we discuss?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
