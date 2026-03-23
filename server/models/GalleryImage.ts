import { Schema, model, Document, Types } from 'mongoose';

export interface IGalleryImage extends Document {
  eventId: Types.ObjectId;
  imageUrl: string;
  caption?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const galleryImageSchema = new Schema<IGalleryImage>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'GalleryEvent',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

galleryImageSchema.index({ eventId: 1 });

export const GalleryImage = model<IGalleryImage>('GalleryImage', galleryImageSchema);
