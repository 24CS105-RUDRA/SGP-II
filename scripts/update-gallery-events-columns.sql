-- Add missing columns to gallery_events table if they don't exist
ALTER TABLE gallery_events ADD COLUMN IF NOT EXISTS event_date DATE;
ALTER TABLE gallery_events ADD COLUMN IF NOT EXISTS created_by VARCHAR;
ALTER TABLE gallery_events ADD COLUMN IF NOT EXISTS created_by_role VARCHAR DEFAULT 'faculty';

-- Rename cover_thumbnail_url to cover_image_url if it exists (create new column and copy data)
ALTER TABLE gallery_events ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR;

-- Copy data from cover_thumbnail_url to cover_image_url if both exist
UPDATE gallery_events SET cover_image_url = cover_thumbnail_url WHERE cover_image_url IS NULL AND cover_thumbnail_url IS NOT NULL;

-- Drop old column if new one has data
ALTER TABLE gallery_events DROP COLUMN IF EXISTS cover_thumbnail_url;

-- Add uploaded_by column if it doesn't exist (for backward compatibility)
ALTER TABLE gallery_events ADD COLUMN IF NOT EXISTS uploaded_by UUID;

-- Create index for faster queries if they don't exist
CREATE INDEX IF NOT EXISTS idx_gallery_events_published ON gallery_events(is_published);
CREATE INDEX IF NOT EXISTS idx_gallery_events_created_by ON gallery_events(created_by);
