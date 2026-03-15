-- Drop the foreign key constraint on uploaded_by
ALTER TABLE gallery_events
DROP CONSTRAINT IF EXISTS gallery_events_uploaded_by_fkey;

-- Verify the column is now just nullable without foreign key
-- The uploaded_by column will remain but won't enforce any foreign key
