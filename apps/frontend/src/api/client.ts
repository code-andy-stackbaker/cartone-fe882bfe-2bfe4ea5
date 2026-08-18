import { CheckoutRequest, CheckoutSuccess, Product } from "../types";

/** The only place a backend URL appears. Baked in at build time by Vite. */
const BASE_URL = (
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

export class ApiFieldError extends Error {
  readonly fieldErrors: Record<string, string>;

  constructor(fieldErrors: Record<string, string>) {
    super("The order could not be placed");
    this.name = "ApiFieldError";
    this.fieldErrors = fieldErrors;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${BASE_URL}/api/products`);
  if (!response.ok) {
    throw new Error(`Could not load the catalogue (${response.status})`);
  }
  const payload = (await response.json()) as { products: Product[] };
  return payload.products ?? [];
}

export async function submitCheckout(
  request: CheckoutRequest
): Promise<CheckoutSuccess> {
  const response = await fetch(`${BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });

  const payload = (await response.json()) as Partial<CheckoutSuccess> & {
    fieldErrors?: Record<string, string>;
  };

  if (!response.ok) {
    throw new ApiFieldError(
      payload.fieldErrors ?? { form: "Payment could not be completed" }
    );
  }
  return payload as CheckoutSuccess;
}
