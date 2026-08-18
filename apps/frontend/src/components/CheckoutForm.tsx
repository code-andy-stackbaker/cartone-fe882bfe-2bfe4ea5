import { useState, type FormEvent } from "react";
import { ApiFieldError, submitCheckout } from "../api/client";
import { useCart } from "../cart/CartProvider";
import { CheckoutSuccess, formatMoney } from "../types";

interface Props {
  onConfirmed: (result: CheckoutSuccess) => void;
  onCancel: () => void;
}

const initialForm = {
  fullName: "",
  email: "",
  address: "",
  number: "",
  expiry: "",
  cvc: ""
};

function validate(form: typeof initialForm): Record<string, string> {
  const errors: Record<string, string> = {};
  if (form.fullName.trim().length < 2) errors["customer.fullName"] = "Enter your full name";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()))
    errors["customer.email"] = "Enter a valid email address";
  if (form.address.trim().length < 5) errors["customer.address"] = "Enter a delivery address";
  if (!/^[0-9 ]{12,23}$/.test(form.number.trim()))
    errors["card.number"] = "Enter a card number of 12-19 digits";
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry.trim())) errors["card.expiry"] = "Use MM/YY";
  if (!/^\d{3,4}$/.test(form.cvc.trim())) errors["card.cvc"] = "Enter a 3 or 4 digit CVC";
  return errors;
}

export function CheckoutForm({ onConfirmed, onCancel }: Props) {
  const { lines, totalMinor } = useCart();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof initialForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const result = await submitCheckout({
        customer: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          address: form.address.trim()
        },
        card: {
          number: form.number.trim(),
          expiry: form.expiry.trim(),
          cvc: form.cvc.trim()
        },
        lines: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity
        }))
      });
      onConfirmed(result);
    } catch (error) {
      if (error instanceof ApiFieldError) {
        setErrors(error.fieldErrors);
      } else {
        setErrors({ form: "Something went wrong — please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const field = (
    key: keyof typeof initialForm,
    errorKey: string,
    label: string,
    placeholder: string
  ) => (
    <label>
      <span>{label}</span>
      <input
        name={key}
        value={form[key]}
        placeholder={placeholder}
        onChange={(event) => update(key, event.target.value)}
      />
      {errors[errorKey] ? (
        <em className="field-error" role="alert">
          {errors[errorKey]}
        </em>
      ) : null}
    </label>
  );

  return (
    <section className="checkout" aria-label="Checkout">
      <h2>Checkout</h2>
      <p className="total">
        Amount due <strong>{formatMoney(totalMinor)}</strong>
      </p>
      <form onSubmit={handleSubmit} noValidate>
        {field("fullName", "customer.fullName", "Full name", "Ada Lovelace")}
        {field("email", "customer.email", "Email", "ada@example.com")}
        {field("address", "customer.address", "Delivery address", "12 Analytical Way")}
        {field("number", "card.number", "Card number", "4242 4242 4242 4242")}
        {field("expiry", "card.expiry", "Expiry (MM/YY)", "12/30")}
        {field("cvc", "card.cvc", "CVC", "123")}

        {errors.form ? (
          <em className="field-error" role="alert">
            {errors.form}
          </em>
        ) : null}

        <div className="card-actions">
          <button type="button" onClick={onCancel}>
            Back to shop
          </button>
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? "Placing order…" : "Pay now"}
          </button>
        </div>
      </form>
    </section>
  );
}
