import { AuthorizeRequest, AuthorizeResult, PaymentProvider } from "./port";

/**
 * The ONLY file that talks to Stripe. It reads its credentials from the
 * environment and maps Stripe's shape to/from the domain types in port.ts.
 * Selected by the factory in index.ts when STRIPE_SECRET_KEY is present.
 */
export class StripePaymentProvider implements PaymentProvider {
  readonly name = "stripe";

  private readonly secretKey: string;
  private readonly apiBase: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY ?? "";
    this.apiBase = process.env.STRIPE_API_BASE ?? "https://api.stripe.com";
  }

  async authorize(request: AuthorizeRequest): Promise<AuthorizeResult> {
    const body = new URLSearchParams({
      amount: String(request.amountMinor),
      currency: request.currency.toLowerCase(),
      confirm: "true",
      "automatic_payment_methods[enabled]": "true",
      "automatic_payment_methods[allow_redirects]": "never",
      description: request.description ?? "CartOne order"
    });

    const response = await fetch(`${this.apiBase}/v1/payment_intents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    const payload = (await response.json()) as {
      id?: string;
      status?: string;
      error?: { message?: string };
    };

    if (!response.ok || !payload.id) {
      return {
        authorized: false,
        providerReference: "stripe_error",
        provider: this.name,
        declineReason: payload.error?.message ?? `Stripe returned ${response.status}`
      };
    }

    const authorized =
      payload.status === "succeeded" ||
      payload.status === "requires_capture" ||
      payload.status === "processing";

    return {
      authorized,
      providerReference: payload.id,
      provider: this.name,
      declineReason: authorized ? undefined : `Payment intent status: ${payload.status}`
    };
  }
}
