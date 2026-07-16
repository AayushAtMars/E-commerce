import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'Placed' | 'In Progress' | 'On the Way' | 'Delivered' | 'Cancelled';
export type ShippingType = 'Economy' | 'Cargo' | 'Express';
export type PaymentMethod = 'Cash' | 'Wallet' | 'Credit Card' | 'PayPal' | 'Apple Pay' | 'Google Pay' | 'UPI' | 'Credit/Debit Card' | 'Netbanking' | 'Cash on Delivery';

export interface IOrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface IOrderAddress {
  label: string;
  line1: string;
  floor?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface IDeliveryAgent {
  _id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicle: string;
  rating: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IOrderAddress;
  shippingType: ShippingType;
  shippingCost: number;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: Date; note?: string }[];
  estimatedDelivery?: Date;
  deliveryAgent?: IDeliveryAgent;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    size: { type: String, default: '' },
    color: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AddressSnapshotSchema = new Schema<IOrderAddress>(
  {
    label: { type: String, required: true },
    line1: { type: String, required: true },
    floor: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [OrderItemSchema],
    shippingAddress: { type: AddressSnapshotSchema, required: true },
    shippingType: {
      type: String,
      enum: ['Economy', 'Cargo', 'Express'],
      required: true,
    },
    shippingCost: { type: Number, required: true, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Wallet', 'Credit Card', 'PayPal', 'Apple Pay', 'Google Pay', 'UPI', 'Credit/Debit Card', 'Netbanking', 'Cash on Delivery'],
      required: true,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    promoCode: { type: String },
    status: {
      type: String,
      enum: ['Placed', 'In Progress', 'On the Way', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
        _id: false,
      },
    ],
    estimatedDelivery: { type: Date },
    deliveryAgent: {
      _id: { type: String },
      name: { type: String },
      phone: { type: String },
      avatar: { type: String },
      vehicle: { type: String },
      rating: { type: Number },
    },
  },
  { timestamps: true }
);

OrderSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => { ret.__v = undefined; return ret; },
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
