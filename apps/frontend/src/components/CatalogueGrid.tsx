import { useCart } from "../cart/CartProvider";
import { formatMoney, Product } from "../types";

interface Props {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function CatalogueGrid({ products, onSelect }: Props) {
  const { add } = useCart();

  return (
    <section aria-label="Catalogue" className="catalogue">
      <h2>Shop everything</h2>
      <ul className="grid">
        {products.map((product) => (
          <li key={product.id} className="card">
            <button
              type="button"
              className="card-media"
              onClick={() => onSelect(product)}
              aria-label={`View details for ${product.name}`}
            >
              <img src={product.imageUrl} alt="" loading="lazy" width={400} height={300} />
            </button>
            <h3>{product.name}</h3>
            <p className="price">{formatMoney(product.priceMinor, product.currency)}</p>
            <div className="card-actions">
              <button type="button" onClick={() => onSelect(product)}>
                Details
              </button>
              <button type="button" className="primary" onClick={() => add(product, 1)}>
                Add to cart
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
