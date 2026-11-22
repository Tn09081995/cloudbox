"use client";

import * as React from "react";
import * as RadixContextMenu from "@radix-ui/react-context-menu";
import { cn } from "@/lib/utils";

export const ContextMenu = RadixContextMenu.Root;
export const ContextMenuTrigger = RadixContextMenu.Trigger;
export const ContextMenuGroup = RadixContextMenu.Group;
export const ContextMenuPortal = RadixContextMenu.Portal;
export const ContextMenuSub = RadixContextMenu.Sub;

export const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.Content>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.Content>
>(({ className, ...props }, ref) => (
  <RadixContextMenu.Portal>
    <RadixContextMenu.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-card border border-border bg-surface p-1.5 text-foreground shadow-lg backdrop-blur-md animate-in fade-in-80",
        className
      )}
      {...props}
    />
  </RadixContextMenu.Portal>
));
ContextMenuContent.displayName = "ContextMenuContent";

export const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.Item>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <RadixContextMenu.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-btn px-2.5 py-1.5 text-xs font-medium outline-none transition-colors hover:bg-surface-2 focus:bg-surface-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
ContextMenuItem.displayName = "ContextMenuItem";

export const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <RadixContextMenu.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center rounded-btn px-2.5 py-1.5 text-xs font-medium outline-none hover:bg-surface-2 focus:bg-surface-2",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
  </RadixContextMenu.SubTrigger>
));
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.SubContent>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.SubContent>
>(({ className, ...props }, ref) => (
  <RadixContextMenu.Portal>
    <RadixContextMenu.SubContent
      ref={ref}
      className={cn(
        "z-50 min-w-[10rem] overflow-hidden rounded-card border border-border bg-surface p-1.5 text-foreground shadow-lg backdrop-blur-md",
        className
      )}
      {...props}
    />
  </RadixContextMenu.Portal>
));
ContextMenuSubContent.displayName = "ContextMenuSubContent";

export const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.Separator>
>(({ className, ...props }, ref) => (
  <RadixContextMenu.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";
