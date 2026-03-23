import { Schema, model, Document, Types } from 'mongoose';

export interface IHomework extends Document {
  facultyId: Types.ObjectId;
  standard: string;
  division: string;
  subject: string;
  title: string;
  description: string;
  dueDate: Date;
  assignedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const homeworkSchema = new Schema<IHomework>(
  {
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: 'FacultyProfile',
      required: true,
    },
    standard: {
      type: String,
      required: true,
    },
    division: String,
    subject: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

homeworkSchema.index({ facultyId: 1 });
homeworkSchema.index({ standard: 1, division: 1 });

export const Homework = model<IHomework>('Homework', homeworkSchema);
