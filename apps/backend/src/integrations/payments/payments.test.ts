import { describe, expect, it } from "vitest";
import { getPaymentProvider } from "./index";
import { MockPaymentProvider } from "./mock";
import { AuthorizeRequest, PaymentProvider } from "./port";
import { StripePaymentProvider } from "./stripe";

const request: AuthorizeRequest = {
  amountMinor: 2800,
  currency: "USD",
  card: { number: "4242424242424242", expiry: "12/30", cvc: "123" }
};

describe("payments seam", () => {
  it("defaults to the mock provider with no env configured", () => {
    expect(getPaymentProvider()).toBeInstanceOf(MockPaymentProvider);
  });

  it("mock and real adapters satisfy the same port", () => {
    const providers: PaymentProvider[] = [
      new MockPaymentProvider(),
      new StripePaymentProvider()
    ];
    for (const provider of providers) {
      expect(typeof provider.authorize).toBe("function");
      expect(typeof provider.name).toBe("string");
    }
  });

  it("authorizes deterministically and declines the 0000 test card", async () => {
    const provider = new MockPaymentProvider();

    const approved = await provider.authorize(request);
    expect(approved.authorized).toBe(true);

    const declined = await provider.authorize({
      ...request,
      card: { ...request.card, number: "4000000000000000" }
    });
    expect(declined.authorized).toBe(false);
    expect(declined.declineReason).toBeTruthy();
  });
});
