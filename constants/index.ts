export const VALID_CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const

export const VALID_DIVISIONS = ['A', 'B', 'C', 'D'] as const

export const VALID_HIGHER_DIVISIONS = [
  'Science-A', 'Science-B', 'Science-C', 'Science-D',
  'Commerce-A', 'Commerce-B', 'Commerce-C', 'Commerce-D'
] as const

export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Accountancy',
  'Business Studies',
] as const

export const DEPARTMENTS = [
  'Science',
  'Commerce',
  'Arts',
  'Languages',
  'Mathematics',
  'Computer Science',
  'Physical Education',
] as const

export const NOTICE_TYPES = ['academic', 'event', 'general', 'urgent'] as const
export type NoticeType = typeof NOTICE_TYPES[number]

export const PRIORITIES = ['low', 'medium', 'high'] as const
export type Priority = typeof PRIORITIES[number]

export const ATTENDANCE_STATUS = ['present', 'absent', 'late'] as const
export type AttendanceStatus = typeof ATTENDANCE_STATUS[number]

export const PAYMENT_STATUS = ['pending', 'partial', 'paid', 'overdue'] as const
export type PaymentStatus = typeof PAYMENT_STATUS[number]

export const INSTALLMENT_STATUS = ['pending', 'partial', 'paid', 'overdue'] as const
export type InstallmentStatus = typeof INSTALLMENT_STATUS[number]

export const USER_ROLES = ['student', 'faculty', 'admin'] as const
export type UserRole = typeof USER_ROLES[number]

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export const FEE_TYPES = [
  'Tuition Fee',
  'Lab Fee',
  'Library Fee',
  'Sports Fee',
  'Transport Fee',
  'Exam Fee',
  'Other',
] as const

export const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque'] as const

export const FEE_CONSTRAINTS = {
  MIN_AMOUNT: 100,
  MAX_AMOUNT: 10000000,
  MIN_INSTALLMENTS: 1,
  MAX_INSTALLMENTS: 12,
  MIN_INSTALLMENT_AMOUNT: 100,
} as const

export const ACCOUNT_LOCKOUT = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000,
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const
