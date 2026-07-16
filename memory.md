# Project Memory — Fashion Store

> This file is the persistent context log. Always read this before starting any session. Always update it before ending one.

---

## Session 1 — 2026-07-14
### What was done
- Read and internalized all planning documents: `prd.md`, `architecture.md`, `design.md`, `phases.md`, `rules.md`
- Reviewed all 21 UI reference screenshots (Behance case study screens)
- Created this `memory.md` file

### Key observations from docs + screenshots
- **Color palette confirmed:** Primary `#401900` (deep brown), Accent `#F8B057` (orange), Text `#242424`, Secondary `#797979`, Border `#E0E0E0`, BG `#F6F6F6`, White `#FFFFFF`. Success/danger are approximate approximations.
- **Typography:** Inter font exclusively, all weights.
- **Bottom nav:** Dark floating rounded bar with 5 tabs: Home, Bag (cart), Heart (wishlist), Chat bubble, Person (profile). Active tab gets white icon inside a white circle.
- **Splash:** Full-screen deep brown (`#401900`) with white hanger logo + "Fashion Store" wordmark in orange script.
- **Onboarding:** 3-slide carousel, white card below with bold headline + italic emphasis, back/next arrows, dot indicators, "Let's Get Started" pill CTA button.
- **Auth screens:** Sign Up / Sign In follow a standard pattern — top half dark image overlay, bottom white sheet with social buttons + email/password form.
- **Home header:** Dark brown header bar with location selector (orange pin icon + city name + dropdown chevron), notification bell icon (orange), search bar with scan and filter icons.
- **Product cards:** Image with rounded corners, red heart top-right, product name, star rating + count, discounted price with strikethrough original.
- **Product Detail:** Full-bleed image gallery with thumbnail strip, seller card (avatar + name/role + chat/call icons), size pills, color swatches, "Add to Cart" pill button at bottom.
- **Cart:** White card items with quantity steppers, swipe-to-delete (red background), promo code field, price breakdown, "Proceed to Checkout" pill.
- **Checkout flow:** Address → Shipping Type (Economy/Cargo/Express) → Payment Methods (Cash, Wallet, Credit Card, PayPal, Apple Pay, Google Pay) → Review Summary → Payment Successful → E-Receipt.
- **Orders:** My Orders with Active/Completed/Cancelled tabs. Active = amber badge, Completed = green badge, Cancelled = red badge. Track Order timeline: Placed → In Progress → On the Way.
- **Profile:** Menu-style screen with icon rows (Your Profile, Manage Address, Payment Methods, My Orders, My Coupons, My Wallet, Settings). Logout modal confirmation.
- **Chat:** Dark brown header with online avatars row, All/Unread tabs, conversation list. Chat bubbles: received = white card left-aligned, sent = dark brown right-aligned.
- **Deferred to phases 5-7:** Wallet, Coupons, Chat (real-time), Voice/Video calls, AR try-on, Social login.

### Key decisions made
- Will follow `phases.md` strictly — no skipping phases.
- React Navigation (native-stack + bottom-tabs), NOT Expo Router, as recommended in rules.
- FlashList for product grids.
- SecureStore for JWT tokens.
- Two microservices: `identity-catalog-service` (Service A) and `commerce-order-service` (Service B).
- Address lives in Service A (user-owned), Service B only snapshots it on order creation.
- Prices always recomputed server-side by Service B calling Service A's internal endpoint.

### Deviations from docs
- None yet.

### What's next
- **Awaiting user confirmation of the pre-build summary** before writing any code.
- Once confirmed: start **Phase 0** — init Expo TS app, both backend repos, set up theme tokens, base components (`<Button>`, `<Input>`, `<Card>`), `/health` routes on both services.

---

## Session 2 — 2026-07-14
### What was done (Phase 0 — Setup)
**Expo App (`app/`):**
- Found existing blank Expo JS project — worked with it directly (did not reinit)
- Installed all required deps: React Navigation (native-stack + bottom-tabs), React Query, Zustand, react-hook-form, zod, FlashList, expo-secure-store, axios
- Installed TypeScript + @types packages
- Created `tsconfig.json`
- Updated `app.json` — name "Fashion Store", splash bg `#401900`, portrait only
- Created full `src/` structure:
  - `theme/` — `colors.ts`, `typography.ts`, `spacing.ts`, `index.ts`
  - `types/index.ts` — full domain interfaces (User, Product, Cart, Order, etc.)
  - `api/client.ts` — two axios instances (catalogApi, commerceApi) with SecureStore JWT interceptor
  - `store/authStore.ts` — Zustand: user, tokens, hydrate(), logout()
  - `store/uiStore.ts` — Zustand: cartItemCount
  - `components/ui/Button.tsx` — primary/secondary/outline/ghost variants, pill shape
  - `components/ui/Input.tsx` — labeled, focus/error states, password toggle
  - `components/ui/Card.tsx` — white rounded card with shadow, optionally pressable
  - `navigation/types.ts` — param lists for AuthStack, MainTabs, HomeStack, ProfileStack
  - `navigation/AuthStack.tsx` — placeholder screens, `headerShown: false`
  - `navigation/MainTabs.tsx` — floating dark brown pill tab bar, 5 tabs
  - `navigation/RootNavigator.tsx` — reads auth state, shows Auth or Main
  - `App.tsx` — QueryClientProvider + StatusBar + RootNavigator

**identity-catalog-service (Service A, port 4001):**
- Init, installed: express, mongoose, jwt, bcrypt, cors, helmet, rate-limit, zod, axios, dotenv + TS dev deps
- `tsconfig.json`, updated `package.json` with dev/build/start scripts
- `src/config/env.ts` — requireEnv guard, all env vars
- `src/config/db.ts` — Mongoose connect
- `src/middlewares/error.middleware.ts` — centralized handler, `{ success, message, code }`
- `src/middlewares/auth.middleware.ts` — JWT verify → req.userId, internal service key middleware
- `src/middlewares/validate.middleware.ts` — Zod schema validator
- `src/server.ts` — helmet + CORS + rate-limit + /health + error handler + route stubs
- `.env.example`

**commerce-order-service (Service B, port 4002):**
- Identical boilerplate to Service A, port 4002
- Added `CATALOG_SERVICE_URL` env var for internal calls to Service A
- Same middleware stack, route stubs for Phase 3+ features

### Key decisions made
- Did not reinit Expo project — existing blank scaffold was sufficient
- Zod `.issues` (not `.errors`) — fixed during Phase 0 compilation check
- Both services use identical middleware patterns for consistency
- `App.js` deleted — replaced with `App.tsx`; `index.js` naturally resolves to it

### Deviations from docs
- None — all Phase 0 items implemented exactly per phases.md and architecture.md

### Verification
- `tsc --noEmit` passes cleanly on all 3 projects ✅
- Both backend servers have /health endpoint ready
- Expo app navigation skeleton boots (auth gate via Zustand hydration)

### What's next
**Phase 1 — Auth & Onboarding:**
- **Backend (Service A):** User model, signup/login/OTP/forgot-reset password endpoints, JWT issue/refresh
- **App:** Splash → Onboarding (3 slides) → SignUp → VerifyOtp → SignIn → ForgotPassword → NewPassword → LocationPermission → NotificationPermission → CompleteProfile
- Exit criteria: new user registers, verifies OTP, logs in, lands on Home with valid token in SecureStore

---

## Session 3 — 2026-07-14
### What was done (Phase 1 — Auth & Onboarding)

**identity-catalog-service — Auth endpoints:**
- `src/models/User.ts` — Mongoose model, bcrypt comparePassword, toJSON strips passwordHash
- `src/models/Otp.ts` — TTL index (auto-cleanup at expiry)
- `src/services/auth.service.ts` — all business logic (signup, verifySignupOtp, login, forgotPassword, resetPassword, refreshToken, completeProfile)
- `src/validators/auth.validators.ts` — Zod schemas for all endpoints
- `src/controllers/auth.controller.ts` — thin controller layer
- `src/routes/auth.routes.ts` — mounted at `/api/auth`, per-route rate limits (auth: 10/15min, OTP: 5/5min)
- Mounted in `server.ts`

**Fixed during development:**
- Zod v4 uses `.issues` not `.errors`; Zod `literal()` uses `message:` string not `errorMap:`
- Mongoose deprecation: `{ new: true }` → `{ returnDocument: 'after' }`
- Node 22 / ts-node incompatibility → switched to `tsx` runtime
- TypeScript strict: toJSON transform needed `any` type for Mongoose compatibility

**App screens created:**
- `src/screens/onboarding/SplashScreen.tsx` — full brown, animated logo entrance, 2.5s auto-advance
- `src/screens/onboarding/OnboardingScreen.tsx` — 3-slide paginated FlatList, skip/back/next, dot indicators, CTA on last
- `src/screens/auth/SignUpScreen.tsx` — dark top + white sheet, react-hook-form + zod
- `src/screens/auth/VerifyOtpScreen.tsx` — 4-box OTP, auto-advance, backspace, resend cooldown (60s)
- `src/screens/auth/SignInScreen.tsx` — calls login, writes to Zustand → RootNavigator flips to Main
- `src/screens/auth/ForgotPasswordScreen.tsx` — sends OTP
- `src/screens/auth/NewPasswordScreen.tsx` — confirm match, resets + logs in
- `src/screens/permissions/LocationPermissionScreen.tsx`
- `src/screens/permissions/NotificationPermissionScreen.tsx`
- `src/screens/auth/CompleteProfileScreen.tsx` — avatar, name, phone, gender chips
- `src/api/auth.api.ts` — all auth endpoints via catalogApi
- `src/navigation/AuthStack.tsx` — all real screens wired

### Integration test results
```
POST /api/auth/signup      → 201, OTP in console ✅
POST /api/auth/verify-otp  → 200, token + user ✅ (passwordHash absent ✅)
POST /api/auth/login       → 200, tokens ✅
GET  /api/auth/me          → 200, user object ✅
POST /api/auth/login bad   → 401 INVALID_CREDENTIALS ✅
POST /api/auth/signup bad  → 400 VALIDATION_ERROR ✅
GET  /api/unknown          → 404 NOT_FOUND ✅
```

### Deviations from docs
- None — all Phase 1 items match phases.md spec

### Verification
- `tsc --noEmit` passes on all 3 projects ✅
- Both backend services boot + connect to MongoDB Atlas ✅
- Service A /health + auth API confirmed working via curl

### What's next
**Phase 2 — Catalog, Search & Wishlist:**
- Service A: Product model + routes (list/detail/search/filter/featured), Address model, Wishlist routes, Review routes, internal price endpoint
- App: HomeScreen, SearchScreen, FilterScreen, ProductDetailScreen, ReviewsScreen, WishlistScreen
- Navigation: HomeStack nested inside Home tab, replace placeholder tab icons with real icons
- Seed 20+ products into MongoDB

---

## Session 4 — 2026-07-14
### What was done (Phase 2 — Catalog, Search & Wishlist)

**identity-catalog-service — Catalog models:**
- `src/models/Product.ts` — Mongoose model, text search index on title/description/category, flash sale + best seller flags, colors/sizes arrays, seller fields
- `src/models/Wishlist.ts` — compound unique index (userId + productId) prevents duplicates
- `src/models/Review.ts` — unique per user+product, auto-cleanup via TTL
- `src/models/Address.ts` — 4 label types (Home/Office/Parent's House/Friend's House), isDefault flag, optional lat/lng

**identity-catalog-service — Services:**
- `src/services/product.service.ts` — listProducts (filter by category/price/rating/size/color + sort + pagination), searchProducts (MongoDB $text), getProductById, getFeaturedProducts (flash sale + best sellers), getCategories (distinct), getProductPriceInternal (for Service B)
- `src/services/wishlist.service.ts` — getWishlist (populated), addToWishlist (duplicate guard on Mongo 11000), removeFromWishlist, getWishlistProductIds
- `src/services/review.service.ts` — getProductReviews (paginated), createReview + recalculates product rating via `$avg` aggregation
- `src/services/address.service.ts` — getUserAddresses, createAddress (auto-default first), updateAddress, deleteAddress, setDefaultAddress

**identity-catalog-service — Controllers + Routes:**
- `product.controller.ts` + `product.routes.ts` — all public; internal router exported separately
- `wishlist.controller.ts` + `wishlist.routes.ts` — all auth-protected
- `review.controller.ts` + `review.routes.ts` — GET public, POST auth-protected
- `address.controller.ts` + `address.routes.ts` — all auth-protected
- All mounted in `server.ts`; internal price endpoint at `/internal/products/:id/price`

**Seed script:**
- `src/seed.ts` — 20 products across 8 categories (T-Shirt, Jacket, Dress, Coat, Handbag, Pant, Shirt, Sweater)
- Flash sale and best seller flags set across the dataset
- Placeholder images via placehold.co

**Fixed during development:**
- TypeScript: `req.params` is `string | string[]` → cast via `String()`
- Mongoose sort type: `Record<string, number>` → `Record<string, 1 | -1>`
- Address `label` enum narrowing → used `as Parameters<typeof Address.create>[0]` cast
- Missing packages: `@react-native-async-storage/async-storage`, `@react-native-community/slider` — installed via `npx expo install`

**App — components:**
- `src/components/ui/ProductCard.tsx` — 2-col grid card, image, heart button, SALE badge, star rating, price with strikethrough

**App — hooks:**
- `src/hooks/useProducts.ts` — useProducts, useProductSearch, useFeaturedProducts, useCategories, useProduct (all React Query with stale times)
- `src/hooks/useWishlist.ts` — useWishlist, useToggleWishlist (add + remove with cache invalidation)

**App — store:**
- `src/store/cartStore.ts` — Zustand cart persisted to AsyncStorage, supports add (merge existing), updateQuantity, removeItem, clearCart, computed total and itemCount

**App — API:**
- `src/api/catalog.api.ts` — getProducts, searchProducts, getFeatured, getCategories, getProduct, getWishlist, addToWishlist, removeFromWishlist, getReviews, createReview

**App — screens:**
- `HomeScreen.tsx` — dark brown header (location selector + bell + search bar with filter btn), category chip scroll with emoji icons, Flash Sale horizontal FlatList, Best Sellers 2-col grid, pull-to-refresh
- `SearchScreen.tsx` — auto-focused input, recent searches list, live text search, results grid
- `FilterScreen.tsx` — category chips, price slider, min rating chips, size chips, sort-by radio, Reset + Apply CTA
- `ProductDetailScreen.tsx` — full-bleed image + thumbnail strip, seller card (avatar + chat/call), size pills, color swatches, quantity stepper, Add to Cart (writes to cartStore), navigates to Reviews
- `ReviewsScreen.tsx` — star display, avatar, reviewer name, date, review text, photo strip
- `WishlistScreen.tsx` — 2-col grid, heart button removes, empty state with "Start Shopping" CTA
- `FlashSaleScreen.tsx` / `BestSellersScreen.tsx` — full-list variants of the featured sections
- `NotificationPlaceholder.tsx` — empty state placeholder

**App — navigation:**
- `HomeStack.tsx` — created, wires all Home-tab screens
- `MainTabs.tsx` — Home tab now uses HomeStack, Wishlist tab uses WishlistScreen, emoji icons for all 5 tabs

### Integration test results (curl smoke tests)
```
GET /api/products/featured       → flashSale: 10, bestSellers: 10 ✅
GET /api/products/categories     → ['Coat','Dress','Handbag','Jacket','Pant','Shirt','Sweater','T-Shirt'] ✅
GET /api/products?category=Jacket → 3 products ✅
GET /api/products/search?q=wool  → 2 results ✅
```

### Deviations from docs
- Slider uses `@react-native-community/slider` (not a native-only dep — compatible with Expo SDK 54)
- Emoji icons used for bottom tab bar instead of vector icons — avoids native linking complexity, functionally equivalent for MVP

### Verification
- `tsc --noEmit` passes on all 3 projects ✅
- Seed script inserted 20 products into MongoDB Atlas ✅
- All product API endpoints verified via curl

### What's next
**Phase 3 — Cart & Checkout:**
- Service B: Cart model + routes (GET, POST add item, PATCH qty, DELETE item), Order model + routes (create, list, get), Checkout flow (address → shipping → payment method → confirm), internal call to Service A for prices
- App: CartScreen (item list + qty stepper + swipe-to-delete + promo code + total), CheckoutScreen (address picker → shipping type → payment method → Review Summary → Payment Success → E-Receipt)
- Navigation: CartStack nested inside Cart tab
- Phase 3 exit: user can add to cart, go through checkout, see order confirmed

---

## Session 5 — 2026-07-14
### What was done (Phase 3 — Cart & Checkout)

**commerce-order-service — Models:**
- `src/models/Cart.ts` — One document per userId (unique index), embedded CartItem sub-docs (`_id: false`), qty capped at 50
- `src/models/Order.ts` — Full order lifecycle, embedded address snapshot (denormalized), status history array, ShippingType enum (Economy/Cargo/Express), PaymentMethod enum, orderNumber unique index

**commerce-order-service — Services:**
- `src/services/cart.service.ts` — getCart, addItem (fetches fresh price from Service A `/internal/products/:id/price`, stock check, merges duplicates), syncCart (full replace with re-price), updateItemQuantity, removeItem, clearCart
- `src/services/order.service.ts` — createOrder (re-prices ALL items from Service A, stock validation per item, SHIPPING_COSTS map, promo code stub FASHION10/SAVE20, order number via nanoid, clears cart after success), getUserOrders, getOrderById, cancelOrder (only Placed/In Progress)
- Installed `nanoid@3` (CJS-compatible with Node 22 + tsx)

**commerce-order-service — Controllers + Routes:**
- `cart.controller.ts` + `cart.routes.ts` — GET cart, POST add, POST sync, PATCH qty, DELETE item, DELETE all
- `order.controller.ts` + `order.routes.ts` — POST create, GET list, GET :id, PATCH :id/cancel
- All mounted in `server.ts` (replaced Phase 3+ stubs)

**App — API:**
- `src/api/commerce.api.ts` — Full cart + order endpoints via commerceApi Axios instance
- `src/api/catalog.api.ts` — Added getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress

**App — Screens (cart/ directory):**
- `CartScreen.tsx` — Item list with image, variant (size/color dots), qty stepper (confirm alert at 0), swipe-to-delete, promo code input (validates FASHION10/SAVE20 locally), order summary breakdown, Proceed to Checkout CTA
- `SelectAddressScreen.tsx` — Address list from Service A, default badge, radio selection, Add New Address (UI only), Continue passes subtotal forward
- `SelectShippingScreen.tsx` — Economy (₹49/7d), Cargo (₹99/4d), Express (₹199/next day), live estimated total preview
- `SelectPaymentScreen.tsx` — Cash, Credit Card, PayPal, Apple Pay, Google Pay with icons + descriptions
- `OrderSummaryScreen.tsx` — Full review (address/items/shipping/payment/breakdown), Place Order calls Service B, clears Zustand cart, navigates to PaymentSuccess
- `PaymentSuccessScreen.tsx` — Animated checkmark (spring scale + fade), order number + amount card, View E-Receipt + Back to Home
- `EReceiptScreen.tsx` — Fetches order from Service B, styled receipt card with dark brown stamp header, dashed tear-line separator, items list, price breakdown, delivery address

**App — Navigation:**
- `CartStack.tsx` — CartScreen → SelectAddress → SelectShipping → SelectPayment → OrderSummary → PaymentSuccess (gestureEnabled: false) → EReceipt
- `MainTabs.tsx` — Cart tab now uses CartStack; CartTabIcon shows live item count badge (red circle, count from cartStore)

### Smoke test results
```
GET  /api/cart  (no token)   → 401 UNAUTHORIZED ✅
GET  /api/orders (no token)  → 401 UNAUTHORIZED ✅
GET  /api/cart  (bad token)  → 401 INVALID_TOKEN ✅
GET  /api/unknown            → 404 NOT_FOUND ✅
GET  /health                 → commerce-order-service | ok ✅
```

### Deviations from docs
- Address CRUD stays in Service A (identity-catalog) as per phases.md note — Service B only snapshots on order creation ✅
- Payment is mocked (no real gateway) — correct for MVP scope
- Promo codes are stubbed (FASHION10/SAVE20) — real coupon logic is Phase 5

### Verification
- `tsc --noEmit` passes on all 3 projects ✅
- Service B starts, connects to MongoDB, all routes auth-protected ✅

### What's next
**Phase 4 — Orders & Tracking:**
- Service B: Order status/history endpoints, status transitions (Placed → In Progress → On the Way → Delivered), mock delivery agent data, cancel/reorder endpoints
- App: MyOrders screen (Active/Completed/Cancelled tabs with filter), TrackOrder screen (status timeline), Order detail actions (Cancel, Re-Order, View E-Receipt, Leave Review)
- Phase 4 exit: Placed order appears in Active, status can advance, moves to Completed with review/receipt actions

---

## Session 6 — 2026-07-14
### What was done (Phase 4 — Orders & Tracking)

**commerce-order-service — Model changes:**
- `src/models/Order.ts` — Added optional `deliveryAgent` embedded field: `{ name, phone, avatar, vehicle, rating }`

**commerce-order-service — Service changes:**
- `src/services/order.service.ts` — Full rewrite adding:
  - `advanceOrderStatus` — graph-based transition map: Placed→In Progress→On the Way→Delivered, throws if terminal
  - `randomAgent()` — picks from 3 mock agents pool, assigned when status becomes "On the Way"
  - `reorder` — rebuilds cart from original order items (upsert replaces cart)
  - `getOrderTracking` — returns orderId/orderNumber/status/statusHistory/estimatedDelivery/shippingAddress/deliveryAgent
  - Refactored `createOrder` to use `new mongoose.Types.ObjectId(userId)` for `getUserOrders` query

**commerce-order-service — Route changes:**
- `GET  /api/orders/:id/tracking` — tracking detail with delivery agent
- `PATCH /api/orders/:id/advance` — advance status step (demo endpoint)
- `POST  /api/orders/:id/reorder` — rebuild cart from order

**App — API:**
- `src/api/commerce.api.ts` — Added getOrderTracking, advanceOrderStatus, reorder

**App — Screens (orders/ directory):**
- `MyOrdersScreen.tsx` — Active/Completed/Cancelled tabs filtering list client-side, color-coded status badges, Track→/Receipt→ action buttons per tab, pull-to-refresh
- `TrackOrderScreen.tsx` — vertical timeline with connector lines (done=filled/primary, pending=grey), status timestamps from statusHistory, delivery agent card (avatar + vehicle + rating + call button via Linking), ETA banner, 30s auto-refetch, demo "Advance Status" button (invokes `/advance` endpoint, invalidates queries)
- `OrderDetailScreen.tsx` — status banner, items list with images, price breakdown, shipping/payment info, address; contextual actions: Track (Active), E-Receipt (Delivered), Leave Review (Delivered), Reorder (all), Cancel (Placed/In Progress only)

**App — Screens (profile/ directory):**
- `ProfileHomeScreen.tsx` — user avatar+name+email card, grouped menus (Shopping: MyOrders/Payments/Coupons/Wallet; Account; Support), phase 5 items show "Phase 5" badge

**App — Navigation:**
- `ProfileStack.tsx` — created; ProfileHome (real), MyOrders, OrderDetail, TrackOrder, EReceipt (real); all Phase 5 screens registered to ProfilePlaceholder
- `MainTabs.tsx` — Profile tab now uses ProfileStack
- `navigation/types.ts` — Added OrderDetail + LeaveReview to ProfileStackParamList

### Smoke test results (Phase 4)
```
GET  /api/orders/:id/tracking  (no token)  → 401 UNAUTHORIZED ✅
PATCH /api/orders/:id/advance  (no token)  → 401 UNAUTHORIZED ✅
POST  /api/orders/:id/reorder  (no token)  → 401 UNAUTHORIZED ✅
tsc --noEmit (Service B)                   → ✅ clean
tsc --noEmit (App)                         → ✅ clean (fixed User.name vs fullName)
```

### Deviations from docs
- Status advance exposed as user-accessible endpoint `/advance` for demo; in production this would be a webhook/admin action
- TrackLiveLocation is registered in ProfileStack but shows a Phase 5 placeholder — real GPS/WebSocket is Phase 7

### What's next (superseded — Phase 5 now complete, see Session 7)
**Phase 5 — Profile, Wallet & Coupons:**
- Service A: Profile update endpoint, Coupon definitions + copy code tracking
- Service B: Wallet + Transaction endpoints, real coupon redemption at checkout
- App: Edit Profile, Manage Address (full CRUD), My Coupons, My Wallet (add money + top-up), Settings, Password Manager, Help Center, Privacy Policy

---

## Session 7 — 2026-07-15
### What was done (Phase 5 — Profile, Wallet & Coupons)

**identity-catalog-service — New:**
- `Coupon` model: code (uppercase/unique), discountType (percent/flat), discountValue, minOrderValue, maxDiscount cap, expiresAt, usageLimit/usedCount
- `profile.service.ts`: updateProfile (whitelist), changePassword (bcrypt), deleteAccount (password confirm), updateNotificationPrefs stub
- `coupon.service.ts`: listCoupons (active+not-expired), validateCoupon (compute discount), recordCouponUsage, seedCoupons (5 coupons)
- Routes: PATCH /api/profile/me, PATCH /me/password, DELETE /me, GET /api/coupons (public), POST /api/coupons/validate, POST /api/coupons/seed

**commerce-order-service — New:**
- `Wallet` model: per-user balance + embedded transactions (credit/debit, source, amount, orderId)
- `wallet.service.ts`: getOrCreate (upsert), topUp (validates 6 preset amounts), debitWallet, getTransactions (desc sorted, paginated)
- Routes: GET /api/wallet, POST /api/wallet/topup, GET /api/wallet/transactions

**App — New screens (all in screens/profile/):**
- `YourProfileScreen` — name/phone/dob/gender form, PATCH to API, updates authStore
- `ManageAddressScreen` — list with default badge, Set Default + Delete
- `AddAddressScreen` — label picker, full fields, set-as-default checkbox
- `MyCouponsScreen` — colored tab cards with tear notch, tap-to-copy, days countdown, auto-seeds
- `MyWalletScreen` — balance card, 6 top-up chips, transaction history
- `SettingsScreen` — notification toggles (saved to API), dark mode stub, Log Out
- `PasswordManagerScreen` — change password + delete account (danger zone)
- `HelpCenterScreen` — 8 FAQ accordion items, contact card
- `PrivacyPolicyScreen` — 8 content sections

**Navigation:** ProfileStack fully wired — all Phase 5 screens real; PaymentMethods/AddCard/LeaveReview/TrackLiveLocation remain Phase 6 placeholders

### Smoke tests
All new routes → 401 (no token) or 200 (public GET). tsc clean across all 3 projects.

### What's next
**Phase 6 — Notifications, Chat & Payment Cards:**
- Service A: Push notification tokens (FCM), in-app notification feed
- Service B: Chat/support thread (stub), payment card storage
- App: Notification Center (bell badge on home), Chat screen, Add Card (Stripe elements mock), Payment Methods screen with card list
