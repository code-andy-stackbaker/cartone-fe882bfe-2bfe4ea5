import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode
} from "react";
import { CartLine, Product } from "../types";

type Action =
  | { type: "add"; product: Product; quantity: number }
  | { type: "setQuantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

export function cartReducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case "add": {
      const existing = state.find((line) => line.productId === action.product.id);
      if (existing) {
        return state.map((line) =>
          line.productId === action.product.id
            ? { ...line, quantity: line.quantity + action.quantity }
            : line
        );
      }
      return [
        ...state,
        {
          productId: action.product.id,
          name: action.product.name,
          unitPriceMinor: action.product.priceMinor,
          quantity: action.quantity
        }
      ];
    }
    case "setQuantity": {
      if (action.quantity <= 0) {
        return state.filter((line) => line.productId !== action.productId);
      }
      return state.map((line) =>
        line.productId === action.productId
          ? { ...line, quantity: action.quantity }
          : line
      );
    }
    case "remove":
      return state.filter((line) => line.productId !== action.productId);
    case "clear":
      return [];
    default:
      return state;
  }
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  totalMinor: number;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, [] as CartLine[]);

  const value = useMemo<CartContextValue>(() => {
    return {
      lines,
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      totalMinor: lines.reduce(
        (sum, line) => sum + line.unitPriceMinor * line.quantity,
        0
      ),
      add: (product, quantity = 1) => dispatch({ type: "add", product, quantity }),
      setQuantity: (productId, quantity) =>
        dispatch({ type: "setQuantity", productId, quantity }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" })
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
}
