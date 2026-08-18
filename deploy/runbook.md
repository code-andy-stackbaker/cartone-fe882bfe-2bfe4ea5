# CartOne — Deployment Runbook

Two **separately-deployable** Node packages. They build, run and are released
independently, on their own ports. Everything below runs on the developer's own
machine — there is no cloud provider, registry or managed CI in this platform.

| Target | Path | Runtime | Dev port | Build | Start |
|---|---|---|---|---|---|
| Backend API | `apps/backend` | Node 20+ | 6000 | `npm run build` (`tsc`) | `node dist/server.js` |
| Frontend SPA | `apps/frontend` | Node 20+ (static host) | 5000 | `npm run build` (`tsc --noEmit && vite build`) | `npx serve -s dist -l $PORT` |

Both servers bind `process.env.PORT`; the ports above are only dev fallbacks.

> **Caution — port 6000.** Chrome and Firefox block requests to port 6000
> (`ERR_UNSAFE_PORT`), so the SPA's browser-side `fetch` to the backend will fail
> even though `curl` succeeds. If the catalogue does not render, re-run the
> backend on an unrestricted port and rebuild the frontend against it, e.g.
> `PORT=8080 node dist/server.js` + `VITE_BACKEND_URL=http://localhost:8080 npm run build`.
> Nothing is hardcoded — both sides read this from the environment.

## Environment variables

Backend (`apps/backend`):

| Var | Required | Safe local default | Notes |
|---|---|---|---|
| `PORT` | no | `6000` | Injected at deploy. |
| `ALLOWED_ORIGINS` | no | unset ⇒ CORS open for local dev | Set to the frontend origin, e.g. `http://localhost:5000`. Comma-separated. |
| `PAYMENTS_PROVIDER` | no | `mock` | Only `mock` is implemented. No credentials exist or are needed. |

Frontend (`apps/frontend`) — Vite inlines `VITE_*` at **build** time, so it must
be set before `npm run build`, not at start:

| Var | Required | Safe local default | Notes |
|---|---|---|---|
| `VITE_BACKEND_URL` | no | `http://localhost:6000` | Set from the deployed `BACKEND_URL`. No trailing slash. |
| `PORT` | no | `5000` | Port `serve` listens on. |

No secrets are involved; never commit a credential to this repo.

## 1. Deploy the backend (do this first)

```bash
cd apps/backend
npm install
npm test          # vitest + supertest; a red test stops the release
npm run build     # -> dist/
PORT=6000 ALLOWED_ORIGINS=http://localhost:5000 PAYMENTS_PROVIDER=mock node dist/server.js
```

Verify:

```bash
curl -fsS http://localhost:6000/api/health      # expect 200
curl -fsS http://localhost:6000/api/products    # expect the seeded catalogue JSON
```

## 2. Deploy the frontend

```bash
cd apps/frontend
npm install
npm test
VITE_BACKEND_URL=http://localhost:6000 npm run build    # -> dist/
PORT=5000 npx serve -s dist -l 5000
```

Verify: open <http://localhost:5000/> — the product catalogue renders (proving
the SPA reached the API), then add an item and complete the mock checkout; a
confirmation with an order id appears. `curl -fsS http://localhost:5000/`
returning the HTML shell is the smoke check.

Order matters: the backend must be answering before the frontend build, and
`VITE_BACKEND_URL` must match the backend's real origin or the SPA will show a
load error.

## 3. Nothing goes live on a failed build

If `npm install`, `npm test` or `npm run build` fails for either package, stop:
do not start the new process and leave the previous one serving. Go-live (the
merge that fires the pipeline) happens only after explicit human approval.

## Rollback

Each target rolls back on its own; they are independent.

1. Stop the new process (`Ctrl-C`, or `kill` the pid holding the port —
   `lsof -ti:6000 | xargs kill`).
2. Return the code to the last known-good commit and rebuild:
   ```bash
   git checkout <previous-good-sha>
   cd apps/backend  && npm install && npm run build && node dist/server.js
   cd apps/frontend && npm install && VITE_BACKEND_URL=http://localhost:6000 npm run build && npx serve -s dist -l 5000
   ```
   (If the merge is already on the default branch, `git revert <merge-sha>` and
   redeploy the same way.)
3. Re-run the verification curls in steps 1–2 to confirm the old version answers.

There is no database and no migration, so rollback is purely
stop → checkout → rebuild → start. Rolling the frontend back does not require
rolling the backend back unless the API contract changed.

## Optional: Docker

`deploy/backend.Dockerfile` and `deploy/frontend.Dockerfile` build each package
into its own image if you prefer containers. They target no registry:

```bash
docker build -f deploy/backend.Dockerfile  -t cartone-backend  .
docker run --rm -p 6000:6000 -e PORT=6000 -e PAYMENTS_PROVIDER=mock cartone-backend

docker build -f deploy/frontend.Dockerfile --build-arg VITE_BACKEND_URL=http://localhost:6000 -t cartone-frontend .
docker run --rm -p 5000:5000 -e PORT=5000 cartone-frontend
```
