import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;
const nameRegex = /^[a-zA-Z\s'-]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const baseSchema = {
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(10, 'Phone number must not exceed 10 digits')
    .regex(phoneRegex, 'Phone must start with 6-9 and contain only digits'),
  
  email: z
    .string()
    .email('Invalid email address')
    .max(254, 'Email must not exceed 254 characters'),
  
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(nameRegex, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(
      passwordRegex,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
};

export const studentRegistrationSchema = z.object({
  username: baseSchema.phone,
  password: baseSchema.password,
  full_name: baseSchema.fullName,
  email: baseSchema.email,
  role: z.literal('student'),
  year_of_study: z.string().min(1, 'Year of study is required'),
  division: z.string().min(1, 'Division is required'),
  standard: z.string().min(1, 'Class is required'),
  roll_number: z
    .string()
    .min(1, 'Roll number is required')
    .max(20, 'Roll number must not exceed 20 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Roll number must be alphanumeric'),
  parent_contact: baseSchema.phone.optional(),
  date_of_birth: z.string().optional(),
});

export const facultyRegistrationSchema = z.object({
  username: baseSchema.phone,
  password: baseSchema.password,
  full_name: baseSchema.fullName,
  email: baseSchema.email,
  role: z.literal('faculty'),
  employee_id: z
    .string()
    .min(1, 'Employee ID is required')
    .max(30, 'Employee ID must not exceed 30 characters')
    .regex(/^[A-Za-z0-9-]+$/, 'Employee ID can contain letters, numbers, and hyphens'),
  department: z.string().min(1, 'Department is required'),
  subject: z.string().min(1, 'Subject is required'),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['student', 'faculty', 'admin']),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: baseSchema.password,
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const feeStructureSchema = z.object({
  standard: z.string().min(1, 'Class is required'),
  academic_year: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Academic year must be in format YYYY-YY (e.g., 2025-26)'),
  total_amount: z
    .number()
    .min(100, 'Amount must be at least 100')
    .max(10000000, 'Amount must not exceed 10,000,000'),
  number_of_installments: z
    .number()
    .int()
    .min(1, 'At least 1 installment required')
    .max(12, 'Maximum 12 installments allowed'),
  installments: z.array(z.object({
    installment_number: z.number().int().min(1),
    amount: z.number().positive(),
    due_date: z.string(),
  })),
});

export const noticeSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(5000, 'Content must not exceed 5000 characters'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  target_roles: z.array(z.enum(['student', 'faculty', 'admin'])).default(['student']),
  target_standards: z.array(z.string()).optional(),
});

export const attendanceSchema = z.object({
  student_id: z.string().min(1, 'Student ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  remarks: z.string().max(500).optional(),
});

export const homeworkSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  subject: z.string().min(1, 'Subject is required'),
  standard: z.string().min(1, 'Class is required'),
  division: z.string().min(1, 'Division is required'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;
export type FacultyRegistrationInput = z.infer<typeof facultyRegistrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type FeeStructureInput = z.infer<typeof feeStructureSchema>;
export type NoticeInput = z.infer<typeof noticeSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type HomeworkInput = z.infer<typeof homeworkSchema>;
