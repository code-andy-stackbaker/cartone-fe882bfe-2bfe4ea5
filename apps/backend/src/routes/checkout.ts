import { Router } from "express";
import { z } from "zod";
import { getOrderStore } from "../data/orderStore";
import { getProductRepository } from "../data/productRepository";
import { getPaymentProvider } from "../integrations/payments";
import { Order, OrderLine } from "../types";

const checkoutSchema = z.object({
  customer: z.object({
    fullName: z.string().trim().min(2, "Enter your full name"),
    email: z.string().trim().email("Enter a valid email address"),
    address: z.string().trim().min(5, "Enter a delivery address")
  }),
  card: z.object({
    number: z
      .string()
      .trim()
      .regex(/^[0-9 ]{12,23}$/, "Enter a card number of 12-19 digits"),
    expiry: z
      .string()
      .trim()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY"),
    cvc: z
      .string()
      .trim()
      .regex(/^\d{3,4}$/, "Enter a 3 or 4 digit CVC")
  }),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1, "Quantity must be at least 1")
      })
    )
    .min(1, "Your cart is empty")
});

function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "form";
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

function generateReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `CART-${suffix}`;
}

export function createCheckoutRouter(): Router {
  const router = Router();

  router.post("/checkout", async (req, res) => {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ fieldErrors: toFieldErrors(parsed.error) });
      return;
    }

    const { customer, card, lines } = parsed.data;
    const repository = getProductRepository();

    const orderLines: OrderLine[] = [];
    for (const line of lines) {
      const product = await repository.findById(line.productId);
      if (!product) {
        res.status(400).json({
          fieldErrors: { lines: `Unknown product: ${line.productId}` }
        });
        return;
      }
      orderLines.push({
        productId: product.id,
        name: product.name,
        unitPriceMinor: product.priceMinor,
        quantity: line.quantity
      });
    }

    // Server-side truth: the total is recomputed from seed prices.
    const totalMinor = orderLines.reduce(
      (sum, line) => sum + line.unitPriceMinor * line.quantity,
      0
    );

    const authorization = await getPaymentProvider().authorize({
      amountMinor: totalMinor,
      currency: "USD",
      card,
      description: `CartOne order for ${customer.email}`
    });

    if (!authorization.authorized) {
      res.status(402).json({
        fieldErrors: {
          "card.number": authorization.declineReason ?? "Payment was declined"
        }
      });
      return;
    }

    const order: Order = {
      reference: generateReference(),
      lines: orderLines,
      totalMinor,
      currency: "USD",
      customerEmail: customer.email,
      createdAt: new Date().toISOString()
    };
    await getOrderStore().save(order);

    res.status(201).json({
      orderReference: order.reference,
      totalPaidMinor: order.totalMinor,
      currency: order.currency,
      status: "confirmed"
    });
  });

  return router;
}
