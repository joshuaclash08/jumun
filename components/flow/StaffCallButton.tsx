"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, ChevronLeft, Check } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { notify } from "@/lib/services/A11yFeedbackService";
import type { StoreInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StaffCallButtonProps {
  storeInfo: Extract<StoreInfo, { orderType: "dine-in" }>;
  className?: string;
}

/**
 * Toss TDS Outline Bell Icon with soft-tint circular surface (#E8F2FF / #0064FF)
 */
function TossOutlineBellIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F2FF] text-[#0064FF] select-none",
        className,
      )}
    >
      <Bell className="size-8 stroke-[1.8]" aria-hidden="true" />
    </div>
  );
}

/**
 * Toss TDS Outline Success Check Icon (#E8F8EE / #00A85A)
 */
function TossOutlineCheckIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8EE] text-[#00A85A] select-none",
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
}: StaffCallButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [callStatus, setCallStatus] = React.useState<"idle" | "success">("idle");
  const autoCloseTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);

  // Clear timers on unmount
  React.useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
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
    setCallStatus("success");

    const toast = notify(
      "success",
      `${storeInfo.table}번 테이블로 직원을 호출했어요.`,
      {
        hapticsEnabled,
      },
    );
    useCartStore.setState((state) => ({ toasts: [...state.toasts, toast] }));

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
      <div
        className={cn(
          "fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-50 pointer-events-none",
          className,
        )}
      >
        <div className="mx-auto max-w-[768px] pl-4">
          <motion.div
            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="pointer-events-auto w-fit"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleOpenChange(true)}
              className="h-14 w-14 rounded-full bg-card/95 backdrop-blur-md hover:bg-muted text-foreground border border-border/80 shadow-[0_4px_16px_rgba(25,31,40,0.12)] p-0 flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="직원 호출하기"
            >
              <Bell className="size-6 stroke-[2.2]" aria-hidden="true" />
            </Button>
          </motion.div>
        </div>
      </div>

      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader className="relative items-center pb-2 pt-6 text-center">
            <motion.div
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute top-3 left-3"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCloseImmediately}
                aria-label="직원 호출 닫기"
                className="h-10 w-10 rounded-full bg-background/85 hover:bg-background text-foreground backdrop-blur-md shadow-xs border border-border/50 flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft
                  className="size-6 stroke-[2.5]"
                  aria-hidden="true"
                />
              </Button>
            </motion.div>

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

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F2FF] text-[#0064FF] font-bold text-xs mb-2">
                    <span>{storeInfo.storeName}</span>
                    <span className="opacity-40">•</span>
                    <span>{storeInfo.table}번 테이블</span>
                  </div>

                  <DrawerTitle className="pt-0.5 text-2xl font-extrabold text-foreground tracking-tight">
                    직원을 호출할까요?
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

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F8EE] text-[#00A85A] font-bold text-xs mb-2">
                    <span>{storeInfo.table}번 테이블</span>
                    <span className="opacity-40">•</span>
                    <span>호출 완료</span>
                  </div>

                  <DrawerTitle className="pt-0.5 text-2xl font-extrabold text-foreground tracking-tight">
                    호출이 완료되었어요!
                  </DrawerTitle>
                  <DrawerDescription className="text-sm font-semibold text-muted-foreground mt-1 leading-relaxed">
                    직원이 곧 테이블로 방문할게요.
                  </DrawerDescription>
                </motion.div>
              )}
            </AnimatePresence>
          </DrawerHeader>

          <DrawerFooter className="p-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-[6px]">
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
                    size="lg"
                    onClick={handleCloseImmediately}
                    className="w-full h-14 min-h-[56px] font-bold text-base rounded-[16px] bg-[#F2F4F6] text-[#4E5968] hover:bg-[#E5E8EB] hover:text-[#191F28] border-0 shadow-none active:scale-[0.96] transition-all cursor-pointer"
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleConfirm}
                    className="w-full h-14 min-h-[56px] font-extrabold text-base rounded-[16px] bg-[#0064FF] text-white hover:bg-[#0050D9] shadow-none border-0 active:scale-[0.96] transition-all cursor-pointer"
                  >
                    호출하기
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
                    size="lg"
                    onClick={handleCloseImmediately}
                    className="w-full h-14 min-h-[56px] font-extrabold text-base rounded-[16px] bg-[#0064FF] text-white hover:bg-[#0050D9] shadow-none border-0 active:scale-[0.96] transition-all cursor-pointer"
                  >
                    확인
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
