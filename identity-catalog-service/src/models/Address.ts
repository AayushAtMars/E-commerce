import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  label: 'Home' | 'Office' | "Parent's House" | "Friend's House";
  line1: string;
  floor?: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
  createdAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: {
      type: String,
      enum: ['Home', 'Office', "Parent's House", "Friend's House"],
      required: true,
    },
    line1: { type: String, required: true, trim: true },
    floor: { type: String },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    pincode: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AddressSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.__v = undefined;
    return ret;
  },
});

export const Address = mongoose.model<IAddress>('Address', AddressSchema);
