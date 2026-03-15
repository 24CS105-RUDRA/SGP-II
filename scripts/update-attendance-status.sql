-- Migration: Replace 'on_leave' with 'absent' in attendance status

-- Drop the old constraint FIRST
ALTER TABLE attendance DROP CONSTRAINT attendance_status_check;

-- Update existing 'on_leave' values to 'absent'
UPDATE attendance SET status = 'absent' WHERE status = 'on_leave';

-- Add new constraint with 'absent' instead of 'on_leave'
ALTER TABLE attendance ADD CONSTRAINT attendance_status_check CHECK (status IN ('present', 'absent', 'missing', 'no_record'));
