import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreSettings extends Document {
  maintenanceMode: boolean;
  minimumOrderValue: number;
  storeContactEmail: string;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    maintenanceMode: { type: Boolean, default: false },
    minimumOrderValue: { type: Number, default: 0 },
    storeContactEmail: { type: String, default: 'support@fashionstore.com' },
  },
  { timestamps: true }
);

export const StoreSettings = mongoose.model<IStoreSettings>('StoreSettings', StoreSettingsSchema);
