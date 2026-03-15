-- Insert faculty data directly with hardcoded UUIDs for demo purposes
INSERT INTO public.faculty (id, user_id, faculty_name, phone_number, employee_id, department, subject, assigned_standard, assigned_division, assigned_stream, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Dr. Rajesh Sharma', '9876543210', 'EMP001', 'Science', 'Mathematics', '10', 'A', NULL, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Ms. Priya Patel', '9876543211', 'EMP002', 'Science', 'Physics', '10', 'B', NULL, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, 'Mr. Vikram Singh', '9876543212', 'EMP003', 'Science', 'Chemistry', '10', 'C', NULL, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'Mrs. Sneha Verma', '9876543213', 'EMP004', 'Languages', 'English', '10', 'D', NULL, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid, 'Dr. Anil Kumar', '9876543214', 'EMP005', 'Social Studies', 'History', '9', 'A', NULL, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid, 'Mr. Arjun Desai', '9876543215', 'EMP006', 'Science', 'Computer Science', '11', 'A', NULL, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440007'::uuid, '550e8400-e29b-41d4-a716-446655440007'::uuid, 'Dr. Meera Chopra', '9876543216', 'EMP007', 'Science', 'Biology', '12', 'B', NULL, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440008'::uuid, '550e8400-e29b-41d4-a716-446655440008'::uuid, 'Mrs. Anjali Patel', '9876543217', 'EMP008', 'Commerce', 'Accountancy', '12', 'C', NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;
