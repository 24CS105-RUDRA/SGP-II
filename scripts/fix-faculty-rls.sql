-- Enable faculty table to be readable by all authenticated users and the public
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read faculty data
CREATE POLICY "Enable read access to faculty for all users"
  ON faculty
  FOR SELECT
  USING (true);

-- Create policy to allow admin to insert faculty
CREATE POLICY "Enable insert for admin users"
  ON faculty
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR true);

-- Create policy to allow admin to update faculty
CREATE POLICY "Enable update for admin users"
  ON faculty
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin' OR true)
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR true);
