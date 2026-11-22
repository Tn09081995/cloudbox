"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  LayoutGrid,
  List,
  Info,
  Sun,
  Moon,
  Laptop,
  Menu,
  Check,
  User,
  Smartphone,
  LogOut,
  ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUiStore, SortField, SortOrder } from "@/lib/hooks/useUiStore";
import { vi } from "@/lib/i18n/vi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TopBar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const {
    viewMode,
    setViewMode,
    detailsPanelOpen,
    setDetailsPanelOpen,
    sortField,
    sortOrder,
    setSort,
    setMobileMenuOpen,
    setCommandPaletteOpen,
  } = useUiStore();

  const sortOptions: { field: SortField; order: SortOrder; label: string }[] = [
    { field: "updated_at", order: "desc", label: "Mới sửa đổi nhất" },
    { field: "updated_at", order: "asc", label: "Cũ nhất" },
    { field: "name", order: "asc", label: "Tên (A-Z)" },
    { field: "name", order: "desc", label: "Tên (Z-A)" },
    { field: "size", order: "desc", label: "Kích thước (Lớn → Nhỏ)" },
    { field: "size", order: "asc", label: "Kích thước (Nhỏ → Lớn)" },
  ];

  return (
    <header className="h-16 sticky top-0 z-20 bg-surface/90 backdrop-blur-md border-b border-border px-4 md:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-btn text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors flex-shrink-0"
          aria-label="Mở thanh điều hướng"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar (Clicking opens Command Palette) */}
        <div
          onClick={() => setCommandPaletteOpen(true)}
          className="flex-1 flex items-center gap-2.5 h-10 px-3.5 rounded-btn bg-surface-2 hover:bg-surface-2/80 border border-transparent hover:border-border text-muted-foreground hover:text-foreground transition-all duration-cb cursor-pointer group"
          role="searchbox"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setCommandPaletteOpen(true);
            }
          }}
          aria-label={vi.search.placeholder}
        >
          <Search className="h-4 w-4 text-muted group-hover:text-foreground transition-colors" />
          <span className="text-sm select-none truncate flex-1">
            {vi.search.placeholder}
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border border-border bg-surface text-muted-foreground shadow-sm">
            <span>⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Right: Actions (Sort, View Mode, Details Toggle, Theme, Avatar) */}
      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
        <TooltipProvider delayDuration={150}>
          {/* Sort Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-2 h-9 w-9 flex items-center justify-center rounded-btn text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
                    aria-label={vi.sort.label}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">{vi.sort.label}</TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-card bg-surface border border-border shadow-lg">
              <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                {vi.sort.label} theo
              </DropdownMenuLabel>
              {sortOptions.map((opt) => {
                const isSelected = sortField === opt.field && sortOrder === opt.order;
                return (
                  <DropdownMenuItem
                    key={`${opt.field}-${opt.order}`}
                    onClick={() => setSort(opt.field, opt.order)}
                    className="flex items-center justify-between px-2.5 py-1.5 text-xs rounded-btn cursor-pointer font-medium"
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Segmented View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-surface-2 rounded-btn border border-border/80">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-[6px] transition-all duration-cb ${
                    viewMode === "grid"
                      ? "bg-surface text-primary shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={vi.actions.viewModeGrid}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{vi.actions.viewModeGrid}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-[6px] transition-all duration-cb ${
                    viewMode === "list"
                      ? "bg-surface text-primary shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={vi.actions.viewModeList}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{vi.actions.viewModeList}</TooltipContent>
            </Tooltip>
          </div>

          {/* Details Panel Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setDetailsPanelOpen((prev) => !prev)}
                className={`p-2 h-9 w-9 flex items-center justify-center rounded-btn transition-colors ${
                  detailsPanelOpen
                    ? "bg-primary-soft text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                }`}
                aria-label={vi.actions.details}
              >
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{vi.actions.details}</TooltipContent>
          </Tooltip>

          {/* Theme Toggle */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-2 h-9 w-9 flex items-center justify-center rounded-btn text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
                    aria-label="Đổi giao diện sáng/tối"
                  >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Giao diện hiển thị</TooltipContent>
            </Tooltip>

            <DropdownMenuContent align="end" className="w-36 p-1 rounded-card bg-surface border border-border shadow-lg">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>{vi.settings.themeLight}</span>
                {theme === "light" && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
              >
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                <span>{vi.settings.themeDark}</span>
                {theme === "dark" && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-btn cursor-pointer font-medium"
              >
                <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{vi.settings.themeSystem}</span>
                {theme === "system" && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center h-9 w-9 rounded-full bg-primary-soft text-primary font-semibold text-xs border border-primary/20 hover:border-primary/40 transition-colors ml-1 focus-visible:ring-2 focus-visible:ring-primary outline-none"
                aria-label="Tài khoản cá nhân"
              >
                TA
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-card bg-surface border border-border shadow-lg font-sans">
              <div className="px-3 py-2 border-b border-border/80 mb-1">
                <p className="text-xs font-semibold text-foreground">Tuấn Anh</p>
                <p className="text-[11px] text-muted-foreground truncate">tuananh@cloudbox.io</p>
              </div>

              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-btn cursor-pointer font-medium"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{vi.settings.profileTab}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-btn cursor-pointer font-medium"
              >
                <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{vi.actions.installApp}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-border" />

              <DropdownMenuItem
                onClick={() => router.push("/login")}
                className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-btn cursor-pointer font-medium text-semantic-danger focus:text-semantic-danger"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      </div>
    </header>
  );
}
