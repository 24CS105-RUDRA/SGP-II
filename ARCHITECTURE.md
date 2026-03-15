# School Management System - Architecture Diagrams

## 🏗️ System Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Student    │  │    Faculty   │  │       Admin          │  │
│  │   Dashboard  │  │   Dashboard  │  │      Dashboard       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                  │                      │             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Attendance   │  │ Mark         │  │ Manage Students      │  │
│  │ Homework     │  │ Attendance   │  │ Manage Faculty       │  │
│  │ Timetable    │  │ Post Notices │  │ Manage Fees          │  │
│  │ Fees         │  │ Create HW    │  │ Reset Passwords      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │       NEXT.JS SERVER ACTIONS             │
        │       (Type-Safe API Layer)              │
        └─────────────────────────────────────────┘
                              │
         ┌────────┬────────┬──┴──┬────────┬──────────┐
         ▼        ▼        ▼     ▼        ▼          ▼
    ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
    │  Auth  ││Attend  ││Homework││Notices ││  Fees  ││Timetbl │
    │ Action ││ Action ││ Action ││ Action ││ Action ││ Action │
    └────────┘└────────┘└────────┘└────────┘└────────┘└────────┘
         │        │        │        │        │         │
         └────────┼────────┼────────┼────────┼─────────┘
                  │
         ┌────────▼────────────────────────┐
         │  SUPABASE (PostgreSQL Database) │
         └────────┬────────────────────────┘
                  │
    ┌─────────────┼─────────────┬──────────────┬─────────────────┐
    ▼             ▼             ▼              ▼                 ▼
┌────────┐  ┌─────────┐  ┌──────────┐  ┌──────────────┐  ┌─────────────┐
│ Users  │  │Students │  │ Faculty  │  │ Attendance   │  │  Homework   │
├────────┤  ├─────────┤  ├──────────┤  ├──────────────┤  ├─────────────┤
│   id   │  │   id    │  │   id     │  │     id       │  │     id      │
│username│  │user_id  │  │ user_id  │  │ student_id   │  │ faculty_id  │
│  role  │  │roll_num │  │emp_id    │  │ faculty_id   │  │   title     │
│ email  │  │standard │  │department│  │  date        │  │ description │
└────────┘  └─────────┘  └──────────┘  │  status      │  │  due_date   │
                                        └──────────────┘  └─────────────┘
    ▼             ▼             ▼              ▼                 ▼
┌────────┐  ┌─────────┐  ┌──────────┐  ┌──────────────┐  ┌─────────────┐
│Notices │  │Timetble │  │   Fees   │  │ Study Mater  │  │  Gallery    │
├────────┤  ├─────────┤  ├──────────┤  ├──────────────┤  ├─────────────┤
│   id   │  │   id    │  │   id     │  │     id       │  │     id      │
│ title  │  │standard │  │student_id│  │ faculty_id   │  │    title    │
│content │  │division │  │  amount  │  │   subject    │  │  image_url  │
│  type  │  │subject  │  │   due    │  │  file_url    │  │  category   │
│priority│  │ time    │  │  status  │  └──────────────┘  └─────────────┘
└────────┘  └─────────┘  └──────────┘
\`\`\`

---

## 🔄 Data Flow Diagrams

### 1. Authentication Flow
\`\`\`
┌─────────────────┐
│  User Enters    │
│ Credentials     │
└────────┬────────┘
         ▼
┌─────────────────────────────────────┐
│  loginUser() Server Action          │
│  - Validate inputs                  │
│  - Query users table                │
│  - Verify bcrypt password           │
└────────┬────────────────────────────┘
         ▼
     ┌─────────────────────┐
     │ Password Match?     │
     └──┬─────────────┬────┘
        │ NO          │ YES
        ▼             ▼
    ┌────────┐   ┌──────────────────────┐
    │ Error  │   │ Return user data     │
    │ Msg    │   │ Store in localStorage│
    └────────┘   │ Redirect to dashboard│
                 └──────────────────────┘
\`\`\`

### 2. Attendance Marking Flow
\`\`\`
┌──────────────────────┐
│ Faculty Opens        │
│ Attendance Page      │
└──────────┬───────────┘
           ▼
┌──────────────────────────────────────┐
│ System Loads Class Students          │
│ getStudentsByClass(std, div)         │
└──────────┬───────────────────────────┘
           ▼
┌──────────────────────────────────────┐
│ Faculty Selects:                     │
│ - Student                            │
│ - Status (Present/Leave/Missing)     │
│ - Date                               │
└──────────┬───────────────────────────┘
           ▼
┌──────────────────────────────────────┐
│ markAttendance() Server Action       │
│ INSERT/UPDATE attendance table       │
└──────────┬───────────────────────────┘
           ▼
┌──────────────────────────────────────┐
│ Confirmation Message                 │
│ Record Saved                         │
└──────────────────────────────────────┘
\`\`\`

### 3. Homework Management Flow
\`\`\`
┌────────────────────────┐
│ Faculty Creates        │
│ Homework Assignment    │
└────────────┬───────────┘
             ▼
┌─────────────────────────────────────┐
│ createHomework() Server Action      │
│ INSERT INTO homework table          │
└────────────┬───────────────────────┘
             ▼
┌─────────────────────────────────────┐
│ Student Views Homework              │
│ getHomeworkByStudent(studentId)     │
│ - Filters by standard/division      │
│ - Groups by due_date                │
└────────────┬───────────────────────┘
             ▼
┌─────────────────────────────────────┐
│ Student Submits                     │
│ submitHomework(hwId, studentId)     │
└────────────┬───────────────────────┘
             ▼
┌─────────────────────────────────────┐
│ Faculty Grades                      │
│ gradeHomework(submissionId, grade)  │
└─────────────────────────────────────┘
\`\`\`

---

## 🗄️ Database Schema Relationships

\`\`\`
                    ┌──────────────────┐
                    │     users        │
                    │  (id, username,  │
                    │   password_hash, │
                    │     role)        │
                    └────────┬─────────┘
                      ▲      │      ▲
                 (1)  │      │ (1)  │
                 ┌────┘      │      └──────┐
                 │           │             │
              (M)│        (M)│          (M)│
                 │           │             │
        ┌────────▼────┐  ┌──▼──────────┐  ├─────────────────┐
        │   students  │  │   faculty   │  │ notices         │
        │ (user_id)   │  │ (user_id)   │  │ (created_by)    │
        └────┬───────┬┘  └──┬──────────┘  └─────────────────┘
             │       │      │
          (1)│    (1)│      │(1)
             │       │      │
          (M)│       │      │(M)
             │       │      │
    ┌────────▼──┐ ┌──▼──────▼────────┐
    │ attendance │ │ timetable        │
    │ (student_id)│ │ (faculty_id)     │
    └────────┬──┘  └──┬───────────────┘
             │        │
          (1)│        │(1)
             │        │
          (M)│        │(M)
             │        │
    ┌────────▼────────▼────────┐
    │     homework             │
    │  (faculty_id)            │
    └────────┬─────────────────┘
             │
          (1)│
             │
          (M)│
             │
    ┌────────▼──────────────────┐
    │ homework_submissions       │
    │ (homework_id, student_id) │
    └───────────────────────────┘

    ┌──────────────┐    ┌──────────┐    ┌───────────┐
    │     fees     │    │  gallery │    │ syllabus  │
    │ (student_id) │    │(uploaded)│    │(faculty_id)
    └──────────────┘    └──────────┘    └───────────┘
\`\`\`

---

## 🔐 Security Architecture

\`\`\`
┌────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                        │
│                                                            │
│  Passwords NEVER sent as plain text                       │
│  Session stored in localStorage                           │
│  No sensitive data in cookies                             │
└──────────────────┬─────────────────────────────────────────┘
                   │ HTTPS
                   ▼
┌────────────────────────────────────────────────────────────┐
│                 NEXT.JS SERVER                             │
│                                                            │
│  ✓ Input Validation                                       │
│  ✓ Authentication Checks                                  │
│  ✓ Password Hashing (bcrypt)                             │
│  ✓ Parameterized Queries                                 │
└──────────────────┬─────────────────────────────────────────┘
                   │
      ┌────────────┴────────────┐
      │ Two Types of Keys      │
      └────────┬───────────────┘
               │
      ┌────────┴──────────────────────────┐
      │                                   │
      ▼                                   ▼
┌─────────────────────┐        ┌──────────────────────┐
│   ANON KEY          │        │ SERVICE ROLE KEY     │
│  (Public)           │        │  (Secret - Server)   │
│                     │        │                      │
│ - Read/write limit  │        │ - Full access        │
│ - Safe on client    │        │ - Never expose!      │
│ - Basic queries     │        │ - Admin operations   │
└─────────────────────┘        └──────────────────────┘
      │                              │
      └──────────────┬───────────────┘
                     ▼
         ┌──────────────────────────┐
         │  SUPABASE (PostgreSQL)   │
         │                          │
         │  ✓ Encryption at rest    │
         │  ✓ Backups               │
         │  ✓ Access logs           │
         │  ✓ Audit trail           │
         └──────────────────────────┘
\`\`\`

---

## 📊 API Call Flow

\`\`\`
┌──────────────────────────────────────────┐
│  UI Component (Client)                   │
│  "use client"                            │
└──────────────┬───────────────────────────┘
               │
               │ Calls server action
               ▼
┌──────────────────────────────────────────┐
│  Server Action (lib/actions/*)           │
│  "use server"                            │
│  - Validate inputs                       │
│  - Check authentication                  │
│  - Type checking                         │
└──────────────┬───────────────────────────┘
               │
               │ createClient()
               ▼
┌──────────────────────────────────────────┐
│  Supabase Client                         │
│  Service Role Key                        │
│  Database query                          │
└──────────────┬───────────────────────────┘
               │
               │ SQL Query
               ▼
┌──────────────────────────────────────────┐
│  PostgreSQL Database                     │
│  - Execute query                         │
│  - Return results                        │
│  - Handle constraints                    │
└──────────────┬───────────────────────────┘
               │
               │ Results
               ▼
┌──────────────────────────────────────────┐
│  Response Object                         │
│  {                                       │
│    success: boolean,                     │
│    data?: T,                             │
│    error?: string                        │
│  }                                       │
└──────────────┬───────────────────────────┘
               │
               │ Return to client
               ▼
┌──────────────────────────────────────────┐
│  UI Updates                              │
│  - Show data                             │
│  - Show error message                    │
│  - Refresh component                     │
└──────────────────────────────────────────┘
\`\`\`

---

## 🎯 User Journey - Student

\`\`\`
Start
  │
  ▼
┌─────────────┐
│ Login Page  │  "student1 / password123"
└──────┬──────┘
       ▼
┌─────────────────────────┐
│ Student Dashboard       │  10 Categories
│ (Category Grid)         │
└──────┬──────────────────┘
       │
       ├─────────────────────────┬─────────────┬──────────────┐
       │                         │             │              │
       ▼                         ▼             ▼              ▼
   ┌────────┐          ┌─────────────┐  ┌──────────┐   ┌──────────┐
   │Attendance       │ Homework    │  │Timetable │   │  Fees    │
   │ Calendar        │  by Date    │  │  (Grid)  │   │          │
   └────────┘        └─────────────┘  └──────────┘   └──────────┘
       │                 │                 │              │
       │ Get attendance  │ Get homework    │ Get schedule │ Get fees
       │ stats           │                 │              │
       │                 │                 │              │
       └─────────────────┴─────────────────┴──────────────┘
                         │
                         ▼
             Supabase Database Queries
                         │
                         ▼
             Display Data in UI
\`\`\`

---

## 👨‍🏫 User Journey - Faculty

\`\`\`
Start
  │
  ▼
┌─────────────┐
│ Login Page  │  "faculty1 / password123"
└──────┬──────┘
       ▼
┌─────────────────────────┐
│ Faculty Dashboard       │  8 Options
└──────┬──────────────────┘
       │
   ┌───┼───┬───┬───────┬──────┬────────┐
   │   │   │   │       │      │        │
   ▼   ▼   ▼   ▼       ▼      ▼        ▼
┌────────────────────────────────────────────────┐
│ Attendance │ Notices │ Homework │ Materials   │
│ Mark class │ Post    │ Create & │ Upload      │
│            │ Announce│ Grade    │ Resources   │
└────────────────────────────────────────────────┘
   │   │      │   │       │   │      │
   └───┼──────┴───┼───────┴───┼──────┘
       │         │           │
       ▼         ▼           ▼
  INSERT/UPDATE Operations
       │
       ▼
  Supabase Database
       │
       ▼
  Confirmation Messages
\`\`\`

---

## 🔑 Admin User Journey

\`\`\`
Start
  │
  ▼
┌─────────────┐
│ Login Page  │  "admin / password123"
└──────┬──────┘
       ▼
┌──────────────────────────────┐
│ Admin Dashboard              │ 7 Sections
└──────┬───────────────────────┘
       │
   ┌───┼────┬────┬────────┬──────────┐
   │   │    │    │        │          │
   ▼   ▼    ▼    ▼        ▼          ▼
┌──────────────────────────────────────────────────┐
│Student Prof │Faculty Prof │Notices │Fees│Gallery│
│  - Create   │  - Create   │ -Post  │-Add│       │
│  - Edit     │  - Edit     │ -Edit  │-Pay│       │
│  - Delete   │  - Delete   │ -Delete│-Del│       │
└──────────────────────────────────────────────────┘
   │          │              │   │     │
   └──────────┼──────────────┼───┼─────┘
              │              │   │
   ┌──────────┴──┬───────────┘   │
   │             │               │
   ▼             ▼               ▼
Admin Creates  Manages Students  Dashboard Stats
New Records    by Class
   │             │               │
   └─────────────┴───────────────┘
          │
          ▼
     INSERT/UPDATE/DELETE
          │
          ▼
     Supabase Database
\`\`\`

---

## 📱 Component Architecture

\`\`\`
┌─────────────────────────────────────┐
│           Layout.tsx                │
│      (Root + Global Config)         │
└────────────┬────────────────────────┘
             │
        ┌────┴────┐
        │          │
        ▼          ▼
   ┌─────────┐ ┌────────────┐
   │ Student │ │ Faculty    │ │ Admin
   │ Layout  │ │ Layout     │ │ Layout
   └────┬────┘ └────────────┘ └───┬────┘
        │                         │
    ┌───┼───────────────┬─────────┼──┐
    │   │               │         │  │
    ▼   ▼               ▼         ▼  ▼
┌────────────────────────────────────────┐
│ Page Components                        │
│ - Dashboard                            │
│ - Attendance                           │
│ - Homework                             │
│ - Notices                              │
│ - Fees                                 │
│ - Timetable                            │
└────────────────────────────────────────┘
    │   │               │         │  │
    └───┴───────────────┴─────────┴──┘
            │
            ▼
    ┌──────────────────────┐
    │ UI Components        │
    │ (From shadcn/ui)     │
    │ - Cards              │
    │ - Tables             │
    │ - Forms              │
    │ - Buttons            │
    └──────────────────────┘
\`\`\`

---

## 🔄 Database Query Patterns

### Pattern 1: Simple SELECT
\`\`\`
getStudentAttendance(studentId)
    │
    ▼
SELECT * FROM attendance WHERE student_id = ?
    │
    ▼
Return array of records
\`\`\`

### Pattern 2: JOIN Query
\`\`\`
getStudentsByClass(standard, division)
    │
    ▼
SELECT s.*, u.full_name, u.email 
FROM students s
JOIN users u ON s.user_id = u.id
WHERE s.standard = ? AND s.division = ?
    │
    ▼
Return enriched data with user info
\`\`\`

### Pattern 3: UPSERT
\`\`\`
markAttendance(data)
    │
    ▼
INSERT INTO attendance (...) VALUES (...)
ON CONFLICT (student_id, attendance_date, subject)
DO UPDATE SET status = ?
    │
    ▼
Insert new or update existing
\`\`\`

### Pattern 4: Aggregate
\`\`\`
getAttendanceStats(studentId)
    │
    ▼
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status='present') as present,
  COUNT(CASE WHEN status='on_leave') as on_leave
FROM attendance
WHERE student_id = ?
    │
    ▼
Return statistics object
\`\`\`

---

## ⚙️ Configuration Overview

\`\`\`
Environment Variables
    │
    ├─ NEXT_PUBLIC_SUPABASE_URL (Client-safe)
    ├─ NEXT_PUBLIC_SUPABASE_ANON_KEY (Public)
    └─ SUPABASE_SERVICE_ROLE_KEY (Secret - Server only)
    
Server Configuration
    │
    ├─ next.config.mjs
    ├─ tsconfig.json
    └─ package.json
    
Database Configuration
    │
    ├─ Schema (12 tables)
    ├─ Indexes
    ├─ Relationships
    └─ Constraints
\`\`\`

---

## 📈 Performance Architecture

\`\`\`
┌────────────────────────────────────┐
│ Optimization Strategies            │
├────────────────────────────────────┤
│                                    │
│  1. Database Indexes               │
│     - Fast lookups                 │
│     - Sorted queries               │
│                                    │
│  2. Server Actions                 │
│     - No REST API overhead         │
│     - Direct DB queries            │
│                                    │
│  3. Type Safety                    │
│     - Compile-time checks          │
│     - No runtime errors            │
│                                    │
│  4. Query Optimization             │
│     - SELECT only needed columns   │
│     - WHERE clause filtering       │
│     - Proper JOINs                 │
│                                    │
│  5. Caching Strategy               │
│     - Client-side session          │
│     - Browser cache                │
│     - Database-level optimization  │
│                                    │
└────────────────────────────────────┘
\`\`\`

---

This architecture ensures:
✅ **Scalability** - Proper database design
✅ **Security** - Server-side operations
✅ **Performance** - Optimized queries
✅ **Maintainability** - Clear structure
✅ **Type Safety** - Full TypeScript
