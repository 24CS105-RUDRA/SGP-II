# School Management System

A full-stack school management application built with Next.js 16, React 19, and MongoDB.

## Features

- **Authentication**: Role-based login (student, faculty, admin) with account lockout protection
- **Student Management**: Profile management, attendance tracking, fee management
- **Faculty Management**: Class assignments, homework creation, attendance marking
- **Admin Dashboard**: Complete system control, user management, announcements

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Next.js Server Actions, MongoDB
- **Authentication**: bcryptjs password hashing, session-based auth

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── faculty/           # Faculty portal pages
│   ├── student/           # Student portal pages
│   ├── login/             # Authentication page
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   └── *.tsx             # Sidebar components
├── lib/                   # Core utilities
│   ├── actions/          # Server Actions (data operations)
│   ├── validations.ts    # Input validation utilities
│   └── supabase.ts       # MongoDB client wrapper
├── types/                 # TypeScript type definitions
├── constants/             # Application constants
└── hooks/                 # Custom React hooks
```

## Key Modules

### Server Actions (`lib/actions/`)

| File | Purpose |
|------|---------|
| auth.ts | Authentication, login, password management |
| students.ts | Student CRUD operations |
| faculty.ts | Faculty CRUD operations |
| attendance.ts | Attendance marking and retrieval |
| homework.ts | Homework assignments |
| notices.ts | Announcements |
| fees.ts | Fee tracking |
| timetable.ts | Class schedules |
| gallery.ts | Image gallery |

### Validation (`lib/validations.ts`)

- Phone number validation (10-digit Indian mobile)
- Email validation
- Password strength validation
- Name and ID validation
- Input sanitization

## API Reference

### Authentication

```typescript
import { loginUser } from '@/lib/actions/auth'
const result = await loginUser(username, password, role)
```

### Students

```typescript
import { createStudent, getStudentsByClass } from '@/lib/actions/students'
await createStudent({ full_name, email, phone_number, ... })
await getStudentsByClass('10', 'A')
```

### Faculty

```typescript
import { createFaculty, getAllFaculty } from '@/lib/actions/faculty'
await createFaculty({ full_name, email, phone_number, department, ... })
```

## Validation Rules

- **Phone Numbers**: 10-digit Indian mobile (starts with 6-9)
- **Emails**: Valid email format, max 254 characters
- **Passwords**: Min 8 chars, uppercase, lowercase, number, special char
- **Names**: Letters, spaces, hyphens only, 2-100 characters

## Security Features

- Password hashing with bcrypt (10-12 rounds)
- Account lockout after 5 failed attempts (15 min)
- Input sanitization and validation
- Server-side validation for all operations

## Development

### Build for Production

```bash
npm run build
```

### Type Check

```bash
npx tsc --noEmit
```

### Lint

```bash
npm run lint
```

## Deployment

The application can be deployed to Vercel, Netlify, or any Node.js hosting platform.

### Environment Variables

| Variable | Description |
|----------|-------------|
| MONGODB_URI | MongoDB connection string |

## License

MIT
