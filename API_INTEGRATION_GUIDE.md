# API Integration Guide - School Management System

## Complete Backend Integration Overview

This document maps all UI features to their backend server actions and database operations.

---

## 1. STUDENT MODULE

### 1.1 Login & Authentication
**UI Location**: `/app/login/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/auth.ts
const result = await loginUser({
  username: 'student1',
  password: 'password123',
  role: 'student'
})
\`\`\`

**Database Query**:
- SELECT from `users` table
- Match username, password_hash, and role
- Return user details

**Demo Credentials**:
- Username: `student1` | Password: `password123`
- Username: `student2` | Password: `password123`

---

### 1.2 Student Dashboard (Category View)
**UI Location**: `/app/student/dashboard/page.tsx`

**Backend Integration**: Displays categories with links to all modules. No backend call needed for initial load.

**Database Usage**:
- Lazy-load module data as needed
- Cache category list in UI state

---

### 1.3 Attendance Calendar View
**UI Location**: `/app/student/attendance/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/attendance.ts
const attendance = await getStudentAttendance(studentId)
const monthStats = await getAttendanceByMonth(studentId, year, month)
const stats = await getAttendanceStats(studentId)
\`\`\`

**Database Queries**:
- SELECT from `attendance` where `student_id = ?`
- Filter by date range for monthly view
- Aggregate statistics (present, on_leave, missing, no_record)

**Color Coding**:
- **Green**: Present
- **Blue**: On Leave
- **Red**: Missing
- **Gray**: No Record

---

### 1.4 Homework Organized by Date
**UI Location**: `/app/student/homework/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/homework.ts
const homework = await getHomeworkByStudent(studentId)
\`\`\`

**Database Queries**:
- SELECT from `homework` where `standard = ?` AND `division = ?` (from student profile)
- ORDER BY `due_date` DESC
- Join with `homework_submissions` for status

**Date Organization**:
- Group by `due_date`
- Sort in descending order
- Show submission status per assignment

---

### 1.5 Timetable (Grid Format)
**UI Location**: `/app/student/timetable/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/timetable.ts
const timetable = await getTimetableByClass(
  student.standard,
  student.division
)
\`\`\`

**Database Queries**:
- SELECT from `timetable` where `standard = ?` AND `division = ?`
- GROUP BY `day_of_week` and `time_slot`
- Include faculty info for each slot

**Grid Layout**:
- Rows: Time slots (1-8)
- Columns: Days (Monday-Saturday)
- Cells: Subject names with color coding

---

### 1.6 Other Student Features

#### Notices/Events
\`\`\`typescript
const notices = await getPublishedNotices()
\`\`\`

#### Fees Management
\`\`\`typescript
const fees = await getStudentFees(studentId)
const stats = await getFeeStats(studentId)
\`\`\`

#### Study Materials
\`\`\`typescript
const materials = await getStudyMaterials()
\`\`\`

#### Profile Management
\`\`\`typescript
const profile = await getStudentProfile(studentId)
\`\`\`

---

## 2. FACULTY MODULE

### 2.1 Faculty Dashboard (Category View)
**UI Location**: `/app/faculty/dashboard/page.tsx`

**Backend Integration**: Similar to student dashboard, displays management categories.

**Features Available**:
- Mark Attendance
- Post Notices
- Manage Students
- Post Homework
- Upload Materials
- Manage Timetable
- Update Syllabus
- Upload Gallery

---

### 2.2 Mark Attendance
**UI Location**: `/app/faculty/attendance/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/attendance.ts
await markAttendance({
  student_id: 'uuid',
  faculty_id: 'faculty-uuid',
  attendance_date: '2026-01-28',
  status: 'present' | 'on_leave' | 'missing',
  subject: 'Mathematics',
  remarks: 'optional'
})

const classAttendance = await getClassAttendance(facultyId, date)
\`\`\`

**Database Operations**:
- INSERT/UPDATE into `attendance`
- Handles duplicate entries with UPSERT
- Tracks by date and subject

---

### 2.3 Post Notices
**UI Location**: `/app/faculty/notices/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/notices.ts
await createNotice({
  created_by: 'faculty-uuid',
  title: 'Notice Title',
  content: 'Notice content',
  notice_type: 'academic' | 'event' | 'general' | 'emergency',
  priority: 'low' | 'normal' | 'high'
})

const notices = await getAllNotices(facultyId)
\`\`\`

**Database Operations**:
- INSERT into `notices`
- Auto-publish with timestamp
- Track priority and type

---

### 2.4 Post Homework
**UI Location**: `/app/faculty/homework/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/homework.ts
await createHomework({
  faculty_id: 'faculty-uuid',
  standard: '10',
  division: 'A',
  subject: 'Mathematics',
  title: 'Assignment Title',
  description: 'Full description',
  due_date: '2026-02-05'
})

const myHomework = await getHomeworkByFaculty(facultyId)
const submissions = await getHomeworkSubmissions(homeworkId)
\`\`\`

**Database Operations**:
- INSERT into `homework`
- Track submissions in `homework_submissions`
- Grade student submissions

---

### 2.5 Manage Students
**UI Location**: `/app/faculty/student-management/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/students.ts
const students = await getStudentsByClass(standard, division)
const profile = await getStudentProfile(studentId)
\`\`\`

**Database Queries**:
- SELECT from `students` with user details
- Filter by class and division
- View individual profiles

---

### 2.6 Upload Study Materials
**UI Location**: `/app/faculty/study-materials/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/gallery.ts
await uploadStudyMaterial({
  faculty_id: 'faculty-uuid',
  title: 'Material Title',
  description: 'Description',
  subject: 'Mathematics',
  standard: '10',
  file_url: 'https://...',
  file_type: 'pdf'
})
\`\`\`

**Database Operations**:
- INSERT into `study_materials`
- Track by subject and class
- Store file URL/path

---

### 2.7 Manage Timetable
**UI Location**: `/app/faculty/timetable/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/timetable.ts
await createTimetableEntry({
  faculty_id: 'uuid',
  standard: '10',
  division: 'A',
  subject: 'Mathematics',
  day_of_week: 'Monday',
  time_slot: '1',
  classroom: '101'
})

const schedule = await getTimetableByFaculty(facultyId)
\`\`\`

**Database Operations**:
- INSERT into `timetable`
- Prevent duplicate slots for same faculty
- Track classroom assignments

---

### 2.8 Upload Gallery
**UI Location**: `/app/faculty/gallery/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/gallery.ts
await uploadGalleryImage({
  title: 'Image Title',
  description: 'Description',
  image_url: 'https://...',
  category: 'Events',
  uploaded_by: 'faculty-uuid'
})
\`\`\`

**Database Operations**:
- INSERT into `gallery`
- Organize by category
- Track upload metadata

---

## 3. ADMIN MODULE

### 3.1 Admin Login
**UI Location**: `/app/login/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/auth.ts
const result = await loginUser({
  username: 'admin',
  password: 'password123',
  role: 'admin'
})
\`\`\`

**Demo Credentials**:
- Username: `admin` | Password: `password123`

---

### 3.2 Admin Dashboard
**UI Location**: `/app/admin/dashboard/page.tsx`

**Backend Integration**: Category view with 8 management options:
- Student Profiles
- Faculty Profiles
- Student Lists
- General Notices
- Fees Management
- Gallery Management
- Password Management
- Dashboard Analytics

---

### 3.3 Student Profiles Management
**UI Location**: `/app/admin/student-profiles/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/students.ts
const allStudents = await getAllStudents()
const classStudents = await getStudentsByClass(standard, division)
const profile = await getStudentProfile(studentId)

await updateStudent(studentId, {
  full_name: 'New Name',
  email: 'new@email.com',
  phone_number: '9876543210',
  division: 'B'
})

await deleteStudent(studentId)
\`\`\`

**Database Operations**:
- SELECT from `students` with joins
- UPDATE user and student records
- DELETE with cascade

---

### 3.4 Student Lists (Add/Modify)
**UI Location**: `/app/admin/student-lists/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/students.ts
await createStudent({
  username: 'newstudent',
  password: 'initial-password',
  full_name: 'Student Name',
  email: 'student@school.com',
  roll_number: 'STU003',
  standard: '10',
  division: 'A',
  phone_number: '9876543210',
  parent_contact: '9876543211',
  date_of_birth: '2010-05-15'
})

const classStudents = await getStudentsByClass(standard, division)
\`\`\`

**Database Operations**:
- INSERT into `users` (with hashed password)
- INSERT into `students`
- Generate roll numbers
- Assign to standard/division

---

### 3.5 Faculty Profiles Management
**UI Location**: `/app/admin/faculty-profiles/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/faculty.ts
const allFaculty = await getAllFaculty()
const profile = await getFacultyProfile(facultyId)

await updateFaculty(facultyId, {
  full_name: 'New Name',
  email: 'new@email.com',
  department: 'Science',
  subject: 'Physics'
})

await deleteFaculty(facultyId)
\`\`\`

**Database Operations**:
- SELECT from `faculty` with joins
- UPDATE user and faculty records
- DELETE with cascade

---

### 3.6 General Notices Management
**UI Location**: `/app/admin/notices/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/notices.ts
await createNotice({
  created_by: 'admin-uuid',
  title: 'School Holiday',
  content: 'Details here',
  notice_type: 'event',
  priority: 'high'
})

const allNotices = await getAllNotices(adminId)
await updateNotice(noticeId, { title: 'Updated' })
await deleteNotice(noticeId)
\`\`\`

**Database Operations**:
- Full CRUD for notices
- Track by type and priority
- Manage publication status

---

### 3.7 Fees Management
**UI Location**: `/app/admin/fees/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/fees.ts
await createFeeRecord({
  student_id: 'uuid',
  amount_due: 50000.00,
  due_date: '2026-02-28',
  remarks: 'Jan-Mar 2026'
})

const classF ees = await getAllStudentFees(standard)
await updatePayment(feeId, 25000.00, 'online_transfer')
\`\`\`

**Database Operations**:
- CREATE fee records per student
- TRACK payments and status
- Calculate outstanding amounts

---

### 3.8 Password Management
**UI Location**: `/app/admin/password-management/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/auth.ts
// Admin can reset student/faculty passwords
// Implementation: Direct password hash update with secure temporary password
\`\`\`

**Database Operations**:
- UPDATE password_hash in users table
- Generate secure temporary passwords
- Force password change on first login

---

### 3.9 Gallery Management
**UI Location**: `/app/admin/gallery/page.tsx`

**Backend Integration**:
\`\`\`typescript
// lib/actions/gallery.ts
const allImages = await getAllGallery()
const categoryImages = await getGalleryByCategory(category)
await deleteGalleryImage(imageId)
\`\`\`

**Database Operations**:
- View all gallery images
- Organize by category
- Delete/manage images

---

## 4. COMMON OPERATIONS

### 4.1 Data Relationships

\`\`\`
users (1) ─── (M) students
  │              │
  ├─── (1) faculty
  └─── (M) notices (created_by)

students (1) ─── (M) attendance
             ├─── (M) homework_submissions
             └─── (M) fees

faculty (1) ─── (M) attendance
           ├─── (M) homework
           ├─── (M) timetable
           ├─── (M) study_materials
           └─── (1) syllabus

homework (1) ─── (M) homework_submissions
\`\`\`

### 4.2 Error Handling

All server actions return consistent response format:
\`\`\`typescript
{
  success: boolean,
  data?: TResult,
  error?: string
}
\`\`\`

### 4.3 Authentication Flow

1. User enters credentials
2. Login page calls `loginUser()` server action
3. Server queries Supabase `users` table
4. Password verified with bcrypt
5. Session stored in localStorage
6. User redirected to appropriate dashboard

### 4.4 Data Validation

- All inputs validated server-side
- Type-safe with TypeScript
- SQL injection prevention
- Required fields checked

---

## 5. TESTING THE BACKEND

### Test Login
\`\`\`bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"password123","role":"student"}'
\`\`\`

### Test Creating Homework
\`\`\`typescript
// In server action context
const result = await createHomework({
  faculty_id: '750e8400-e29b-41d4-a716-446655440001',
  standard: '10',
  division: 'A',
  subject: 'Mathematics',
  title: 'Test Homework',
  description: 'Test',
  due_date: '2026-02-05'
})
console.log(result)
\`\`\`

### Test Marking Attendance
\`\`\`typescript
const result = await markAttendance({
  student_id: '650e8400-e29b-41d4-a716-446655440001',
  faculty_id: '750e8400-e29b-41d4-a716-446655440001',
  attendance_date: '2026-01-28',
  status: 'present',
  subject: 'Mathematics'
})
console.log(result)
\`\`\`

---

## 6. PERFORMANCE CONSIDERATIONS

### Database Indexes
Created on frequently queried columns:
- `users(role)` - For role-based queries
- `users(username)` - For login
- `attendance(student_id, attendance_date)`
- `homework(standard)`
- `notices(is_published, published_date)`
- `fees(student_id, status)`
- `gallery(category)`

### Query Optimization
- Use SELECT only needed columns
- Join efficiently with foreign keys
- Filter early to reduce result sets
- Cache immutable data client-side

---

## Summary

This comprehensive backend integration provides:

✅ Complete user authentication
✅ Attendance tracking and statistics
✅ Homework assignment and grading
✅ Notice/announcement management
✅ Fee tracking and payments
✅ Timetable management
✅ Student and faculty profiles
✅ Gallery and materials management
✅ Admin controls and oversight
✅ Secure data storage with Supabase

All operations are type-safe, validated, and optimized for performance!
