# Class Assignment System Documentation

## Overview
This document outlines how the faculty class assignment system works end-to-end.

## Database Schema Updates
A migration was executed (`add-faculty-class-assignment.sql`) that added:
- `assigned_class` column to faculty table (e.g., "10", "11", "12")
- `assigned_division` column to faculty table (e.g., "A", "Science", "Commerce")

## Admin Workflow

### Adding Faculty with Class Assignment
1. Admin goes to `/admin/faculty-profiles`
2. Clicks "Add New Faculty" button
3. Fills in faculty details (username, password, name, email, etc.)
4. Selects **Assign Class** (1-12)
5. Based on class selection, Division dropdown updates:
   - **Classes 1-10**: Shows divisions A, B, C, D
   - **Classes 11-12**: Shows Science/Commerce with A, B, C, D variants
6. Selects division and submits form
7. Faculty record is created with class assignment stored in database

### Viewing Faculty
- Faculty table shows "Class/Div" column
- Example: "10-B", "11-Science", "11-Commerce-A"
- Shows "Not Assigned" if no class assigned

## Faculty Workflow

### Marking Attendance
1. Faculty logs in and goes to `/faculty/attendance`
2. System automatically loads their assigned class and division
3. **Assigned Class** and **Division** fields are read-only and display their assigned class
4. Faculty selects a date using the date picker
5. Students from that specific class/division automatically load
6. Faculty clicks on students to toggle: Absent → Present → On Leave
7. "Mark All Present" button quickly marks all visible students as present
8. Clicks "Save Attendance" to commit records to database

### Key Features
- Faculty can only see students from their assigned class
- Cannot change class selection (read-only fields)
- Warning message displays if no class is assigned
- Date selection independent of class selection
- Real-time counter shows Present/On Leave counts

## Student Workflow

### Viewing Attendance
1. Student logs in and goes to `/student/attendance`
2. System fetches their attendance records from database
3. Calendar view shows all records for the current month
4. Color-coded status:
   - **Green**: Present
   - **Blue**: On Leave
   - **Red**: Missing
   - **Purple**: Attendance Percentage

## Database Relationships

\`\`\`
users (id, role, full_name, email)
  ↓
faculty (user_id, assigned_class, assigned_division)
  ↓
students (standard, division, roll_number)
\`\`\`

When faculty marks attendance:
- Records stored in `attendance` table with:
  - `student_id`: Links to students table
  - `faculty_id`: Links to faculty user
  - `attendance_date`: Date of attendance
  - `status`: present/on_leave/missing
  - `subject`: Subject taught

## Server Actions

### Faculty Actions
- `createFaculty(data)`: Creates faculty with class assignment
- `getFacultyByUserId(userId)`: Retrieves faculty profile including assigned class
- `updateFaculty(facultyId, updates)`: Updates faculty info including class assignment

### Attendance Actions
- `getStudentsForAttendance(standard, division)`: Fetches students by class/division
- `markBulkAttendance(records)`: Saves attendance for multiple students
- `getStudentAttendance(userId)`: Retrieves student's attendance history
- `getAttendanceStats(userId)`: Calculates attendance statistics

## Division Logic

**Classes 1-10:**
- Division A, B, C, D (always 4 sections)

**Classes 11-12:**
- Stream-based divisions:
  - Science (A, B, C, D)
  - Commerce (A, B, C, D)

Example class assignments:
- Student: "Meet Shah" - Class 10-B
- Faculty: "Raj Parekh" - Class Teacher of 10-B
- Result: Raj can see Meet in attendance page

## Testing Checklist

- [ ] Admin can add faculty and assign class
- [ ] Admin can view assigned class/division in table
- [ ] Faculty can view their assigned class (read-only)
- [ ] Faculty can mark attendance for assigned class
- [ ] Students from assigned class load automatically
- [ ] Attendance records appear in student view
- [ ] Can change date without changing class
- [ ] Classes 1-10 show A,B,C,D divisions
- [ ] Classes 11-12 show Science/Commerce divisions
- [ ] Unassigned faculty sees warning message
