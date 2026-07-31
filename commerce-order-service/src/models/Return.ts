import mongoose, { Schema, Document } from 'mongoose';

export type ReturnStatus = 'Requested' | 'Approved' | 'Rejected' | 'Completed';
export type ReturnType = 'Refund' | 'Replacement';

export interface IReturnItem {
  productId: string;
  quantity: number;
  reason: string;
}

export interface IReturn extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: IReturnItem[];
  status: ReturnStatus;
  type: ReturnType;
  note?: string; // admin note
  statusHistory: Array<{
    status: ReturnStatus;
    timestamp: Date;
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnSchema = new Schema<IReturn>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    items: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        reason: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['Requested', 'Approved', 'Rejected', 'Completed'],
      default: 'Requested',
    },
    type: { type: String, enum: ['Refund', 'Replacement'], required: true },
    note: { type: String },
    statusHistory: [
      {
        status: { type: String, enum: ['Requested', 'Approved', 'Rejected', 'Completed'] },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

ReturnSchema.pre('save', function () {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: this.note,
    });
  }
});

export const Return = mongoose.model<IReturn>('Return', ReturnSchema);
