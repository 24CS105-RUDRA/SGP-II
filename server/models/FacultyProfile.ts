import { Schema, model, Document, Types } from 'mongoose';

interface AssignedClass {
  standard: string;
  division: string;
}

export interface IFacultyProfile extends Document {
  userId: Types.ObjectId;
  employeeId: string;
  subject: string;
  department: string;
  assignedClasses: AssignedClass[];
  createdAt: Date;
  updatedAt: Date;
}

const facultyProfileSchema = new Schema<IFacultyProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    assignedClasses: [
      {
        standard: String,
        division: String,
      },
    ],
  },
  { timestamps: true }
);

facultyProfileSchema.index({ userId: 1 });
facultyProfileSchema.index({ employeeId: 1 });

export const FacultyProfile = model<IFacultyProfile>('FacultyProfile', facultyProfileSchema);
