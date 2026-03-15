-- Clean up all demo and dummy data
-- Keep only the structure, remove all demo records

-- Delete all data from tables (order matters due to foreign keys)
DELETE FROM homework_submissions;
DELETE FROM homework;
DELETE FROM attendance;
DELETE FROM syllabus;
DELETE FROM study_materials;
DELETE FROM gallery;
DELETE FROM notices;
DELETE FROM timetable;
DELETE FROM fees;
DELETE FROM students;
DELETE FROM faculty;
DELETE FROM users;

-- Optional: Reset sequences if you want
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
