import { Product } from "../types";

/** In-memory seed catalogue. No database, no credentials, no network. */
export const SEED_PRODUCTS: Product[] = [
  {
    id: "mug-01",
    name: "Enamel Camp Mug",
    description:
      "A 12oz speckled enamel mug that survives campfires, commutes and Monday mornings alike.",
    priceMinor: 1400,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/mug-01/400/300"
  },
  {
    id: "tee-02",
    name: "Heavyweight Cotton Tee",
    description:
      "220gsm organic cotton, boxy fit, pre-shrunk. The plain tee you end up wearing every week.",
    priceMinor: 2800,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/tee-02/400/300"
  },
  {
    id: "note-03",
    name: "Dot Grid Notebook",
    description:
      "A6 hardcover notebook with 160 dot-grid pages, elastic closure and a ribbon marker.",
    priceMinor: 1650,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/note-03/400/300"
  },
  {
    id: "bottle-04",
    name: "Insulated Water Bottle",
    description:
      "600ml double-walled steel bottle. Keeps cold drinks cold for 24 hours and coffee hot for 12.",
    priceMinor: 3200,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/bottle-04/400/300"
  },
  {
    id: "tote-05",
    name: "Canvas Tote Bag",
    description:
      "Sturdy 16oz canvas tote with reinforced straps and an inner pocket for the small things.",
    priceMinor: 2100,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/tote-05/400/300"
  },
  {
    id: "socks-06",
    name: "Merino Crew Socks",
    description:
      "Two pairs of cushioned merino crew socks — warm when it is cold, breathable when it is not.",
    priceMinor: 1900,
    currency: "USD",
    imageUrl: "https://picsum.photos/seed/socks-06/400/300"
  }
];
