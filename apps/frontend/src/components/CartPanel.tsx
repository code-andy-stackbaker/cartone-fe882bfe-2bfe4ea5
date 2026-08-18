import { useCart } from "../cart/CartProvider";
import { formatMoney } from "../types";

export function CartPanel({ onCheckout }: { onCheckout: () => void }) {
  const { lines, totalMinor, itemCount, setQuantity, remove } = useCart();

  return (
    <aside className="cart" aria-label="Your cart">
      <h2>Your cart ({itemCount})</h2>

      {lines.length === 0 ? (
        <p className="empty">Your cart is empty — add something you like.</p>
      ) : (
        <ul className="cart-lines">
          {lines.map((line) => (
            <li key={line.productId}>
              <div className="cart-line-title">
                <span>{line.name}</span>
                <span>{formatMoney(line.unitPriceMinor * line.quantity)}</span>
              </div>
              <div className="stepper">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${line.name}`}
                  onClick={() => setQuantity(line.productId, line.quantity - 1)}
                >
                  −
                </button>
                <span aria-label={`Quantity of ${line.name}`}>{line.quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${line.name}`}
                  onClick={() => setQuantity(line.productId, line.quantity + 1)}
                >
                  +
                </button>
                <button
                  type="button"
                  className="link"
                  onClick={() => remove(line.productId)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="total">
        Total <strong>{formatMoney(totalMinor)}</strong>
      </p>
      <button
        type="button"
        className="primary block"
        disabled={lines.length === 0}
        onClick={onCheckout}
      >
        Checkout
      </button>
    </aside>
  );
}
