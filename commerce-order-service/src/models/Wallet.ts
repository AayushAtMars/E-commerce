import mongoose, { Schema, Document } from 'mongoose';

export type TransactionType = 'credit' | 'debit';
export type TransactionSource = 'top_up' | 'order_payment' | 'refund' | 'cashback' | 'admin';

export interface ITransaction {
  type: TransactionType;
  amount: number;
  source: TransactionSource;
  description: string;
  orderId?: string;
  createdAt: Date;
}

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true, min: 0 },
    source: {
      type: String,
      enum: ['top_up', 'order_payment', 'refund', 'cashback', 'admin'],
      required: true,
    },
    description: { type: String, required: true },
    orderId: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, unique: true, index: true },
    balance: { type: Number, default: 0, min: 0 },
    transactions: [TransactionSchema],
  },
  { timestamps: true }
);

WalletSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => { ret.__v = undefined; return ret; },
});

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
