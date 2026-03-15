-- Create faculty users and insert faculty records
-- This script creates user records first, then links them to faculty records

-- Insert users for faculty members
INSERT INTO users (id, username, password_hash, full_name, email, role, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'faculty_rajesh', '$2a$10$dummy_hash_1', 'Dr. Rajesh Sharma', 'rajesh@school.edu', 'faculty', NOW(), NOW()),
  (gen_random_uuid(), 'faculty_priya', '$2a$10$dummy_hash_2', 'Ms. Priya Patel', 'priya@school.edu', 'faculty', NOW(), NOW()),
  (gen_random_uuid(), 'faculty_vikram', '$2a$10$dummy_hash_3', 'Mr. Vikram Singh', 'vikram@school.edu', 'faculty', NOW(), NOW()),
  (gen_random_uuid(), 'faculty_sneha', '$2a$10$dummy_hash_4', 'Mrs. Sneha Verma', 'sneha@school.edu', 'faculty', NOW(), NOW()),
  (gen_random_uuid(), 'faculty_anil', '$2a$10$dummy_hash_5', 'Dr. Anil Kumar', 'anil@school.edu', 'faculty', NOW(), NOW()),
  (gen_random_uuid(), 'faculty_arjun', '$2a$10$dummy_hash_6', 'Mr. Arjun Desai', 'arjun@school.edu', 'faculty', NOW(), NOW()),
  (gen_random_uuid(), 'faculty_meera', '$2a$10$dummy_hash_7', 'Dr. Meera Chopra', 'meera@school.edu', 'faculty', NOW(), NOW()),
  (gen_random_uuid(), 'faculty_anjali', '$2a$10$dummy_hash_8', 'Mrs. Anjali Patel', 'anjali@school.edu', 'faculty', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Now insert faculty records with user references
INSERT INTO faculty (user_id, faculty_name, phone_number, employee_id, department, created_at, updated_at)
SELECT u.id, u.full_name, 
  CASE 
    WHEN u.username = 'faculty_rajesh' THEN '9876543210'
    WHEN u.username = 'faculty_priya' THEN '9876543211'
    WHEN u.username = 'faculty_vikram' THEN '9876543212'
    WHEN u.username = 'faculty_sneha' THEN '9876543213'
    WHEN u.username = 'faculty_anil' THEN '9876543214'
    WHEN u.username = 'faculty_arjun' THEN '9876543215'
    WHEN u.username = 'faculty_meera' THEN '9876543216'
    WHEN u.username = 'faculty_anjali' THEN '9876543217'
    ELSE '9999999999'
  END as phone_number,
  CASE 
    WHEN u.username = 'faculty_rajesh' THEN 'EMP001'
    WHEN u.username = 'faculty_priya' THEN 'EMP002'
    WHEN u.username = 'faculty_vikram' THEN 'EMP003'
    WHEN u.username = 'faculty_sneha' THEN 'EMP004'
    WHEN u.username = 'faculty_anil' THEN 'EMP005'
    WHEN u.username = 'faculty_arjun' THEN 'EMP006'
    WHEN u.username = 'faculty_meera' THEN 'EMP007'
    WHEN u.username = 'faculty_anjali' THEN 'EMP008'
    ELSE NULL
  END as employee_id,
  CASE 
    WHEN u.username IN ('faculty_rajesh', 'faculty_priya', 'faculty_vikram') THEN 'Science'
    WHEN u.username IN ('faculty_sneha') THEN 'Languages'
    WHEN u.username IN ('faculty_anil') THEN 'Social Studies'
    WHEN u.username IN ('faculty_arjun') THEN 'Science'
    WHEN u.username IN ('faculty_meera') THEN 'Science'
    WHEN u.username IN ('faculty_anjali') THEN 'Commerce'
    ELSE 'General'
  END as department,
  NOW(),
  NOW()
FROM users u
WHERE u.role = 'faculty'
AND NOT EXISTS (
  SELECT 1 FROM faculty f WHERE f.user_id = u.id
)
ON CONFLICT DO NOTHING;
