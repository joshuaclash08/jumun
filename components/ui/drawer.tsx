"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

function Drawer({
  autoFocus = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" autoFocus={autoFocus} {...props} />
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
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
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
  style,
  onCloseAutoFocus,
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        data-lenis-prevent=""
        data-handle-variant={handleVariant}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event)
          if (!event.defaultPrevented) {
            ;(document.activeElement as HTMLElement)?.blur()
          }
        }}
        style={{
          "--initial-transform": "calc(100% + 5rem)",
          ...style,
        } as React.CSSProperties}
        className={cn(
          "group/drawer-content fixed z-50 flex h-auto max-h-[min(90vh,calc(100dvh-2.5rem-env(safe-area-inset-bottom,0px)))] min-h-0 flex-col bg-background text-base text-foreground shadow-floating overscroll-contain focus:outline-none [&::after]:hidden",
          "data-[vaul-drawer-direction=bottom]:left-1/2 data-[vaul-drawer-direction=bottom]:-translate-x-1/2",
          "data-[vaul-drawer-direction=bottom]:bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:data-[vaul-drawer-direction=bottom]:bottom-5",
          "data-[vaul-drawer-direction=bottom]:w-[calc(100%-1.5rem)] data-[vaul-drawer-direction=bottom]:max-w-[540px]",
          "data-[vaul-drawer-direction=bottom]:rounded-[28px] sm:data-[vaul-drawer-direction=bottom]:rounded-[32px]",
          "data-[vaul-drawer-direction=bottom]:border data-[vaul-drawer-direction=bottom]:border-border/80 dark:data-[vaul-drawer-direction=bottom]:border-border/50",
          "data-[vaul-drawer-direction=bottom]:shadow-floating",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-r-2xl data-[vaul-drawer-direction=left]:border-r",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-l-2xl data-[vaul-drawer-direction=right]:border-l",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[92vh] data-[vaul-drawer-direction=top]:rounded-b-2xl data-[vaul-drawer-direction=top]:border-b",
          "overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Unified floating drag handle pill (Toss Place style) */}
        {!hideHandle && (
          <DrawerPrimitive.Handle
            data-slot="drawer-handle"
            className={cn(
              "!absolute top-2.5 left-1/2 -translate-x-1/2 z-40 !m-0 !w-12 sm:!w-14 !h-1 shrink-0 rounded-full cursor-grab active:cursor-grabbing backdrop-blur-md pointer-events-auto transition-colors duration-200",
              "bg-neutral-300/80 dark:bg-neutral-600/80 hover:bg-neutral-400 dark:hover:bg-neutral-500",
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
      className={cn("flex flex-col gap-1 px-5 pt-6 pb-2 text-left", className)}
      {...props}
    />
  )
}

function DrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-body"
      data-lenis-prevent=""
      tabIndex={-1}
      className={cn(
        "flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-3 scrollbar-none outline-none",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      data-sticky-action-bar="true"
      className={cn(
        "mt-auto flex flex-col gap-2 p-5 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent",
        className
      )}
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
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
