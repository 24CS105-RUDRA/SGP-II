import { Schema, model, Document, Types } from 'mongoose';

export interface IClassFacultyAssignment extends Document {
  standard: string;
  division: string;
  facultyId: Types.ObjectId;
  subject: string;
  createdAt: Date;
  updatedAt: Date;
}

const classFacultyAssignmentSchema = new Schema<IClassFacultyAssignment>(
  {
    standard: {
      type: String,
      required: true,
    },
    division: {
      type: String,
      required: true,
    },
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: 'FacultyProfile',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

classFacultyAssignmentSchema.index(
  { standard: 1, division: 1, facultyId: 1, subject: 1 },
  { unique: true }
);
classFacultyAssignmentSchema.index({ standard: 1, division: 1 });

export const ClassFacultyAssignment = model<IClassFacultyAssignment>(
  'ClassFacultyAssignment',
  classFacultyAssignmentSchema
);
