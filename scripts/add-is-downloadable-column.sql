-- Add is_downloadable column to study_materials table
ALTER TABLE study_materials 
ADD COLUMN is_downloadable BOOLEAN DEFAULT true;
