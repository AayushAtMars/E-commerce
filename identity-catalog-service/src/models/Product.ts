import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  colors: string[];
  sizes: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  sellerName: string;
  sellerAvatar?: string;
  sellerRole?: string;
  isFlashSale: boolean;
  isBestSeller: boolean;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    colors: [{ type: String }],
    sizes: [{ type: String }],
    images: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    sellerName: { type: String, required: true },
    sellerAvatar: { type: String },
    sellerRole: { type: String, default: 'Fashion Seller' },
    isFlashSale: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    stock: { type: Number, default: 100, min: 0 },
  },
  { timestamps: true }
);

// Text search index on title + description
ProductSchema.index({ title: 'text', description: 'text', category: 'text' });

ProductSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.__v = undefined;
    return ret;
  },
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
