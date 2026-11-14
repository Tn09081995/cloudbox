"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DriveProvider, useDrive } from "@/context/DriveContext";
import { createClient } from "@/lib/supabase/client";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    usedBytes,
    quotaBytes,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortField,
    sortOrder,
    setSort,
    openUploadModal,
    openCreateFolderModal,
  } = useDrive();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email || null);
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();

        const profileData = profile as { display_name: string | null } | null;

        setDisplayName(
          profileData?.display_name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Người dùng"
        );
      } else {
        setUserEmail("demo@cloudbox.app");
        setDisplayName("Người Dùng Thử Nghiệm");
      }
    };
    fetchUser();
  }, [supabase]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        usedBytes={usedBytes}
        quotaBytes={quotaBytes}
        onOpenUpload={() => openUploadModal(null)}
        onOpenCreateFolder={() => openCreateFolderModal(null)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={setSort}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          userEmail={userEmail}
          displayName={displayName}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DriveProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DriveProvider>
  );
}
