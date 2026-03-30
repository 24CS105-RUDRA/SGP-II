# MongoDB Indexes & Performance Optimization

## Recommended Indexes for 1,500+ Users

### Users Collection
```javascript
// users collection indexes
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ standard: 1, division: 1 });
db.users.createIndex({ created_at: -1 });
```

### Students Collection
```javascript
// students collection indexes
db.students.createIndex({ user_id: 1 }, { unique: true });
db.students.createIndex({ roll_number: 1 }, { unique: true });
db.students.createIndex({ standard: 1, division: 1 });
db.students.createIndex({ roll_number: 1, standard: 1, division: 1 }, { unique: true });
```

### Faculty Collection
```javascript
// faculty collection indexes
db.faculty.createIndex({ user_id: 1 }, { unique: true });
db.faculty.createIndex({ employee_id: 1 }, { unique: true });
db.faculty.createIndex({ department: 1 });
db.faculty.createIndex({ subject: 1 });
```

### Attendance Collection
```javascript
// attendance collection indexes
db.attendance.createIndex({ student_id: 1, date: 1 }, { unique: true });
db.attendance.createIndex({ standard: 1, division: 1, date: 1 });
db.attendance.createIndex({ date: 1 });
db.attendance.createIndex({ student_id: 1 });
```

### Homework Collection
```javascript
// homework collection indexes
db.homework.createIndex({ standard: 1, division: 1, created_at: -1 });
db.homework.createIndex({ subject: 1 });
db.homework.createIndex({ due_date: 1 });
db.homework.createIndex({ created_by: 1 });
```

### Notices Collection
```javascript
// notices collection indexes
db.notices.createIndex({ created_at: -1 });
db.notices.createIndex({ priority: 1, created_at: -1 });
db.notices.createIndex({ target_roles: 1 });
```

### Fees Collection
```javascript
// fees collection indexes
db.fees.createIndex({ student_id: 1, academic_year: 1 });
db.fees.createIndex({ standard: 1, academic_year: 1 });
db.fees.createIndex({ academic_year: 1 });
```

---

## MongoDB Transactions for Add Student Flow

### Transactional Add Student Operation

```javascript
// server/lib/db/transactions.ts
import { ClientSession, Db } from 'mongodb';

export async function addStudentWithTransaction(
  db: Db,
  studentData: {
    username: string;
    password_hash: string;
    full_name: string;
    email: string;
    role: 'student';
    year_of_study: string;
    division: string;
    standard: string;
    roll_number: string;
    parent_contact?: string;
    date_of_birth?: string;
  },
  session: ClientSession
) {
  const usersCollection = db.collection('users');
  const studentsCollection = db.collection('students');

  // Start transaction
  session.startTransaction({
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
  });

  try {
    // Check if username exists
    const existingUser = await usersCollection.findOne(
      { username: studentData.username },
      { session }
    );
    
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Check if roll_number exists for the same class
    const existingRoll = await studentsCollection.findOne(
      { 
        roll_number: studentData.roll_number,
        standard: studentData.standard,
        division: studentData.division
      },
      { session }
    );
    
    if (existingRoll) {
      throw new Error('Roll number already exists for this class');
    }

    // Insert user document
    const userResult = await usersCollection.insertOne(
      {
        ...studentData,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { session }
    );

    // Insert student document with reference to user
    const studentResult = await studentsCollection.insertOne(
      {
        user_id: userResult.insertedId,
        roll_number: studentData.roll_number,
        parent_contact: studentData.parent_contact,
        date_of_birth: studentData.date_of_birth,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { session }
    );

    // Commit transaction
    await session.commitTransaction();

    return {
      userId: userResult.insertedId,
      studentId: studentResult.insertedId,
    };
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## Supabase (PostgreSQL) Alternative

Since your project uses Supabase, here are the equivalent PostgreSQL indexes:

```sql
-- Users table indexes
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_standard_division ON users(standard, division);

-- Students table indexes
CREATE UNIQUE INDEX idx_students_user_id ON students(user_id);
CREATE UNIQUE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_standard_division ON students(standard, division);
CREATE UNIQUE INDEX idx_students_roll_class_div ON students(roll_number, standard, division);

-- Faculty table indexes  
CREATE UNIQUE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE UNIQUE INDEX idx_faculty_employee_id ON faculty(employee_id);
CREATE INDEX idx_faculty_department ON faculty(department);

-- Attendance table indexes
CREATE UNIQUE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_attendance_class_date ON attendance(standard, division, date);
CREATE INDEX idx_attendance_date ON attendance(date);

-- Homework table indexes
CREATE INDEX idx_homework_class_created ON homework(standard, division, created_at DESC);
CREATE INDEX idx_homework_subject ON homework(subject);
CREATE INDEX idx_homework_due_date ON homework(due_date);

-- Notices table indexes
CREATE INDEX idx_notices_created ON notices(created_at DESC);
CREATE INDEX idx_notices_priority ON notices(priority, created_at DESC);

-- Fees table indexes
CREATE INDEX idx_fees_student_year ON fees(student_id, academic_year);
CREATE INDEX idx_fees_standard_year ON fees(standard, academic_year);
```

---

## Performance Tips

1. **Connection Pooling**: Configure appropriate pool size (recommended: 10-20 connections)
2. **Query Optimization**: Use `.select()` to fetch only needed fields
3. **Caching**: Implement Redis for frequently accessed data (notices, fee structures)
4. **Pagination**: Always use pagination for list endpoints (limit: 20-50 items per page)
5. **Composite Indexes**: Create composite indexes for common query patterns
6. **Explain Plans**: Regularly analyze slow queries using `.explain()`
