# Software Requirements Specification (SRS)
## SGP-II: School Management System

---

## 1. INTRODUCTION

### 1.1 Purpose
The purpose of this document is to provide a detailed description of the requirements for the **SGP-II (School Management System II)**. This document outlines the functional and non-functional requirements, user interfaces, and system constraints for a comprehensive school management system.

### 1.2 Scope
SGP-II is a web-based application designed to automate and manage school operations including:
- Student information management
- Faculty management
- Attendance tracking
- Homework management
- Fee collection
- Notice board
- Timetable scheduling
- Study materials distribution
- Photo gallery management

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| SRS | Software Requirements Specification |
| Admin | Administrator - has full system access |
| Faculty | Teachers/staff members |
| Student | Enrolled students |
| CRUD | Create, Read, Update, Delete operations |
| MongoDB | NoSQL database used for data storage |
| Cloudinary | Cloud-based file storage service |

---

## 2. OVERALL DESCRIPTION

### 2.1 Product Perspective
SGP-II is a **full-stack web application** built with modern technologies:
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Next.js Server Actions
- **Database**: MongoDB (via custom MongoDB-Supabase wrapper)
- **File Storage**: Cloudinary for images and documents
- **Authentication**: Session-based with password hashing

### 2.2 User Characteristics

| User Role | Characteristics |
|-----------|-----------------|
| **Administrator** | Technical staff, full access to all features, manages students and faculty accounts |
| **Faculty** | Teachers, can manage attendance, homework, notices, study materials, and gallery |
| **Student** | Can view attendance, submit homework, pay fees, access study materials, view notices |

### 2.3 Product Functions (Summary)

| Module | Users | Key Functions |
|--------|-------|---------------|
| Authentication | All | Login, password change, account lockout |
| Student Management | Admin | Create, edit, delete, view students |
| Faculty Management | Admin | Create, edit, delete, view faculty |
| Attendance | Faculty, Student | Mark attendance, view records |
| Homework | Faculty, Student | Create/grade homework, submit |
| Fees | Admin, Student | Manage fees, view/pay fees |
| Notices | Admin, Faculty, Student | Create/publish notices, view notices |
| Timetable | Faculty, Student | View class schedules |
| Study Materials | Faculty, Student | Upload/download materials |
| Gallery | Admin, Faculty, Student | Create events, upload/view images |
| Profile | All | View and update profile |

---

## 3. SPECIFIC REQUIREMENTS

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces
- **Login Page**: Role-based login (Student/Faculty/Admin)
- **Admin Dashboard**: Overview with statistics cards, quick access navigation
- **Faculty Dashboard**: Teaching schedule, assigned classes overview
- **Student Dashboard**: Personal information, quick links to features

#### 3.1.2 Hardware Interfaces
- Desktop/Laptop computers (minimum 1024x768 resolution)
- Mobile responsive design for tablet and mobile access

#### 3.1.3 Software Interfaces
- MongoDB database
- Cloudinary file storage API
- Browser-based access (Chrome, Firefox, Safari, Edge)

#### 3.1.4 Communication Interfaces
- HTTP/HTTPS for client-server communication
- RESTful API patterns via Next.js Server Actions

### 3.2 Functional Requirements

#### 3.2.1 Authentication Module

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| AUTH-01 | Users can login with username (mobile number) and password | Must |
| AUTH-02 | Password must be hashed using bcrypt | Must |
| AUTH-03 | Account locks after 5 failed login attempts | Must |
| AUTH-04 | First lockout duration: 1 minute, subsequent: 5 minutes | Must |
| AUTH-05 | Users can change their password | Must |
| AUTH-06 | Session-based authentication | Must |

#### 3.2.2 Student Management (Admin)

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| STU-01 | Admin can add new student with phone as username | Must |
| Admin can set custom password for student | Must |
| STU-02 | Admin can view all students grouped by class-division | Must |
| STU-03 | Admin can edit student details (name, roll number, class, phone) | Must |
| STU-04 | Admin can delete student (cascades to related records) | Must |
| STU-05 | Student profile includes: roll number, class, division, DOB, phone, father's mobile, mother's mobile | Must |
| STU-06 | Phone numbers validated as 10-digit Indian mobile (6-9) | Must |

#### 3.2.3 Faculty Management (Admin)

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| FAC-01 | Admin can add new faculty with phone as username | Must |
| FAC-02 | Admin can assign faculty to class/division | Must |
| FAC-03 | Admin can view all faculty members | Must |
| FAC-04 | Admin can edit faculty details | Must |
| FAC-05 | Admin can delete faculty | Must |

#### 3.2.4 Attendance Management

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| ATT-01 | Faculty can mark attendance for assigned class | Must |
| ATT-02 | Faculty cannot mark attendance for future dates | Must |
| ATT-03 | Faculty can mark all students present/absent at once | Must |
| ATT-04 | Students can view their attendance records | Must |
| ATT-05 | Attendance shows present/absent status per date | Must |

#### 3.2.5 Homework Management

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| HW-01 | Faculty can create homework with title, description, due date | Must |
| HW-02 | Faculty can specify subject and class/division | Must |
| HW-03 | Students can view homework assignments | Must |
| HW-04 | Students can submit homework | Must |
| HW-05 | Faculty can grade submitted homework | Must |
| HW-06 | Faculty can view submission status | Must |

#### 3.2.6 Fee Management

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| FEE-01 | Admin can create fee records for students | Must |
| FEE-02 | Fee record includes: fee type, amount, due date | Must |
| FEE-03 | Students can view their fee status | Must |
| FEE-04 | Students can view payment history | Must |

#### 3.2.7 Notice Board

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| NOT-01 | Admin can create notices with title, content | Must |
| NOT-02 | Faculty can create notices | Must |
| NOT-03 | Notices can be categorized (academic, event, general, urgent) | Should |
| NOT-04 | Notices can have priority levels (low, medium, high) | Should |
| NOT-05 | Admin can publish/unpublish notices | Must |
| NOT-06 | Students can view published notices | Must |

#### 3.2.8 Timetable

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| TIM-01 | Faculty can view their teaching schedule | Must |
| TIM-02 | Students can view their class timetable | Must |
| TIM-03 | Timetable shows day, time, subject, room | Must |

#### 3.2.9 Study Materials

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| SM-01 | Faculty can upload study materials (PDF, docs, etc.) | Must |
| SM-02 | Files stored in Cloudinary | Must |
| SM-03 | Faculty can organize materials in folders | Should |
| SM-04 | Students can download study materials | Must |

#### 3.2.10 Gallery

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| GAL-01 | Admin/Faculty can create gallery events | Must |
| GAL-02 | Cover image uploaded to Cloudinary | Must |
| GAL-03 | Multiple images can be uploaded per event | Must |
| GAL-04 | Admin can publish/unpublish gallery events | Must |
| GAL-05 | Students can view published gallery events | Must |

#### 3.2.11 Profile Management

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| PRO-01 | Students can view their profile (name, roll, class, phone, parent contacts) | Must |
| PRO-02 | Students can change their password | Must |
| PRO-03 | Faculty can view their profile | Must |
| PRO-04 | Admin can reset user passwords | Must |

### 3.3 Data Flow & Processing

#### 3.3.1 Database Collections

| Collection | Fields |
|------------|--------|
| users | id, username, password_hash, full_name, email, role, year_of_study, division, standard |
| students | id, user_id, roll_number, standard, division, student_name, phone_number, father_mobile, mother_mobile, date_of_birth |
| faculty | id, user_id, employee_id, department, subject, faculty_name, phone_number, assigned_standard, assigned_division |
| attendance | id, student_id, faculty_id, attendance_date, subject, status |
| homework | id, faculty_id, standard, division, subject, title, description, due_date |
| homework_submissions | id, homework_id, student_id, submission_date, content, grade, status |
| notices | id, created_by, title, content, notice_type, priority, is_published, published_date |
| fees | id, student_id, fee_type, amount, due_date, paid_amount, payment_date, status |
| timetable | id, faculty_id, standard, division, subject, day_of_week, start_time, end_time, room |
| gallery_events | id, event_name, description, event_date, cover_image_url, created_by, is_published |
| gallery_images | id, event_id, image_url, caption |
| study_materials | id, faculty_id, title, description, file_url, folder_id, standard, division, subject |
| study_material_folders | id, faculty_id, folder_name, parent_folder_id, standard, subject |

#### 3.3.2 Key Modules/Classes Design

| Module | Responsibility | Public API |
|--------|---------------|------------|
| auth.ts | Authentication, password management | loginUser, changePassword, seedDemoUsers |
| students.ts | Student CRUD operations | createStudent, getStudentsByClass, getStudentProfile, updateStudent, deleteStudent |
| faculty.ts | Faculty CRUD operations | createFaculty, getFacultyProfile, getAllFaculty, updateFaculty, deleteFaculty |
| attendance.ts | Attendance tracking | markAttendance, getStudentAttendance, getClassAttendance |
| homework.ts | Homework operations | createHomework, submitHomework, gradeHomework |
| notices.ts | Notice management | createNotice, getPublishedNotices, publishNotice |
| fees.ts | Fee management | createFeeRecord, getStudentFees, updatePayment |
| gallery-events.ts | Gallery operations | createGalleryEvent, uploadGalleryImages |
| study-materials.ts | Material operations | createStudyMaterial, getStudyMaterialsByStudent |

### 3.4 Non-Functional Requirements

#### 3.4.1 Performance

| Requirement | Target |
|-------------|--------|
| Page load time | < 3 seconds |
| Database queries | < 1 second response time |
| File upload (up to 10MB) | < 30 seconds |

#### 3.4.2 Security

| Requirement | Implementation |
|-------------|----------------|
| Password hashing | bcrypt with 10-12 salt rounds |
| Input validation | Server-side validation for all inputs |
| Phone validation | 10-digit Indian mobile (6-9 prefix) |
| SQL injection prevention | Parameterized queries via MongoDB |
| XSS prevention | React auto-escaping |

#### 3.4.3 Usability

| Requirement | Target |
|-------------|--------|
| Responsive design | Mobile, tablet, desktop |
| Navigation | Clear sidebar navigation per role |
| Feedback | Alert messages for all operations |

#### 3.4.4 Reliability

| Requirement | Target |
|-------------|--------|
| Uptime | 99% during school hours |
| Data backup | Daily MongoDB backups |
| Error handling | Graceful error messages |

---

## 4. APPENDICES

### A. Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn/UI |
| Database | MongoDB |
| File Storage | Cloudinary |
| Authentication | bcryptjs |

### B. User Roles and Permissions

| Feature | Admin | Faculty | Student |
|---------|-------|---------|---------|
| Manage Students | ✓ | ✗ | ✗ |
| Manage Faculty | ✓ | ✗ | ✗ |
| Mark Attendance | ✓ | ✓ | ✗ |
| View Attendance | ✓ | ✓ | ✓ |
| Create Homework | ✓ | ✓ | ✗ |
| Submit Homework | ✗ | ✗ | ✓ |
| Manage Fees | ✓ | ✗ | View Only |
| Create Notices | ✓ | ✓ | ✗ |
| View Notices | ✓ | ✓ | ✓ |
| Upload Materials | ✓ | ✓ | ✗ |
| Download Materials | ✓ | ✓ | ✓ |
| Manage Gallery | ✓ | ✓ | View Only |
| Change Password | ✓ | ✓ | ✓ |

### C. Validation Rules

| Field | Rule |
|-------|------|
| Phone Number | 10 digits, starts with 6-9 |
| Password | Min 8 chars, uppercase, lowercase, number, special char |
| Name | Letters, spaces, hyphens only, 2-100 chars |
| Email | Valid email format |
| Roll Number | Alphanumeric |

---

## Document Information

| Item | Details |
|------|---------|
| Project Name | SGP-II (School Management System II) |
| Version | 1.0 |
| Date | March 2026 |
| Prepared By | Development Team |

---

*End of SRS Document*
