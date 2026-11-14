"use client";

import React from "react";
import {
  Menu,
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { ViewMode, SortField, SortOrder } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  onToggleMobileSidebar: () => void;
  userEmail?: string | null;
  displayName?: string | null;
}

export function Header({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortField,
  sortOrder,
  onSortChange,
  onToggleMobileSidebar,
  userEmail,
  displayName,
}: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Đã đăng xuất thành công");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Đã xảy ra lỗi khi đăng xuất");
    }
  };

  const currentSortLabel = () => {
    if (sortField === "name") {
      return sortOrder === "asc" ? "Tên: A → Z" : "Tên: Z → A";
    }
    if (sortField === "created_at") {
      return sortOrder === "desc" ? "Mới nhất trước" : "Cũ nhất trước";
    }
    if (sortField === "size") {
      return sortOrder === "desc" ? "Kích thước: Lớn → Nhỏ" : "Kích thước: Nhỏ → Lớn";
    }
    return "Sắp xếp";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left section: Hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          onClick={onToggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Mở menu</span>
        </Button>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm tệp và thư mục..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 w-full rounded-xl bg-muted/40 border-muted focus-visible:bg-background"
          />
        </div>
      </div>

      {/* Right section: Sort, View Toggle, Theme, User */}
      <div className="flex items-center gap-2">
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-1.5 h-9 rounded-xl border-dashed"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{currentSortLabel()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onSortChange("name", "asc")}
              className={sortField === "name" && sortOrder === "asc" ? "bg-accent font-semibold" : ""}
            >
              Tên: A → Z
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("name", "desc")}
              className={sortField === "name" && sortOrder === "desc" ? "bg-accent font-semibold" : ""}
            >
              Tên: Z → A
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onSortChange("created_at", "desc")}
              className={sortField === "created_at" && sortOrder === "desc" ? "bg-accent font-semibold" : ""}
            >
              Mới nhất trước
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("created_at", "asc")}
              className={sortField === "created_at" && sortOrder === "asc" ? "bg-accent font-semibold" : ""}
            >
              Cũ nhất trước
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onSortChange("size", "desc")}
              className={sortField === "size" && sortOrder === "desc" ? "bg-accent font-semibold" : ""}
            >
              Kích thước: Lớn → Nhỏ
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("size", "asc")}
              className={sortField === "size" && sortOrder === "asc" ? "bg-accent font-semibold" : ""}
            >
              Kích thước: Nhỏ → Lớn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => onViewModeChange("grid")}
            title="Dạng lưới"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => onViewModeChange("list")}
            title="Dạng danh sách"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Dark Mode Toggle */}
        <ThemeToggle />

        {/* User Profile / Logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
            >
              <UserIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">
                  {displayName || "Người dùng"}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {userEmail || "Tài khoản cá nhân"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
