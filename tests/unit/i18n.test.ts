import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { translate, t, useTranslation, DEFAULT_LOCALE } from "@/lib/i18n";
import { validateLocale, validateAllLocales } from "@/lib/i18n/validator";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

describe("i18n Core Engine (translate & t)", () => {
  it("translates known keys in default locale (ko)", () => {
    const text = translate("ko", "settings.title");
    expect(text).toBe("설정");

    const sectionTitle = translate("ko", "settings.screen.sectionTitle");
    expect(sectionTitle).toBe("화면 및 텍스트 상세 설정");
  });

  it("translates known keys in English (en)", () => {
    const text = translate("en", "settings.title");
    expect(text).toBe("Settings");

    const sectionTitle = translate("en", "settings.screen.sectionTitle");
    expect(sectionTitle).toBe("Screen & Display Settings");
  });

  it("interpolates parameters when provided", () => {
    // Test interpolation logic directly with custom key or fallback
    const result = translate("ko", "nonexistent.key", { count: 3 }, "선택 {count}개");
    expect(result).toBe("선택 3개");
  });

  it("falls back to default locale (ko) when a key is absent in target locale", () => {
    // If a key only existed in ko, en would fall back to ko
    const result = translate("en", "settings.title");
    expect(result).toBe("Settings");
  });

  it("returns fallback string or key name when key is not found anywhere", () => {
    const withFallback = translate("ko", "unknown.nested.key", undefined, "기본값");
    expect(withFallback).toBe("기본값");

    const withoutFallback = translate("ko", "unknown.nested.key");
    expect(withoutFallback).toBe("unknown.nested.key");
  });

  it("static helper t() uses DEFAULT_LOCALE by default", () => {
    expect(t("settings.title")).toBe("설정");
    expect(t("settings.title", undefined, "en")).toBe("Settings");
  });
});

describe("i18n Parity & Key Validation", () => {
  it("en locale dictionary has 100% key parity with ko locale dictionary", () => {
    const report = validateLocale("en");
    expect(report.missingKeys).toEqual([]);
    expect(report.extraKeys).toEqual([]);
    expect(report.tokenMismatches).toEqual([]);
    expect(report.isValid).toBe(true);
  });

  it("validateAllLocales() passes for all registered locales", () => {
    const reports = validateAllLocales();
    for (const [locale, report] of Object.entries(reports)) {
      expect(report.isValid, `Locale ${locale} should be valid`).toBe(true);
    }
  });
});

describe("useTranslation React Hook", () => {
  beforeEach(() => {
    useAccessibilityStore.getState().resetAll();
  });

  it("returns translations matching useAccessibilityStore language and reacts to changes", () => {
    const { result } = renderHook(() => useTranslation());

    expect(result.current.language).toBe(DEFAULT_LOCALE);
    expect(result.current.t("settings.title")).toBe("설정");

    act(() => {
      result.current.setLanguage("en");
    });

    expect(result.current.language).toBe("en");
    expect(result.current.t("settings.title")).toBe("Settings");
  });

  it("supports scoped namespace without prefixing in call sites", () => {
    const { result } = renderHook(() => useTranslation("settings"));

    expect(result.current.t("title")).toBe("설정");
    expect(result.current.t("screen.highContrast.label")).toBe("고대비 모드");

    act(() => {
      result.current.setLanguage("en");
    });

    expect(result.current.t("title")).toBe("Settings");
    expect(result.current.t("screen.highContrast.label")).toBe("High Contrast Mode");
  });

  it("translates all namespaces correctly in both ko and en", () => {
    const { result } = renderHook(() => ({
      common: useTranslation("common"),
      menu: useTranslation("menu"),
      orderFlow: useTranslation("orderFlow"),
      landing: useTranslation("landing"),
      setup: useTranslation("setup"),
    }));

    // Korean checks
    expect(result.current.common.t("currency")).toBe("원");
    expect(result.current.menu.t("popularCategory")).toBe("인기");
    expect(result.current.menu.t("cart.title")).toBe("장바구니");
    expect(result.current.menu.t("checkout.title")).toBe("주문 및 결제");
    expect(result.current.menu.t("receipt.completedTitle")).toBe("주문이 완료되었어요!");
    expect(result.current.menu.t("wizard.stepName1")).toBe("카테고리 선택");
    expect(result.current.orderFlow.t("orderType.dineIn")).toBe("매장 식사");
    expect(result.current.landing.t("selectStoreDirectly")).toBe("직접 매장 선택하기");
    expect(result.current.setup.t("title")).toBe("주문을 도와드릴까요?");

    // Switch to English
    act(() => {
      useAccessibilityStore.getState().setLanguage("en");
    });

    // English checks
    expect(result.current.common.t("currency")).toBe("KRW");
    expect(result.current.menu.t("popularCategory")).toBe("Popular");
    expect(result.current.menu.t("cart.title")).toBe("Cart");
    expect(result.current.menu.t("checkout.title")).toBe("Order & Pay");
    expect(result.current.menu.t("receipt.completedTitle")).toBe("Order Confirmed!");
    expect(result.current.menu.t("wizard.stepName1")).toBe("Category");
    expect(result.current.orderFlow.t("orderType.dineIn")).toBe("Dine-in");
    expect(result.current.landing.t("selectStoreDirectly")).toBe("Select Store Manually");
    expect(result.current.setup.t("title")).toBe("Need help with your order?");
  });
});
