import { useEffect, useState } from "react";
import { fetchProducts } from "./api/client";
import { useCart } from "./cart/CartProvider";
import { CartPanel } from "./components/CartPanel";
import { CatalogueGrid } from "./components/CatalogueGrid";
import { CheckoutForm } from "./components/CheckoutForm";
import { OrderConfirmation } from "./components/OrderConfirmation";
import { ProductDetailOverlay } from "./components/ProductDetailOverlay";
import { CheckoutSuccess, Product } from "./types";

type View = "shop" | "checkout" | "confirmed";

export default function App() {
  const { clear } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [view, setView] = useState<View>("shop");
  const [order, setOrder] = useState<CheckoutSuccess | null>(null);

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((loaded) => {
        if (active) setProducts(loaded);
      })
      .catch(() => {
        if (active) setLoadError("The catalogue is unavailable right now.");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page">
      <header className="masthead">
        <h1>CartOne</h1>
        <p>A tiny storefront running on seeded demo data.</p>
      </header>

      <main className="layout">
        {view === "confirmed" && order ? (
          <OrderConfirmation
            result={order}
            onNewOrder={() => {
              setOrder(null);
              setView("shop");
            }}
          />
        ) : (
          <>
            {view === "checkout" ? (
              <CheckoutForm
                onCancel={() => setView("shop")}
                onConfirmed={(result) => {
                  setOrder(result);
                  clear();
                  setView("confirmed");
                }}
              />
            ) : (
              <>
                {loadError ? <p className="error">{loadError}</p> : null}
                <CatalogueGrid products={products} onSelect={setSelected} />
              </>
            )}
            <CartPanel onCheckout={() => setView("checkout")} />
          </>
        )}
      </main>

      {selected ? (
        <ProductDetailOverlay product={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
