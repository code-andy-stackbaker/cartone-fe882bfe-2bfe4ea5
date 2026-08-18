import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { CartProvider } from "./cart/CartProvider";

const products = [
  {
    id: "mug-01",
    name: "Enamel Camp Mug",
    description: "A speckled enamel mug.",
    priceMinor: 1400,
    currency: "USD",
    imageUrl: "https://example.test/mug.jpg"
  },
  {
    id: "tee-02",
    name: "Heavyweight Cotton Tee",
    description: "A plain cotton tee.",
    priceMinor: 2800,
    currency: "USD",
    imageUrl: "https://example.test/tee.jpg"
  }
];

/** Hermetic: the network seam is mocked, nothing is fetched for real. */
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ products })
    }))
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderApp() {
  return render(
    <CartProvider>
      <App />
    </CartProvider>
  );
}

describe("CartOne storefront", () => {
  it("renders the catalogue returned by the API", async () => {
    renderApp();

    expect(await screen.findByText("Enamel Camp Mug")).toBeTruthy();
    expect(screen.getByText("Heavyweight Cotton Tee")).toBeTruthy();
    expect(screen.getByText("$14.00")).toBeTruthy();
  });

  it("starts with an empty cart and a disabled checkout button", async () => {
    renderApp();
    await screen.findByText("Enamel Camp Mug");

    expect(screen.getByText(/your cart is empty/i)).toBeTruthy();
    const checkout = screen.getByRole("button", { name: "Checkout" }) as HTMLButtonElement;
    expect(checkout.disabled).toBe(true);
  });

  it("adds a product to the cart and enables checkout", async () => {
    renderApp();
    await screen.findByText("Enamel Camp Mug");

    fireEvent.click(screen.getAllByRole("button", { name: "Add to cart" })[0]);

    await waitFor(() => {
      expect(screen.getByLabelText("Quantity of Enamel Camp Mug").textContent).toBe("1");
    });
    const checkout = screen.getByRole("button", { name: "Checkout" }) as HTMLButtonElement;
    expect(checkout.disabled).toBe(false);
  });

  it("opens the product detail overlay without losing the cart", async () => {
    renderApp();
    await screen.findByText("Enamel Camp Mug");

    fireEvent.click(screen.getAllByRole("button", { name: "Add to cart" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Details" })[1]);

    const dialog = await screen.findByRole("dialog");
    expect(dialog.textContent).toContain("A plain cotton tee.");
    expect(screen.getByLabelText("Quantity of Enamel Camp Mug")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close details" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
