import { Request, Response } from 'express';
import { Fee } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse, pagingResponse } from '../utils/response.js';

export const createFee = async (req: Request, res: Response) => {
  const { studentId, amountDue, dueDate, remarks } = req.body;

  const fee = await Fee.create({
    studentId,
    amountDue,
    amountPaid: 0,
    dueDate: new Date(dueDate),
    status: 'pending',
    remarks,
  });

  res.status(201).json(successResponse(fee, 'Fee record created successfully', 201));
};

export const getFees = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const { status, studentId } = req.query;

  let query: any = {};

  if (status) query.status = status;
  if (studentId) query.studentId = studentId;

  const fees = await Fee.find(query)
    .populate('studentId', 'rollNumber')
    .skip(skip)
    .limit(limit)
    .sort({ dueDate: 1 });

  const total = await Fee.countDocuments(query);

  res.json(pagingResponse(fees, total, page, limit, 'Fees fetched successfully'));
};

export const getFeeById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const fee = await Fee.findById(id).populate('studentId');

  if (!fee) {
    throw new AppError(404, 'Fee record not found');
  }

  res.json(successResponse(fee, 'Fee record fetched successfully'));
};

export const getStudentFees = async (req: Request, res: Response) => {
  const { studentId } = req.params;

  const fees = await Fee.find({ studentId }).sort({ dueDate: 1 });

  res.json(successResponse(fees, 'Student fees fetched successfully'));
};

export const updatePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amountPaid, paymentMethod, remarks } = req.body;

  const fee = await Fee.findById(id);

  if (!fee) {
    throw new AppError(404, 'Fee record not found');
  }

  fee.amountPaid += amountPaid;
  fee.paidDate = new Date();
  fee.paymentMethod = paymentMethod;

  if (remarks) {
    fee.remarks = remarks;
  }

  if (fee.amountPaid >= fee.amountDue) {
    fee.status = 'paid';
  } else if (fee.amountPaid > 0) {
    fee.status = 'partial';
  }

  await fee.save();

  res.json(successResponse(fee, 'Payment updated successfully'));
};

export const getFeeStats = async (req: Request, res: Response) => {
  const stats = await Fee.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amountDue' },
        totalPaid: { $sum: '$amountPaid' },
      },
    },
  ]);

  const overdueFees = await Fee.countDocuments({
    status: 'pending',
    dueDate: { $lt: new Date() },
  });

  res.json(
    successResponse(
      { stats, overdue: overdueFees },
      'Fee statistics fetched successfully'
    )
  );
};

export const deleteFee = async (req: Request, res: Response) => {
  const { id } = req.params;

  const fee = await Fee.findByIdAndDelete(id);

  if (!fee) {
    throw new AppError(404, 'Fee record not found');
  }

  res.json(successResponse({}, 'Fee record deleted successfully'));
};
