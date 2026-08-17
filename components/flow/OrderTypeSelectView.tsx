"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Utensils, ShoppingBag } from "lucide-react";
import { SelectionCard } from "./SelectionCard";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { BackButton } from "@/components/ui/BackButton";
import { SettingsIconButton } from "@/components/ui/SettingsIconButton";
import type { StoreListing } from "@/lib/types";

interface OrderTypeSelectViewProps {
  store: StoreListing;
}

// Entry step 2 of 2 for a manually-selected store: dine-in routes on to the
// dedicated table-selection screen, takeout skips straight to the menu since
// there's no table to resolve (docs/decisions/0014).
export function OrderTypeSelectView({ store }: OrderTypeSelectViewProps) {
  const router = useRouter();
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  return (
    <main
      id="main-content"
      className="flex min-h-[100dvh] w-full flex-col bg-background text-foreground"
    >
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 bg-background/90 backdrop-blur-md">
        <BackButton href="/" label="홈으로 이동" className="-ml-1" />
        <SettingsIconButton className="-mr-1" />
      </header>


      <div className="flex flex-1 flex-col justify-center gap-6 px-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-bold text-primary">{store.storeName}</p>
          <h1 className="text-2xl font-extrabold text-foreground leading-snug">
            매장에서 드시나요,
            <br />
            포장하시나요?
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectionCard
            isSelected={false}
            onClick={() => router.push(`/order/${store.storeId}/table`)}
            label="매장 식사"
            sublabel="테이블에서 편하게"
            icon={<Utensils className="h-5 w-5" />}
            reduceMotion={reduceMotion}
          />
          <SelectionCard
            isSelected={false}
            onClick={() => router.push(`/order/${store.storeId}?type=takeout`)}
            label="포장하기"
            sublabel="포장 후 픽업"
            icon={<ShoppingBag className="h-5 w-5" />}
            reduceMotion={reduceMotion}
          />
        </div>
      </div>
    </main>
  );
}
