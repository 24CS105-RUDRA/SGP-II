-- Create study_material_folders table for hierarchical folder structure
CREATE TABLE study_material_folders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id uuid NOT NULL,
  standard varchar NOT NULL,
  subject varchar NOT NULL,
  parent_folder_id uuid REFERENCES study_material_folders(id) ON DELETE CASCADE,
  folder_name varchar NOT NULL,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW(),
  CONSTRAINT fk_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
);

-- Add folder_id column to study_materials table
ALTER TABLE study_materials ADD COLUMN folder_id uuid REFERENCES study_material_folders(id) ON DELETE CASCADE;

-- Create index for efficient querying
CREATE INDEX idx_folders_faculty_standard_subject ON study_material_folders(faculty_id, standard, subject);
CREATE INDEX idx_folders_parent ON study_material_folders(parent_folder_id);
CREATE INDEX idx_materials_folder ON study_materials(folder_id);
