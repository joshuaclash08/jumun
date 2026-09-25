"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  Check,
  CreditCard,
  Smartphone,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  Info,
  Loader2,
} from "lucide-react";
import type { MenuCategory, Product, StoreInfo, CartItem } from "@/lib/types";
import { formatKRW } from "@/lib/format";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { OrderService } from "@/lib/services";
import { toast } from "@/lib/services/A11yFeedbackService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WizardOrderViewProps {
  categories: MenuCategory[];
  products: Product[];
  storeInfo?: StoreInfo;
  onExitWizard: () => void;
}

export function WizardOrderView({
  categories,
  products,
  storeInfo,
  onExitWizard,
}: WizardOrderViewProps) {
  // Store hooks
  const {
    items,
    addItem,
    clearCart,
    setOrderStatus,
    setLastReceipt,
  } = useCartStore();

  const {
    oneHandedMode,
    voiceGuideEnabled,
    setVoiceGuideEnabled,
    reducedMotion,
    hapticsEnabled,
  } = useAccessibilityStore();

  const isMotionDisabled = reducedMotion || process.env.NODE_ENV === "test";

  const defaultPaymentMethod = usePaymentStore((state) => state.defaultMethod);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>(
    defaultPaymentMethod,
  );

  // Voice guide hook
  const { speak, cancel } = useVoiceGuide();

  // Wizard state: 1 (Category), 2 (Product), 3 (Option), 4 (Checkout)
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  // Option selections: groupId -> string[]
  const [optionSelections, setOptionSelections] = React.useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Step names for accessible progress
  const stepTitles = {
    1: "카테고리 선택",
    2: "메뉴 선택",
    3: "옵션 선택",
    4: "주문 및 결제",
  };

  // Announce step transitions
  React.useEffect(() => {
    if (step === 1) {
      speak("1단계, 카테고리를 선택해 주세요.");
    }
  }, [step, speak]);

  // Filter products by selected category
  const filteredProducts = React.useMemo(() => {
    if (!selectedCategoryId) return [];
    return products.filter((p) => p.category === selectedCategoryId && p.available !== false);
  }, [products, selectedCategoryId]);

  const selectedCategory = React.useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  // Compute unit price for selected product with options
  const currentUnitPrice = React.useMemo(() => {
    if (!selectedProduct) return 0;
    let price = selectedProduct.price;
    selectedProduct.optionGroups.forEach((group) => {
      const selectedIds = optionSelections[group.id] || [];
      group.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          price += opt.priceDelta;
        }
      });
    });
    return price;
  }, [selectedProduct, optionSelections]);

  // Step 1: Select Category
  const handleSelectCategory = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    setSelectedCategoryId(categoryId);
    setStep(2);
    speak(`${cat?.labelKo || "선택한"} 카테고리를 선택하셨습니다. 원하시는 메뉴를 골라주세요.`);
  };

  // Step 2: Select Product
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    // Initialize default options (pick first option for required groups)
    const initialOptions: Record<string, string[]> = {};
    product.optionGroups.forEach((group) => {
      if (group.required && group.options.length > 0) {
        initialOptions[group.id] = [group.options[0].id];
      }
    });
    setOptionSelections(initialOptions);
    setQuantity(1);
    setStep(3);
    speak(
      `${product.nameKo}, ${formatKRW(product.price)}를 선택하셨습니다. 옵션과 수량을 선택해 주세요.`,
    );
  };

  // Step 3: Toggle Option
  const handleToggleOption = (groupId: string, optionId: string, selectionType: "single" | "multiple") => {
    setOptionSelections((prev) => {
      const current = prev[groupId] || [];
      if (selectionType === "single") {
        return { ...prev, [groupId]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  // Build CartItem from current selections
  const buildCurrentCartItem = (): CartItem | null => {
    if (!selectedProduct) return null;

    const selections = Object.entries(optionSelections).map(([groupId, optionIds]) => ({
      groupId,
      optionIds,
    }));

    const optionsSummaryParts: string[] = [];
    selectedProduct.optionGroups.forEach((group) => {
      const selectedIds = optionSelections[group.id] || [];
      group.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          optionsSummaryParts.push(opt.labelKo);
        }
      });
    });

    return {
      id: `${selectedProduct.id}-${Date.now()}`,
      productId: selectedProduct.id,
      nameKo: selectedProduct.nameKo,
      optionsSummary: optionsSummaryParts.join(", "),
      quantity,
      selections,
      unitPrice: currentUnitPrice,
    };
  };

  // Step 3 Actions: Add & Continue vs Direct Checkout
  const handleAddMoreItems = () => {
    const item = buildCurrentCartItem();
    if (!item) return;

    addItem(item);
    speak(`${item.nameKo}를 담았습니다. 추가하실 카테고리를 선택해 주세요.`);
    // Reset to step 1
    setSelectedProduct(null);
    setOptionSelections({});
    setQuantity(1);
    setStep(1);
  };

  const handleProceedToCheckout = () => {
    const item = buildCurrentCartItem();
    if (item) {
      addItem(item);
    }
    setStep(4);
    speak("주문 내역을 확인하고 결제를 진행해 주세요.");
  };

  // Step 4: Final Mock Payment
  const handleFinalPayment = async () => {
    if (!storeInfo) {
      toast({
        kind: "error",
        messageKo: "매장 정보가 확인되지 않았습니다.",
        variant: "generic",
        hapticsEnabled,
      });
      return;
    }

    if (items.length === 0) {
      toast({
        kind: "error",
        messageKo: "장바구니에 담긴 메뉴가 없습니다.",
        variant: "generic",
        hapticsEnabled,
      });
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setOrderStatus("submitting");

    try {
      const receipt = await OrderService.submitOrder(storeInfo, items);
      setLastReceipt(receipt);
      setOrderStatus("confirmed");
      clearCart();
      speak("주문과 결제가 성공적으로 완료되었습니다. 영수증이 발급되었습니다.");
    } catch (err: unknown) {
      setOrderStatus("failed");
      const msg = err instanceof Error ? err.message : "결제에 실패했습니다.";
      toast({
        kind: "error",
        messageKo: msg,
        variant: "generic",
        hapticsEnabled,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Total amount in cart for step 4
  const cartTotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

  // One-Handed Layout Container Classes
  const oneHandedAlignClass = React.useMemo(() => {
    if (oneHandedMode === "left") {
      return "max-w-[85%] sm:max-w-[360px] mr-auto self-start text-left";
    }
    if (oneHandedMode === "right") {
      return "max-w-[85%] sm:max-w-[360px] ml-auto self-end text-left";
    }
    return "max-w-[560px] mx-auto w-full text-left";
  }, [oneHandedMode]);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      {/* ── Top Bar: Prototype VoiceOver Notice & Audio Controls ── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/40 px-4 py-3">
        <div className="max-w-[768px] mx-auto flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onExitWizard}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-lg"
              aria-label="일반 메뉴판으로 나가기"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>일반 메뉴판</span>
            </button>

            {/* Quick Audio Guide Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextState = !voiceGuideEnabled;
                setVoiceGuideEnabled(nextState);
                if (nextState) {
                  speak("음성 안내가 켜졌습니다.", { force: true });
                } else {
                  cancel();
                }
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                voiceGuideEnabled
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted/50 text-muted-foreground border-border/60 hover:text-foreground",
              )}
              aria-label={`음성 안내 ${voiceGuideEnabled ? "끄기" : "켜기"}`}
            >
              {voiceGuideEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>음성 켜짐</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>음성 꺼짐</span>
                </>
              )}
            </button>
          </div>

          {/* Prototype VoiceOver Disclaimer Banner */}
          <div
            role="note"
            className="flex items-start gap-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 p-3 text-xs leading-relaxed text-blue-900 dark:text-blue-200"
          >
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-extrabold text-primary">※ 프로토타입 음성 안내 알림</span>
              <p className="text-muted-foreground font-medium">
                본 웹 시연에서는 음성 합성(TTS)으로 동작을 체험할 수 있으며, 향후 실제 상용 앱에서는 스마트폰 OS 내장 VoiceOver / TalkBack과 네이티브로 정밀 연동됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Wizard Step Area ── */}
      <div className="w-full px-4 pt-4">
        <div className={cn("flex flex-col transition-all duration-300", oneHandedAlignClass)}>
          {/* Progress Indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <span className="text-xs font-bold tracking-wider text-primary uppercase">
              {stepTitles[step]} (Step {step}/4)
            </span>
            {oneHandedMode !== "none" && (
              <Badge variant="outline" className="text-[11px] font-semibold text-muted-foreground">
                {oneHandedMode === "left" ? "왼손 한손 조작" : "오른손 한손 조작"}
              </Badge>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* ═══════════════ STEP 1: 카테고리 선택 ═══════════════ */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={isMotionDisabled ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={isMotionDisabled ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: isMotionDisabled ? 0 : 0.15 }}
                className="flex flex-col gap-4 pt-4"
              >
                <div>
                  <h1 className="text-2xl font-black text-foreground tracking-tight">
                    어떤 메뉴를 드실까요?
                  </h1>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    원하시는 종류의 카테고리를 하나 선택해 주세요.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className="group flex items-center justify-between p-5 rounded-2xl bg-card border-2 border-border/70 hover:border-primary focus-visible:border-primary hover:bg-accent/40 transition-all text-left shadow-xs active:scale-[0.98]"
                    >
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {cat.labelKo}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {products.filter((p) => p.category === cat.id).length}개 메뉴 준비됨
                        </span>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Check className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══════════════ STEP 2: 메뉴 선택 ═══════════════ */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={isMotionDisabled ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={isMotionDisabled ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: isMotionDisabled ? 0 : 0.15 }}
                className="flex flex-col gap-4 pt-4"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      speak("카테고리 선택으로 돌아갑니다.");
                    }}
                    className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="카테고리 다시 선택하기"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">
                      {selectedCategory?.labelKo} 메뉴 선택
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">
                      드실 메뉴를 하나 골라주세요.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  {filteredProducts.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleSelectProduct(prod)}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-card border-2 border-border/70 hover:border-primary focus-visible:border-primary hover:bg-accent/40 transition-all text-left shadow-xs active:scale-[0.98]"
                    >
                      <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-muted/60 shrink-0">
                        <Image
                          src={prod.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {prod.nameKo}
                        </span>
                        <span className="text-sm font-extrabold text-foreground mt-0.5">
                          {formatKRW(prod.price)}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground mt-1 line-clamp-1">
                          {prod.descriptionKo}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══════════════ STEP 3: 옵션 선택 ═══════════════ */}
            {step === 3 && selectedProduct && (
              <motion.div
                key="step-3"
                initial={isMotionDisabled ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={isMotionDisabled ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: isMotionDisabled ? 0 : 0.15 }}
                className="flex flex-col gap-5 pt-4"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      speak("메뉴 선택으로 돌아갑니다.");
                    }}
                    className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="메뉴 다시 선택하기"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">
                      {selectedProduct.nameKo}
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">
                      옵션과 수량을 확인해 주세요.
                    </p>
                  </div>
                </div>

                {/* Selected Product Card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                    <Image
                      src={selectedProduct.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-foreground">{selectedProduct.nameKo}</h2>
                    <span className="text-base font-extrabold text-primary">
                      {formatKRW(currentUnitPrice * quantity)}
                    </span>
                  </div>
                </div>

                {/* Option Groups */}
                {selectedProduct.optionGroups.map((group) => {
                  const selectedIds = optionSelections[group.id] || [];
                  return (
                    <div key={group.id} className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">{group.labelKo}</span>
                        {group.required && (
                          <Badge variant="secondary" className="text-[11px] font-semibold">
                            필수
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {group.options.map((opt) => {
                          const isSelected = selectedIds.includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                handleToggleOption(group.id, opt.id, group.selectionType);
                                speak(`${opt.labelKo} 옵션이 선택되었습니다.`);
                              }}
                              className={cn(
                                "flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all font-bold text-sm",
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                                  : "border-border/70 bg-card text-foreground hover:bg-muted/40",
                              )}
                            >
                              <span>{opt.labelKo}</span>
                              {opt.priceDelta > 0 && (
                                <span className="text-xs font-semibold opacity-80 mt-0.5">
                                  +{formatKRW(opt.priceDelta)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Quantity Stepper */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/70">
                  <span className="text-base font-bold text-foreground">주문 수량</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => {
                        const next = Math.max(1, quantity - 1);
                        setQuantity(next);
                        speak(`수량 ${next}개`);
                      }}
                      className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-foreground disabled:opacity-30 active:scale-95 transition-all"
                      aria-label="수량 줄이기"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-black tabular-nums w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= 10}
                      onClick={() => {
                        const next = Math.min(10, quantity + 1);
                        setQuantity(next);
                        speak(`수량 ${next}개`);
                      }}
                      className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-foreground disabled:opacity-30 active:scale-95 transition-all"
                      aria-label="수량 늘리기"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Step 3 Action Buttons */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <Button
                    size="cta-full"
                    onClick={handleProceedToCheckout}
                    className="h-14 text-base font-black bg-primary text-white hover:bg-primary/90 rounded-2xl shadow-sm cursor-pointer"
                  >
                    이 메뉴 바로 결제하기 ({formatKRW(currentUnitPrice * quantity)})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddMoreItems}
                    className="h-13 text-base font-bold rounded-2xl border-2 border-border/80 hover:bg-muted/60 cursor-pointer"
                  >
                    담고 다른 메뉴 더 고르기
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════ STEP 4: 주문 확인 및 결제 ═══════════════ */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={isMotionDisabled ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={isMotionDisabled ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: isMotionDisabled ? 0 : 0.15 }}
                className="flex flex-col gap-5 pt-4"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(3);
                      speak("옵션 선택으로 돌아갑니다.");
                    }}
                    className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="이전 화면으로 돌아가기"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">
                      주문 및 결제 확인
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">
                      담긴 메뉴와 결제 수단을 확인해 주세요.
                    </p>
                  </div>
                </div>

                {/* Store and Table Details */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between text-sm">
                  <span className="font-bold text-foreground">
                    {storeInfo?.storeName || "주문 매장"}
                  </span>
                  <Badge variant="outline" className="font-bold">
                    {storeInfo?.orderType === "dine-in"
                      ? `${storeInfo.table}번 테이블`
                      : "포장 주문"}
                  </Badge>
                </div>

                {/* Item List Summary */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-sm font-bold text-foreground">주문 메뉴 목록</span>
                  <div className="flex flex-col gap-2 rounded-2xl bg-card border border-border/70 p-4 divide-y divide-border/40">
                    {items.map((it) => (
                      <div key={it.id} className="pt-2 first:pt-0 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-foreground">{it.nameKo}</span>
                          {it.optionsSummary && (
                            <span className="text-xs text-muted-foreground">{it.optionsSummary}</span>
                          )}
                          <span className="text-xs font-semibold text-muted-foreground mt-0.5">
                            수량 {it.quantity}개
                          </span>
                        </div>
                        <span className="text-base font-extrabold text-foreground tabular-nums">
                          {formatKRW(it.unitPrice * it.quantity)}
                        </span>
                      </div>
                    ))}

                    <div className="pt-3 flex items-center justify-between">
                      <span className="text-base font-black text-foreground">총 결제 금액</span>
                      <span className="text-xl font-black text-primary tabular-nums">
                        {formatKRW(cartTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-sm font-bold text-foreground">결제 수단</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "credit_card", label: "신용/체크카드", icon: CreditCard },
                      { id: "toss_pay", label: "토스페이", icon: Smartphone },
                    ].map((method) => {
                      const isSelected = selectedPaymentMethod === method.id;
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            setSelectedPaymentMethod(method.id);
                            speak(`${method.label}가 선택되었습니다.`);
                          }}
                          className={cn(
                            "flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all font-bold text-sm",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-xs"
                              : "border-border/70 bg-card text-foreground hover:bg-muted/40",
                          )}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          <span>{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Final Checkout Button */}
                <Button
                  size="cta-full"
                  disabled={isSubmitting || items.length === 0}
                  onClick={handleFinalPayment}
                  className="h-15 text-lg font-black bg-primary text-white hover:bg-primary/90 rounded-2xl shadow-md cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>결제 처리 중...</span>
                    </div>
                  ) : (
                    <span>총 {formatKRW(cartTotal)} 결제하기</span>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
