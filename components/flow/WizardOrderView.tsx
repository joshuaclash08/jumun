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
  Loader2,
} from "lucide-react";
import type { MenuCategory, Product, StoreInfo, CartItem } from "@/lib/types";
import { formatKRW, getCartItemDisplayName, getCartTotals } from "@/lib/format";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { OrderService, MenuService } from "@/lib/services";
import { toast } from "@/lib/services/A11yFeedbackService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuantityStepper } from "@/components/flow/QuantityStepper";
import { OptionGroupList } from "@/components/flow/OptionGroupList";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

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
  const { t, language } = useTranslation("menu");
  const { t: tCommon } = useTranslation("common");

  // Store hooks
  const { items, addItem, clearCart, setOrderStatus, setLastReceipt } =
    useCartStore();

  const {
    oneHandedMode,
    voiceGuideEnabled,
    setVoiceGuideEnabled,
    reducedMotion,
    hapticsEnabled,
  } = useAccessibilityStore();

  const isMotionDisabled = reducedMotion || process.env.NODE_ENV === "test";

  const defaultPaymentMethod = usePaymentStore((state) => state.defaultMethod);
  const [userPaymentMethod, setUserPaymentMethod] = React.useState<string | null>(null);
  const selectedPaymentMethod = userPaymentMethod ?? defaultPaymentMethod;
  const setSelectedPaymentMethod = (method: string) => setUserPaymentMethod(method);

  const lastDirectCheckoutItemIdRef = React.useRef<string | null>(null);

  // Voice guide hook
  const { speak, cancel } = useVoiceGuide();

  // Wizard state: 1 (Category), 2 (Product), 3 (Option), 4 (Checkout)
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<
    string | null
  >(null);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null,
  );

  // Option selections: groupId -> string[]
  const [optionSelections, setOptionSelections] = React.useState<
    Record<string, string[]>
  >({});
  const [quantity, setQuantity] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Step names for accessible progress
  const stepTitles = {
    1: t("wizard.stepName1"),
    2: t("wizard.stepName2"),
    3: t("wizard.stepName3"),
    4: t("wizard.stepName4"),
  };

  // Announce step transitions
  React.useEffect(() => {
    if (step === 1) {
      speak(t("wizard.step1Voice"));
    }
  }, [step, speak, t]);

  // Filter products by selected category
  const filteredProducts = React.useMemo(() => {
    if (!selectedCategoryId) return [];
    return products.filter(
      (p) => p.category === selectedCategoryId && p.available !== false,
    );
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
    speak(
      t("wizard.selectCategoryVoice", {
        category: cat ? MenuService.getLocalizedTitle(cat, language) : "",
      }),
    );
  };

  // Step 2: Select Product
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    // Initialize default options (pick first option for required groups)
    const initialOptions: Record<string, string[]> = {};
    (product.optionGroups || []).forEach((group) => {
      if (group.required && group.options.length > 0) {
        initialOptions[group.id] = [group.options[0].id];
      }
    });
    setOptionSelections(initialOptions);
    setQuantity(1);
    setStep(3);
    speak(
      t("wizard.selectProductVoice", {
        product: MenuService.getLocalizedTitle(product, language),
        price: formatKRW(product.price),
      }),
    );
  };

  // Build CartItem from current selections
  const buildCurrentCartItem = (): CartItem | null => {
    if (!selectedProduct) return null;

    const selections = Object.entries(optionSelections).map(
      ([groupId, optionIds]) => ({
        groupId,
        optionIds,
      }),
    );

    const optionsSummaryParts: string[] = [];
    (selectedProduct.optionGroups || []).forEach((group) => {
      const selectedIds = optionSelections[group.id] || [];
      group.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          optionsSummaryParts.push(MenuService.getLocalizedTitle(opt, language));
        }
      });
    });

    return {
      id: `${selectedProduct.id}-${Date.now()}`,
      productId: selectedProduct.id,
      nameKo: selectedProduct.nameKo,
      title: MenuService.getLocalizedTitle(selectedProduct, language),
      optionsSummary: optionsSummaryParts.join(", "),
      quantity,
      selections,
      unitPrice: currentUnitPrice,
    };
  };

  // Step 3 Actions: Add & Continue vs Direct Checkout
  const handleAddMoreItems = () => {
    if (!selectedProduct) return;
    const validation = MenuService.validateRequiredOptions(selectedProduct, optionSelections, language);
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
    const item = buildCurrentCartItem();
    if (!item) return;

    addItem(item);
    lastDirectCheckoutItemIdRef.current = null;
    speak(t("wizard.addMoreVoice", { product: item.title || item.nameKo || "" }));
    // Reset to step 1
    setSelectedProduct(null);
    setOptionSelections({});
    setQuantity(1);
    setStep(1);
  };

  const handleProceedToCheckout = () => {
    if (!selectedProduct) return;
    const validation = MenuService.validateRequiredOptions(selectedProduct, optionSelections, language);
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
    const item = buildCurrentCartItem();
    if (item) {
      addItem(item);
      lastDirectCheckoutItemIdRef.current = item.id;
    }
    setStep(4);
    speak(t("wizard.checkoutVoice"));
  };

  // Step 4: Final Mock Payment
  const handleFinalPayment = async () => {
    if (!storeInfo) {
      toast({
        kind: "error",
        messageKo: t("wizard.missingStoreVoice"),
        variant: "generic",
        hapticsEnabled,
      });
      return;
    }

    if (items.length === 0) {
      toast({
        kind: "error",
        messageKo: t("wizard.emptyCartVoice"),
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
      lastDirectCheckoutItemIdRef.current = null;
      setLastReceipt(receipt);
      setOrderStatus("confirmed");
      clearCart();
      speak(t("wizard.paymentSuccessVoice"));
    } catch (err: unknown) {
      setOrderStatus("failed");
      const msg = err instanceof Error ? err.message : t("wizard.paymentFailedVoice");
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
  const { totalPrice: cartTotal } = getCartTotals(items);

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
      <div className="sticky top-0 z-30 bg-background border-b border-border/40 px-4 py-3">
        <div className="max-w-[840px] mx-auto flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onExitWizard}
              className="inline-flex items-center gap-1.5 text-base font-bold text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-lg"
              aria-label={t("wizard.exitAria")}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("wizard.exitText")}</span>
            </button>

            {/* Quick Audio Guide Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextState = !voiceGuideEnabled;
                setVoiceGuideEnabled(nextState);
                if (nextState) {
                  speak(t("wizard.voiceTurnedOn"), { force: true });
                } else {
                  cancel();
                }
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-base font-bold transition-all border",
                voiceGuideEnabled
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted/50 text-muted-foreground border-border/60 hover:text-foreground",
              )}
              aria-label={t("wizard.voiceToggleAria", { action: voiceGuideEnabled ? t("wizard.voiceTurnOff") : t("wizard.voiceTurnOn") })}
            >
              {voiceGuideEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>{t("wizard.voiceOn")}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{t("wizard.voiceOff")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Wizard Step Area ── */}
      <div className="w-full px-4 pt-4">
        <div
          className={cn(
            "flex flex-col transition-all duration-300",
            oneHandedAlignClass,
          )}
        >
          {/* Progress Indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <span className="text-base font-bold tracking-wider text-primary uppercase">
              {t("wizard.stepIndicator", { title: stepTitles[step], step })}
            </span>
            {oneHandedMode !== "none" && (
              <Badge
                variant="outline"
                className="text-base font-semibold text-muted-foreground"
              >
                {oneHandedMode === "left"
                  ? t("wizard.leftHand")
                  : t("wizard.rightHand")}
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
                    {t("wizard.step1Title")}
                  </h1>
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
                          {MenuService.getLocalizedTitle(cat, language)}
                        </span>
                        <span className="text-base font-medium text-muted-foreground">
                          {t("wizard.itemsPrepared", { count: products.filter((p) => p.category === cat.id).length })}
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
                      speak(t("wizard.backToCategoryVoice"));
                    }}
                    className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={t("wizard.backToCategoryAria")}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">
                      {t("wizard.step2Title", { category: selectedCategory ? MenuService.getLocalizedTitle(selectedCategory, language) : "" })}
                    </h1>
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
                          {MenuService.getLocalizedTitle(prod, language)}
                        </span>
                        <span className="text-base font-extrabold text-foreground mt-0.5">
                          {formatKRW(prod.price)}
                        </span>
                        <span className="text-base font-medium text-muted-foreground mt-1 line-clamp-1">
                          {MenuService.getLocalizedDescription(prod, language)}
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
                      speak(t("wizard.backToMenuVoice"));
                    }}
                    className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={t("wizard.backToMenuAria")}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">
                      {MenuService.getLocalizedTitle(selectedProduct, language)}
                    </h1>
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
                    <h2 className="text-base font-bold text-foreground">
                      {MenuService.getLocalizedTitle(selectedProduct, language)}
                    </h2>
                    <span className="text-base font-extrabold text-primary">
                      {formatKRW(currentUnitPrice * quantity)}
                    </span>
                  </div>
                </div>

                {/* Unified Option Groups via OptionGroupList */}
                {selectedProduct.optionGroups && selectedProduct.optionGroups.length > 0 && (
                  <OptionGroupList
                    groups={selectedProduct.optionGroups}
                    selections={optionSelections}
                    onOptionToggle={(group, optionId) => {
                      const isSingle = group.selectionType === "single";
                      const current = optionSelections[group.id] || [];
                      const opt = group.options.find((o) => o.id === optionId);
                      const optTitle = opt ? MenuService.getLocalizedTitle(opt, language) : "";

                      if (isSingle) {
                        setOptionSelections((prev) => ({ ...prev, [group.id]: [optionId] }));
                        if (opt) {
                          speak(t("wizard.optionSelectedVoice", { option: optTitle }));
                        }
                        return;
                      }

                      if (current.includes(optionId)) {
                        setOptionSelections((prev) => ({
                          ...prev,
                          [group.id]: current.filter((id) => id !== optionId),
                        }));
                        if (opt) {
                          speak(t("productDetail.optionDeselectedVoice", { option: optTitle }));
                        }
                        return;
                      }

                      if (group.maxSelections && current.length >= group.maxSelections) {
                        const msg = t("productDetail.maxSelectionsToast", { count: group.maxSelections });
                        toast({
                          kind: "error",
                          messageKo: msg,
                          variant: "generic",
                          hapticsEnabled,
                        });
                        speak(msg);
                        return;
                      }

                      setOptionSelections((prev) => ({
                        ...prev,
                        [group.id]: [...current, optionId],
                      }));
                      if (opt) {
                        speak(t("wizard.optionSelectedVoice", { option: optTitle }));
                      }
                    }}
                  />
                )}

                {/* Tactile Quantity Stepper */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/70">
                  <span className="text-base font-bold text-foreground">
                    {t("wizard.orderQuantity")}
                  </span>
                  <QuantityStepper
                    value={quantity}
                    onIncrement={() => {
                      const next = Math.min(10, quantity + 1);
                      setQuantity(next);
                      speak(t("wizard.quantityVoice", { count: next }));
                    }}
                    onDecrement={() => {
                      const next = Math.max(1, quantity - 1);
                      setQuantity(next);
                      speak(t("wizard.quantityVoice", { count: next }));
                    }}
                    min={1}
                    max={10}
                    itemLabel={t("wizard.orderQuantity")}
                  />
                </div>

                {/* Bottom Step 3 Action Buttons */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <Button
                    size="cta-full"
                    onClick={handleProceedToCheckout}
                    className="h-14 text-base font-black bg-primary text-white hover:bg-primary/90 rounded-2xl shadow-sm cursor-pointer"
                  >
                    {t("wizard.directPayButton", { price: formatKRW(currentUnitPrice * quantity) })}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddMoreItems}
                    className="h-13 text-base font-bold rounded-2xl border-2 border-border/80 hover:bg-muted/60 cursor-pointer"
                  >
                    {t("wizard.addMoreButton")}
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
                      if (lastDirectCheckoutItemIdRef.current) {
                        useCartStore.getState().removeItem(lastDirectCheckoutItemIdRef.current);
                        lastDirectCheckoutItemIdRef.current = null;
                      }
                      setStep(3);
                      speak(t("wizard.backToOptionVoice"));
                    }}
                    className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={tCommon("back")}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">
                      {t("wizard.step4Title")}
                    </h1>
                  </div>
                </div>

                {/* Store and Table Details */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between text-base">
                  <span className="font-bold text-foreground">
                    {storeInfo?.storeName || t("wizard.defaultStore")}
                  </span>
                  <Badge variant="outline" className="font-bold text-base">
                    {storeInfo?.orderType === "dine-in"
                      ? tCommon("tableNumber", { table: storeInfo.table })
                      : t("wizard.takeoutOrder")}
                  </Badge>
                </div>

                {/* Item List Summary */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-base font-bold text-foreground">
                    {t("wizard.orderedMenuList")}
                  </span>
                  <div className="flex flex-col gap-2 rounded-2xl bg-card border border-border/70 p-4 divide-y divide-border/40">
                    {items.map((it) => (
                      <div
                        key={it.id}
                        className="pt-2 first:pt-0 flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-foreground">
                            {getCartItemDisplayName(it)}
                          </span>
                          {it.optionsSummary && (
                            <span className="text-base text-muted-foreground">
                              {it.optionsSummary}
                            </span>
                          )}
                          <span className="text-base font-semibold text-muted-foreground mt-0.5">
                            {t("wizard.itemQuantity", { quantity: it.quantity })}
                          </span>
                        </div>
                        <span className="text-base font-extrabold text-foreground tabular-nums">
                          {formatKRW(it.unitPrice * it.quantity)}
                        </span>
                      </div>
                    ))}

                    <div className="pt-3 flex items-center justify-between">
                      <span className="text-base font-black text-foreground">
                        {t("receipt.totalAmount")}
                      </span>
                      <span className="text-xl font-black text-primary tabular-nums">
                        {formatKRW(cartTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-base font-bold text-foreground">
                    {t("checkout.paymentMethod")}
                  </span>
                  <div
                    role="radiogroup"
                    aria-label={t("checkout.paymentMethod")}
                    className="grid grid-cols-2 gap-2"
                  >
                    {[
                      {
                        id: "card",
                        label: t("wizard.creditCard"),
                        icon: CreditCard,
                      },
                      { id: "easy-pay", label: t("wizard.tossPay"), icon: Smartphone },
                    ].map((method) => {
                      const isSelected = selectedPaymentMethod === method.id;
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => {
                            setSelectedPaymentMethod(method.id);
                            speak(t("wizard.payMethodSelectedVoice", { method: method.label }));
                          }}
                          className={cn(
                            "flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all font-bold text-base cursor-pointer",
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
                      <span>{t("wizard.paymentProcessing")}</span>
                    </div>
                  ) : (
                    <span>{t("wizard.payTotalButton", { total: formatKRW(cartTotal) })}</span>
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
