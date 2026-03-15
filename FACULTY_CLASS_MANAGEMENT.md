# Faculty Class Management Module - Complete Setup

## Overview
The Faculty Class Management system allows administrators to assign faculty members to classes with specific subjects. Students can then view their assigned faculty with contact details.

## Database Schema

### class_faculty_assignments Table
- `id` (UUID) - Primary key
- `standard` (VARCHAR) - Class number (1-12)
- `division` (VARCHAR) - Division (A, B, C, D)
- `faculty_id` (UUID) - Foreign key to faculty table
- `subject` (VARCHAR) - Subject taught by this faculty
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Record update time

### faculty Table (Referenced)
- `id` (UUID) - Primary key
- `faculty_name` (VARCHAR) - Faculty member's name
- `phone_number` (VARCHAR) - Contact number
- `department` (VARCHAR) - Department
- `subject` (VARCHAR) - Primary subject
- Other fields: employee_id, assigned_standard, assigned_division, etc.

## Features

### Admin Portal (/admin/faculty-class-management)
1. **Class Selection**: Select standard (1-12) and division (A-D)
2. **Faculty Assignment**: 
   - View all available faculty from the faculty table
   - Assign multiple faculty to same class with different subjects
   - Prevent duplicate assignments
3. **Faculty Management**:
   - Display assigned faculty with name, subject, and phone number
   - Remove faculty from class assignments
4. **Real-time Updates**: Faculty list updates immediately after assignment/removal

### Student Portal (/student/faculty-info)
1. **Auto-populated Class**: Student sees faculty assigned to their class
2. **Faculty Details**: Displays:
   - Faculty name
   - Subject they teach
   - Phone number (clickable for direct call)
3. **Responsive Grid**: 1 column on mobile, 2-3 columns on desktop

## Database Queries

### Get Faculty for Class
```sql
SELECT * FROM class_faculty_assignments 
WHERE standard = 'X' AND division = 'Y'
```
Then join with faculty table to get faculty_name and phone_number.

### Assign Faculty to Class
```sql
INSERT INTO class_faculty_assignments 
(faculty_id, standard, division, subject) 
VALUES (?, ?, ?, ?)
```

### Get All Available Faculty
```sql
SELECT id, faculty_name, phone_number 
FROM faculty 
ORDER BY faculty_name ASC
```

## Key Implementation Details

1. **Two-Step Query Pattern**: Instead of relying on foreign key joins, the code:
   - Fetches assignments from class_faculty_assignments
   - Fetches faculty details from faculty table using faculty_ids
   - Maps them together to avoid RLS/permission issues

2. **Class Range**: Supports classes 1-12 (not just 8-12) for primary and secondary students

3. **Duplicate Prevention**: Checks existing assignments before adding to prevent duplicate faculty in same class

4. **Data Integrity**: 
   - Proper error handling for database operations
   - Detailed console logging for debugging
   - Graceful fallbacks for missing data

## Workflow

### Admin Workflow
1. Login as admin
2. Navigate to "Faculty Class Management" from sidebar
3. Select standard (1-12) and division (A-D)
4. View currently assigned faculty
5. Click "Add Faculty" to assign new faculty
6. Select faculty from dropdown and enter subject
7. Click "Assign Faculty" to save
8. View updated faculty list immediately

### Student Workflow
1. Login as student
2. Navigate to "Faculty Info" from sidebar
3. See auto-populated class information
4. View all faculty assigned to their class
5. See faculty name, subject, and phone number
6. Click phone number to call (if mobile)

## Testing Checklist

- [ ] Admin can select all classes 1-12
- [ ] Admin can select all divisions A-D
- [ ] Faculty dropdown shows all available faculty
- [ ] Faculty assignment succeeds with valid data
- [ ] Duplicate prevention works
- [ ] Faculty list updates immediately after assignment
- [ ] Faculty removal works correctly
- [ ] Student sees correct faculty for their class
- [ ] Phone numbers display correctly
- [ ] Mobile responsiveness works
- [ ] Error messages display for invalid operations

## Known Limitations

- Phone number displayed only (no email from faculty table)
- Maximum 8 faculty per class can be assigned (recommended best practice)
- All 4 divisions must use same faculty roster when assigning

## Future Enhancements

- Add edit functionality to change subject for assigned faculty
- Bulk assignment for all divisions at once
- Faculty workload management
- Subject-wise faculty filtering
- Time slot management for faculty
