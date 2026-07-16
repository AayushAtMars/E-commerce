// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  avatarUrl?: string;
  authProvider: 'local' | 'google' | 'apple' | 'facebook';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── Address ──────────────────────────────────────────────────────────────────

export interface Address {
  _id: string;
  userId: string;
  label: 'Home' | 'Office' | "Parent's House" | "Friend's House";
  line1: string;
  floor?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'T-Shirt'
  | 'Jacket'
  | 'Dress'
  | 'Coat'
  | 'Handbag'
  | 'Pant'
  | 'Shirt'
  | 'Sweater';

export interface Product {
  _id: string;
  title: string;
  category: ProductCategory;
  price: number;
  discountPrice?: number;
  colors: string[];
  sizes: ('S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL')[];
  images: string[];
  rating: number;
  reviewCount: number;
  sellerName: string;
  sellerAvatar?: string;
  isFlashSale?: boolean;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
  productId: string;
  product: Product;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  photos?: string[];
  createdAt: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  product: Product;
  qty: number;
  priceSnapshot: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  promoCode?: string;
  discount?: number;
}

// ─── Checkout & Payment ───────────────────────────────────────────────────────

export type ShippingType = 'Economy' | 'Cargo' | 'Express';
export type PaymentMethodType = 'Cash' | 'Wallet' | 'Card' | 'PayPal' | 'ApplePay' | 'GooglePay';

export interface ShippingOption {
  type: ShippingType;
  price: number;
  etaDays: number;
  etaDate: string;
}

export interface PaymentMethod {
  _id: string;
  userId: string;
  type: PaymentMethodType;
  cardLast4?: string;
  cardHolderName?: string;
  provider?: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'Placed' | 'In Progress' | 'On the Way' | 'Delivered' | 'Cancelled';

export interface OrderStatusEntry {
  status: OrderStatus;
  timestamp: string;
}

export interface OrderTotals {
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  discount: number;
  total: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: CartItem[];
  addressSnapshot: Address;
  shippingType: ShippingType;
  status: OrderStatus;
  statusHistory: OrderStatusEntry[];
  paymentMethod: PaymentMethodType;
  totals: OrderTotals;
  createdAt: string;
  expectedDelivery?: string;
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
