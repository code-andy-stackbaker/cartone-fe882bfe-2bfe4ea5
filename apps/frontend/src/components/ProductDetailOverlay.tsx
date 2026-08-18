import { useCart } from "../cart/CartProvider";
import { formatMoney, Product } from "../types";

interface Props {
  product: Product;
  onClose: () => void;
}

export function ProductDetailOverlay({ product, onClose }: Props) {
  const { add } = useCart();

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div
        className="overlay"
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="close" onClick={onClose} aria-label="Close details">
          ×
        </button>
        <img src={product.imageUrl} alt="" width={400} height={300} />
        <h2>{product.name}</h2>
        <p className="price">{formatMoney(product.priceMinor, product.currency)}</p>
        <p>{product.description}</p>
        <button
          type="button"
          className="primary"
          onClick={() => {
            add(product, 1);
            onClose();
          }}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
