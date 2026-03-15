-- First, create users for faculty members (if using user authentication)
-- Then seed faculty data with proper user_id references

-- Create faculty records with associated user data
-- Note: This assumes faculty have associated user records
-- If not, modify the faculty table to make user_id nullable

-- For now, we'll insert faculty without relying on users
-- Seed sample faculty data for testing
INSERT INTO faculty (id, faculty_name, phone_number, employee_id, department, subject, assigned_standard, assigned_division, assigned_stream, created_at, updated_at)
SELECT 
  gen_random_uuid(), 'Dr. Rajesh Sharma', '9876543210', 'EMP001', 'Science', 'Mathematics', '10', 'A', NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM faculty WHERE employee_id = 'EMP001')
UNION ALL
SELECT 
  gen_random_uuid(), 'Ms. Priya Patel', '9876543211', 'EMP002', 'Science', 'Physics', '10', 'B', NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM faculty WHERE employee_id = 'EMP002')
UNION ALL
SELECT 
  gen_random_uuid(), 'Mr. Vikram Singh', '9876543212', 'EMP003', 'Science', 'Chemistry', '10', 'C', NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM faculty WHERE employee_id = 'EMP003')
UNION ALL
SELECT 
  gen_random_uuid(), 'Mrs. Sneha Verma', '9876543213', 'EMP004', 'Languages', 'English', '10', 'D', NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM faculty WHERE employee_id = 'EMP004')
UNION ALL
SELECT 
  gen_random_uuid(), 'Dr. Anil Kumar', '9876543214', 'EMP005', 'Social Studies', 'History', '9', 'A', NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM faculty WHERE employee_id = 'EMP005')
UNION ALL
SELECT 
  gen_random_uuid(), 'Mr. Arjun Desai', '9876543215', 'EMP006', 'Science', 'Computer Science', '11', 'A', NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM faculty WHERE employee_id = 'EMP006')
UNION ALL
SELECT 
  gen_random_uuid(), 'Dr. Meera Chopra', '9876543216', 'EMP007', 'Science', 'Biology', '12', 'B', NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM faculty WHERE employee_id = 'EMP007')
UNION ALL
SELECT 
  gen_random_uuid(), 'Mrs. Anjali Patel', '9876543217', 'EMP008', 'Commerce', 'Accountancy', '12', 'C', NULL, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM faculty WHERE employee_id = 'EMP008');
