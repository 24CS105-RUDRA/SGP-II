-- Seed Students Data
INSERT INTO students (user_id, standard, division, year_of_study, roll_number, parent_phone, address, is_active)
SELECT id, '10-A', 'A', '10', '001', '9876543210', 'Mumbai, Maharashtra', true
FROM users WHERE username = 'student1'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO students (user_id, standard, division, year_of_study, roll_number, parent_phone, address, is_active)
SELECT id, '10-B', 'B', '10', '002', '9876543211', 'Delhi, Delhi', true
FROM users WHERE username = 'student2'
ON CONFLICT (user_id) DO NOTHING;

-- Seed Faculty Data
INSERT INTO faculty (user_id, department, subject, qualification, phone_number, office_location, is_active)
SELECT id, 'Science', 'Mathematics', 'M.Sc, B.Ed', '9123456789', 'Room 301', true
FROM users WHERE username = 'faculty1'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO faculty (user_id, department, subject, qualification, phone_number, office_location, is_active)
SELECT id, 'Science', 'Physics', 'M.Sc, B.Ed', '9123456790', 'Room 302', true
FROM users WHERE username = 'faculty2'
ON CONFLICT (user_id) DO NOTHING;

-- Seed Attendance Data (January 2026)
INSERT INTO attendance (student_id, faculty_id, attendance_date, status, remarks)
SELECT 
  s.id,
  f.id,
  '2026-01-20'::date,
  'present',
  'Regular attendance'
FROM students s, faculty f LIMIT 1;

INSERT INTO attendance (student_id, faculty_id, attendance_date, status, remarks)
SELECT 
  s.id,
  f.id,
  '2026-01-19'::date,
  'on_leave',
  'Medical leave'
FROM students s, faculty f WHERE s.standard = '10-A' LIMIT 1;

INSERT INTO attendance (student_id, faculty_id, attendance_date, status, remarks)
SELECT 
  s.id,
  f.id,
  '2026-01-18'::date,
  'present',
  'Regular attendance'
FROM students s, faculty f WHERE s.standard = '10-B' LIMIT 1;

INSERT INTO attendance (student_id, faculty_id, attendance_date, status, remarks)
VALUES 
  ((SELECT id FROM students WHERE standard = '10-A' LIMIT 1), 
   (SELECT id FROM faculty WHERE subject = 'Mathematics' LIMIT 1), 
   '2026-01-17'::date, 'present', 'Regular attendance'),
  ((SELECT id FROM students WHERE standard = '10-B' LIMIT 1), 
   (SELECT id FROM faculty WHERE subject = 'Physics' LIMIT 1), 
   '2026-01-16'::date, 'present', 'Regular attendance'),
  ((SELECT id FROM students WHERE standard = '10-A' LIMIT 1), 
   (SELECT id FROM faculty WHERE subject = 'Physics' LIMIT 1), 
   '2026-01-15'::date, 'on_leave', 'Approved leave'),
  ((SELECT id FROM students WHERE standard = '10-B' LIMIT 1), 
   (SELECT id FROM faculty WHERE subject = 'Mathematics' LIMIT 1), 
   '2026-01-14'::date, 'present', 'Regular attendance');

-- Seed Timetable Data
INSERT INTO timetable (faculty_id, standard, day_of_week, time_slot, subject_name, room_number, start_time, end_time)
SELECT 
  (SELECT id FROM faculty WHERE subject = 'Mathematics' LIMIT 1),
  '10-A',
  'Monday',
  '1',
  'Mathematics',
  '101',
  '08:00',
  '09:00'
ON CONFLICT DO NOTHING;

INSERT INTO timetable (faculty_id, standard, day_of_week, time_slot, subject_name, room_number, start_time, end_time)
SELECT 
  (SELECT id FROM faculty WHERE subject = 'Physics' LIMIT 1),
  '10-B',
  'Tuesday',
  '2',
  'Physics',
  '102',
  '09:15',
  '10:15'
ON CONFLICT DO NOTHING;

INSERT INTO timetable (faculty_id, standard, day_of_week, time_slot, subject_name, room_number, start_time, end_time)
SELECT 
  (SELECT id FROM faculty WHERE subject = 'Mathematics' LIMIT 1),
  '10-B',
  'Wednesday',
  '3',
  'Mathematics',
  '101',
  '10:30',
  '11:30'
ON CONFLICT DO NOTHING;

INSERT INTO timetable (faculty_id, standard, day_of_week, time_slot, subject_name, room_number, start_time, end_time)
SELECT 
  (SELECT id FROM faculty WHERE subject = 'Physics' LIMIT 1),
  '10-A',
  'Thursday',
  '4',
  'Physics',
  '102',
  '11:45',
  '12:45'
ON CONFLICT DO NOTHING;

-- Seed Homework Data
INSERT INTO homework (faculty_id, standard, title, description, due_date, assigned_date, subject)
SELECT 
  (SELECT id FROM faculty WHERE subject = 'Mathematics' LIMIT 1),
  '10-A',
  'Solve Calculus Problems - Chapter 5',
  'Complete exercises 5.1 to 5.5 from the textbook. Include step-by-step solutions.',
  '2026-01-25'::date,
  '2026-01-20'::date,
  'Mathematics'
ON CONFLICT DO NOTHING;

INSERT INTO homework (faculty_id, standard, title, description, due_date, assigned_date, subject)
SELECT 
  (SELECT id FROM faculty WHERE subject = 'Physics' LIMIT 1),
  '10-B',
  'Laws of Motion - Numerical Problems',
  'Solve 10 numerical problems on Newtons laws. Submit in A4 format.',
  '2026-01-24'::date,
  '2026-01-19'::date,
  'Physics'
ON CONFLICT DO NOTHING;

INSERT INTO homework (faculty_id, standard, title, description, due_date, assigned_date, subject)
SELECT 
  (SELECT id FROM faculty WHERE subject = 'Mathematics' LIMIT 1),
  '10-B',
  'Algebra Assignment',
  'Solve all problems from page 45-50 in the textbook.',
  '2026-01-23'::date,
  '2026-01-18'::date,
  'Mathematics'
ON CONFLICT DO NOTHING;

-- Seed Notices Data
INSERT INTO notices (faculty_id, title, content, is_published, published_date, standard)
SELECT 
  (SELECT id FROM faculty LIMIT 1),
  'Annual Examination Schedule',
  'Final examinations will commence from March 15. Check the attached schedule for details.',
  true,
  NOW(),
  '10-A'
ON CONFLICT DO NOTHING;

INSERT INTO notices (faculty_id, title, content, is_published, published_date, standard)
SELECT 
  (SELECT id FROM faculty LIMIT 1),
  'Library Extension Hours',
  'The school library will remain open until 7:00 PM during examination season.',
  true,
  NOW(),
  '10-B'
ON CONFLICT DO NOTHING;

INSERT INTO notices (faculty_id, title, content, is_published, published_date, standard)
SELECT 
  (SELECT id FROM faculty LIMIT 1),
  'Sports Day Registrations',
  'Register for sports day events by March 1st. Limited slots available.',
  true,
  NOW(),
  NULL
ON CONFLICT DO NOTHING;

-- Seed Fees Data
INSERT INTO fees (student_id, fee_type, amount, due_date, paid_date, status, academic_year)
SELECT 
  (SELECT id FROM students WHERE standard = '10-A' LIMIT 1),
  'Tuition',
  50000,
  '2026-03-31'::date,
  NULL,
  'pending',
  '2025-2026'
ON CONFLICT DO NOTHING;

INSERT INTO fees (student_id, fee_type, amount, due_date, paid_date, status, academic_year)
SELECT 
  (SELECT id FROM students WHERE standard = '10-B' LIMIT 1),
  'Tuition',
  50000,
  '2026-03-31'::date,
  '2026-01-15'::date,
  'paid',
  '2025-2026'
ON CONFLICT DO NOTHING;

INSERT INTO fees (student_id, fee_type, amount, due_date, paid_date, status, academic_year)
SELECT 
  (SELECT id FROM students WHERE standard = '10-A' LIMIT 1),
  'Bus Fee',
  15000,
  '2026-03-31'::date,
  NULL,
  'pending',
  '2025-2026'
ON CONFLICT DO NOTHING;

-- Seed Gallery Data
INSERT INTO gallery (title, description, image_url, uploaded_date, faculty_id, category)
SELECT 
  'Annual Sports Day 2025',
  'Photos from the annual sports day event',
  '/gallery1.jpg',
  NOW(),
  (SELECT id FROM faculty LIMIT 1),
  'Sports'
ON CONFLICT DO NOTHING;

INSERT INTO gallery (title, description, image_url, uploaded_date, faculty_id, category)
SELECT 
  'Science Exhibition',
  'Student projects from science exhibition',
  '/gallery2.jpg',
  NOW(),
  (SELECT id FROM faculty LIMIT 1),
  'Academic'
ON CONFLICT DO NOTHING;

-- Seed Syllabus Data
INSERT INTO syllabus (faculty_id, standard, subject, content, academic_year, total_chapters)
SELECT 
  (SELECT id FROM faculty WHERE subject = 'Mathematics' LIMIT 1),
  '10-A',
  'Mathematics',
  'Chapter 1: Real Numbers, Chapter 2: Polynomials, Chapter 3: Linear Equations, Chapter 4: Quadratic Equations, Chapter 5: Arithmetic Progressions',
  '2025-2026',
  5
ON CONFLICT DO NOTHING;

INSERT INTO syllabus (faculty_id, standard, subject, content, academic_year, total_chapters)
SELECT 
  (SELECT id FROM faculty WHERE subject = 'Physics' LIMIT 1),
  '10-B',
  'Physics',
  'Chapter 1: Light, Chapter 2: Electricity, Chapter 3: Magnetism, Chapter 4: Heat, Chapter 5: Sound',
  '2025-2026',
  5
ON CONFLICT DO NOTHING;

-- Seed Study Materials Data
INSERT INTO study_materials (faculty_id, standard, subject, title, file_url, uploaded_date, material_type, description)
SELECT 
  (SELECT id FROM faculty WHERE subject = 'Mathematics' LIMIT 1),
  '10-A',
  'Mathematics',
  'Chapter 5 Lecture Notes',
  '/materials/math_ch5.pdf',
  NOW(),
  'pdf',
  'Complete lecture notes with examples and solutions'
ON CONFLICT DO NOTHING;

INSERT INTO study_materials (faculty_id, standard, subject, title, file_url, uploaded_date, material_type, description)
SELECT 
  (SELECT id FROM faculty WHERE subject = 'Physics' LIMIT 1),
  '10-B',
  'Physics',
  'Electricity Concepts Video',
  '/materials/physics_electricity.mp4',
  NOW(),
  'video',
  'Complete video explanation of electricity concepts'
ON CONFLICT DO NOTHING;

-- Verify data was inserted
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Faculty', COUNT(*) FROM faculty
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'Homework', COUNT(*) FROM homework
UNION ALL
SELECT 'Notices', COUNT(*) FROM notices
UNION ALL
SELECT 'Fees', COUNT(*) FROM fees
UNION ALL
SELECT 'Gallery', COUNT(*) FROM gallery
UNION ALL
SELECT 'Timetable', COUNT(*) FROM timetable
UNION ALL
SELECT 'Syllabus', COUNT(*) FROM syllabus
UNION ALL
SELECT 'Study Materials', COUNT(*) FROM study_materials;
