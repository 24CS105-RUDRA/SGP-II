-- Make uploaded_by nullable and add default value
ALTER TABLE gallery_events 
ALTER COLUMN uploaded_by DROP NOT NULL;

-- Set default empty UUID for any new inserts
ALTER TABLE gallery_events 
ALTER COLUMN uploaded_by SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Update any existing NULL values
UPDATE gallery_events 
SET uploaded_by = '00000000-0000-0000-0000-000000000000'::uuid 
WHERE uploaded_by IS NULL;
