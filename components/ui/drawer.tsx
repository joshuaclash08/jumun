"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      data-lenis-prevent=""
      className={cn(
        "fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

export interface DrawerContentProps
  extends React.ComponentProps<typeof DrawerPrimitive.Content> {
  handleVariant?: "auto" | "light" | "dark"
  handleClassName?: string
  hideHandle?: boolean
}

function DrawerContent({
  className,
  children,
  handleVariant = "auto",
  handleClassName,
  hideHandle = false,
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        data-lenis-prevent=""
        data-handle-variant={handleVariant}
        className={cn(
          "group/drawer-content fixed z-50 flex h-auto max-h-[92vh] min-h-0 flex-col bg-background text-base text-foreground shadow-floating overscroll-contain",
          "data-[vaul-drawer-direction=bottom]:left-1/2 data-[vaul-drawer-direction=bottom]:-translate-x-1/2",
          "data-[vaul-drawer-direction=bottom]:w-full data-[vaul-drawer-direction=bottom]:max-w-[840px]",
          "data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24",
          "data-[vaul-drawer-direction=bottom]:rounded-t-[28px] data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=bottom]:border-border/60",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-r-2xl data-[vaul-drawer-direction=left]:border-r",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-l-2xl data-[vaul-drawer-direction=right]:border-l",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[92vh] data-[vaul-drawer-direction=top]:rounded-b-2xl data-[vaul-drawer-direction=top]:border-b",
          className
        )}
        {...props}
      >
        {/* Unified longer drag handle (64px wide pill) — floating at top-3 across all drawers */}
        {!hideHandle && (
          <DrawerPrimitive.Handle
            data-slot="drawer-handle"
            className={cn(
              "!absolute top-3 left-1/2 -translate-x-1/2 z-40 !m-0 !w-16 sm:!w-20 !h-1.5 shrink-0 rounded-full cursor-grab active:cursor-grabbing backdrop-blur-md pointer-events-auto transition-colors duration-200",
              // "auto": iOS-style adaptive grabber against white/gray sheet headers (dark charcoal with white specular highlight in light mode, frosted light in dark mode)
              "group-data-[handle-variant=auto]/drawer-content:bg-neutral-800/60 dark:group-data-[handle-variant=auto]/drawer-content:bg-white/65 group-data-[handle-variant=auto]/drawer-content:shadow-[0_1px_1px_rgba(255,255,255,0.85),0_0_0_0.5px_rgba(0,0,0,0.12)] dark:group-data-[handle-variant=auto]/drawer-content:shadow-[0_1px_3px_rgba(0,0,0,0.6),0_0_0_0.5px_rgba(255,255,255,0.2)]",
              // "light": light frosted glass pill with ambient drop shadow for dark photos/backgrounds
              "group-data-[handle-variant=light]/drawer-content:bg-white/85 dark:group-data-[handle-variant=light]/drawer-content:bg-white/75 group-data-[handle-variant=light]/drawer-content:shadow-[0_1px_4px_rgba(0,0,0,0.6),0_0_0_0.5px_rgba(255,255,255,0.4)]",
              // "dark": high-contrast dark graphite pill with specular rim highlight for white, light-gray, cream, or beige backgrounds
              "group-data-[handle-variant=dark]/drawer-content:bg-neutral-900/70 dark:group-data-[handle-variant=dark]/drawer-content:bg-neutral-900/80 group-data-[handle-variant=dark]/drawer-content:shadow-[0_1px_1px_rgba(255,255,255,0.9),0_0_0_0.5px_rgba(0,0,0,0.18)]",
              handleClassName
            )}
          />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1 px-5 pt-7 pb-3 text-left", className)}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(
        "font-heading text-xl font-extrabold text-foreground",
        className
      )}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-base text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
