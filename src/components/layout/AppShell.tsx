"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileTabBar } from "./MobileTabBar";
import { useUiStore } from "@/lib/hooks/useUiStore";
import { useAuthStore } from "@/lib/hooks/useAuthStore";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { setSidebarCollapsed } = useUiStore();
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // If user explicitly logged out, redirect to /login
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Responsive listener: auto-collapse below 1100px
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

  // If logged out, render a subtle redirecting state
  if (isInitialized && !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden text-foreground antialiased font-sans select-none">
      {/* Google Material You TopBar */}
      <TopBar />

      {/* Body: Sidebar + Floating Main Surface */}
      <div className="flex-1 flex min-w-0 overflow-hidden">
        {/* Sidebar (Desktop icon-rail/expanded & Mobile Drawer) */}
        <Sidebar />

        {/* Floating Content Surface: Thẻ bo góc 24px nằm trên nền ngoài xám xanh, cuộn độc lập */}
        <main className="flex-1 min-w-0 overflow-hidden p-2 md:p-3 md:pl-1 md:pr-4 md:pb-4 flex flex-col">
          <div className="flex-1 bg-surface rounded-[24px] shadow-sm border border-border/50 overflow-y-auto overflow-x-hidden p-5 md:p-8 select-text">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileTabBar />
    </div>
  );
}
