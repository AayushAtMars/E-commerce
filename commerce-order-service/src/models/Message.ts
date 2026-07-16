import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId; // User or Partner ID
  senderType: 'user' | 'partner';
  type: 'text' | 'image' | 'voice';
  text?: string;
  imageUrl?: string;
  duration?: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderType: { type: String, enum: ['user', 'partner'], required: true },
    type: { type: String, enum: ['text', 'image', 'voice'], default: 'text' },
    text: { type: String },
    imageUrl: { type: String },
    duration: { type: String },
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
