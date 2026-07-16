import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryPartner extends Document {
  name: string;
  phone: string;
  avatar: string;
  vehicle: string;
  rating: number;
  isActive: boolean;
  ordersCount: number; // how many orders assigned (used for round-robin)
}

const DeliveryPartnerSchema = new Schema<IDeliveryPartner>(
  {
    name:        { type: String, required: true },
    phone:       { type: String, required: true },
    avatar:      { type: String, required: true },
    vehicle:     { type: String, required: true },
    rating:      { type: Number, required: true, min: 1, max: 5 },
    isActive:    { type: Boolean, default: true },
    ordersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DeliveryPartner = mongoose.model<IDeliveryPartner>('DeliveryPartner', DeliveryPartnerSchema);
