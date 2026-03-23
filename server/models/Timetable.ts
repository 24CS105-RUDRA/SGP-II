import { Schema, model, Document, Types } from 'mongoose';

export interface ITimetable extends Document {
  facultyId: Types.ObjectId;
  standard: string;
  division: string;
  subject: string;
  day: string;
  timeSlot: string;
  createdAt: Date;
  updatedAt: Date;
}

const timetableSchema = new Schema<ITimetable>(
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
    division: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

timetableSchema.index({ facultyId: 1 });
timetableSchema.index({ standard: 1, division: 1, day: 1 });

export const Timetable = model<ITimetable>('Timetable', timetableSchema);
