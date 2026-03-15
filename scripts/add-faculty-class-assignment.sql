-- Add class assignment columns to faculty table
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS assigned_standard VARCHAR(50);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS assigned_division VARCHAR(50);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS assigned_stream VARCHAR(50); -- For class 11-12 (Science/Commerce)

-- Add class teacher reference to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS class_teacher_id UUID REFERENCES faculty(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_faculty_assigned_class ON faculty(assigned_standard, assigned_division);
CREATE INDEX IF NOT EXISTS idx_students_class_teacher ON students(class_teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_standard_division ON students(standard, division);
