# School Management System - Backend Setup Guide

## Overview

This school management system uses **Supabase** as the backend database and **Next.js Server Actions** for API logic. All authentication, data management, and business logic is handled server-side for security and performance.

## Architecture

### Technology Stack
- **Database**: Supabase (PostgreSQL)
- **Backend**: Next.js Server Actions (App Router)
- **Authentication**: Custom JWT with bcrypt password hashing
- **API Style**: RESTful via Server Actions

### Database Schema

The system includes the following tables:

1. **users** - User accounts (students, faculty, admins)
2. **students** - Student profiles and details
3. **faculty** - Faculty profiles and departments
4. **attendance** - Daily attendance records
5. **homework** - Homework assignments
6. **homework_submissions** - Student homework submissions
7. **notices** - School announcements and notices
8. **timetable** - Class schedule management
9. **fees** - Student fee records and payments
10. **study_materials** - Educational materials
11. **gallery** - School gallery images
12. **syllabus** - Course syllabi

## Setup Instructions

### 1. Supabase Project Setup

1. Create a Supabase project at https://supabase.com
2. Copy your project credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key (public)
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (private, server-side only)

3. Add these to your `.env.local` file:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### 2. Create Database Tables

Execute the migration script in Supabase SQL Editor:

\`\`\`sql
-- Execute: scripts/supabase-setup.sql
\`\`\`

Or use the Supabase CLI:
\`\`\`bash
supabase db push
\`\`\`

### 3. Seed Demo Data (Optional)

Load demo data for testing by executing in Supabase SQL Editor:

\`\`\`sql
-- Execute: scripts/seed-demo-data.sql
\`\`\`

**Demo Credentials:**
- **Student**: username: `student1`, password: `password123`
- **Faculty**: username: `faculty1`, password: `password123`
- **Admin**: username: `admin`, password: `password123`

## Server Actions Reference

All server actions are located in `/lib/actions/` directory:

### Authentication (`/lib/actions/auth.ts`)
- `loginUser(credentials)` - Authenticate user
- `registerUser(userData)` - Create new user account
- `changePassword(userId, oldPassword, newPassword)` - Change user password

### Attendance (`/lib/actions/attendance.ts`)
- `markAttendance(data)` - Mark student attendance
- `getStudentAttendance(studentId)` - Get student's attendance records
- `getAttendanceByMonth(studentId, year, month)` - Get monthly attendance
- `getClassAttendance(facultyId, date)` - Get class attendance
- `getAttendanceStats(studentId)` - Get attendance statistics

### Homework (`/lib/actions/homework.ts`)
- `createHomework(data)` - Create homework assignment
- `getHomeworkByStudent(studentId)` - Get student's homework
- `getHomeworkByFaculty(facultyId)` - Get faculty's assignments
- `submitHomework(homeworkId, studentId)` - Submit homework
- `gradeHomework(submissionId, grade, remarks)` - Grade submission
- `deleteHomework(homeworkId)` - Delete assignment

### Notices (`/lib/actions/notices.ts`)
- `createNotice(data)` - Create new notice
- `getPublishedNotices()` - Get all published notices
- `getNoticesByType(type)` - Get notices by category
- `updateNotice(id, updates)` - Update notice
- `deleteNotice(id)` - Delete notice
- `publishNotice(id)` - Publish notice

### Fees (`/lib/actions/fees.ts`)
- `createFeeRecord(data)` - Create fee record
- `getStudentFees(studentId)` - Get student fees
- `updatePayment(feeId, amount, method)` - Record payment
- `getFeeStats(studentId)` - Get fee statistics
- `getAllStudentFees(standard)` - Get class fees

### Timetable (`/lib/actions/timetable.ts`)
- `createTimetableEntry(data)` - Add timetable entry
- `getTimetableByClass(standard, division)` - Get class schedule
- `getTimetableByFaculty(facultyId)` - Get faculty schedule
- `updateTimetableEntry(id, updates)` - Update entry
- `deleteTimetableEntry(id)` - Delete entry

### Students (`/lib/actions/students.ts`)
- `createStudent(data)` - Add new student
- `getStudentsByClass(standard, division)` - Get class students
- `getStudentProfile(studentId)` - Get student details
- `updateStudent(studentId, updates)` - Update student info
- `deleteStudent(studentId)` - Delete student
- `getAllStudents()` - Get all students

### Faculty (`/lib/actions/faculty.ts`)
- `createFaculty(data)` - Add new faculty
- `getFacultyProfile(facultyId)` - Get faculty details
- `getAllFaculty()` - Get all faculty
- `updateFaculty(facultyId, updates)` - Update faculty info
- `deleteFaculty(facultyId)` - Delete faculty

### Gallery (`/lib/actions/gallery.ts`)
- `uploadGalleryImage(data)` - Upload gallery image
- `getGalleryByCategory(category)` - Get images by category
- `getAllGallery()` - Get all gallery images
- `deleteGalleryImage(imageId)` - Delete image
- `uploadStudyMaterial(data)` - Upload study material
- `deleteStudyMaterial(materialId)` - Delete material

## Usage Examples

### Login
\`\`\`typescript
import { loginUser } from '@/lib/actions/auth'

const result = await loginUser({
  username: 'student1',
  password: 'password123',
  role: 'student'
})

if (result.success) {
  console.log('User:', result.data)
}
\`\`\`

### Mark Attendance
\`\`\`typescript
import { markAttendance } from '@/lib/actions/attendance'

const result = await markAttendance({
  student_id: 'student-uuid',
  faculty_id: 'faculty-uuid',
  attendance_date: '2026-01-28',
  status: 'present',
  subject: 'Mathematics'
})
\`\`\`

### Create Homework
\`\`\`typescript
import { createHomework } from '@/lib/actions/homework'

const result = await createHomework({
  faculty_id: 'faculty-uuid',
  standard: '10',
  division: 'A',
  subject: 'Mathematics',
  title: 'Algebra Problems',
  description: 'Chapter 5 exercises',
  due_date: '2026-02-05'
})
\`\`\`

### Post Notice
\`\`\`typescript
import { createNotice } from '@/lib/actions/notices'

const result = await createNotice({
  created_by: 'admin-uuid',
  title: 'Exam Schedule',
  content: 'Exams start on February 15',
  notice_type: 'academic',
  priority: 'high'
})
\`\`\`

## Security Features

### Password Hashing
- Uses bcrypt with 10-round salting
- Passwords never stored in plain text
- Secure comparison prevents timing attacks

### Server-Side Operations
- All sensitive operations use service role key
- API routes protected with authentication checks
- Environment variables kept secure on server

### Data Validation
- Input validation on all functions
- SQL injection prevention via parameterized queries
- Type safety with TypeScript

## Environment Variables

**Required for Client:**
\`\`\`
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
\`\`\`

**Required for Server:**
\`\`\`
SUPABASE_SERVICE_ROLE_KEY
\`\`\`

Never expose service role key to client!

## Troubleshooting

### "operator does not exist: uuid = text"
- Ensure UUID types are properly cast in Supabase
- Check RLS policies match the schema

### Connection Refused
- Verify Supabase credentials in `.env.local`
- Check network connectivity
- Ensure Supabase project is active

### Permission Denied
- Verify service role key is set correctly
- Check RLS policies allow intended operations
- Ensure user role matches operation requirements

## Next Steps

1. Integrate server actions with UI components
2. Add file upload support for materials/gallery
3. Implement email notifications
4. Add advanced analytics dashboard
5. Setup backup and recovery procedures
