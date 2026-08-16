"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Bell } from "lucide-react";
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

interface StaffCallButtonProps {
  storeInfo: StoreInfo;
}

// Lives in the header, next to the settings icon, so it's reachable from
// anywhere in the flow -- not buried at the bottom of the scrollable menu
// (docs/ux-audit.md 3.2). Confirmation uses a Drawer, not a Dialog, to match
// the app's one sheet pattern (docs/design-system.md's Bottom Sheets section).
export function StaffCallButton({ storeInfo }: StaffCallButtonProps) {
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
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          className="h-11 w-11 rounded-[--radius-md] shadow-2xs hover:bg-muted text-foreground border-border/80"
          aria-label="직원 호출하기"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </Button>
      </motion.div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="items-center border-b pb-4 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <Bell className="h-6 w-6" />
            </div>
            <DrawerTitle className="pt-2">직원을 호출할까요?</DrawerTitle>
            <DrawerDescription>
              {storeInfo.storeName} {storeInfo.table}번 테이블로 직원이 방문합니다.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pb-[env(safe-area-inset-bottom)]">
            <Button size="lg" onClick={handleConfirm} className="w-full">
              호출 요청하기
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full font-semibold text-muted-foreground"
            >
              닫기
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
