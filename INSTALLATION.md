# Installation & Dependencies Guide

## Required Packages

The backend integration requires the following npm packages to be installed:

### Core Dependencies

\`\`\`bash
npm install @supabase/supabase-js@latest
npm install bcryptjs
npm install next@latest
\`\`\`

### Versions Used

- **@supabase/supabase-js**: ^2.38.0+
- **bcryptjs**: ^2.4.3+
- **next**: ^16.0.0+ (with App Router)
- **react**: ^19.0.0+
- **typescript**: ^5.3.0+

## Installation Steps

### 1. Install Dependencies

\`\`\`bash
npm install @supabase/supabase-js bcryptjs
\`\`\`

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
\`\`\`

⚠️ **Important**: Never commit `.env.local` to version control. Add it to `.gitignore`.

### 3. Set Up Supabase Project

1. Go to https://supabase.com and create a new project
2. In Supabase Dashboard:
   - Navigate to Settings → API
   - Copy `URL` and `anon public key`
   - Copy `service_role key` (keep this secret!)
3. Add these to your `.env.local`

### 4. Initialize Database Schema

Execute the migration in Supabase SQL Editor:

\`\`\`bash
# Copy contents of scripts/supabase-setup.sql
# Paste into Supabase SQL Editor and execute
\`\`\`

Or using the Supabase CLI:

\`\`\`bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db pull
supabase db push scripts/supabase-setup.sql
\`\`\`

### 5. Load Demo Data

Execute the seed script in Supabase SQL Editor:

\`\`\`bash
# Copy contents of scripts/seed-demo-data.sql
# Paste into Supabase SQL Editor and execute
\`\`\`

## Verify Installation

### Test Supabase Connection

Create a test file `/lib/test-supabase.ts`:

\`\`\`typescript
import { createClient } from '@supabase/supabase-js'

async function testConnection() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('users')
    .select('count()')

  if (error) {
    console.error('Connection failed:', error)
  } else {
    console.log('Connection successful!', data)
  }
}

testConnection()
\`\`\`

Run: `npx ts-node lib/test-supabase.ts`

### Test Authentication

\`\`\`bash
# Try logging in with demo credentials
# Username: student1
# Password: password123
# Role: student
\`\`\`

## Project Structure

\`\`\`
project-root/
├── app/
│   ├── login/page.tsx                 # Login interface
│   ├── student/
│   │   ├── dashboard/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── homework/page.tsx
│   │   ├── timetable/page.tsx
│   │   └── ...
│   ├── faculty/
│   │   ├── dashboard/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── notices/page.tsx
│   │   └── ...
│   └── admin/
│       ├── dashboard/page.tsx
│       ├── student-profiles/page.tsx
│       ├── fees/page.tsx
│       └── ...
├── lib/
│   ├── actions/                       # Server Actions
│   │   ├── auth.ts                   # Authentication
│   │   ├── attendance.ts             # Attendance management
│   │   ├── homework.ts               # Homework management
│   │   ├── notices.ts                # Notices/announcements
│   │   ├── fees.ts                   # Fee management
│   │   ├── timetable.ts              # Timetable
│   │   ├── students.ts               # Student management
│   │   ├── faculty.ts                # Faculty management
│   │   └── gallery.ts                # Gallery & materials
│   ├── supabase.ts                   # Supabase client
│   └── utils.ts
├── components/
│   ├── ui/                           # Shadcn UI components
│   ├── StudentSidebar.tsx
│   ├── FacultySidebar.tsx
│   ├── AdminSidebar.tsx
│   └── ...
├── scripts/
│   ├── supabase-setup.sql            # Database schema
│   └── seed-demo-data.sql            # Demo data
├── .env.local                        # Environment variables (gitignored)
├── BACKEND_SETUP.md                  # Backend documentation
├── API_INTEGRATION_GUIDE.md          # API reference
└── INSTALLATION.md                   # This file
\`\`\`

## Troubleshooting

### Connection Error: "ECONNREFUSED"

**Solution**: 
- Verify Supabase URL is correct
- Check internet connectivity
- Ensure Supabase project is active in dashboard

### Error: "Operator does not exist: uuid = text"

**Solution**:
- This is already fixed in the provided schema
- Re-run the database migration

### "Service Role Key is invalid"

**Solution**:
- Copy the key from Supabase Settings → API → Service Role Key
- Ensure it's correctly set in `.env.local`
- Never use the anon key for service operations

### Password verification fails

**Solution**:
- Ensure bcryptjs is installed: `npm install bcryptjs`
- Demo passwords use 10-round bcrypt hashing
- Default demo password: `password123` (for all demo users)

### Session not persisting

**Solution**:
- Check localStorage is enabled in browser
- Verify sessionData is stored correctly after login
- Check browser console for errors

## Updating Dependencies

\`\`\`bash
# Check for updates
npm outdated

# Update specific package
npm update @supabase/supabase-js

# Update all
npm update
\`\`\`

## Performance Optimization

### Enable Database Connection Pooling

In Supabase Settings:
1. Go to Database → Connection pooler
2. Set pool mode to "Transaction"
3. Update connection string if needed

### Implement Query Caching

Add to next.config.mjs:
\`\`\`javascript
module.exports = {
  experimental: {
    ppr: true,
  },
}
\`\`\`

## Security Best Practices

✅ **Do:**
- Keep `SUPABASE_SERVICE_ROLE_KEY` private
- Validate all inputs server-side
- Use prepared statements (automatic with Supabase)
- Enable HTTPS in production
- Implement rate limiting for login attempts
- Use strong passwords for admin accounts

❌ **Don't:**
- Expose service role key in client code
- Store passwords in plain text
- Disable password requirements
- Use demo credentials in production
- Skip input validation
- Enable unauthorized API access

## Production Deployment

### Before Deploying

1. ✅ Test all features thoroughly
2. ✅ Update demo credentials with real passwords
3. ✅ Set up proper email notifications
4. ✅ Configure CORS properly
5. ✅ Set up backups and recovery
6. ✅ Enable SSL/TLS
7. ✅ Implement logging and monitoring

### Environment Variables for Production

Set in your hosting platform (Vercel, Netlify, etc.):

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-production.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=prod_service_role_key
NODE_ENV=production
\`\`\`

### Deploy to Vercel

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
# Redeploy with: vercel --prod
\`\`\`

## Getting Help

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

### Support
- Supabase Discord: https://discord.supabase.com
- Next.js Discord: https://discord.gg/nextjs
- GitHub Issues: Report bugs with detailed steps to reproduce

## Quick Reference

### Start Development
\`\`\`bash
npm run dev
# App runs on http://localhost:3000
\`\`\`

### Run Database Migration
\`\`\`bash
# Execute scripts/supabase-setup.sql in Supabase SQL Editor
\`\`\`

### Load Demo Data
\`\`\`bash
# Execute scripts/seed-demo-data.sql in Supabase SQL Editor
\`\`\`

### Check Database
\`\`\`bash
# Visit Supabase Dashboard → Table Editor
# Browse all tables and data
\`\`\`

---

**Installation complete!** You now have a fully functional school management system with Supabase backend. See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed API documentation.
