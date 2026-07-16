# Architecture — Fashion Store

## 1. Tech Stack
| Layer | Choice |
|---|---|
| Mobile App | React Native (Expo, JSX) |
| Navigation | React Navigation (native-stack + bottom-tabs) |
| State/Data | React Query (server state) + Zustand (client/UI state) |
| Backend | Node.js + Express (TypeScript), split into **exactly 2 microservices** |
| Database | MongoDB Atlas (Mongoose) — one logical DB per service |
| Auth | JWT (access + refresh), bcrypt password hashing |
| Realtime (Phase 6, optional) | Socket.io, hosted on Commerce service |
| File/Image storage | Cloudinary (product images, avatars, review photos) |
| Deployment | Render (2 separate Web Services), Expo EAS Build for the app |
| Push Notifications | Expo Notifications (client) + a notification-trigger module inside Commerce service |

## 2. Why 2 Microservices
Split along a natural seam: **things a user browses vs. things a user does with money/orders.**

### Service A — `identity-catalog-service`
Owns everything about *who the user is* and *what can be bought*.
- Auth (signup, login, OTP, forgot/reset password)
- User profile & addresses
- Product catalog (products, categories, search, filters)
- Wishlist
- Reviews & ratings
- Coupons (definitions + eligibility display)
- Notification preferences (settings only)
- Help Center / FAQ / Privacy Policy content

### Service B — `commerce-order-service`
Owns everything about *transactions and fulfillment*.
- Cart
- Checkout, orders, order status/tracking
- Payment methods & payment processing (mocked gateway + wallet ledger)
- Wallet balance & transactions
- Chat / support messaging (Phase 6, via Socket.io)
- Order-related push notification triggers (order shipped, flash sale, etc.)

### Cross-service communication
- The mobile app talks to **both services directly** (no API gateway needed at this scale — keeps things simple and within Render's free/starter tier).
- When Service B needs product data (e.g., to snapshot price/name into an order), it calls Service A's internal REST endpoint (`GET /internal/products/:id`) using a shared internal API key (`INTERNAL_SERVICE_KEY` env var), never trusting client-supplied prices.
- Both services validate the same JWT (shared `JWT_SECRET`) so a user only logs in once via Service A and reuses the token on Service B.

```
                        ┌─────────────────────┐
                        │   React Native App   │
                        │   (Expo, TS)          │
                        └─────────┬────────────┘
                     JWT ┌────────┴────────┐ JWT
                         ▼                  ▼
          ┌───────────────────────┐  ┌───────────────────────┐
          │ identity-catalog-svc  │  │ commerce-order-svc     │
          │ Auth, Users, Products │◄─┤ Cart, Orders, Payments │
          │ Wishlist, Reviews,    │  │ Wallet, Chat           │
          │ Coupons, Help         │  │                        │
          └──────────┬────────────┘  └──────────┬─────────────┘
                     ▼                            ▼
          ┌───────────────────────┐  ┌───────────────────────┐
          │ MongoDB (catalog DB)  │  │ MongoDB (commerce DB) │
          └───────────────────────┘  └───────────────────────┘
```

## 3. App Flow (high level)
```
Splash → Onboarding (3 slides) → Sign Up / Sign In → OTP Verify (signup only)
   → Location Permission → Notification Permission → Complete Profile
   → Home (tabs: Home | Cart | Wishlist | Chat | Profile)

Home → Search/Filter → Product Detail → Add to Cart / Wishlist
Product Detail → Reviews → Leave Review

Cart → Checkout (Address → Shipping Type → Payment Method) → Review Summary
   → Payment Successful → E-Receipt

Orders (Active/Completed/Cancelled) → Track Order → Track Live Location

Profile → Your Profile / Manage Address / Payment Methods / My Orders /
   My Coupons / My Wallet / Settings → Help Center / Privacy Policy
```

## 4. Mobile App Folder Structure
```
app/
├── app.json
├── App.tsx
├── src/
│   ├── api/
│   │   ├── client.ts              # axios instances (catalogApi, commerceApi) + services
│   │   ├── auth.api.ts
│   │   ├── catalog.api.ts
│   │   ├── cart.api.ts
│   │   ├── order.api.ts
│   │   ├── wallet.api.ts
│   │   └── chat.api.ts
│   ├── components/
│   │   ├── ui/                    # Button, Input, Chip, Modal, RatingStars, PriceTag
│   │   ├── product/                # ProductCard, ProductGrid
│   │   └── order/                  # OrderStatusTimeline, OrderCard
│   ├── screens/
│   │   ├── onboarding/
│   │   ├── auth/                   # SignIn, SignUp, VerifyOtp, ForgotPassword
│   │   ├── permissions/            # LocationPermission, NotificationPermission
│   │   ├── home/
│   │   ├── search/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── chat/
│   │   ├── profile/
│   │   └── settings/
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   ├── MainTabs.tsx
│   │   └── types.ts
│   ├── store/                      # Zustand slices: authStore, cartStore, uiStore
│   ├── hooks/                      # useAuth, useDebounce, useCart
│   ├── theme/                      # colors.ts, typography.ts, spacing.ts
│   ├── utils/
│   └── types/                      # shared TS interfaces (Product, Order, User…)
└── assets/
```

## 5. Backend Folder Structure (repeated per service)
```
identity-catalog-service/
├── src/
│   ├── config/                 # db.ts, env.ts
│   ├── models/                 # User, Address, Product, Category, Wishlist, Review, Coupon
│   ├── routes/
│   ├── controllers/
│   ├── services/                # business logic separated from controllers
│   ├── middlewares/             # auth.middleware.ts, validate.middleware.ts, error.middleware.ts
│   ├── validators/              # zod/joi schemas per route
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json

commerce-order-service/
├── src/
│   ├── config/
│   ├── models/                  # Cart, Order, Payment, Wallet, Transaction, ChatMessage
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── sockets/                 # chat.socket.ts (Phase 6)
│   ├── middlewares/
│   ├── validators/
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## 6. Core Data Models (simplified)
**identity-catalog-service**
- `User { name, email, phone, passwordHash, dob, gender, avatarUrl, authProvider }`
- `Address { userId, label, line1, floor, landmark, lat, lng, isDefault }`
- `Product { title, category, price, discountPrice, colors[], sizes[], images[], rating, sellerName }`
- `Wishlist { userId, productIds[] }`
- `Review { productId, userId, rating, text, photos[], createdAt }`
- `Coupon { code, discountType, discountValue, unlockThreshold }`

**commerce-order-service**
- `Cart { userId, items: [{ productId, qty, priceSnapshot }] }`
- `Order { userId, items[], addressSnapshot, shippingType, status, statusHistory[], paymentMethod, totals }`
- `PaymentMethod { userId, type, cardLast4, provider }`
- `Wallet { userId, balance }`
- `Transaction { userId, type(credit/debit), amount, relatedOrderId, createdAt }`
- `ChatMessage { conversationId, senderId, type(text/image/audio), content, createdAt }` *(Phase 6)*

## 7. Environment & Deployment (Render)
- Two separate Render Web Services, each with its own `MONGODB_URI`, `JWT_SECRET` (shared value), `INTERNAL_SERVICE_KEY` (shared), `PORT`.
- Health check endpoint `/health` on both services (Render requirement).
- CORS restricted to Expo app's known origins / `*` during dev.
- Use Render's environment groups to share `JWT_SECRET` and `INTERNAL_SERVICE_KEY` across both services without duplicating values.