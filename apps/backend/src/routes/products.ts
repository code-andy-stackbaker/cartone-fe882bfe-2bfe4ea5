import { Router } from "express";
import { getProductRepository } from "../data/productRepository";

export function createProductRouter(): Router {
  const router = Router();

  router.get("/products", async (_req, res) => {
    const products = await getProductRepository().list();
    res.json({ products });
  });

  router.get("/products/:id", async (req, res) => {
    const product = await getProductRepository().findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(product);
  });

  return router;
}
