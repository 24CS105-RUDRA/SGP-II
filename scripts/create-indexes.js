/**
 * MongoDB Shell Commands for Creating Indexes
 * Run these commands in MongoDB Shell (mongosh) to create optimized indexes
 * 
 * Usage: mongosh "mongodb://localhost:27017/school_management" scripts/create-indexes.js
 * Or paste directly into MongoDB Compass terminal
 */

db = db.getSiblingDB('school_management');

print('=== Creating Indexes for School Management System ===\n');

// Users Collection Indexes
print('Creating users indexes...');
db.users.createIndex({ username: 1 }, { unique: true, background: true });
db.users.createIndex({ email: 1 }, { unique: true, background: true });
db.users.createIndex({ role: 1 }, { background: true });
db.users.createIndex({ standard: 1, division: 1 }, { background: true });
db.users.createIndex({ created_at: -1 }, { background: true });
print('✓ Users indexes created');

// Students Collection Indexes
print('\nCreating students indexes...');
db.students.createIndex({ user_id: 1 }, { unique: true, background: true });
db.students.createIndex({ roll_number: 1, standard: 1, division: 1 }, { unique: true, background: true });
db.students.createIndex({ standard: 1, division: 1 }, { background: true });
print('✓ Students indexes created');

// Faculty Collection Indexes
print('\nCreating faculty indexes...');
db.faculty.createIndex({ user_id: 1 }, { unique: true, background: true });
db.faculty.createIndex({ employee_id: 1 }, { unique: true, background: true });
db.faculty.createIndex({ department: 1 }, { background: true });
db.faculty.createIndex({ subject: 1 }, { background: true });
print('✓ Faculty indexes created');

// Attendance Collection Indexes
print('\nCreating attendance indexes...');
db.attendance.createIndex({ student_id: 1, date: 1 }, { unique: true, background: true });
db.attendance.createIndex({ standard: 1, division: 1, date: 1 }, { background: true });
db.attendance.createIndex({ date: 1 }, { background: true });
print('✓ Attendance indexes created');

// Homework Collection Indexes
print('\nCreating homework indexes...');
db.homework.createIndex({ standard: 1, division: 1, created_at: -1 }, { background: true });
db.homework.createIndex({ due_date: 1 }, { background: true });
db.homework.createIndex({ subject: 1 }, { background: true });
db.homework.createIndex({ created_by: 1 }, { background: true });
print('✓ Homework indexes created');

// Notices Collection Indexes
print('\nCreating notices indexes...');
db.notices.createIndex({ created_at: -1 }, { background: true });
db.notices.createIndex({ priority: 1, created_at: -1 }, { background: true });
db.notices.createIndex({ target_roles: 1 }, { background: true });
print('✓ Notices indexes created');

// Fees Collection Indexes
print('\nCreating fees indexes...');
db.fees.createIndex({ student_id: 1, academic_year: 1 }, { background: true });
db.fees.createIndex({ standard: 1, academic_year: 1 }, { background: true });
db.fees.createIndex({ academic_year: 1 }, { background: true });
print('✓ Fees indexes created');

// Timetable Collection Indexes
print('\nCreating timetable indexes...');
db.timetable.createIndex({ standard: 1, division: 1, day: 1 }, { background: true });
db.timetable.createIndex({ academic_year: 1 }, { background: true });
print('✓ Timetable indexes created');

// Gallery Collection Indexes
print('\nCreating gallery indexes...');
db.gallery.createIndex({ created_at: -1 }, { background: true });
db.gallery.createIndex({ event_date: -1 }, { background: true });
print('✓ Gallery indexes created');

print('\n=== All Indexes Created Successfully ===\n');
print('Verifying indexes...');
printjson(db.getCollectionNames().map(c => ({
  collection: c,
  indexes: db.getCollection(c).getIndexes().map(i => i.name)
})));
