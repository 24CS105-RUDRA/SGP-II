-- Drop the old unique constraint on just roll_number
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_roll_number_key;

-- Create a new composite unique constraint on (roll_number, standard, division)
ALTER TABLE students ADD CONSTRAINT students_roll_number_standard_division_unique 
  UNIQUE (roll_number, standard, division);
