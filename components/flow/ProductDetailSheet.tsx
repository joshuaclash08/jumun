"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import type { Product, CartItemSelection } from "@/lib/types";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { toast } from "@/lib/services/A11yFeedbackService";
import Image from "next/image";
import { RollingPrice } from "@/components/ui/RollingPrice";
import { BackButton } from "@/components/ui/BackButton";
import { QuantityStepper } from "@/components/flow/QuantityStepper";
import { OptionGroupList } from "@/components/flow/OptionGroupList";
import { StickyActionBar } from "@/components/shared/StickyActionBar";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { generateUUID } from "@/lib/utils";
import { formatKRW } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { MenuService } from "@/lib/services";

export interface ProductDetailSheetProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProductDetailContentProps {
  product: Product;
  onAddToCart: (data: {
    quantity: number;
    selections: CartItemSelection[];
    unitPrice: number;
    optionsSummary: string;
  }) => void;
  onClose: () => void;
}

const emptySubscribe = () => () => {};

function ProductDetailContent({
  product,
  onAddToCart,
  onClose,
}: ProductDetailContentProps) {
  const { t, language } = useTranslation("menu");
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);
  const { speak } = useVoiceGuide();

  const productName = MenuService.getLocalizedTitle(product, language);
  const productDescription = MenuService.getLocalizedDescription(product, language);

  const dialogRef = React.useRef<HTMLDivElement>(null);

  // Body scroll locking when open
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Focus management: focus dialog on open, restore previously active element on close
  React.useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  // Keyboard navigation: Escape to close and Tab focus trap within modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const dialogNode = dialogRef.current;
        if (!dialogNode) return;

        const focusables = Array.from(
          dialogNode.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
          ),
        );

        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === firstElement ||
            document.activeElement === dialogNode
          ) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Voice guide intro
  React.useEffect(() => {
    speak(
      t("productDetail.voiceIntro", {
        name: productName,
        price: formatKRW(product.price),
      }),
    );
  }, [productName, product.price, speak, t]);

  // Initialize options selections
  const [selections, setSelections] = React.useState<Record<string, string[]>>(
    () => {
      const initial: Record<string, string[]> = {};
      (product.optionGroups || []).forEach((group) => {
        if (group.selectionType === "single" && group.options.length > 0) {
          initial[group.id] = [group.options[0].id];
        } else {
          initial[group.id] = [];
        }
      });
      return initial;
    },
  );

  const [quantity, setQuantity] = React.useState(1);

  const handleOptionToggle = (
    group: Product["optionGroups"][number],
    optionId: string,
  ) => {
    const isSingle = group.selectionType === "single";
    const maxSelections = group.maxSelections;
    const current = selections[group.id] || [];
    const opt = group.options.find((o) => o.id === optionId);
    const optTitle = opt ? MenuService.getLocalizedTitle(opt, language) : "";

    if (isSingle) {
      setSelections((prev) => ({ ...prev, [group.id]: [optionId] }));
      if (opt)
        speak(t("productDetail.optionSelectedVoice", { option: optTitle }));
      return;
    }

    if (current.includes(optionId)) {
      setSelections((prev) => ({
        ...prev,
        [group.id]: (prev[group.id] || []).filter((id) => id !== optionId),
      }));
      if (opt)
        speak(
          t("productDetail.optionDeselectedVoice", { option: optTitle }),
        );
      return;
    }

    if (maxSelections && current.length >= maxSelections) {
      const msg = t("productDetail.maxSelectionsToast", {
        count: maxSelections,
      });
      toast({
        kind: "error",
        messageKo: msg,
        variant: "generic",
        hapticsEnabled,
      });
      speak(msg);
      return;
    }

    setSelections((prev) => ({
      ...prev,
      [group.id]: [...(prev[group.id] || []), optionId],
    }));
    if (opt)
      speak(t("productDetail.optionSelectedVoice", { option: optTitle }));
  };

  const calculateUnitPrice = () => {
    let price = product.price;
    (product.optionGroups || []).forEach((group) => {
      const selectedIds = selections[group.id] || [];
      group.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          price += opt.priceDelta;
        }
      });
    });
    return price;
  };

  const getOptionsSummary = () => {
    const labels: string[] = [];
    (product.optionGroups || []).forEach((group) => {
      const selectedIds = selections[group.id] || [];
      group.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          labels.push(MenuService.getLocalizedTitle(opt, language));
        }
      });
    });
    return labels.join(" / ");
  };

  const unitPrice = calculateUnitPrice();
  const totalPrice = unitPrice * quantity;

  const buildItemData = () => {
    const itemSelections: CartItemSelection[] = [];
    (product.optionGroups || []).forEach((group) => {
      const selectedIds = selections[group.id] || [];
      if (selectedIds.length > 0) {
        itemSelections.push({
          groupId: group.id,
          optionIds: selectedIds,
        });
      }
    });

    return {
      quantity,
      selections: itemSelections,
      unitPrice,
      optionsSummary: getOptionsSummary(),
    };
  };

  const handleAddToCart = () => {
    const validation = MenuService.validateRequiredOptions(product, selections, language);
    if (!validation.isValid) {
      const missingStr = validation.missingGroups.join(", ");
      const msgKo = `${missingStr} 옵션을 선택해주세요.`;
      const msgEn = `Please select required option: ${missingStr}`;
      toast({
        kind: "error",
        messageKo: msgKo,
        messageEn: msgEn,
        variant: "generic",
        hapticsEnabled,
      });
      speak(language === "en" ? msgEn : msgKo);
      return;
    }
    onAddToCart(buildItemData());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 overflow-hidden"
      data-lenis-prevent=""
    >
      {/* Backdrop overlay (visible on desktop/tablet, interactive to dismiss) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Main Dialog View: Mobile 100% full screen (fixed inset-0), Desktop/Tablet centered dialog */}
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={productName}
        aria-labelledby="product-detail-title"
        aria-describedby="product-detail-description"
        tabIndex={-1}
        initial={
          reduceMotion
            ? { opacity: 1 }
            : { opacity: 0, y: 16, scale: 0.98 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 16, scale: 0.98 }
        }
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="relative z-10 flex flex-col w-full h-full sm:h-auto sm:max-h-[92vh] max-w-lg sm:rounded-[28px] overflow-hidden bg-background shadow-floating focus:outline-none"
      >
        {/* Floating Glass Back Button overlaid on top-left of hero photo with safe-area support */}
        <div className="absolute top-[calc(0.875rem+env(safe-area-inset-top,0px))] sm:top-4 left-4 z-30 pointer-events-auto">
          <BackButton
            onClick={onClose}
            label={t("productDetail.closeAria")}
            className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 hover:text-white border-none shadow-sm flex items-center justify-center transition-all"
          />
        </div>

        {/* Scrollable Content Container starting right at top-0 */}
        <div
          data-lenis-prevent=""
          tabIndex={-1}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))] scrollbar-none outline-none"
        >
          <div className="flex flex-col">
            {/* Top Hero Visual Stage starting right at top-0 with zero white gap or border */}
            <div
              style={{ backgroundColor: product.themeBg || "#F4F4F6" }}
              className="relative h-72 sm:h-80 md:h-[350px] w-full overflow-hidden shrink-0"
              aria-hidden="true"
            >
              <Image
                src={product.imageUrl}
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-cover object-center"
              />
            </div>

            {/* Structured Content Container bounded by maximum frame & comfortable margins */}
            <div className="w-full max-w-[560px] sm:max-w-[600px] mx-auto px-5 sm:px-6 flex flex-col gap-6 pt-4 pb-8">
              {/* Title, Description & Price/Stepper Row */}
              <div className="flex flex-col gap-1.5">
                <h2
                  id="product-detail-title"
                  className="text-2xl sm:text-[26px] font-black text-foreground tracking-tight"
                >
                  {productName}
                </h2>
                <p
                  id="product-detail-description"
                  className="text-base font-medium text-muted-foreground leading-relaxed mt-0.5"
                >
                  {productDescription}
                </p>

                {/* Price & Tactile Stepper Row */}
                <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-2">
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-muted-foreground">
                      {t("productDetail.orderPrice")}
                    </span>
                    <span className="text-xl font-black text-foreground tabular-nums tracking-[0.5px]">
                      {formatKRW(unitPrice)}
                    </span>
                  </div>

                  {/* Tactile Stepper */}
                  <QuantityStepper
                    value={quantity}
                    onIncrement={() => {
                      const next = Math.min(20, quantity + 1);
                      setQuantity(next);
                      speak(t("productDetail.quantityVoice", { count: next }));
                    }}
                    onDecrement={() => {
                      const next = Math.max(1, quantity - 1);
                      setQuantity(next);
                      speak(t("productDetail.quantityVoice", { count: next }));
                    }}
                    min={1}
                    max={20}
                    itemLabel={t("productDetail.quantityLabel")}
                  />
                </div>
              </div>

              {/* Unified Option Groups via OptionGroupList */}
              {product.optionGroups && product.optionGroups.length > 0 && (
                <OptionGroupList
                  groups={product.optionGroups}
                  selections={selections}
                  onOptionToggle={handleOptionToggle}
                  className="pt-1"
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Fixed Bottom Action Bar: Single Unified Cart CTA ── */}
        <StickyActionBar position="absolute">
          <Button
            type="button"
            variant="default"
            size="cta-full"
            onClick={handleAddToCart}
            className="w-full bg-primary text-primary-foreground font-extrabold hover:bg-primary/95 rounded-[14px] shadow-sm py-4 h-auto min-h-[52px]"
          >
            <RollingPrice
              value={totalPrice}
              suffix={t("productDetail.addToCartSuffix")}
              className="font-extrabold text-base text-primary-foreground"
            />
          </Button>
        </StickyActionBar>
      </motion.div>
    </motion.div>
  );
}

export function ProductDetailSheet({
  product,
  open,
  onOpenChange,
}: ProductDetailSheetProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { speak } = useVoiceGuide();
  const { t, language } = useTranslation("menu");
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) return null;

  const currentTitle = product ? MenuService.getLocalizedTitle(product, language) : "";

  const handleAdd = (data: {
    quantity: number;
    selections: CartItemSelection[];
    unitPrice: number;
    optionsSummary: string;
  }) => {
    if (!product) return;
    addItem({
      id: generateUUID(),
      productId: product.id,
      title: currentTitle,
      nameKo: product.nameKo || currentTitle,
      optionsSummary: data.optionsSummary,
      quantity: data.quantity,
      selections: data.selections,
      unitPrice: data.unitPrice,
    });
  };

  return createPortal(
    <AnimatePresence>
      {open && product && (
        <ProductDetailContent
          key={product.id}
          product={product}
          onClose={() => onOpenChange(false)}
          onAddToCart={(data) => {
            speak(
              t("productDetail.voiceAdded", {
                name: currentTitle,
                quantity: data.quantity,
              }),
            );
            handleAdd(data);
            onOpenChange(false);
          }}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
