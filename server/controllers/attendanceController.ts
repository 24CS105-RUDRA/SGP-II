import { Request, Response } from 'express';
import { Attendance, StudentProfile } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse, pagingResponse } from '../utils/response.js';

export const markAttendance = async (req: Request, res: Response) => {
  const { studentId, date, subject, status, remarks } = req.body;
  const userId = req.user?.userId;

  const student = await StudentProfile.findById(studentId);
  if (!student) {
    throw new AppError(404, 'Student not found');
  }

  try {
    const attendance = await Attendance.create({
      studentId,
      facultyId: student._id, // This should be facultyId from request
      date: new Date(date),
      subject,
      status,
      remarks,
      markedAt: new Date(),
      markedBy: userId,
    });

    res.status(201).json(successResponse(attendance, 'Attendance marked successfully', 201));
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(400, 'Attendance already marked for this student on this date');
    }
    throw error;
  }
};

export const bulkMarkAttendance = async (req: Request, res: Response) => {
  const { attendanceData } = req.body;
  const userId = req.user?.userId;

  try {
    const results = await Attendance.insertMany(
      attendanceData.map((record: any) => ({
        ...record,
        markedAt: new Date(),
        markedBy: userId,
      }))
    );

    res.status(201).json(
      successResponse(results, `${results.length} attendance records marked`, 201)
    );
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(400, 'Some attendance records already exist');
    }
    throw error;
  }
};

export const getAttendance = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { month, subject } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  let query: any = { studentId };

  if (month) {
    const date = new Date(month as string);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    query.date = {
      $gte: startOfMonth,
      $lte: endOfMonth,
    };
  }

  if (subject) {
    query.subject = subject;
  }

  const attendance = await Attendance.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  const total = await Attendance.countDocuments(query);

  res.json(pagingResponse(attendance, total, page, limit, 'Attendance fetched successfully'));
};

export const getClassAttendance = async (req: Request, res: Response) => {
  const { date, subject } = req.query;

  let query: any = {};

  if (date) {
    const attendanceDate = new Date(date as string);
    query.date = {
      $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
      $lt: new Date(attendanceDate.setHours(23, 59, 59, 999)),
    };
  }

  if (subject) {
    query.subject = subject;
  }

  const attendance = await Attendance.find(query)
    .populate('studentId')
    .sort({ studentId: 1 });

  res.json(successResponse(attendance, 'Class attendance fetched successfully'));
};

export const updateAttendance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  const attendance = await Attendance.findByIdAndUpdate(
    id,
    { status, remarks },
    { new: true }
  );

  if (!attendance) {
    throw new AppError(404, 'Attendance record not found');
  }

  res.json(successResponse(attendance, 'Attendance updated successfully'));
};

export const getAttendanceStats = async (req: Request, res: Response) => {
  const { studentId, month } = req.query;

  let query: any = {};

  if (studentId) {
    query.studentId = studentId;
  }

  if (month) {
    const date = new Date(month as string);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    query.date = {
      $gte: startOfMonth,
      $lte: endOfMonth,
    };
  }

  const stats = await Attendance.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$studentId',
        present: {
          $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] },
        },
        late: {
          $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] },
        },
        medicalLeave: {
          $sum: { $cond: [{ $eq: ['$status', 'medical_leave'] }, 1, 0] },
        },
        total: { $sum: 1 },
      },
    },
  ]);

  res.json(successResponse(stats, 'Attendance statistics fetched successfully'));
};
