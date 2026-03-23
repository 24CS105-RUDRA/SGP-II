import { Schema, model, Document, Types } from 'mongoose';

export interface IStudyMaterial extends Document {
  facultyId: Types.ObjectId;
  standard: string;
  division?: string;
  subject: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

const studyMaterialSchema = new Schema<IStudyMaterial>(
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
    description: String,
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

studyMaterialSchema.index({ facultyId: 1 });
studyMaterialSchema.index({ standard: 1 });

export const StudyMaterial = model<IStudyMaterial>('StudyMaterial', studyMaterialSchema);
