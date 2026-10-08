"use client";

import * as React from "react";
import { AnimatePresence } from "motion/react";
import { Volume2, VolumeX, ArrowLeft } from "lucide-react";
import type { MenuCategory, Product, StoreInfo, CartItem, ProductOptionGroup } from "@/lib/types";
import { formatKRW, getCartTotals } from "@/lib/format";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { OrderService, MenuService } from "@/lib/services";
import { toast } from "@/lib/services/A11yFeedbackService";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import {
  WizardCategoryStep,
  WizardProductStep,
  WizardOptionStep,
  WizardCheckoutStep,
} from "./wizard";

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
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  // Option selections: groupId -> string[]
  const [optionSelections, setOptionSelections] = React.useState<Record<string, string[]>>({});
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

  // Active step: if on step 3 but selectedProduct is missing, safely display step 1
  const activeStep: 1 | 2 | 3 | 4 = step === 3 && !selectedProduct ? 1 : step;

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

    const selections = Object.entries(optionSelections).map(([groupId, optionIds]) => ({
      groupId,
      optionIds,
    }));

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

  // Option toggle handler for OptionGroupList
  const handleOptionToggle = (group: ProductOptionGroup, optionId: string) => {
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
      {/* ── Top Bar: Audio Controls & Exit ── */}
      <div className="sticky top-0 z-30 bg-background border-b border-border/40 px-4 py-3">
        <div className="max-w-[840px] mx-auto flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onExitWizard}
              className="inline-flex items-center gap-1.5 text-base font-bold text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-lg cursor-pointer"
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
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-base font-bold transition-all border cursor-pointer",
                voiceGuideEnabled
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted/50 text-muted-foreground border-border/60 hover:text-foreground",
              )}
              aria-label={t("wizard.voiceToggleAria", {
                action: voiceGuideEnabled
                  ? t("wizard.voiceTurnOff")
                  : t("wizard.voiceTurnOn"),
              })}
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
              {t("wizard.stepIndicator", {
                title: stepTitles[activeStep],
                step: activeStep,
              })}
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
            {activeStep === 1 && (
              <WizardCategoryStep
                categories={categories}
                products={products}
                onSelectCategory={handleSelectCategory}
                isMotionDisabled={isMotionDisabled}
              />
            )}

            {activeStep === 2 && (
              <WizardProductStep
                selectedCategory={selectedCategory}
                products={filteredProducts}
                onSelectProduct={handleSelectProduct}
                onBack={() => {
                  setStep(1);
                  speak(t("wizard.backToCategoryVoice"));
                }}
                isMotionDisabled={isMotionDisabled}
              />
            )}

            {activeStep === 3 && selectedProduct && (
              <WizardOptionStep
                product={selectedProduct}
                currentUnitPrice={currentUnitPrice}
                quantity={quantity}
                optionSelections={optionSelections}
                onOptionToggle={handleOptionToggle}
                onQuantityChange={(qty) => {
                  setQuantity(qty);
                  speak(t("wizard.quantityVoice", { count: qty }));
                }}
                onProceedToCheckout={handleProceedToCheckout}
                onAddMoreItems={handleAddMoreItems}
                onBack={() => {
                  setStep(2);
                  speak(t("wizard.backToMenuVoice"));
                }}
                isMotionDisabled={isMotionDisabled}
              />
            )}

            {activeStep === 4 && (
              <WizardCheckoutStep
                storeInfo={storeInfo}
                items={items}
                cartTotal={cartTotal}
                selectedPaymentMethod={selectedPaymentMethod}
                onSelectPaymentMethod={(method) => {
                  setSelectedPaymentMethod(method);
                  speak(
                    t("wizard.payMethodSelectedVoice", {
                      method:
                        method === "card"
                          ? t("wizard.creditCard")
                          : t("wizard.tossPay"),
                    }),
                  );
                }}
                onFinalPayment={handleFinalPayment}
                onBack={() => {
                  if (lastDirectCheckoutItemIdRef.current) {
                    useCartStore
                      .getState()
                      .removeItem(lastDirectCheckoutItemIdRef.current);
                    lastDirectCheckoutItemIdRef.current = null;
                  }
                  setStep(3);
                  speak(t("wizard.backToOptionVoice"));
                }}
                isSubmitting={isSubmitting}
                isMotionDisabled={isMotionDisabled}
                reducedMotion={reducedMotion}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
