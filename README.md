# CartOne — a tiny storefront (SDLC Generated App)

Generated end-to-end by the SDLC Agent Pipeline. This application is AI-generated
(governance disclosure).

**Stack (chosen at the design gate):** React + TypeScript + Vite SPA `apps/frontend`
and a Node + Express + TypeScript API `apps/backend`. No database — the catalogue
and orders live in in-memory seed data, and payments run through a mock provider
by default, so the app builds and runs with **zero configuration**.

## Packages

| Package | Dir | Install | Build | Test | Start | Dev port |
| --- | --- | --- | --- | --- | --- | --- |
| frontend | `apps/frontend` | `npm install` | `npm run build` | `npm test` | `npx serve -s dist -l $PORT` | 5173 |
| backend | `apps/backend` | `npm install` | `npm run build` | `npm test` | `node dist/server.js` | 8080 |

## Runtime configuration (all optional — see `.env.example`)

- Backend binds `process.env.PORT` (dev fallback 8080).
- Backend CORS allowlist comes from `ALLOWED_ORIGINS` (comma-separated);
  permissive when unset so local dev works.
- Frontend reads the API base URL from the build-time `VITE_BACKEND_URL`
  (falls back to `http://localhost:8080`).

## API

- `GET /api/health` → `{ status: "ok" }`
- `GET /api/products` → `{ products: Product[] }` (in-memory seed)
- `GET /api/products/:id` → `Product` or 404
- `POST /api/checkout` → 201 `{ orderReference, totalPaidMinor, currency, status }`,
  400 `{ fieldErrors }` on validation failure, 402 on a declined card. The total is
  always recomputed server-side from seed prices; client totals are never trusted.

## Seams

- **Data access:** `getProductRepository()` / `getOrderStore()` in
  `apps/backend/src/data` — a real database implements the same interface with no
  route changes.
- **Payments:** `apps/backend/src/integrations/payments` (`port.ts`, `mock.ts`,
  `stripe.ts`, `index.ts`). `getPaymentProvider()` is the only place the mock/real
  choice is made: set `PAYMENTS_PROVIDER=stripe` **and** `STRIPE_SECRET_KEY` to go
  live — no code change.

## Local development

```bash
cd apps/backend  && npm install && npm run build && node dist/server.js
cd apps/frontend && npm install && npm run dev
```
