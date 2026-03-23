import { Request, Response } from 'express';
import { Homework, HomeworkSubmission } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse, pagingResponse } from '../utils/response.js';

export const createHomework = async (req: Request, res: Response) => {
  const { standard, division, subject, title, description, dueDate } = req.body;
  const userId = req.user?.userId;

  const homework = await Homework.create({
    facultyId: userId,
    standard,
    division,
    subject,
    title,
    description,
    dueDate: new Date(dueDate),
    assignedDate: new Date(),
  });

  res.status(201).json(successResponse(homework, 'Homework created successfully', 201));
};

export const getHomework = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const { standard, division, subject } = req.query;

  let query: any = {};

  if (standard) query.standard = standard;
  if (division) query.division = division;
  if (subject) query.subject = subject;

  const homework = await Homework.find(query)
    .populate('facultyId', 'subject')
    .skip(skip)
    .limit(limit)
    .sort({ assignedDate: -1 });

  const total = await Homework.countDocuments(query);

  res.json(pagingResponse(homework, total, page, limit, 'Homework fetched successfully'));
};

export const getHomeworkById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const homework = await Homework.findById(id).populate('facultyId', 'subject');

  if (!homework) {
    throw new AppError(404, 'Homework not found');
  }

  res.json(successResponse(homework, 'Homework fetched successfully'));
};

export const updateHomework = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const homework = await Homework.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate('facultyId', 'subject');

  if (!homework) {
    throw new AppError(404, 'Homework not found');
  }

  res.json(successResponse(homework, 'Homework updated successfully'));
};

export const deleteHomework = async (req: Request, res: Response) => {
  const { id } = req.params;

  const homework = await Homework.findByIdAndDelete(id);

  if (!homework) {
    throw new AppError(404, 'Homework not found');
  }

  // Delete all submissions
  await HomeworkSubmission.deleteMany({ homeworkId: id });

  res.json(successResponse({}, 'Homework deleted successfully'));
};

export const submitHomework = async (req: Request, res: Response) => {
  const { homeworkId } = req.body;
  const userId = req.user?.userId;

  try {
    const submission = await HomeworkSubmission.create({
      homeworkId,
      studentId: userId,
      submissionDate: new Date(),
      status: 'submitted',
    });

    res.status(201).json(
      successResponse(submission, 'Homework submitted successfully', 201)
    );
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(400, 'Homework already submitted');
    }
    throw error;
  }
};

export const gradeSubmission = async (req: Request, res: Response) => {
  const { submissionId } = req.params;
  const { grade, remarks } = req.body;

  const submission = await HomeworkSubmission.findByIdAndUpdate(
    submissionId,
    {
      grade,
      remarks,
      status: 'evaluated',
    },
    { new: true }
  );

  if (!submission) {
    throw new AppError(404, 'Submission not found');
  }

  res.json(successResponse(submission, 'Submission graded successfully'));
};

export const getStudentSubmissions = async (req: Request, res: Response) => {
  const { studentId } = req.params;

  const submissions = await HomeworkSubmission.find({ studentId }).populate(
    'homeworkId',
    'title subject dueDate'
  );

  res.json(successResponse(submissions, 'Submissions fetched successfully'));
};

export const getHomeworkSubmissions = async (req: Request, res: Response) => {
  const { homeworkId } = req.params;

  const submissions = await HomeworkSubmission.find({ homeworkId }).populate(
    'studentId',
    'rollNumber'
  );

  res.json(successResponse(submissions, 'Submissions fetched successfully'));
};
