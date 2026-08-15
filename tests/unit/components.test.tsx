import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ProductCard } from "@/components/flow/ProductCard";
import type { Product } from "@/lib/types";

describe("Component Accessibility & Rendering", () => {
  const sampleProduct: Product = {
    id: "prod-americano",
    category: "coffee",
    nameKo: "아메리카노",
    descriptionKo: "깊고 풍부한 바디감의 에스프레소에 물을 더한 클래식 커피",
    voiceDescriptionKo: "아메리카노, 4500원, 깊고 풍부한 바디감의 클래식 커피",
    price: 4500,
    available: true,
    optionGroups: [
      {
        id: "temp",
        labelKo: "온도",
        required: true,
        selectionType: "single",
        options: [
          { id: "hot", labelKo: "따뜻하게 (HOT)", priceDelta: 0 },
          { id: "ice", labelKo: "시원하게 (ICE)", priceDelta: 500 },
        ],
      },
    ],
  };

  it("renders ProductCard with rich voiceDescription accessible label", () => {
    render(<ProductCard product={sampleProduct} onClick={() => {}} />);
    const cardButton = screen.getByRole("button", {
      name: sampleProduct.voiceDescriptionKo,
    });
    expect(cardButton).toBeInTheDocument();
    expect(screen.getByText("아메리카노")).toBeInTheDocument();
    expect(screen.getByText("4,500원")).toBeInTheDocument();
  });

  it("ensures ProductCard has no accessibility violations with axe", async () => {
    const { container } = render(
      <ProductCard product={sampleProduct} onClick={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders sold-out state when product is unavailable", () => {
    const soldOutProduct = { ...sampleProduct, available: false };
    render(<ProductCard product={soldOutProduct} onClick={() => {}} />);
    const cardButton = screen.getByRole("button");
    expect(cardButton).toBeDisabled();
    expect(screen.getByText("품절")).toBeInTheDocument();
  });
});
