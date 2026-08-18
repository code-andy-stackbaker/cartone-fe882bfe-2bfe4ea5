import { MockPaymentProvider } from "./mock";
import { PaymentProvider } from "./port";
import { StripePaymentProvider } from "./stripe";

export * from "./port";

/** Keys required before the real provider is used. */
export const REQUIRED_ENV = ["STRIPE_SECRET_KEY"] as const;

/**
 * The ONLY place the mock/real decision is made. Callers import just this.
 * Zero-config default: no env vars set => deterministic MockPaymentProvider.
 */
export function getPaymentProvider(): PaymentProvider {
  const configured = (process.env.PAYMENTS_PROVIDER ?? "mock").toLowerCase();
  const hasKeys = REQUIRED_ENV.every((key) => !!process.env[key]);

  if (configured === "stripe" && hasKeys) {
    return new StripePaymentProvider();
  }
  return new MockPaymentProvider();
}
