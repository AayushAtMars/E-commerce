import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  adminId: string;
  adminName: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: String, required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
