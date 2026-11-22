"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type EmptyStateVariant = "folder" | "search" | "starred" | "shared" | "trash";

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  desc: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  variant,
  title,
  desc,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center select-none ${className}`}>
      {/* Clean inline vector SVG illustration without emoji */}
      <div className="w-48 h-36 mb-6 flex items-center justify-center">
        {variant === "folder" && (
          <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="35" width="60" height="25" rx="6" fill="#F5A524" opacity="0.3" />
            <rect x="20" y="45" width="160" height="90" rx="12" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
            <rect x="35" y="65" width="50" height="6" rx="3" fill="var(--muted)" opacity="0.4" />
            <rect x="35" y="78" width="90" height="5" rx="2.5" fill="var(--muted)" opacity="0.2" />
            <rect x="35" y="88" width="70" height="5" rx="2.5" fill="var(--muted)" opacity="0.2" />
            <circle cx="145" cy="90" r="18" fill="var(--primary-soft)" />
            <path d="M145 82 V98 M137 90 H153" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}

        {variant === "search" && (
          <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="95" cy="70" r="35" fill="var(--surface)" stroke="var(--border)" strokeWidth="2.5" />
            <line x1="120" y1="95" x2="155" y2="130" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
            <path d="M80 65 Q95 55 110 65" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          </svg>
        )}

        {variant === "starred" && (
          <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="75" r="45" fill="rgba(245, 165, 36, 0.1)" />
            <polygon
              points="100,45 109,68 133,69 113,85 120,108 100,94 80,108 87,85 67,69 91,68"
              fill="#F5A524"
              opacity="0.85"
            />
          </svg>
        )}

        {variant === "shared" && (
          <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80" cy="65" r="22" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
            <circle cx="120" cy="65" r="22" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="2" />
            <path d="M55 115 C55 95 105 95 105 115" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
            <path d="M95 115 C95 95 145 95 145 115" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="2" />
          </svg>
        )}

        {variant === "trash" && (
          <svg viewBox="0 0 200 150" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect x="65" y="55" width="70" height="75" rx="10" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
            <rect x="55" y="45" width="90" height="10" rx="5" fill="var(--muted)" opacity="0.3" />
            <rect x="85" y="38" width="30" height="8" rx="4" fill="var(--muted)" opacity="0.4" />
            <line x1="85" y1="75" x2="85" y2="105" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <line x1="100" y1="75" x2="100" y2="105" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            <line x1="115" y1="75" x2="115" y2="105" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-bold text-foreground max-w-sm">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
        {desc}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-4 rounded-btn text-xs font-semibold bg-primary text-white hover:bg-primary-ink"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
