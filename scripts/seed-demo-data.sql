-- Seed demo data for testing
-- Only admin user for demonstration
-- Passwords are hashed with bcrypt (cost 10)
-- Admin password: admin123

INSERT INTO users (id, username, password_hash, full_name, email, role, year_of_study, division, standard) VALUES
  ('550e8400-e29b-41d4-a716-446655440005', 'admin', '$2a$10$fvqDZLaB7cWeLQLVHbYXoOknVCmUa8yR7SAWfGZKX3NzJPwpH2VBi', 'Administrator', 'admin@school.com', 'admin', NULL, NULL, NULL)
ON CONFLICT (username) DO NOTHING;
