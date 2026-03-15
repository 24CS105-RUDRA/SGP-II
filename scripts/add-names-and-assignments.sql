-- Add name columns to students and faculty tables
-- Add student_name to students table (from users.full_name)
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_name VARCHAR(255);

-- Add faculty_name to faculty table (from users.full_name)  
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS faculty_name VARCHAR(255);

-- Add assigned_standard and assigned_division to faculty table
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS assigned_standard VARCHAR(50);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS assigned_division VARCHAR(50);

-- Create faculty_student_assignment table to track which students are assigned to which faculty
CREATE TABLE IF NOT EXISTS faculty_student_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(faculty_id, student_id)
);

-- Update existing student_name from users table
UPDATE students 
SET student_name = users.full_name
FROM users 
WHERE students.user_id = users.id AND students.student_name IS NULL;

-- Update existing faculty_name from users table
UPDATE faculty 
SET faculty_name = users.full_name
FROM users 
WHERE faculty.user_id = users.id AND faculty.faculty_name IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_faculty_standard_division ON faculty(assigned_standard, assigned_division);
CREATE INDEX IF NOT EXISTS idx_faculty_student_assignments_faculty ON faculty_student_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_student_assignments_student ON faculty_student_assignments(student_id);
