# Rules — What to Use, What to Avoid


## Always update memory.md
## 1. General Principles
- Ship the MVP scope first (see `phases.md`). Do not build Phase 5+ features before Phase 1–3 are working end-to-end.
- Every screen must work with mock/seeded data before wiring to the real backend — don't block UI work on backend being finished.
- Keep the 2-microservice boundary strict: never let `commerce-order-service` write directly to catalog collections, and vice versa. Cross-service reads only through internal REST calls.

## 2. Frontend (React Native / Expo)

### Use
- **TypeScript everywhere** — no `.js` files in `src/`.
- **Expo Router or React Navigation** (pick one; recommend React Navigation native-stack + bottom-tabs since it matches the screen set well) — pick once, don't mix.
- **React Query** for all server data (products, cart, orders) — gives caching, retries, loading/error states for free.
- **Zustand** for small local/UI state (auth token, cart badge count, theme).
- **react-hook-form + zod** for all forms (Sign Up, Add Card, Add Address, Checkout, Leave Review).
- **FlashList** (Shopify) instead of `FlatList` for product grids — smoother scroll on long catalog lists.
- **Expo SecureStore** for storing JWT tokens (never AsyncStorage for tokens).
- Centralize colors/typography/spacing in `src/theme/` and reference them everywhere (see `design.md` tokens).
- One shared `<Button>`, `<Input>`, `<Card>` component set — every screen reuses them.

### Avoid
- Don't call `fetch` directly inside components — always go through `src/api/*.api.ts` + React Query hooks.
- Don't hardcode colors/hex values inline in screens — pull from theme.
- Don't build custom navigation/back-button logic — use the navigation library's built-in header/back behavior.
- Don't implement the AR try-on or video/voice calling in the MVP — these need native modules (camera ML, WebRTC) far beyond timeline; stub the button with a "Coming soon" alert if the screen is referenced.
- Don't over-fetch: product list screens should paginate (`?page=&limit=`), not load the whole catalog.
- Avoid prop-drilling more than 2 levels — lift to Zustand/context instead.

## 3. Backend (Node.js / Express)

### Use
- TypeScript, `zod` for request validation on every route.
- Layered structure: `routes → controllers → services → models`. Controllers stay thin (parse req, call service, send res).
- `bcrypt` for password hashing, `jsonwebtoken` for access (15min) + refresh (7d) tokens.
- Centralized `error.middleware.ts` — every error goes through one handler, consistent JSON error shape `{ success: false, message, code }`.
- `helmet`, `cors`, `express-rate-limit` on both services (especially auth routes — rate-limit login/OTP).
- Mongoose schemas with explicit `required`/`enum` validation — don't rely only on frontend validation.
- Idempotent payment endpoints: creating an order twice with the same client-generated `idempotencyKey` should not double-charge the wallet.
- Environment variables via `.env` + `.env.example` committed (no real secrets committed).

### Avoid
- No business logic inside route files — route files only wire `path → controller`.
- Don't trust client-sent prices/totals at checkout — always recompute from Service A's product data server-side.
- Don't store raw card numbers — only store `last4` + a mock/tokenized reference (this is a student project; do NOT integrate real card storage/PCI-scope code).
- Don't share one Mongoose connection object across both services — each service owns its own DB connection and its own database.
- No synchronous cross-service calls in a hot path without a timeout — always set an axios timeout (e.g., 5s) when Service B calls Service A.


## 6. Security Checklist (don't skip)
- [ ] JWT secret only in env, never committed
- [ ] Passwords never logged or returned in API responses
- [ ] All write routes require auth middleware except signup/login/forgot-password
- [ ] Rate limit auth + OTP endpoints
- [ ] Validate `userId` from JWT server-side — never trust a `userId` field sent in the request body