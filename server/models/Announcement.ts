import { Schema, model, Document, Types } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  type: 'general' | 'academic' | 'event' | 'emergency';
  priority: 'low' | 'normal' | 'high';
  createdBy: Types.ObjectId;
  targetAudience: ('student' | 'faculty' | 'admin' | 'all')[];
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
    },
    type: {
      type: String,
      enum: ['general', 'academic', 'event', 'emergency'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetAudience: [
      {
        type: String,
        enum: ['student', 'faculty', 'admin', 'all'],
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
  },
  { timestamps: true }
);

announcementSchema.index({ createdBy: 1 });
announcementSchema.index({ isPublished: 1 });
announcementSchema.index({ type: 1 });

export const Announcement = model<IAnnouncement>('Announcement', announcementSchema);
