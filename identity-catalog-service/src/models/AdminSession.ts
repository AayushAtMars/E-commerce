import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminSession extends Document {
  adminId: mongoose.Types.ObjectId;
  userAgent: string;
  ipAddress: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSessionSchema = new Schema<IAdminSession>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    userAgent: { type: String, default: 'Unknown Device' },
    ipAddress: { type: String, default: 'Unknown IP' },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Index for automatically cleaning up expired sessions (TTL index)
AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster queries when checking session validity
AdminSessionSchema.index({ _id: 1, isActive: 1 });

export const AdminSession = mongoose.model<IAdminSession>('AdminSession', AdminSessionSchema);
