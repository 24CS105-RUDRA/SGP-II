-- Drop the uploaded_by column since we're using created_by and created_by_role instead
ALTER TABLE gallery_events DROP COLUMN IF EXISTS uploaded_by;

-- Add NOT NULL constraint to created_by if it doesn't have it
ALTER TABLE gallery_events ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE gallery_events ALTER COLUMN created_by_role SET NOT NULL;
