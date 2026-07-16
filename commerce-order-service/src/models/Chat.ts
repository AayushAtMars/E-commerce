import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  partnerId: mongoose.Types.ObjectId;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    partnerId: { type: Schema.Types.ObjectId, ref: 'DeliveryPartner', required: true },
    lastMessage: { type: String, default: '' },
    lastMessageTime: { type: Date, default: Date.now },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Ensure unique chat between a user and a delivery partner
ChatSchema.index({ userId: 1, partnerId: 1 }, { unique: true });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
