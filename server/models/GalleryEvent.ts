import { Schema, model, Document, Types } from 'mongoose';

export interface IGalleryEvent extends Document {
  title: string;
  description?: string;
  eventDate: Date;
  location?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const galleryEventSchema = new Schema<IGalleryEvent>(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    eventDate: {
      type: Date,
      required: true,
    },
    location: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

galleryEventSchema.index({ createdBy: 1 });
galleryEventSchema.index({ eventDate: 1 });

export const GalleryEvent = model<IGalleryEvent>('GalleryEvent', galleryEventSchema);
