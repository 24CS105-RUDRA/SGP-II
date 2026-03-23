import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, StudentProfile, FacultyProfile } from '../models/index.js';
import { generateTokens } from '../config/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { successResponse } from '../utils/response.js';

export const login = async (req: Request, res: Response) => {
  const { mobileNumber, password, role } = req.body;

  const user = await User.findOne({ mobileNumber, role, isActive: true });
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials');
  }

  let profileData = null;
  if (role === 'student') {
    profileData = await StudentProfile.findOne({ userId: user._id });
  } else if (role === 'faculty') {
    profileData = await FacultyProfile.findOne({ userId: user._id });
  }

  await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

  const tokens = generateTokens({
    userId: user._id.toString(),
    mobileNumber: user.mobileNumber,
    role: user.role as 'student' | 'faculty' | 'admin',
  });

  res.json(
    successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobileNumber,
          email: user.email,
          role: user.role,
        },
        profile: profileData,
        tokens,
      },
      'Login successful'
    )
  );
};

export const register = async (req: Request, res: Response) => {
  const { mobileNumber, password, name, email, role } = req.body;

  const existingUser = await User.findOne({ mobileNumber });
  if (existingUser) {
    throw new AppError(400, 'Mobile number already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    mobileNumber,
    password: hashedPassword,
    name,
    email,
    role,
    isActive: true,
  });

  const tokens = generateTokens({
    userId: user._id.toString(),
    mobileNumber: user.mobileNumber,
    role: user.role as 'student' | 'faculty' | 'admin',
  });

  res.status(201).json(
    successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobileNumber,
          email: user.email,
          role: user.role,
        },
        tokens,
      },
      'Registration successful',
      201
    )
  );
};

export const changePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, 'Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ _id: userId }, { password: hashedPassword });

  res.json(successResponse({}, 'Password changed successfully'));
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError(400, 'Refresh token required');
  }

  // Verify refresh token and generate new tokens
  // Implementation depends on your token strategy

  res.json(successResponse({}, 'Token refreshed'));
};
