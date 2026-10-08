"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Bell, Check } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { toast } from "@/lib/services/A11yFeedbackService";
import type { StoreInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface StaffCallButtonProps {
  storeInfo: Extract<StoreInfo, { orderType: "dine-in" }>;
  className?: string;
  isExpanded?: boolean;
}

const STAFF_CALL_OPTIONS = [
  { id: "wipes", labelKey: "staffCall.options.wipes" },
  { id: "plates", labelKey: "staffCall.options.plates" },
  { id: "cutlery", labelKey: "staffCall.options.cutlery" },
  { id: "apron", labelKey: "staffCall.options.apron" },
  { id: "receipt", labelKey: "staffCall.options.receipt" },
  { id: "staff", labelKey: "staffCall.options.staff" },
] as const;

export function StaffCallButton({
  storeInfo,
  className,
  isExpanded = true,
}: StaffCallButtonProps) {
  const { t } = useTranslation("menu");
  const [open, setOpen] = React.useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [hasRecentCall, setHasRecentCall] = React.useState(false);
  const recentCallTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);

  // Clear timer on unmount
  React.useEffect(() => {
    return () => {
      if (recentCallTimerRef.current) {
        clearTimeout(recentCallTimerRef.current);
      }
    };
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedOptions([]);
    }
  };

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    // Release focus from the button inside DrawerFooter before closing
    ;(document.activeElement as HTMLElement)?.blur();

    // Close drawer immediately upon confirmation
    setOpen(false);
    setHasRecentCall(true);

    if (recentCallTimerRef.current) {
      clearTimeout(recentCallTimerRef.current);
    }
    recentCallTimerRef.current = setTimeout(() => {
      setHasRecentCall(false);
    }, 3500);

    // Toast message adapting to selected items
    const selectedLabels = selectedOptions.map((id) =>
      t(`staffCall.options.${id}` as Parameters<typeof t>[0])
    );

    const message =
      selectedLabels.length > 0
        ? t("staffCall.toastItemsSuccess", {
            table: storeInfo.table,
            items: selectedLabels.join(", "),
          })
        : t("staffCall.toastSuccess", { table: storeInfo.table });

    toast({
      kind: "success",
      messageKo: message,
      variant: "staff-call",
      hapticsEnabled,
    });

    setSelectedOptions([]);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <div className={cn("pointer-events-auto shrink-0", className)}>
        <DrawerTrigger asChild>
          <Button
            type="button"
            className={cn(
              "h-14 rounded-full flex items-center p-0 gap-0 cursor-pointer overflow-hidden active:scale-[0.92] transition-all px-4 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
              // High contrast against canvas in both light and dark modes
              !hasRecentCall &&
                "bg-[#191F28] text-white hover:bg-neutral-800 shadow-[0_4px_16px_rgba(25,31,40,0.22)] border border-neutral-700/30 dark:bg-white dark:text-[#191F28] dark:hover:bg-neutral-100 dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)] dark:border-white/20",
              // Active / Recent Call state: vibrant Toss Blue
              hasRecentCall &&
                "border-primary bg-primary text-white shadow-[0_4px_16px_rgba(0,100,255,0.35)]"
            )}
            aria-label={hasRecentCall ? t("staffCall.called") : t("staffCall.callAria")}
          >
            {hasRecentCall ? (
              <Check className="size-6 stroke-[2.4] text-white shrink-0" aria-hidden="true" />
            ) : (
              <Bell className="size-6 stroke-[1.9] text-white dark:text-[#191F28] shrink-0" aria-hidden="true" />
            )}
            <motion.div
              initial={false}
              animate={{
                width: isExpanded ? "auto" : 0,
                opacity: isExpanded ? 1 : 0,
              }}
              transition={{
                duration: reduceMotion ? 0 : 0.28,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="overflow-hidden"
              aria-hidden={!isExpanded}
            >
              <span
                className={cn(
                  "block font-bold text-[15px] sm:text-base whitespace-nowrap pl-2.5 transition-colors",
                  hasRecentCall ? "text-white font-extrabold" : "text-white dark:text-[#191F28]"
                )}
              >
                {hasRecentCall ? t("staffCall.called") : t("staffCall.button")}
              </span>
            </motion.div>
          </Button>
        </DrawerTrigger>
      </div>

      <DrawerContent className="bg-[#F8F9FA] dark:bg-[#121316] border-border/40">
        <DrawerHeader className="px-5 pt-7 pb-2 text-left">
          <DrawerTitle className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {t("staffCall.heading")}
          </DrawerTitle>
        </DrawerHeader>

        <DrawerBody className="px-5 py-3">
          <div
            className="grid grid-cols-3 gap-2.5"
            role="group"
            aria-label={t("staffCall.title")}
          >
            {STAFF_CALL_OPTIONS.map((opt) => {
              const isSelected = selectedOptions.includes(opt.id);
              const label = t(opt.labelKey as Parameters<typeof t>[0]);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleOption(opt.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative flex min-h-[64px] h-16 w-full items-center justify-center rounded-[16px] px-1.5 py-3 text-base transition-all cursor-pointer select-none",
                    reduceMotion ? "" : "active:scale-[0.96]",
                    isSelected
                      ? "border-2 border-primary bg-primary/10 text-primary shadow-2xs font-extrabold"
                      : "border-0 bg-[#F2F4F6] dark:bg-[#202124] text-foreground font-bold hover:bg-[#E5E8EB] dark:hover:bg-[#2A2B2E]"
                  )}
                >
                  <span className="break-keep text-center leading-snug">{label}</span>
                </button>
              );
            })}
          </div>
        </DrawerBody>

        <DrawerFooter className="grid grid-cols-2 gap-3 px-5 pb-5 pt-2 bg-transparent">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => handleOpenChange(false)}
            aria-label={t("staffCall.close")}
            className="w-full h-14 min-h-[56px] font-bold text-base rounded-[16px] border-0 bg-[#F2F4F6] dark:bg-[#202124] text-foreground hover:bg-[#E5E8EB] dark:hover:bg-[#2A2B2E] shadow-none cursor-pointer"
          >
            {t("staffCall.close")}
          </Button>
          <Button
            type="button"
            variant="default"
            size="lg"
            onClick={handleConfirm}
            aria-label={t("staffCall.call")}
            className="w-full h-14 min-h-[56px] font-extrabold text-base rounded-[16px] bg-[#3182F6] hover:bg-[#1B64DA] text-white shadow-none border-0 cursor-pointer"
          >
            {t("staffCall.call")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
