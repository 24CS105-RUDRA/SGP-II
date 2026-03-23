import { Request, Response } from 'express';
import { User, StudentProfile, Attendance } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse, pagingResponse } from '../utils/response.js';

export const getAllStudents = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const students = await StudentProfile.find()
    .populate('userId', 'name email mobileNumber')
    .skip(skip)
    .limit(limit);

  const total = await StudentProfile.countDocuments();

  res.json(pagingResponse(students, total, page, limit, 'Students fetched successfully'));
};

export const getStudentById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const student = await StudentProfile.findById(id).populate(
    'userId',
    'name email mobileNumber'
  );

  if (!student) {
    throw new AppError(404, 'Student not found');
  }

  const attendance = await Attendance.find({ studentId: id });

  res.json(
    successResponse(
      { student, attendance },
      'Student details fetched successfully'
    )
  );
};

export const getStudentsByClass = async (req: Request, res: Response) => {
  const { standard, division } = req.query;

  if (!standard || !division) {
    throw new AppError(400, 'Standard and division are required');
  }

  const students = await StudentProfile.find({
    class: standard,
    division,
  }).populate('userId', 'name email mobileNumber');

  res.json(
    successResponse(students, 'Students fetched successfully')
  );
};

export const createStudent = async (req: Request, res: Response) => {
  const { userId, rollNumber, class: classVal, division, dateOfBirth, parentContact, address } =
    req.body;

  const existingStudent = await StudentProfile.findOne({
    rollNumber,
    class: classVal,
    division,
  });

  if (existingStudent) {
    throw new AppError(400, 'Student with this roll number already exists');
  }

  const student = await StudentProfile.create({
    userId,
    rollNumber,
    class: classVal,
    division,
    dateOfBirth,
    parentContact,
    address,
  });

  res.status(201).json(successResponse(student, 'Student created successfully', 201));
};

export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const student = await StudentProfile.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate('userId', 'name email mobileNumber');

  if (!student) {
    throw new AppError(404, 'Student not found');
  }

  res.json(successResponse(student, 'Student updated successfully'));
};

export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;

  const student = await StudentProfile.findByIdAndDelete(id);

  if (!student) {
    throw new AppError(404, 'Student not found');
  }

  // Delete associated user
  await User.deleteOne({ _id: student.userId });

  res.json(successResponse({}, 'Student deleted successfully'));
};

export const getStudentAttendance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { month } = req.query;

  let query: any = { studentId: id };

  if (month) {
    const date = new Date(month as string);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    query.date = {
      $gte: startOfMonth,
      $lte: endOfMonth,
    };
  }

  const attendance = await Attendance.find(query).sort({ date: -1 });

  res.json(successResponse(attendance, 'Attendance fetched successfully'));
};
