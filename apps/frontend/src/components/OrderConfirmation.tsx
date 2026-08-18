import { CheckoutSuccess, formatMoney } from "../types";

interface Props {
  result: CheckoutSuccess;
  onNewOrder: () => void;
}

export function OrderConfirmation({ result, onNewOrder }: Props) {
  return (
    <section className="confirmation" aria-label="Order confirmation">
      <h2>Thank you — your order is confirmed</h2>
      <p>
        Order reference <strong>{result.orderReference}</strong>
      </p>
      <p>
        Total paid{" "}
        <strong>{formatMoney(result.totalPaidMinor, result.currency)}</strong>
      </p>
      <button type="button" className="primary" onClick={onNewOrder}>
        Start a new order
      </button>
    </section>
  );
}
