"use client";

import React from "react";
import { Smartphone, X } from "lucide-react";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { vi } from "@/lib/i18n/vi";
import Link from "next/link";

export function InstallAppCard({ collapsed = false }: { collapsed?: boolean }) {
  const { installCardDismissed, setInstallCardDismissed } = useUiStore();

  if (installCardDismissed || collapsed) {
    return null;
  }

  return (
    <div className="relative p-3 rounded-card bg-surface-2 border border-border/80 shadow-sm transition-all duration-cb">
      <button
        type="button"
        onClick={() => setInstallCardDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-btn text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
        aria-label={vi.installCard.dismiss}
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-2.5">
        <div className="h-7 w-7 rounded-btn bg-primary-soft text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <Smartphone className="h-4 w-4" />
        </div>
        <div className="flex-1 pr-4">
          <h4 className="text-xs font-semibold text-foreground leading-tight">
            {vi.installCard.title}
          </h4>
          <p className="text-[11px] text-muted-foreground leading-snug mt-1">
            {vi.installCard.desc}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <Link
              href="/settings"
              className="inline-flex items-center justify-center h-7 px-2.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-btn transition-colors"
            >
              {vi.installCard.btn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
