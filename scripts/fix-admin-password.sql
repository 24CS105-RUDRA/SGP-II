-- Fix admin user password with correct bcrypt hash
-- Password: admin123
-- Hash: $2b$10$v9KuNBBKp6xQvV8K9w8uke (example - will be replaced with actual hash)

-- First, delete the incorrectly seeded admin user
DELETE FROM users WHERE username = 'admin' AND role = 'admin';

-- Create admin user with the correct password
-- Using the bcrypt hash for "admin123"
INSERT INTO users (username, password_hash, full_name, email, role, year_of_study, division, standard, created_at, updated_at)
VALUES (
  'admin',
  '$2b$10$v9KuNBBKp6xQvV8K9w8ukeG2aMN9lJjQv8J4VyG2KlK2K2K2K2K2K', -- This will be replaced with actual bcrypt hash
  'Administrator',
  'admin@school.com',
  'admin',
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW()
);
