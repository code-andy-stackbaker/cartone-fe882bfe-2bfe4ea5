import { Product } from "../types";
import { SEED_PRODUCTS } from "./seed";

/**
 * Single data-access seam. Every caller goes through getProductRepository();
 * a real database implementation drops in behind this interface with no
 * changes to any route.
 */
export interface ProductRepository {
  list(): Promise<Product[]>;
  findById(id: string): Promise<Product | undefined>;
}

export class InMemoryProductRepository implements ProductRepository {
  private readonly products: Product[];

  constructor(products: Product[] = SEED_PRODUCTS) {
    // defensive copy so callers cannot mutate the seed
    this.products = products.map((p) => ({ ...p }));
  }

  async list(): Promise<Product[]> {
    return this.products.map((p) => ({ ...p }));
  }

  async findById(id: string): Promise<Product | undefined> {
    const found = this.products.find((p) => p.id === id);
    return found ? { ...found } : undefined;
  }
}

let repository: ProductRepository | null = null;

export function getProductRepository(): ProductRepository {
  if (!repository) {
    repository = new InMemoryProductRepository();
  }
  return repository;
}
