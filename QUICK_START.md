# Quick Start Guide - School Management System

## 5-Minute Setup

### Step 1: Install Dependencies
\`\`\`bash
npm install @supabase/supabase-js bcryptjs
\`\`\`

### Step 2: Create `.env.local`
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### Step 3: Setup Database
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy credentials to `.env.local`
4. Go to Supabase SQL Editor
5. Copy & paste: `scripts/supabase-setup.sql`
6. Execute the migration
7. Copy & paste: `scripts/seed-demo-data.sql`
8. Execute the seed data

### Step 4: Start Server
\`\`\`bash
npm run dev
\`\`\`

Open: http://localhost:3000/login

---

## Login Test Credentials

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| Student | `student1` | `password123` | Standard 10-A |
| Student | `student2` | `password123` | Standard 10-B |
| Faculty | `faculty1` | `password123` | Mathematics |
| Faculty | `faculty2` | `password123` | Physics |
| Admin | `admin` | `password123` | Full Access |

---

## File Locations Reference

### Core Backend Files
- Server Actions: `/lib/actions/*.ts`
- Database Schema: `/scripts/supabase-setup.sql`
- Demo Data: `/scripts/seed-demo-data.sql`
- Supabase Client: `/lib/supabase.ts`

### UI Pages
- Login: `/app/login/page.tsx`
- Student: `/app/student/**/*.tsx`
- Faculty: `/app/faculty/**/*.tsx`
- Admin: `/app/admin/**/*.tsx`

### Documentation
- Setup Guide: `/BACKEND_SETUP.md`
- API Reference: `/API_INTEGRATION_GUIDE.md`
- Installation: `/INSTALLATION.md`
- Overview: `/BACKEND_SUMMARY.md`

---

## Key Features Implemented

✅ **Authentication**
- Role-based login (student, faculty, admin)
- Password hashing with bcrypt
- Secure session management

✅ **Student Features**
- View attendance (calendar)
- Check homework (by date)
- View timetable (grid)
- Track fees
- Read notices

✅ **Faculty Features**
- Mark attendance
- Post notices
- Create homework
- Grade submissions
- Manage timetable
- Upload materials

✅ **Admin Features**
- Manage students
- Manage faculty
- Control notices
- Track fees
- Password reset
- Gallery management

---

## Common Operations

### Query Student Attendance
\`\`\`typescript
import { getStudentAttendance } from '@/lib/actions/attendance'

const attendance = await getStudentAttendance(studentId)
console.log(attendance)
\`\`\`

### Create Homework
\`\`\`typescript
import { createHomework } from '@/lib/actions/homework'

const hw = await createHomework({
  faculty_id: 'uuid',
  standard: '10',
  division: 'A',
  subject: 'Math',
  title: 'Chapter 5',
  description: 'Solve problems 1-20',
  due_date: '2026-02-05'
})
\`\`\`

### Post Notice
\`\`\`typescript
import { createNotice } from '@/lib/actions/notices'

const notice = await createNotice({
  created_by: 'admin-uuid',
  title: 'Exam Schedule',
  content: 'Exams start Feb 15',
  notice_type: 'academic',
  priority: 'high'
})
\`\`\`

### Get Student Fees
\`\`\`typescript
import { getStudentFees } from '@/lib/actions/fees'

const fees = await getStudentFees(studentId)
\`\`\`

---

## Database Tables

| Table | Rows | Purpose |
|-------|------|---------|
| users | 5 demo | All user accounts |
| students | 2 demo | Student profiles |
| faculty | 2 demo | Faculty profiles |
| attendance | 3 demo | Daily attendance |
| homework | 2 demo | Assignments |
| homework_submissions | 0 | Submissions |
| notices | 2 demo | Announcements |
| timetable | 4 demo | Schedule |
| fees | 2 demo | Fee tracking |
| study_materials | 2 demo | Resources |
| gallery | 2 demo | Images |
| syllabus | 2 demo | Courses |

---

## Troubleshooting

### Login fails
\`\`\`
✓ Check if demo data is seeded
✓ Verify .env.local has correct keys
✓ Try credentials: student1 / password123
\`\`\`

### "Module not found" error
\`\`\`
✓ Ensure bcryptjs is installed: npm install bcryptjs
✓ Check import paths are correct
\`\`\`

### Database connection error
\`\`\`
✓ Verify NEXT_PUBLIC_SUPABASE_URL is set
✓ Check internet connection
✓ Ensure Supabase project is active
\`\`\`

### Server action not found
\`\`\`
✓ Check file exists in /lib/actions/
✓ Verify filename matches import
✓ Ensure 'use server' directive is present
\`\`\`

---

## Next Steps

### Enhance Features
- [ ] Add email notifications
- [ ] Implement file uploads
- [ ] Add export to PDF/Excel
- [ ] Setup payment gateway
- [ ] Add SMS alerts
- [ ] Create mobile app
- [ ] Setup analytics dashboard

### Deployment
- [ ] Test on staging
- [ ] Update credentials for production
- [ ] Setup automated backups
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Setup monitoring

### Customization
- [ ] Update school logo/branding
- [ ] Configure gradeing scales
- [ ] Add custom subjects
- [ ] Setup payment methods
- [ ] Configure holidays
- [ ] Add class sections

---

## API Endpoints Quick Reference

### Authentication
- `loginUser({username, password, role})`
- `registerUser({...})`
- `changePassword(userId, oldPwd, newPwd)`

### Attendance
- `markAttendance({...})`
- `getStudentAttendance(studentId)`
- `getAttendanceStats(studentId)`

### Homework
- `createHomework({...})`
- `getHomeworkByStudent(studentId)`
- `submitHomework(hwId, studentId)`

### Notices
- `createNotice({...})`
- `getPublishedNotices()`
- `deleteNotice(id)`

### Fees
- `createFeeRecord({...})`
- `getStudentFees(studentId)`
- `updatePayment(feeId, amount, method)`

### Timetable
- `createTimetableEntry({...})`
- `getTimetableByClass(standard, division)`

### Students
- `createStudent({...})`
- `getStudentsByClass(standard, division)`
- `updateStudent(studentId, updates)`

### Faculty
- `createFaculty({...})`
- `getAllFaculty()`
- `deleteFaculty(facultyId)`

### Gallery
- `uploadGalleryImage({...})`
- `getGalleryByCategory(category)`
- `deleteGalleryImage(imageId)`

---

## Environment Variables Checklist

\`\`\`env
✓ NEXT_PUBLIC_SUPABASE_URL       = https://xxx.supabase.co
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJxx...
✓ SUPABASE_SERVICE_ROLE_KEY      = eyJxx... (secret)
\`\`\`

Never commit `.env.local` to Git!

---

## Database Connectivity Verification

\`\`\`bash
# Test in Node environment
node -e "
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
sb.from('users').select('count()').then(r => console.log('Connected!', r));
"
\`\`\`

---

## Performance Tips

1. **Load Data on Demand**
   - Don't fetch all students on page load
   - Use filters: `getTimetableByClass()`

2. **Cache Results**
   - Store user session in localStorage
   - Use SWR for fresh data

3. **Optimize Queries**
   - Select only needed columns
   - Use appropriate indexes
   - Filter early in WHERE clause

4. **Pagination**
   - Limit queries to 50-100 rows
   - Load more on scroll
   - Use offset/limit

---

## Security Reminders

🔐 **Do's**
- ✅ Keep SERVICE_ROLE_KEY secret
- ✅ Hash passwords with bcrypt
- ✅ Validate input server-side
- ✅ Use HTTPS in production
- ✅ Store keys in environment variables

🚫 **Don'ts**
- ❌ Expose service role key in code
- ❌ Store passwords in plain text
- ❌ Disable authentication
- ❌ Skip input validation
- ❌ Commit .env.local to Git

---

## Support Resources

📚 **Documentation**
- BACKEND_SETUP.md - Detailed setup
- API_INTEGRATION_GUIDE.md - All APIs
- INSTALLATION.md - Dependency details

🔗 **External Docs**
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

💬 **Community**
- Supabase Discord
- Next.js Discord
- Stack Overflow

---

## Success Indicators

✅ You'll know it's working when:
- Login page loads without errors
- Can login with demo credentials
- Dashboard shows categories
- Can view attendance calendar
- Can see homework assignments
- Can view timetable

🎉 **All set! Your school management system is ready!**

---

For detailed information, see:
- **BACKEND_SETUP.md** - Complete backend guide
- **API_INTEGRATION_GUIDE.md** - Detailed API reference
- **INSTALLATION.md** - Step-by-step installation
