"use client";

import React, { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileTabBar } from "./MobileTabBar";
import { useUiStore } from "@/lib/hooks/useUiStore";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { setSidebarCollapsed } = useUiStore();

  // Responsive listener: auto-collapse to 72px rail below 1100px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1100 && window.innerWidth >= 768) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth >= 1100) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarCollapsed]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground antialiased font-sans">
      {/* Sidebar (Desktop / Tablet & Mobile Drawer) */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Top Bar (64px) */}
        <TopBar />

        {/* Independently Scrolling Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 pb-20 md:pb-8">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar />
    </div>
  );
}
