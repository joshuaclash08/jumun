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
  // Calling staff "to the table" is meaningless for a takeout/pickup order --
  // callers are expected to gate rendering on orderType === "dine-in" first
  // (see MenuClientView), so this narrows to the variant that always has a table.
  storeInfo: Extract<StoreInfo, { orderType: "dine-in" }>;
  className?: string;
}

export function StaffCallButton({
  storeInfo,
  className,
}: StaffCallButtonProps) {
  const [open, setOpen] = React.useState(false);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);

  const handleConfirm = () => {
    setOpen(false);
    const toast = notify(
      "success",
      "직원에게 호출을 전달했어요. 잠시만 기다려 주세요.",
      {
        hapticsEnabled,
      },
    );
    useCartStore.setState((state) => ({ toasts: [...state.toasts, toast] }));
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
            onClick={() => setOpen(true)}
            className="h-14 w-14 rounded-full bg-card/95 backdrop-blur-md hover:bg-muted text-foreground border border-border/80 shadow-[0_4px_16px_rgba(25,31,40,0.12)] p-0 flex items-center justify-center shrink-0"
            aria-label="직원 호출하기"
          >
            <Bell className="size-6 stroke-[2.2]" aria-hidden="true" />
          </Button>
        </motion.div>
        </div>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="relative items-center pb-2 text-center">
            <motion.div
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute top-3 left-3"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="직원 호출 닫기"
                className="h-11 w-11 rounded-full text-foreground hover:bg-muted"
              >
                <ChevronLeft
                  className="size-7 stroke-[2.8]"
                  aria-hidden="true"
                />
              </Button>
            </motion.div>

            <div className="flex h-32 w-32 items-center justify-center rounded-[22px] mb-0 mt-1">
              <StaffBellIllustration size={130} />
            </div>
            <DrawerTitle className="pt-1 text-xl font-extrabold text-foreground">
              직원을 호출할까요?
            </DrawerTitle>
            <DrawerDescription className="text-base font-medium text-muted-foreground">
              {storeInfo.storeName} {storeInfo.table}번 테이블로 직원이
              방문합니다.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex flex-col gap-2 p-4 pt-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_80%,transparent_100%)]">
            <Button
              size="lg"
              onClick={handleConfirm}
              className="w-full h-14 min-h-[56px] font-extrabold rounded-[16px] bg-primary text-white shadow-none hover:bg-primary/95"
            >
              호출 요청하기
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setOpen(false)}
              className="w-full h-12 min-h-[48px] font-bold text-muted-foreground rounded-[14px]"
            >
              취소
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
