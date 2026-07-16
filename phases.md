# Phases — Build Plan

Each phase should end with something runnable/demoable. Backend and frontend for a phase should be built together where possible.

## Phase 0 — Setup (0.5–1 day)
- Init Expo TS app, install navigation/state/query libs, set up `theme/` tokens from `design.md`.
- Init both backend repos (`identity-catalog-service`, `commerce-order-service`) with base Express + TS + Mongoose boilerplate, `/health` route.
- Set up MongoDB Atlas (2 databases/clusters), Render project (2 web services), shared env vars.
- Set up shared `theme.ts`, base `<Button>`, `<Input>`, `<Card>` components.

## Phase 1 — Auth & Onboarding (Service A + App)
**Backend (identity-catalog-service):** signup, login, OTP generate/verify (mock SMS/email — log to console or use a free email provider), forgot/reset password, JWT issue/refresh, complete-profile endpoint.
**App:** Splash → Onboarding carousel → Sign Up → Verify OTP → Sign In → Forgot/Reset Password → Location permission → Notification permission → Complete Profile.
**Exit criteria:** A new user can register, verify, log in, and land on Home with a valid token stored via SecureStore.

## Phase 2 — Catalog, Home & Search (Service A + App)
**Backend:** Product & Category models + seed data (~40–60 mock products across categories, matching screen categories: T-Shirt, Jacket, Dress, Coat, Handbag…), list/detail/search/filter endpoints, Wishlist endpoints, Review endpoints (read + create).
**App:** Home (offers carousel, categories, best sellers, flash sale), Search + recent/recently-viewed, Filter screen, Product Detail, Reviews list, Leave Review, Wishlist screen.
**Exit criteria:** User can browse, search, filter, view a product, add/remove wishlist, read and submit a review.

## Phase 3 — Cart & Checkout (Service B + App)
**Backend (commerce-order-service):** Cart CRUD, Address CRUD (can live in Service A since it's user data — see note below), Payment method CRUD (mocked), Order creation with server-side price recompute (calls Service A internally), shipping-type pricing logic.
**App:** My Cart (qty stepper, remove, promo code — Phase 5 for real coupon logic, stub for now), Checkout (address, shipping type, payment method), Add Card, Review Summary, Payment Successful, E-Receipt.
**Exit criteria:** User can go from cart → checkout → mock payment → order created → e-receipt shown.

> Note: `Address` is user-owned data — keep it in Service A (identity-catalog-service) since it's tied to the user profile; Service B only reads a snapshot of the chosen address when creating an order.

## Phase 4 — Orders & Tracking (Service B + App)
**Backend:** Order status/history endpoints, status transition logic (Placed → In Progress → On the Way → Delivered), mock delivery-agent data, cancel/reorder endpoints.
**App:** My Orders (Active/Completed/Cancelled tabs), Track Order (status timeline), Track Live Location (static/simulated map route — real GPS websocket is a stretch item), Order detail actions (Cancel, Re-Order, View E-Receipt, Leave Review).
**Exit criteria:** Placed order appears in Active, status can be advanced (e.g. via a simple admin/seed script or timer), and moves to Completed with review/receipt actions available.

## Phase 5 — Profile, Wallet & Coupons (Service A + Service B + App)
**Backend:** Profile update endpoint (Service A), Wallet + Transaction endpoints (Service B), Coupon definitions + "copy code" tracking (Service A), Settings (notification prefs, password change, delete account) (Service A).
**App:** Profile home, Edit Profile, Manage Address, My Coupons, My Wallet (+ Add Money + Top-Up Successful), Settings, Password Manager, Help Center (FAQ), Privacy Policy.
**Exit criteria:** User can top up wallet, pay with wallet at checkout, apply a coupon code at cart, and manage account settings.

## Phase 6 — Chat & Notifications (Service B + App) — *Optional/Stretch*
**Backend:** Socket.io setup on commerce-order-service, ChatMessage model, conversation endpoints, in-app Notification feed endpoint.
**App:** Chat list, 1:1 chat (text + image; voice-note recording is a further stretch), Notifications screen.
**Exit criteria:** Two seeded users (or user + support) can exchange real-time text messages.

## Phase 7 — Polish & Stretch — *Optional, only if time remains*
- Real-time GPS order tracking via Socket.io location updates
- Voice/video call UI (front-end only, no real WebRTC signaling) or full WebRTC if time allows
- AR/virtual try-on visual mock (static image swap, not real AR)
- Animations/transitions polish, skeleton loaders, empty-state illustrations
- Social login (Google/Apple/Facebook) via Expo AuthSession

## Suggested Timeline (adjust to your deadline)
| Phase | Focus | Est. Days |
|---|---|---|
| 0 | Setup | 1 |
| 1 | Auth & Onboarding | 2–3 |
| 2 | Catalog & Search | 3–4 |
| 3 | Cart & Checkout | 3 |
| 4 | Orders & Tracking | 2–3 |
| 5 | Profile/Wallet/Coupons | 2–3 |
| 6 | Chat (optional) | 2 |
| 7 | Polish (optional) | 2+ |
