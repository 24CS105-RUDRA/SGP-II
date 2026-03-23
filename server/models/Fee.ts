import { Schema, model, Document, Types } from 'mongoose';

export interface IFee extends Document {
  studentId: Types.ObjectId;
  amountDue: number;
  amountPaid: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'online';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feeSchema = new Schema<IFee>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    amountDue: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: Date,
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'check', 'bank_transfer', 'online'],
    },
    remarks: String,
  },
  { timestamps: true }
);

feeSchema.index({ studentId: 1 });
feeSchema.index({ status: 1 });

export const Fee = model<IFee>('Fee', feeSchema);
