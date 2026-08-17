import { describe, expect, it, beforeEach } from "vitest";
import { useToastStore } from "@/store/useToastStore";
import type { ToastItem } from "@/lib/types";

describe("useToastStore", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  const sampleToast: ToastItem = {
    id: "toast-1",
    messageKo: "장바구니에 담겼습니다.",
    kind: "success",
    variant: "cart",
  };

  it("starts with an empty toast list", () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it("pushes a toast onto the list", () => {
    useToastStore.getState().pushToast(sampleToast);

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0]).toEqual(sampleToast);
  });

  it("appends multiple toasts in order", () => {
    useToastStore.getState().pushToast(sampleToast);
    useToastStore.getState().pushToast({
      id: "toast-2",
      messageKo: "직원을 호출했어요.",
      kind: "success",
      variant: "staff-call",
    });

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(2);
    expect(state.toasts.map((t) => t.id)).toEqual(["toast-1", "toast-2"]);
  });

  it("dismisses a toast by id", () => {
    useToastStore.getState().pushToast(sampleToast);
    useToastStore.getState().dismissToast("toast-1");

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("dismissing an unknown id is a no-op", () => {
    useToastStore.getState().pushToast(sampleToast);
    useToastStore.getState().dismissToast("does-not-exist");

    expect(useToastStore.getState().toasts).toHaveLength(1);
  });

  it("preserves an onUndo callback through push and dismiss", () => {
    let undone = false;
    useToastStore.getState().pushToast({
      id: "toast-undo",
      messageKo: "장바구니에서 삭제되었습니다.",
      kind: "success",
      variant: "delete",
      onUndo: () => {
        undone = true;
      },
    });

    const toast = useToastStore.getState().toasts.at(-1);
    expect(toast?.onUndo).toBeDefined();
    toast?.onUndo?.();
    expect(undone).toBe(true);

    useToastStore.getState().dismissToast("toast-undo");
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
