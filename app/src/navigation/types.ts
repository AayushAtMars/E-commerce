import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  VerifyOtp: { email: string; mode: 'signup' | 'forgotPassword' };
  ForgotPassword: undefined;
  NewPassword: { email: string; otp: string };
  LocationPermission: undefined;
  NotificationPermission: undefined;
  CompleteProfile: undefined;
};

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

// ─── Main Tab Navigator ───────────────────────────────────────────────────────

export type MainTabParamList = {
  Home: undefined;
  Cart: undefined;
  Wishlist: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// ─── Home Stack (nested inside the Home tab) ──────────────────────────────────

export type HomeStackParamList = {
  HomeScreen: undefined;
  Search: undefined;
  Filter: undefined;
  ProductDetail: { productId: string };
  Reviews: { productId: string };
  LeaveReview: { orderId: string; productId: string };
  SpecialOffers: undefined;
  FlashSale: undefined;
  BestSellers: undefined;
  Notifications: undefined;
};

// ─── Cart Stack (nested inside the Cart tab) ──────────────────────────────────

export type CartStackParamList = {
  CartScreen: undefined;
  SelectAddress: undefined;
  AddAddress: { addressId?: string };
  SelectShipping: { subtotal: number; selectedAddress?: any };
  SelectPayment: { subtotal: number; shippingCost: number; shippingType: string; promoCode?: string; selectedAddress?: any };
  OrderSummary: {
    subtotal: number;
    shippingCost: number;
    shippingType: string;
    promoCode?: string;
    selectedAddress?: any;
    shippingDate?: string;
  };
  AddCard: undefined;
  PaymentSuccess: { orderId: string; orderNumber: string; total: number };
  EReceipt: { orderId: string };
};

// ─── Profile Stack (nested inside the Profile tab) ───────────────────────────

export type ProfileStackParamList = {
  ProfileHome: undefined;
  YourProfile: undefined;
  ManageAddress: undefined;
  AddAddress: { addressId?: string };
  PaymentMethods: undefined;
  AddCard: undefined;
  MyOrders: undefined;
  OrderDetail: { orderId: string };
  TrackOrder: { orderId: string };
  TrackLiveLocation: { orderId: string };
  EReceipt: { orderId: string };
  LeaveReview: { orderId: string; productId: string };
  MyCoupons: undefined;
  MyWallet: undefined;
  TopUpSuccess: { amount: number };
  Settings: undefined;
  NotificationSettings: undefined;
  PasswordManager: undefined;
  DeleteAccount: undefined;
  HelpCenter: undefined;
  TicketDetail: { ticketId: string };
  PrivacyPolicy: undefined;
};

// ─── Root Navigator ───────────────────────────────────────────────────────────

export type RootParamList = {
  Auth: undefined;
  Main: undefined;
  LocationPermission: undefined;
  NotificationPermission: undefined;
  Settings: undefined;
  HelpCenter: undefined;
  TicketDetail: { ticketId: string };
  AddAddress: { addressId?: string };
};
