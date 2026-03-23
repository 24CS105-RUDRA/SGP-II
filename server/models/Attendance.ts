import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  studentId: Types.ObjectId;
  facultyId: Types.ObjectId;
  date: Date;
  subject: string;
  status: 'present' | 'absent' | 'late' | 'medical_leave';
  remarks?: string;
  markedAt: Date;
  markedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: 'FacultyProfile',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'medical_leave'],
      required: true,
    },
    remarks: String,
    markedAt: {
      type: Date,
      default: Date.now,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1, date: 1, subject: 1 }, { unique: true });
attendanceSchema.index({ studentId: 1 });
attendanceSchema.index({ date: 1 });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
