import { Schema, model, Document, Types } from 'mongoose';

export interface IHomeworkSubmission extends Document {
  homeworkId: Types.ObjectId;
  studentId: Types.ObjectId;
  submissionDate: Date;
  status: 'not_submitted' | 'submitted' | 'evaluated';
  grade?: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const homeworkSubmissionSchema = new Schema<IHomeworkSubmission>(
  {
    homeworkId: {
      type: Schema.Types.ObjectId,
      ref: 'Homework',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['not_submitted', 'submitted', 'evaluated'],
      default: 'not_submitted',
    },
    grade: Number,
    remarks: String,
  },
  { timestamps: true }
);

homeworkSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });
homeworkSubmissionSchema.index({ studentId: 1 });

export const HomeworkSubmission = model<IHomeworkSubmission>(
  'HomeworkSubmission',
  homeworkSubmissionSchema
);
