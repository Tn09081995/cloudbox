import React from "react";

export function GridSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 w-28 bg-surface-2 rounded" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-card bg-surface border border-border/80 p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-btn bg-surface-2" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 rounded bg-surface-2" />
                <div className="h-2.5 w-1/2 rounded bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="h-4 w-24 bg-surface-2 rounded" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-card bg-surface border border-border/80 overflow-hidden">
              <div className="w-full aspect-[4/3] bg-surface-2" />
              <div className="p-3 flex items-start gap-2.5">
                <div className="h-6 w-6 rounded bg-surface-2" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-4/5 rounded bg-surface-2" />
                  <div className="h-2.5 w-1/2 rounded bg-surface-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="w-full rounded-card border border-border bg-surface overflow-hidden shadow-card animate-pulse">
      <div className="h-10 bg-surface-2 border-b border-border" />
      <div className="divide-y divide-border/60">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 px-4 flex items-center gap-4">
            <div className="h-4 w-4 rounded bg-surface-2" />
            <div className="h-7 w-7 rounded bg-surface-2" />
            <div className="flex-1 h-3.5 rounded bg-surface-2 max-w-sm" />
            <div className="h-3 w-28 rounded bg-surface-2 hidden md:block" />
            <div className="h-3 w-20 rounded bg-surface-2 hidden sm:block" />
            <div className="h-3 w-16 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
