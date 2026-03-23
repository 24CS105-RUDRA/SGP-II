import { Request, Response } from 'express';
import { StudyMaterial } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse, pagingResponse } from '../utils/response.js';

export const uploadStudyMaterial = async (req: Request, res: Response) => {
  const { standard, division, subject, title, description, fileUrl, fileName, fileSize } =
    req.body;
  const userId = req.user?.userId;

  const material = await StudyMaterial.create({
    facultyId: userId,
    standard,
    division,
    subject,
    title,
    description,
    fileUrl,
    fileName,
    fileSize,
  });

  res.status(201).json(
    successResponse(material, 'Study material uploaded successfully', 201)
  );
};

export const getStudyMaterials = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const { standard, division, subject } = req.query;

  let query: any = {};

  if (standard) query.standard = standard;
  if (division) query.division = division;
  if (subject) query.subject = subject;

  const materials = await StudyMaterial.find(query)
    .populate('facultyId', 'subject')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await StudyMaterial.countDocuments(query);

  res.json(
    pagingResponse(materials, total, page, limit, 'Study materials fetched successfully')
  );
};

export const getStudyMaterialById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const material = await StudyMaterial.findById(id).populate('facultyId', 'subject');

  if (!material) {
    throw new AppError(404, 'Study material not found');
  }

  res.json(successResponse(material, 'Study material fetched successfully'));
};

export const updateStudyMaterial = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, subject } = req.body;

  const material = await StudyMaterial.findByIdAndUpdate(
    id,
    { title, description, subject },
    { new: true }
  ).populate('facultyId', 'subject');

  if (!material) {
    throw new AppError(404, 'Study material not found');
  }

  res.json(successResponse(material, 'Study material updated successfully'));
};

export const deleteStudyMaterial = async (req: Request, res: Response) => {
  const { id } = req.params;

  const material = await StudyMaterial.findByIdAndDelete(id);

  if (!material) {
    throw new AppError(404, 'Study material not found');
  }

  res.json(successResponse({}, 'Study material deleted successfully'));
};

export const getFacultyMaterials = async (req: Request, res: Response) => {
  const { facultyId } = req.params;

  const materials = await StudyMaterial.find({ facultyId }).sort({ createdAt: -1 });

  res.json(successResponse(materials, 'Faculty materials fetched successfully'));
};
