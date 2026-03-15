# Supabase Authentication Setup & Login Fix

## Problem Fixed

The login was failing with error:
\`\`\`
fetch to https://[...]/rest/v1/users failed with status 406
Cannot coerce the result to a single JSON object
\`\`\`

**Root Cause**: The database had no users, and the `.single()` method in Supabase was throwing an error when querying returned 0 rows.

## Solution Implemented

### 1. Fixed Auth Logic ✅
- Changed from `.single()` to `.maybeSingle()` - returns `null` when no rows found instead of throwing error
- Added proper null checking
- Added debug logging for troubleshooting

### 2. Added Demo User Seeding ✅
- Created `seedDemoUsers()` function that creates 5 demo users
- Function checks if users already exist before creating
- All demo users use password: `password123`
- Demo accounts:
  - **Student 1**: student1 (10-A)
  - **Student 2**: student2 (10-B)
  - **Faculty 1**: faculty1 (Mathematics)
  - **Faculty 2**: faculty2 (Physics)
  - **Admin**: admin (Full Access)

### 3. Updated Login Page ✅
- Added "Setup Demo Data" button on login page
- Shows success message after seeding
- Auto-fills demo credentials for easy testing
- Shows loading state with spinner during seed operation

## How to Use

### Step 1: Install Dependencies
\`\`\`bash
npm install @supabase/supabase-js bcryptjs
\`\`\`

### Step 2: Add Environment Variables
Add to your `.env.local` file:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### Step 3: Create Database Tables
Run the SQL migration in Supabase SQL Editor:
\`\`\`sql
-- Copy and paste contents of scripts/supabase-setup.sql
\`\`\`

### Step 4: Setup Demo Data
You have two options:

#### Option A: Use Login Page Button (Recommended)
1. Go to `/login`
2. Click "Setup Demo Data" button
3. Wait for success message
4. Demo credentials will be auto-filled
5. Click "Login" to test

#### Option B: Run SQL Script
Execute `scripts/seed-demo-data.sql` in Supabase SQL Editor.

### Step 5: Login
Use any of these credentials:
- **Student**: student1 / password123
- **Faculty**: faculty1 / password123
- **Admin**: admin / password123

## Technical Details

### `.maybeSingle()` vs `.single()`

**Before (Broken)**:
\`\`\`typescript
const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .eq('username', username)
  .single()  // ❌ Throws error if 0 or >1 rows

// Result: Error 406 when 0 rows found
\`\`\`

**After (Fixed)**:
\`\`\`typescript
const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .eq('username', username)
  .maybeSingle()  // ✅ Returns null if 0 rows, error if >1

if (!user) {
  return { success: false, error: 'User not found' }
}
\`\`\`

### Seed Function Behavior

\`\`\`typescript
export async function seedDemoUsers() {
  // 1. Check if users already exist
  if (existingUsers.length > 0) {
    return 'Demo users already exist'
  }

  // 2. Hash passwords with bcrypt
  const hashes = await Promise.all(
    users.map(u => bcrypt.hash(u.password, 10))
  )

  // 3. Insert users into database
  await supabase.from('users').insert(cleanUsers)

  return 'Success'
}
\`\`\`

## Troubleshooting

### Still seeing "Invalid username or password"?
1. Click "Setup Demo Data" button to create users
2. Check that Supabase environment variables are set
3. Verify the users table was created

### "Cannot coerce the result to a single JSON object"?
This error means the database query returned 0 or multiple rows. The fix handles this by using `.maybeSingle()` which returns null instead of throwing.

### Users not found after seeding?
1. Check that the Supabase SQL migration ran successfully
2. Verify you can see the `users` table in Supabase
3. Click "Setup Demo Data" again

### Password hashing issues?
Make sure `bcryptjs` is installed:
\`\`\`bash
npm install bcryptjs
\`\`\`

## Files Modified

1. **lib/actions/auth.ts**
   - Changed `.single()` to `.maybeSingle()`
   - Added `seedDemoUsers()` function
   - Added error logging

2. **app/login/page.tsx**
   - Added seed demo button
   - Added seed message state
   - Shows loading spinner
   - Auto-fills demo credentials

## Next Steps

After login works:
1. Test student module functionality
2. Test faculty module functionality
3. Test admin module functionality
4. Add real users through admin panel

Happy testing!
