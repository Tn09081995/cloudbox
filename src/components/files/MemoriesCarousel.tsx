"use client";

import React, { useRef } from "react";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { usePhotosAndVideos } from "@/lib/hooks/useFiles";

export function MemoriesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setPreviewTargetId } = useUiStore();
  const { data: mediaFiles = [] } = usePhotosAndVideos();

  // Strictly filter only real image/photo files
  const photoFiles = mediaFiles.filter(
    (n) =>
      !n.is_trashed &&
      (n.kind === "image" ||
        (n.mime_type && n.mime_type.startsWith("image/")) ||
        /\.(jpe?g|png|webp|gif|bmp|tiff)$/i.test(n.name))
  );

  // If there are no images, do NOT render the carousel at all!
  if (photoFiles.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/carousel mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
            Kỷ niệm & Điểm sáng
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="h-7 w-7 rounded-full bg-surface-2 hover:bg-surface-variant flex items-center justify-center text-muted hover:text-foreground transition-colors shadow-xs"
            aria-label="Cuộn sang trái"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="h-7 w-7 rounded-full bg-surface-2 hover:bg-surface-variant flex items-center justify-center text-muted hover:text-foreground transition-colors shadow-xs"
            aria-label="Cuộn sang phải"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-3.5 overflow-x-auto scrollbar-none py-1 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {photoFiles.map((file) => (
          <div
            key={file.id}
            onClick={() => {
              setPreviewTargetId(file.id);
            }}
            className="relative flex-shrink-0 w-44 md:w-52 h-28 md:h-32 rounded-[16px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Background image if available */}
            {file.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.thumbnail_url}
                alt={file.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-surface-2 flex items-center justify-center text-primary font-bold text-xs p-2 text-center">
                {file.name}
              </div>
            )}

            {/* Dark bottom gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Content text */}
            <div className="absolute bottom-0 inset-x-0 p-3 text-white">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block text-sky-300">
                Ảnh lưu trữ
              </span>
              <p className="text-xs md:text-sm font-semibold truncate leading-tight mt-0.5">
                {file.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
