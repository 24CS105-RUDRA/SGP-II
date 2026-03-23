import { Request, Response } from 'express';
import { Announcement } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse, pagingResponse } from '../utils/response.js';

export const createAnnouncement = async (req: Request, res: Response) => {
  const { title, description, type, priority, targetAudience, isPublished } = req.body;
  const userId = req.user?.userId;

  const announcement = await Announcement.create({
    title,
    description,
    type,
    priority,
    createdBy: userId,
    targetAudience,
    isPublished,
    publishedAt: isPublished ? new Date() : undefined,
  });

  res.status(201).json(successResponse(announcement, 'Announcement created successfully', 201));
};

export const getAllAnnouncements = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const { type, isPublished } = req.query;

  let query: any = {};

  if (type) {
    query.type = type;
  }

  if (isPublished !== undefined) {
    query.isPublished = isPublished === 'true';
  }

  const announcements = await Announcement.find(query)
    .populate('createdBy', 'name role')
    .skip(skip)
    .limit(limit)
    .sort({ publishedAt: -1, createdAt: -1 });

  const total = await Announcement.countDocuments(query);

  res.json(
    pagingResponse(announcements, total, page, limit, 'Announcements fetched successfully')
  );
};

export const getAnnouncementById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const announcement = await Announcement.findById(id).populate('createdBy', 'name role');

  if (!announcement) {
    throw new AppError(404, 'Announcement not found');
  }

  res.json(successResponse(announcement, 'Announcement fetched successfully'));
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, type, priority, targetAudience, isPublished } = req.body;

  const announcement = await Announcement.findByIdAndUpdate(
    id,
    {
      title,
      description,
      type,
      priority,
      targetAudience,
      isPublished,
      publishedAt: isPublished ? new Date() : undefined,
    },
    { new: true }
  ).populate('createdBy', 'name role');

  if (!announcement) {
    throw new AppError(404, 'Announcement not found');
  }

  res.json(successResponse(announcement, 'Announcement updated successfully'));
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  const { id } = req.params;

  const announcement = await Announcement.findByIdAndDelete(id);

  if (!announcement) {
    throw new AppError(404, 'Announcement not found');
  }

  res.json(successResponse({}, 'Announcement deleted successfully'));
};

export const publishAnnouncement = async (req: Request, res: Response) => {
  const { id } = req.params;

  const announcement = await Announcement.findByIdAndUpdate(
    id,
    {
      isPublished: true,
      publishedAt: new Date(),
    },
    { new: true }
  ).populate('createdBy', 'name role');

  if (!announcement) {
    throw new AppError(404, 'Announcement not found');
  }

  res.json(successResponse(announcement, 'Announcement published successfully'));
};

export const getAnnouncementsByAudience = async (req: Request, res: Response) => {
  const { audience } = req.query;

  if (!audience) {
    throw new AppError(400, 'Audience parameter is required');
  }

  const announcements = await Announcement.find({
    isPublished: true,
    targetAudience: { $in: [audience, 'all'] },
  })
    .populate('createdBy', 'name role')
    .sort({ publishedAt: -1 });

  res.json(successResponse(announcements, 'Announcements fetched successfully'));
};
