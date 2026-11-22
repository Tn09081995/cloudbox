import React from "react";
import Link from "next/link";
import { Cloud } from "lucide-react";

export function CloudBoxLogo({
  collapsed = false,
  className = "",
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/drive"
      className={`flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-btn transition-colors ${className}`}
      aria-label="CloudBox Trang chủ"
    >
      <div className="h-9 w-9 rounded-btn bg-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
        <Cloud className="h-5 w-5 fill-white/20 stroke-white stroke-[2.2]" />
      </div>
      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-base tracking-tight text-foreground flex items-center gap-1 leading-none">
            CloudBox
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-soft text-primary font-mono">
              v1.0
            </span>
          </span>
          <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
            Không gian cá nhân
          </span>
        </div>
      )}
    </Link>
  );
}
