import { Request, Response } from 'express';
import { GalleryEvent, GalleryImage } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse, pagingResponse } from '../utils/response.js';

export const createGalleryEvent = async (req: Request, res: Response) => {
  const { title, description, eventDate, location } = req.body;
  const userId = req.user?.userId;

  const event = await GalleryEvent.create({
    title,
    description,
    eventDate: new Date(eventDate),
    location,
    createdBy: userId,
  });

  res.status(201).json(successResponse(event, 'Gallery event created successfully', 201));
};

export const getGalleryEvents = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const events = await GalleryEvent.find()
    .populate('createdBy', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ eventDate: -1 });

  const total = await GalleryEvent.countDocuments();

  res.json(pagingResponse(events, total, page, limit, 'Gallery events fetched successfully'));
};

export const getGalleryEventById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const event = await GalleryEvent.findById(id).populate('createdBy', 'name');

  if (!event) {
    throw new AppError(404, 'Gallery event not found');
  }

  const images = await GalleryImage.find({ eventId: id });

  res.json(
    successResponse({ event, images }, 'Gallery event details fetched successfully')
  );
};

export const updateGalleryEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, eventDate, location } = req.body;

  const event = await GalleryEvent.findByIdAndUpdate(
    id,
    { title, description, eventDate: new Date(eventDate), location },
    { new: true }
  ).populate('createdBy', 'name');

  if (!event) {
    throw new AppError(404, 'Gallery event not found');
  }

  res.json(successResponse(event, 'Gallery event updated successfully'));
};

export const deleteGalleryEvent = async (req: Request, res: Response) => {
  const { id } = req.params;

  const event = await GalleryEvent.findByIdAndDelete(id);

  if (!event) {
    throw new AppError(404, 'Gallery event not found');
  }

  // Delete all images for this event
  await GalleryImage.deleteMany({ eventId: id });

  res.json(successResponse({}, 'Gallery event deleted successfully'));
};

export const uploadGalleryImage = async (req: Request, res: Response) => {
  const { eventId, imageUrl, caption } = req.body;

  const event = await GalleryEvent.findById(eventId);

  if (!event) {
    throw new AppError(404, 'Gallery event not found');
  }

  const image = await GalleryImage.create({
    eventId,
    imageUrl,
    caption,
  });

  res.status(201).json(successResponse(image, 'Image uploaded successfully', 201));
};

export const getEventImages = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  const images = await GalleryImage.find({ eventId }).sort({ uploadedAt: -1 });

  res.json(successResponse(images, 'Event images fetched successfully'));
};

export const deleteGalleryImage = async (req: Request, res: Response) => {
  const { id } = req.params;

  const image = await GalleryImage.findByIdAndDelete(id);

  if (!image) {
    throw new AppError(404, 'Image not found');
  }

  res.json(successResponse({}, 'Image deleted successfully'));
};

export const updateGalleryImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { caption } = req.body;

  const image = await GalleryImage.findByIdAndUpdate(id, { caption }, { new: true });

  if (!image) {
    throw new AppError(404, 'Image not found');
  }

  res.json(successResponse(image, 'Image updated successfully'));
};
