-- Disable RLS on all tables for development
-- This allows the service role to access all data without policies

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE faculty DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE homework DISABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE timetable DISABLE ROW LEVEL SECURITY;
ALTER TABLE fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus DISABLE ROW LEVEL SECURITY;

-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'faculty', COUNT(*) FROM faculty
UNION ALL
SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'homework', COUNT(*) FROM homework
UNION ALL
SELECT 'notices', COUNT(*) FROM notices
UNION ALL
SELECT 'fees', COUNT(*) FROM fees
UNION ALL
SELECT 'timetable', COUNT(*) FROM timetable
UNION ALL
SELECT 'gallery', COUNT(*) FROM gallery
UNION ALL
SELECT 'syllabus', COUNT(*) FROM syllabus;
