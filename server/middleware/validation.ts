import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      req.body = validated.body;
      req.params = validated.params;
      req.query = validated.query;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        return res.status(400).json({
          success: false,
          message,
          statusCode: 400,
        });
      }
      next(error);
    }
  };
}

export const authSchemas = {
  login: z.object({
    body: z.object({
      mobileNumber: z.string().regex(/^\d{10}$/, 'Invalid mobile number'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      role: z.enum(['student', 'faculty', 'admin']),
    }),
  }),

  register: z.object({
    body: z.object({
      mobileNumber: z.string().regex(/^\d{10}$/, 'Invalid mobile number'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email'),
      role: z.enum(['student', 'faculty']),
    }),
  }),

  passwordChange: z.object({
    body: z.object({
      oldPassword: z.string(),
      newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    }),
  }),
};

export const studentSchemas = {
  create: z.object({
    body: z.object({
      userId: z.string(),
      rollNumber: z.string(),
      class: z.string(),
      division: z.string(),
      dateOfBirth: z.string().optional(),
      parentContact: z.string().optional(),
      address: z.string().optional(),
    }),
  }),

  update: z.object({
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      rollNumber: z.string().optional(),
      class: z.string().optional(),
      division: z.string().optional(),
      dateOfBirth: z.string().optional(),
      parentContact: z.string().optional(),
      address: z.string().optional(),
    }),
  }),
};

export const attendanceSchemas = {
  mark: z.object({
    body: z.object({
      studentId: z.string(),
      date: z.string(),
      subject: z.string(),
      status: z.enum(['present', 'absent', 'late', 'medical_leave']),
      remarks: z.string().optional(),
    }),
  }),
};

export const announcementSchemas = {
  create: z.object({
    body: z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      type: z.enum(['general', 'academic', 'event', 'emergency']),
      priority: z.enum(['low', 'normal', 'high']).default('normal'),
      targetAudience: z.array(z.enum(['student', 'faculty', 'admin', 'all'])),
      isPublished: z.boolean().default(false),
    }),
  }),
};
