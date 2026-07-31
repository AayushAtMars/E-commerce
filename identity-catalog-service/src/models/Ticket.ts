import mongoose, { Schema, Document } from 'mongoose';

export type TicketCategory = 'Order Issue' | 'Product Issue' | 'Payment' | 'Other';
export type TicketPriority = 'Low' | 'Medium' | 'High';
export type TicketStatus = 'Open' | 'In Progress' | 'Escalated' | 'Resolved' | 'Closed';

export interface ITicketMessage {
  text: string;
  isAdmin: boolean;
  senderName: string;
  createdAt: Date;
}

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  orderId?: string; // Optional order reference
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  messages: ITicketMessage[];
  slaDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TicketMessageSchema = new Schema<ITicketMessage>(
  {
    text: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    senderName: { type: String, required: true },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const TicketSchema = new Schema<ITicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: String },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ['Order Issue', 'Product Issue', 'Payment', 'Other'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'],
      default: 'Open',
    },
    messages: [TicketMessageSchema],
    slaDeadline: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
