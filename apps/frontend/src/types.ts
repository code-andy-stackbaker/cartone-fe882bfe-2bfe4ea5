export interface Product {
  id: string;
  name: string;
  description: string;
  priceMinor: number;
  currency: "USD";
  imageUrl: string;
}

export interface CartLine {
  productId: string;
  name: string;
  unitPriceMinor: number;
  quantity: number;
}

export interface CheckoutRequest {
  customer: { fullName: string; email: string; address: string };
  card: { number: string; expiry: string; cvc: string };
  lines: { productId: string; quantity: number }[];
}

export interface CheckoutSuccess {
  orderReference: string;
  totalPaidMinor: number;
  currency: "USD";
  status: "confirmed";
}

export function formatMoney(minor: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    minor / 100
  );
}
