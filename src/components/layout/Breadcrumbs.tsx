"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home, Folder } from "lucide-react";
import { BreadcrumbItem } from "@/types";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground overflow-x-auto py-1 scrollbar-none">
      <Link
        href="/drive"
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent hover:text-foreground transition-colors shrink-0 font-medium"
      >
        <Home className="h-4 w-4 text-primary" />
        <span>Tệp của tôi</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={item.id ?? index}>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
            {isLast ? (
              <span className="flex items-center gap-1.5 px-2 py-1 font-semibold text-foreground shrink-0 max-w-[200px] truncate">
                <Folder className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{item.name}</span>
              </span>
            ) : (
              <Link
                href={`/drive/${item.id}`}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent hover:text-foreground transition-colors shrink-0 max-w-[160px] truncate"
              >
                <Folder className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
