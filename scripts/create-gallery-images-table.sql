-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES gallery_events(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL,
  image_name VARCHAR NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gallery_images_event_id ON gallery_images(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_uploaded_at ON gallery_images(uploaded_at DESC);

-- Enable RLS for gallery_images
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for gallery_images (allow anyone to view images from published events, only creator to manage)
CREATE POLICY "Anyone can view images from published events" ON gallery_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gallery_events WHERE gallery_events.id = gallery_images.event_id AND gallery_events.is_published = TRUE
    )
  );

CREATE POLICY "Creator and admin can view own images" ON gallery_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gallery_events WHERE gallery_events.id = gallery_images.event_id 
      AND (gallery_events.created_by = current_user OR current_setting('app.user_role') = 'admin')
    )
  );

CREATE POLICY "Only event creator and admin can upload images" ON gallery_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM gallery_events WHERE gallery_events.id = gallery_images.event_id 
      AND (gallery_events.created_by = current_user OR current_setting('app.user_role') = 'admin')
    )
  );

CREATE POLICY "Only event creator and admin can delete images" ON gallery_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM gallery_events WHERE gallery_events.id = gallery_images.event_id 
      AND (gallery_events.created_by = current_user OR current_setting('app.user_role') = 'admin')
    )
  );
