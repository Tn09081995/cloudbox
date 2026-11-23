"use client";

import React, { useRef } from "react";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useUiStore } from "@/lib/hooks/useUiStore";

interface MemoryItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  fileId?: string;
}

const MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    title: "Điểm sáng tuần qua",
    subtitle: "18 khoảnh khắc đẹp",
    image: "https://picsum.photos/seed/danang1/500/350",
    fileId: "file-photo-1",
  },
  {
    id: "mem-2",
    title: "Chuyến đi Hội An",
    subtitle: "1 năm trước",
    image: "https://picsum.photos/seed/hoian3/500/350",
    fileId: "file-photo-3",
  },
  {
    id: "mem-3",
    title: "Bình minh trên đỉnh Bà Nà",
    subtitle: "Kỷ niệm đáng nhớ",
    image: "https://picsum.photos/seed/bana5/500/350",
    fileId: "file-photo-5",
  },
  {
    id: "mem-4",
    title: "Cuối tuần ấm áp",
    subtitle: "Ảnh gia đình",
    image: "https://picsum.photos/seed/family8/500/350",
    fileId: "file-photo-8",
  },
  {
    id: "mem-5",
    title: "Mùa hoa Hà Giang",
    subtitle: "Tháng 10 rực rỡ",
    image: "https://picsum.photos/seed/hagiang10/500/350",
    fileId: "file-photo-10",
  },
];

export function MemoriesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setPreviewTargetId } = useUiStore();

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
        {MEMORIES.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (item.fileId) setPreviewTargetId(item.fileId);
            }}
            className="relative flex-shrink-0 w-44 md:w-52 h-28 md:h-32 rounded-[16px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Background image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />

            {/* Dark bottom gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Content text */}
            <div className="absolute bottom-0 inset-x-0 p-3 text-white">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block text-sky-300">
                {item.subtitle}
              </span>
              <p className="text-xs md:text-sm font-semibold truncate leading-tight mt-0.5">
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
