import { AuthorizeRequest, AuthorizeResult, PaymentProvider } from "./port";

/**
 * Default provider: deterministic, no network, no credentials.
 * Cards whose digits end in "0000" are declined so the decline path is
 * demonstrable without any real integration.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async authorize(request: AuthorizeRequest): Promise<AuthorizeResult> {
    const digits = request.card.number.replace(/\D/g, "");
    if (digits.endsWith("0000")) {
      return {
        authorized: false,
        providerReference: "mock_declined",
        provider: this.name,
        declineReason: "Card declined by issuer (mock)"
      };
    }
    const suffix = digits.slice(-4) || "0001";
    return {
      authorized: true,
      providerReference: `mock_auth_${request.amountMinor}_${suffix}`,
      provider: this.name
    };
  }
}
