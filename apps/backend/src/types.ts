export interface Product {
  id: string;
  name: string;
  description: string;
  priceMinor: number;
  currency: "USD";
  imageUrl: string;
}

export interface OrderLine {
  productId: string;
  name: string;
  unitPriceMinor: number;
  quantity: number;
}

export interface Order {
  reference: string;
  lines: OrderLine[];
  totalMinor: number;
  currency: "USD";
  customerEmail: string;
  createdAt: string;
}
