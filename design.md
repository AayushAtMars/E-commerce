# Design System — Fashion Store

Extracted from the Behance case study's style guide + observed patterns across all screens.

## 1. Colors
| Token | Hex | Usage |
|---|---|---|
| `primary` (Deep Brown) | `#401900` | Primary buttons, header/hero backgrounds, active nav icon bg, price/brand accents |
| `accent` (Orange) | `#F8B057` | Icons (location, notification bell, badges), highlights, star ratings alt state |
| `textPrimary` | `#242424` | Headings, primary body text |
| `textSecondary` | `#797979` | Secondary/meta text, placeholders, timestamps |
| `borderLight` | `#E0E0E0` | Input borders, dividers, disabled chip bg |
| `background` | `#F6F6F6` | Screen background |
| `white` | `#FFFFFF` | Cards, sheets, modals |
| `success` | `#2E9E5B` *(observed in Completed Order / green badges)* | Completed status, success text |
| `danger` | `#E14B4B` *(observed in Cancel/Remove actions)* | Cancel/remove/error states |
| `star` | `#F8B057` | Rating stars |

> Note: success/danger exact hex should be re-sampled from the Behance file with an eyedropper if pixel-perfect accuracy is required; values above are close visual approximations.

## 2. Typography
- **Font family:** Inter (all weights)
- **Scale (suggested, based on visual hierarchy observed):**
  | Style | Size | Weight | Usage |
  |---|---|---|---|
  | H1 | 24–28px | Bold | Onboarding headlines, screen hero titles |
  | H2 | 20px | Semibold | Section titles ("Special Offers", "Best Seller Product") |
  | H3 / Screen title | 18px | Semibold | Header titles (e.g. "Settings", "My Wallet") |
  | Body | 14px | Regular | Descriptions, list item text |
  | Small / Meta | 12px | Regular | Timestamps, secondary labels |
  | Button text | 16px | Semibold | All CTA buttons |

## 3. Spacing Scale
`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40` px — use a `spacing.ts` token file (`xs=4, sm=8, md=16, lg=24, xl=32, xxl=40`). Screen horizontal padding is consistently ~20px across observed screens.

## 4. Component Inventory
| Component | Notes |
|---|---|
| Primary Button | Full-width, deep-brown fill, white text, large rounded corners (~28px radius / pill-ish), used for every main CTA (Sign In, Sign Up, Continue, Add to Cart, Confirm Payment) |
| Secondary/Outline Button | White bg, light border, dark text (e.g. "Cancel" in Remove-from-Cart modal) |
| Text Input | Light gray/white bg, subtle border, rounded corners, label above field |
| Chip / Filter Pill | Rounded pill, deep-brown when active, light-gray when inactive (categories, FAQ tabs, size selectors) |
| Product Card | Image (rounded corners), heart icon top-right, title, star rating, price (with strikethrough original price when discounted) |
| Bottom Tab Bar | Dark (near-black/brown) rounded floating bar, 5 icons: Home, Bag, Wishlist(heart), Chat, Profile — active icon in white circle |
| Status Badge | Pill badge: orange/amber = Active, green = Completed, red = Cancelled |
| Order Status Timeline | Vertical stepper with filled circles + connecting line, icon per step |
| Modal / Bottom Sheet | White rounded-top sheet, drag handle bar, used for confirmations (Remove from Cart) |
| Avatar | Circular, with small edit-pencil badge on profile screens |
| Rating Stars | 5-star row, filled orange stars, used in product cards, review screens, "Leave Review" |
| Search Bar | Rounded, icon-left (magnifier), optional icon-right (scan/filter) |
| Card/List Row | White rounded card on `background` gray screen bg — used pervasively (orders, addresses, coupons, wallet transactions) |

## 5. Iconography
- Line-style icons throughout (outline, not filled) except: filled heart (wishlist "liked" state), filled star (ratings).
- Icon-in-circle pattern for list rows (Settings, Profile menu, Help Center categories) — light gray circle bg, icon in `textPrimary` or `accent`.

## 6. Screen-Level Layout Patterns
- **List/menu screens** (Profile, Settings, Help Center): back-chevron + centered title header, then vertical list of rounded white rows with a right chevron.
- **Grid screens** (Best Seller, Search Results, Wishlist, Flash Sale): 2-column product grid, consistent card component.
- **Form screens** (Add Address, Add Card, Edit Profile): label-above-input stacked fields, primary button pinned at bottom.
- **Confirmation screens** (Payment Successful, Top-Up Successful): centered badge/checkmark icon, headline, subtext, single primary button.
- **Detail screens with map** (Track Order, Track Live Location, Delivery courier card): map fills top ~50–60%, info card sheet below/overlapping.

## 7. Accessibility Notes
- Deep-brown-on-white and white-on-deep-brown both pass WCAG AA for body text — safe to use as primary contrast pair.
- Orange (`#F8B057`) on white is borderline for small text — reserve orange for icons/large text/badges, not small body copy.
- Maintain minimum 44x44px tap targets for icon buttons (nav icons, back chevrons) even where the visual icon is smaller.

## 8. Assets Checklist to Export from Behance
- App logo mark (hanger icon) — SVG
- Onboarding illustration/photo crops (3)
- Category icons (T-Shirt, Jacket, Dress, Coat, Handbag, …)
- Empty-state illustrations (empty cart, empty wishlist, empty orders — not shown in provided screens, will need to be designed to match style if not present in source file)
