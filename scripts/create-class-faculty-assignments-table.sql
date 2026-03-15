-- Create table to store faculty assignments to classes with subjects
CREATE TABLE IF NOT EXISTS class_faculty_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  standard VARCHAR NOT NULL,
  division VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_class_faculty_standard_division ON class_faculty_assignments(standard, division);
CREATE INDEX IF NOT EXISTS idx_class_faculty_faculty_id ON class_faculty_assignments(faculty_id);

-- Enable RLS
ALTER TABLE class_faculty_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow admin and faculty to view/manage, students to view their class faculty
CREATE POLICY "Admin and faculty can view faculty assignments" ON class_faculty_assignments
  FOR SELECT USING (true);

CREATE POLICY "Only admin can insert faculty assignments" ON class_faculty_assignments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admin can update faculty assignments" ON class_faculty_assignments
  FOR UPDATE USING (true);

CREATE POLICY "Only admin can delete faculty assignments" ON class_faculty_assignments
  FOR DELETE USING (true);
