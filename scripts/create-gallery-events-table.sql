-- Create gallery_events table to organize images by event
CREATE TABLE IF NOT EXISTS gallery_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name VARCHAR NOT NULL,
  description TEXT,
  cover_thumbnail_url VARCHAR NOT NULL,
  event_date DATE,
  created_by VARCHAR NOT NULL,
  created_by_role VARCHAR DEFAULT 'faculty',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modify gallery table to reference events
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES gallery_events(id);
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gallery_event_id ON gallery(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_events_published ON gallery_events(is_published);
CREATE INDEX IF NOT EXISTS idx_gallery_is_published ON gallery(is_published);

-- Enable RLS for gallery_events
ALTER TABLE gallery_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for gallery_events (allow anyone to read published events, only creator to modify)
CREATE POLICY "Anyone can view published events" ON gallery_events
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Creator and admin can view own events" ON gallery_events
  FOR SELECT USING (created_by = current_user OR current_setting('app.user_role') = 'admin');

CREATE POLICY "Only admin and faculty can create events" ON gallery_events
  FOR INSERT WITH CHECK (current_setting('app.user_role') IN ('admin', 'faculty'));

CREATE POLICY "Only creator and admin can update own events" ON gallery_events
  FOR UPDATE USING (created_by = current_user OR current_setting('app.user_role') = 'admin');

CREATE POLICY "Only creator and admin can delete own events" ON gallery_events
  FOR DELETE USING (created_by = current_user OR current_setting('app.user_role') = 'admin');
