import { Order } from "../types";

/**
 * In-memory order store behind a single accessor, mirroring the repository
 * seam so persistence can be swapped in later without touching routes.
 */
export interface OrderStore {
  save(order: Order): Promise<Order>;
  findByReference(reference: string): Promise<Order | undefined>;
}

export class InMemoryOrderStore implements OrderStore {
  private readonly orders = new Map<string, Order>();

  async save(order: Order): Promise<Order> {
    this.orders.set(order.reference, order);
    return order;
  }

  async findByReference(reference: string): Promise<Order | undefined> {
    return this.orders.get(reference);
  }
}

let store: OrderStore | null = null;

export function getOrderStore(): OrderStore {
  if (!store) {
    store = new InMemoryOrderStore();
  }
  return store;
}
