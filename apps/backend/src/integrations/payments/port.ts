/** Domain-typed payment capability — never the vendor's raw shape. */

export interface CardDetails {
  number: string;
  expiry: string;
  cvc: string;
}

export interface AuthorizeRequest {
  amountMinor: number;
  currency: "USD";
  card: CardDetails;
  description?: string;
}

export interface AuthorizeResult {
  authorized: boolean;
  providerReference: string;
  provider: string;
  declineReason?: string;
}

export interface PaymentProvider {
  readonly name: string;
  authorize(request: AuthorizeRequest): Promise<AuthorizeResult>;
}
