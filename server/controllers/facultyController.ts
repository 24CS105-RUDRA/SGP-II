import { Request, Response } from 'express';
import { User, FacultyProfile } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse, pagingResponse } from '../utils/response.js';

export const getAllFaculty = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const faculty = await FacultyProfile.find()
    .populate('userId', 'name email mobileNumber')
    .skip(skip)
    .limit(limit);

  const total = await FacultyProfile.countDocuments();

  res.json(pagingResponse(faculty, total, page, limit, 'Faculty fetched successfully'));
};

export const getFacultyById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const faculty = await FacultyProfile.findOne({ userId: id }).populate(
    'userId',
    'name email mobileNumber'
  );

  if (!faculty) {
    throw new AppError(404, 'Faculty not found');
  }

  res.json(successResponse(faculty, 'Faculty details fetched successfully'));
};

export const getFacultyByEmployeeId = async (req: Request, res: Response) => {
  const { employeeId } = req.params;

  const faculty = await FacultyProfile.findOne({ employeeId }).populate(
    'userId',
    'name email mobileNumber'
  );

  if (!faculty) {
    throw new AppError(404, 'Faculty not found');
  }

  res.json(successResponse(faculty, 'Faculty details fetched successfully'));
};

export const createFaculty = async (req: Request, res: Response) => {
  const { userId, employeeId, subject, department, assignedClasses } = req.body;

  const existingFaculty = await FacultyProfile.findOne({ employeeId });

  if (existingFaculty) {
    throw new AppError(400, 'Faculty with this employee ID already exists');
  }

  const faculty = await FacultyProfile.create({
    userId,
    employeeId,
    subject,
    department,
    assignedClasses,
  });

  res.status(201).json(successResponse(faculty, 'Faculty created successfully', 201));
};

export const updateFaculty = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const faculty = await FacultyProfile.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate('userId', 'name email mobileNumber');

  if (!faculty) {
    throw new AppError(404, 'Faculty not found');
  }

  res.json(successResponse(faculty, 'Faculty updated successfully'));
};

export const deleteFaculty = async (req: Request, res: Response) => {
  const { id } = req.params;

  const faculty = await FacultyProfile.findOneAndDelete({ userId: id });

  if (!faculty) {
    throw new AppError(404, 'Faculty not found');
  }

  // Delete associated user
  await User.deleteOne({ _id: id });

  res.json(successResponse({}, 'Faculty deleted successfully'));
};

export const getFacultyAssignedClasses = async (req: Request, res: Response) => {
  const { id } = req.params;

  const faculty = await FacultyProfile.findOne({ userId: id });

  if (!faculty) {
    throw new AppError(404, 'Faculty not found');
  }

  res.json(
    successResponse(faculty.assignedClasses, 'Assigned classes fetched successfully')
  );
};

export const updateFacultyAssignments = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { assignedClasses } = req.body;

  const faculty = await FacultyProfile.findOneAndUpdate(
    { userId: id },
    { assignedClasses },
    { new: true }
  );

  if (!faculty) {
    throw new AppError(404, 'Faculty not found');
  }

  res.json(successResponse(faculty, 'Assignments updated successfully'));
};
