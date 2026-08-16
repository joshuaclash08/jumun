"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Bell, ChevronLeft } from "lucide-react";
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
import { StaffBellIllustration } from "@/components/ui/TossIllustrations";
import type { StoreInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StaffCallButtonProps {
  storeInfo: StoreInfo;
  className?: string;
}

export function StaffCallButton({ storeInfo, className }: StaffCallButtonProps) {
  const [open, setOpen] = React.useState(false);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);

  const handleConfirm = () => {
    setOpen(false);
    const toast = notify("success", "직원에게 호출을 전달했어요. 잠시만 기다려 주세요.", {
      hapticsEnabled,
    });
    useCartStore.setState((state) => ({ toasts: [...state.toasts, toast] }));
  };

  return (
    <>
      <motion.div
        whileTap={reduceMotion ? undefined : { scale: 0.90 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 z-50",
          className
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          className="h-16 w-16 rounded-full bg-card/95 backdrop-blur-md hover:bg-muted text-foreground border border-border/80 shadow-floating"
          aria-label="직원 호출하기"
        >
          <Bell className="h-6 w-6" aria-hidden="true" />
        </Button>
      </motion.div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="relative items-center border-b border-border/40 pb-4 text-center">
            <motion.div
              whileTap={reduceMotion ? undefined : { scale: 0.90 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute top-3 left-3"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="직원 호출 닫기"
                className="h-12 w-12 rounded-full text-foreground hover:bg-muted"
              >
                <ChevronLeft className="h-7 w-7 stroke-[2.8]" aria-hidden="true" />
              </Button>
            </motion.div>

            <div className="flex h-24 w-24 items-center justify-center rounded-[22px] mb-1 mt-2">
              <StaffBellIllustration size={80} />
            </div>
            <DrawerTitle className="pt-2 text-xl font-extrabold text-foreground">직원을 호출할까요?</DrawerTitle>
            <DrawerDescription className="text-base font-medium text-muted-foreground">
              {storeInfo.storeName} {storeInfo.table}번 테이블로 직원이 방문합니다.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="p-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
            <Button size="lg" onClick={handleConfirm} className="w-full font-extrabold rounded-[16px] bg-primary text-white">
              호출 요청하기
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full font-bold text-muted-foreground rounded-[14px]"
            >
              취소
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

