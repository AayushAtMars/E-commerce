# Product Requirements Document — Fashion Store (E-commerce Mobile App)

## 1. Overview
Fashion Store is a mobile-first fashion e-commerce app (React Native / Expo) where users browse, search, and buy clothing/accessories, track orders live, manage a wallet/coupons, and chat directly with sellers/support. This PRD is derived from a full screen-by-screen analysis of the Behance case study "Fashion Ecommerce Store Mobile App UI/UX Design."

## 2. Problem Statement
Fashion shoppers want a fast, visual, trustworthy mobile buying experience: easy discovery (search/filter/flash sales), transparent order tracking, flexible payment (cash, wallet, cards, 3rd-party wallets), and direct communication with sellers/delivery — all in one app, without needing a browser or a separate customer-support channel.

## 3. Target Users
- **Primary:** Fashion-conscious shoppers (18–40) who shop on mobile, are price/deal sensitive (flash sales, coupons), and expect same-day-style order visibility.
- **Secondary:** Repeat/loyal customers who use wallet top-ups, saved cards, and coupon stacking.
- **Internal actor (not an app role, but referenced in flows):** Seller/Manager (e.g., "Leslie Alexander," "Lily Harris") and Delivery Agent — both appear as chat/call contacts, not as separate app clients in MVP (see Out of Scope).

## 4. Personas
| Persona | Goal | Key screens used |
|---|---|---|
| New shopper | Discover trending/best-seller items fast | Onboarding, Home, Search, Filter, Product Detail |
| Deal hunter | Maximize discounts | Special Offers, Flash Sale, My Coupons |
| Repeat buyer | Reorder, track, pay fast | My Orders, Wallet, Saved Cards, Track Order |
| Support seeker | Resolve issue quickly | Chat, Help Center, Call/Video with seller, Privacy Policy |

## 5. Goals & Success Metrics
- Time-to-first-purchase (onboarding → checkout completion)
- Cart-to-checkout conversion rate
- Search-to-product-view conversion
- Order tracking screen engagement (proxy for trust)
- Coupon redemption rate
- Support chat resolution time

## 6. Feature Inventory (from screen analysis)

### 6.1 Onboarding & Auth
- Splash screen (brand logo)
- 3-step onboarding carousel (skip / next / back)
- Sign Up (email/password + Google, Apple, Facebook), Terms & Condition acceptance
- Sign In (email/password + social), Forgot Password
- OTP verification (4-digit, resend code)
- New/Reset Password
- Location permission (allow / enter manually) with map + search + "use current location"
- Notification permission (allow / maybe later)
- Complete Profile (name, phone, gender, avatar)

### 6.2 Home & Discovery
- Home feed: location selector, search bar (with barcode/scan icon), notification bell
- Special Offers carousel (claimable deal cards)
- Shop by Category chips (T-Shirt, Jacket, Dress, Coat, Handbag, …)
- Best Seller Product grid ("See All")
- Flash Sale listing (discount badges, ratings)
- Full Special Offers listing page

### 6.3 Search & Filter
- Search screen: recent searches (removable chips), recently viewed items
- Search results grid with live result count
- Filter screen: category, size, price range slider, color swatches, rating filter, reset/apply

### 6.4 Product & Reviews
- Product Detail: image gallery/thumbnails, wishlist heart, share, seller card (chat + call), size selector, color selector, price, Add to Cart
- Virtual try-on / AR fitting-room view (camera-style garment preview with a scrub slider) — **stretch feature**
- Reviews screen: aggregate rating + histogram, review search, filter chips (Verified/Latest/Detailed), review list
- Leave Review: star rating, text, add photo, submit

### 6.5 Wishlist & Cart
- My Wishlist: category-tab filtering, grid with hearts
- My Cart: quantity stepper, swipe-to-delete, promo code field, price breakdown (subtotal, delivery, tax, discount, total)
- Remove-from-cart confirmation modal

### 6.6 Checkout & Payments
- Checkout: shipping address (selected + change), shipping type (selected + change), order list, continue to payment
- Choose Shipping Type: Economy / Cargo / Express (price + ETA)
- Shipping Address list (Home/Office/Parent's House/Friend's House) + Add New Address (map pin, address type tag, floor, landmark)
- Review Summary (products, date/time, shipping address, proceed to checkout)
- Payment Methods: Cash, Wallet, Credit/Debit Card, PayPal, Apple Pay, Google Pay
- Add Card (card preview UI, holder name, number, expiry, CVV, save card)
- Payment Successful confirmation
- E-Receipt (barcode, order details, transaction ID, downloadable)

### 6.7 Orders & Tracking
- My Orders: Active / Completed / Cancelled tabs + search
  - Active → Cancel / Track Order
  - Completed → Leave Review / View E-Receipt
  - Cancelled → Re-Order
- Track Order: order status timeline (Placed → In Progress → On the Way), expected delivery date
- Track Live Location: map with delivery agent + destination markers and route
- Delivery contact card: agent name/photo, ETA, chat & call shortcuts

### 6.8 Chat & Communication
- Chat list: online-status avatars, All/Unread tabs, unread counts
- 1:1 conversation: text, image, voice-note (waveform) messages
- Voice call screen (in-call controls)
- Video call screen (PiP self-view + controls)

### 6.9 Profile & Account
- Profile home: avatar + menu (Your Profile, Manage Address, Payment Methods, My Orders, My Coupons, My Wallet, Settings)
- Edit Profile: name, email (change), phone, DOB, gender
- Manage Address (list + edit)
- My Coupons: progress-to-unlock copy, "Copy Code"
- My Wallet: balance, Add Money, grouped transaction history (credits/debits), Top-Up Successful confirmation
- Settings: Notification Settings, Password Manager (change password), Delete Account
- Help Center: search, FAQ (categorized accordion) / Contact Us tabs
- Privacy Policy / Terms & Conditions (static content)

### 6.10 Global
- Persistent bottom nav: Home, Cart/Bag, Wishlist, Chat, Profile
- Notifications screen (grouped Today/Yesterday, mark-all-as-read)

## 7. MVP Scope (Phase 1 target — see phases.md for full breakdown)
**In:** Auth (email/password + OTP), onboarding, home + categories + search + filter, product detail, cart, wishlist, checkout (address + shipping + payment methods incl. wallet/cash/card), order placement, order list + tracking (status timeline, not live GPS), profile + address management, reviews (read + write), basic notifications, static Help Center/Privacy Policy.

**Deferred to later phases:** Wallet top-up + transaction ledger, coupons engine, live GPS order tracking, in-app chat, voice/video calling, social login (Google/Apple/FB), AR try-on.

## 8. Out of Scope (for this build)
- Seller-side / admin app (sellers are represented as static data, not a separate client)
- Real payment gateway integration (Stripe/Razorpay simulated with mock success responses)
- Real AR body-tracking try-on (visually mocked only if attempted)
- Multi-language / RTL support

## 9. Assumptions
- Single currency (INR), single region pricing initially
- Delivery/fulfillment is simulated (no real courier API integration)
- "Manager"/seller shown in chat is a single support entity per store, not multi-vendor marketplace logic

## 10. Non-Functional Requirements
- App must be usable on mid-range Android + iOS via Expo
- API responses < 500ms for catalog/browse endpoints (mocked/local DB)
- JWT-based auth with refresh tokens
- All sensitive data (passwords, tokens) never stored in plain text or client logs
- Deployed backend must run on Render free/starter tier within memory limits