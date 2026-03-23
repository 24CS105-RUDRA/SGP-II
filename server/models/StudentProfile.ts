import { Schema, model, Document, Types } from 'mongoose';

export interface IStudentProfile extends Document {
  userId: Types.ObjectId;
  rollNumber: string;
  class: string;
  division: string;
  dateOfBirth?: Date;
  parentContact?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    division: {
      type: String,
      required: true,
    },
    dateOfBirth: Date,
    parentContact: String,
    address: String,
  },
  { timestamps: true }
);

studentProfileSchema.index({ rollNumber: 1, class: 1, division: 1 }, { unique: true });
studentProfileSchema.index({ userId: 1 });

export const StudentProfile = model<IStudentProfile>('StudentProfile', studentProfileSchema);
