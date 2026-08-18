import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

const validPayload = {
  customer: {
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    address: "12 Analytical Way, London"
  },
  card: { number: "4242 4242 4242 4242", expiry: "12/30", cvc: "123" },
  lines: [{ productId: "mug-01", quantity: 2 }]
};

describe("CartOne API", () => {
  it("serves the seeded catalogue", async () => {
    const response = await request(createApp()).get("/api/products");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.products)).toBe(true);
    expect(response.body.products.length).toBeGreaterThan(0);
    expect(response.body.products[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      priceMinor: expect.any(Number),
      currency: "USD"
    });
  });

  it("404s an unknown product", async () => {
    const response = await request(createApp()).get("/api/products/does-not-exist");
    expect(response.status).toBe(404);
  });

  it("rejects an invalid checkout with inline field errors", async () => {
    const response = await request(createApp())
      .post("/api/checkout")
      .send({ ...validPayload, customer: { ...validPayload.customer, email: "nope" } });

    expect(response.status).toBe(400);
    expect(response.body.fieldErrors["customer.email"]).toBeTruthy();
  });

  it("confirms a valid checkout with a server-computed total", async () => {
    const app = createApp();
    const catalogue = await request(app).get("/api/products");
    const mug = catalogue.body.products.find((p: { id: string }) => p.id === "mug-01");

    const response = await request(app).post("/api/checkout").send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("confirmed");
    expect(response.body.orderReference).toMatch(/^CART-[A-Z0-9]{6}$/);
    expect(response.body.totalPaidMinor).toBe(mug.priceMinor * 2);
  });
});
