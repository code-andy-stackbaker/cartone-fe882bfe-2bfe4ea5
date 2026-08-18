import { describe, expect, it } from "vitest";
import { cartReducer } from "./CartProvider";
import { CartLine, Product } from "../types";

const product: Product = {
  id: "mug-01",
  name: "Enamel Camp Mug",
  description: "A mug",
  priceMinor: 1400,
  currency: "USD",
  imageUrl: "https://example.test/mug.jpg"
};

describe("cartReducer", () => {
  it("adds a product and merges repeat adds into one line", () => {
    const once = cartReducer([], { type: "add", product, quantity: 1 });
    const twice = cartReducer(once, { type: "add", product, quantity: 2 });

    expect(twice).toHaveLength(1);
    expect(twice[0].quantity).toBe(3);
  });

  it("removes the line when quantity drops to zero", () => {
    const lines: CartLine[] = [
      { productId: product.id, name: product.name, unitPriceMinor: 1400, quantity: 1 }
    ];

    expect(cartReducer(lines, { type: "setQuantity", productId: product.id, quantity: 0 }))
      .toHaveLength(0);
    expect(cartReducer(lines, { type: "remove", productId: product.id })).toHaveLength(0);
  });
});
