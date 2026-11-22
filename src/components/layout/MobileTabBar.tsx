"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HardDrive, Clock, Star, Users, Plus } from "lucide-react";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { vi } from "@/lib/i18n/vi";

export function MobileTabBar() {
  const pathname = usePathname();
  const { setNewFolderOpen } = useUiStore();

  const tabs = [
    {
      href: "/drive",
      label: "Tệp",
      icon: HardDrive,
      active: pathname.startsWith("/drive"),
    },
    {
      href: "/recent",
      label: vi.nav.recent,
      icon: Clock,
      active: pathname === "/recent",
    },
    // Center is Floating '+'
    {
      href: "/starred",
      label: "Gắn sao",
      icon: Star,
      active: pathname === "/starred",
    },
    {
      href: "/shared",
      label: vi.nav.shared,
      icon: Users,
      active: pathname === "/shared",
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-3 py-1.5 flex items-center justify-around shadow-lg">
      {tabs.slice(0, 2).map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-btn text-[11px] transition-colors ${
              tab.active
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 mb-0.5 stroke-[2]" />
            <span>{tab.label}</span>
          </Link>
        );
      })}

      {/* Floating Center '+' Button */}
      <div className="-mt-5">
        <button
          type="button"
          onClick={() => setNewFolderOpen(true)}
          className="h-11 w-11 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary-ink active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={vi.actions.new}
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </button>
      </div>

      {tabs.slice(2).map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-btn text-[11px] transition-colors ${
              tab.active
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 mb-0.5 stroke-[2]" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
