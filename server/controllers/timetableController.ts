import { Request, Response } from 'express';
import { Timetable } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse } from '../utils/response.js';

export const createTimetable = async (req: Request, res: Response) => {
  const { standard, division, subject, day, timeSlot } = req.body;
  const userId = req.user?.userId;

  const timetable = await Timetable.create({
    facultyId: userId,
    standard,
    division,
    subject,
    day,
    timeSlot,
  });

  res.status(201).json(successResponse(timetable, 'Timetable entry created successfully', 201));
};

export const getTimetable = async (req: Request, res: Response) => {
  const { standard, division, day } = req.query;

  let query: any = {};

  if (standard) query.standard = standard;
  if (division) query.division = division;
  if (day) query.day = day;

  const timetable = await Timetable.find(query)
    .populate('facultyId', 'subject')
    .sort({ day: 1, timeSlot: 1 });

  res.json(successResponse(timetable, 'Timetable fetched successfully'));
};

export const getTimetableById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const timetable = await Timetable.findById(id).populate('facultyId', 'subject');

  if (!timetable) {
    throw new AppError(404, 'Timetable entry not found');
  }

  res.json(successResponse(timetable, 'Timetable entry fetched successfully'));
};

export const getFacultyTimetable = async (req: Request, res: Response) => {
  const { facultyId } = req.params;

  const timetable = await Timetable.find({ facultyId }).sort({ day: 1, timeSlot: 1 });

  res.json(successResponse(timetable, 'Faculty timetable fetched successfully'));
};

export const getClassTimetable = async (req: Request, res: Response) => {
  const { standard, division } = req.params;

  const timetable = await Timetable.find({ standard, division })
    .populate('facultyId', 'subject')
    .sort({ day: 1, timeSlot: 1 });

  res.json(successResponse(timetable, 'Class timetable fetched successfully'));
};

export const updateTimetable = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { day, timeSlot, subject } = req.body;

  const timetable = await Timetable.findByIdAndUpdate(
    id,
    { day, timeSlot, subject },
    { new: true }
  ).populate('facultyId', 'subject');

  if (!timetable) {
    throw new AppError(404, 'Timetable entry not found');
  }

  res.json(successResponse(timetable, 'Timetable updated successfully'));
};

export const deleteTimetable = async (req: Request, res: Response) => {
  const { id } = req.params;

  const timetable = await Timetable.findByIdAndDelete(id);

  if (!timetable) {
    throw new AppError(404, 'Timetable entry not found');
  }

  res.json(successResponse({}, 'Timetable entry deleted successfully'));
};

export const deleteClassTimetable = async (req: Request, res: Response) => {
  const { standard, division } = req.params;

  const result = await Timetable.deleteMany({ standard, division });

  res.json(
    successResponse(
      { deletedCount: result.deletedCount },
      'Class timetable deleted successfully'
    )
  );
};
