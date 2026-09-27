"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Check } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/BackButton";
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

/**
 * Toss TDS Outline Bell Icon with soft-tint circular surface. Icon-sized use
 * of the accent color, not small text, so accent/secondary tokens apply
 * directly (no Status-Color Exception Rule concern here).
 */
function TossOutlineBellIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground select-none",
        className,
      )}
    >
      <Bell className="size-8 stroke-[1.8]" aria-hidden="true" />
    </div>
  );
}

/**
 * Toss TDS Outline Success Check Icon -- large icon-sized use of --success,
 * which is fine per the Status-Color Exception Rule (icon/large-surface
 * only, never small text).
 */
function TossOutlineCheckIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full bg-success-bg text-success select-none",
        className,
      )}
    >
      <Check className="size-8 stroke-[2.2]" aria-hidden="true" />
    </div>
  );
}

export function StaffCallButton({
  storeInfo,
  className,
  isExpanded = true,
}: StaffCallButtonProps) {
  const { t } = useTranslation("menu");
  const { t: tCommon } = useTranslation("common");
  const [open, setOpen] = React.useState(false);
  const [callStatus, setCallStatus] = React.useState<"idle" | "success">("idle");
  const [hasRecentCall, setHasRecentCall] = React.useState(false);
  const autoCloseTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const recentCallTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);

  // Clear timers on unmount
  React.useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      if (recentCallTimerRef.current) {
        clearTimeout(recentCallTimerRef.current);
      }
    };
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    React.startTransition(() => {
      setOpen(isOpen);
    });
    if (!isOpen) {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      // Reset call status after sheet slide down transition completes
      setTimeout(() => {
        setCallStatus("idle");
      }, 300);
    }
  };

  const handleConfirm = () => {
    React.startTransition(() => {
      setCallStatus("success");
      setHasRecentCall(true);
    });

    if (recentCallTimerRef.current) {
      clearTimeout(recentCallTimerRef.current);
    }
    recentCallTimerRef.current = setTimeout(() => {
      setHasRecentCall(false);
    }, 3500);

    toast({
      kind: "success",
      messageKo: t("staffCall.toastSuccess", { table: storeInfo.table }),
      variant: "staff-call",
      hapticsEnabled,
    });

    // Auto dismiss after 2.4s
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    autoCloseTimerRef.current = setTimeout(() => {
      handleOpenChange(false);
    }, 2400);
  };

  const handleCloseImmediately = () => {
    handleOpenChange(false);
  };

  return (
    <>
      <div className={cn("pointer-events-auto shrink-0", className)}>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOpenChange(true)}
          className={cn(
            "h-14 rounded-full bg-card hover:bg-muted text-foreground border border-border/80 shadow-[0_4px_16px_rgba(25,31,40,0.08)] flex items-center p-0 gap-0 cursor-pointer overflow-hidden active:scale-[0.92] transition-all px-4 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
            hasRecentCall && "border-primary/50 bg-primary/10 text-primary shadow-xs"
          )}
          aria-label={hasRecentCall ? "직원 호출 완료됨" : t("staffCall.callAria")}
        >
          {hasRecentCall ? (
            <Check className="size-6 stroke-[2.4] text-primary shrink-0" aria-hidden="true" />
          ) : (
            <Bell className="size-6 stroke-[1.9] shrink-0" aria-hidden="true" />
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
                hasRecentCall ? "text-primary font-extrabold" : "text-foreground"
              )}
            >
              {hasRecentCall ? "호출 완료" : t("staffCall.button")}
            </span>
          </motion.div>
        </Button>
      </div>

      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader className="relative items-center pb-2 pt-7 text-center">
            <div className="absolute top-3 left-3">
              <BackButton
                onClick={handleCloseImmediately}
                label={t("staffCall.closeAria")}
              />
            </div>

            <AnimatePresence mode="wait">
              {callStatus === "idle" ? (
                <motion.div
                  key="idle-view"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex flex-col items-center w-full mt-2"
                >
                  <div className="mb-3">
                    <TossOutlineBellIcon />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-bold text-sm mb-2">
                    <span>{storeInfo.storeName}</span>
                    <span className="opacity-40">•</span>
                    <span>{tCommon("tableNumber", { table: storeInfo.table })}</span>
                  </div>

                  <DrawerTitle className="pt-0.5 text-2xl font-extrabold text-foreground tracking-tight">
                    {t("staffCall.confirmTitle")}
                  </DrawerTitle>
                </motion.div>
              ) : (
                <motion.div
                  key="success-view"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex flex-col items-center w-full mt-2"
                >
                  <div className="mb-3">
                    <TossOutlineCheckIcon />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-bg text-foreground font-bold text-sm mb-2">
                    <span>{tCommon("tableNumber", { table: storeInfo.table })}</span>
                    <span className="opacity-40">•</span>
                    <span>{t("staffCall.called")}</span>
                  </div>

                  <DrawerTitle className="pt-0.5 text-2xl font-extrabold text-foreground tracking-tight">
                    {t("staffCall.successTitle")}
                  </DrawerTitle>
                  <DrawerDescription className="text-sm font-semibold text-muted-foreground mt-1 leading-relaxed">
                    {t("staffCall.successDesc")}
                  </DrawerDescription>
                </motion.div>
              )}
            </AnimatePresence>
          </DrawerHeader>

          <DrawerFooter className="p-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-background">
            <AnimatePresence mode="wait">
              {callStatus === "idle" ? (
                <motion.div
                  key="idle-buttons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-2 gap-3 w-full"
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={handleCloseImmediately}
                    className="w-full h-14 min-h-[56px] font-bold text-base rounded-[16px] border-0 shadow-none active:scale-[0.96] transition-all cursor-pointer"
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="lg"
                    onClick={handleConfirm}
                    className="w-full h-14 min-h-[56px] font-extrabold text-base rounded-[16px] shadow-none border-0 active:scale-[0.96] transition-all cursor-pointer"
                  >
                    {t("staffCall.confirmButton")}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="success-buttons"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full"
                >
                  <Button
                    type="button"
                    variant="default"
                    size="lg"
                    onClick={handleCloseImmediately}
                    className="w-full h-14 min-h-[56px] font-extrabold text-base rounded-[16px] shadow-none border-0 active:scale-[0.96] transition-all cursor-pointer"
                  >
                    {tCommon("confirm")}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
