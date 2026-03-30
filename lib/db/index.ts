import { MongoClient, Db, ClientSession, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'school_management';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (client && db) {
    return { client, db };
  }

  client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 20,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  await client.connect();
  db = client.db(DB_NAME);
  
  await createIndexes(db);
  
  console.log('[MongoDB] Connected to database:', DB_NAME);
  return { client, db };
}

export async function createIndexes(db: Db): Promise<void> {
  const usersCollection = db.collection('users');
  const studentsCollection = db.collection('students');
  const facultyCollection = db.collection('faculty');
  const attendanceCollection = db.collection('attendance');
  const homeworkCollection = db.collection('homework');
  const noticesCollection = db.collection('notices');
  const feesCollection = db.collection('fees');
  const timetableCollection = db.collection('timetable');
  const galleryCollection = db.collection('gallery');

  await Promise.all([
    usersCollection.createIndex({ username: 1 }, { unique: true, background: true }),
    usersCollection.createIndex({ email: 1 }, { unique: true, background: true }),
    usersCollection.createIndex({ role: 1 }, { background: true }),
    usersCollection.createIndex({ standard: 1, division: 1 }, { background: true }),
    usersCollection.createIndex({ created_at: -1 }, { background: true }),
    
    studentsCollection.createIndex({ user_id: 1 }, { unique: true, background: true }),
    studentsCollection.createIndex({ roll_number: 1, standard: 1, division: 1 }, { unique: true, background: true }),
    studentsCollection.createIndex({ standard: 1, division: 1 }, { background: true }),
    
    facultyCollection.createIndex({ user_id: 1 }, { unique: true, background: true }),
    facultyCollection.createIndex({ employee_id: 1 }, { unique: true, background: true }),
    facultyCollection.createIndex({ department: 1 }, { background: true }),
    facultyCollection.createIndex({ subject: 1 }, { background: true }),
    
    attendanceCollection.createIndex({ student_id: 1, date: 1 }, { unique: true, background: true }),
    attendanceCollection.createIndex({ standard: 1, division: 1, date: 1 }, { background: true }),
    attendanceCollection.createIndex({ date: 1 }, { background: true }),
    
    homeworkCollection.createIndex({ standard: 1, division: 1, created_at: -1 }, { background: true }),
    homeworkCollection.createIndex({ due_date: 1 }, { background: true }),
    homeworkCollection.createIndex({ subject: 1 }, { background: true }),
    
    noticesCollection.createIndex({ created_at: -1 }, { background: true }),
    noticesCollection.createIndex({ priority: 1, created_at: -1 }, { background: true }),
    noticesCollection.createIndex({ target_roles: 1 }, { background: true }),
    
    feesCollection.createIndex({ student_id: 1, academic_year: 1 }, { background: true }),
    feesCollection.createIndex({ standard: 1, academic_year: 1 }, { background: true }),
    
    timetableCollection.createIndex({ standard: 1, division: 1, day: 1 }, { background: true }),
    timetableCollection.createIndex({ academic_year: 1 }, { background: true }),
    
    galleryCollection.createIndex({ created_at: -1 }, { background: true }),
    galleryCollection.createIndex({ event_date: -1 }, { background: true }),
  ]);

  console.log('[MongoDB] Indexes created successfully');
}

export async function getDatabase(): Promise<Db> {
  if (!db) {
    const { db: database } = await connectToDatabase();
    return database;
  }
  return db;
}

export async function withTransaction<T>(
  callback: (session: ClientSession) => Promise<T>
): Promise<T> {
  const { client } = await connectToDatabase();
  
  const session = client.startSession();
  
  try {
    let result: T | undefined;
    
    await session.withTransaction(async () => {
      result = await callback(session);
    });
    
    if (result === undefined) {
      throw new Error('Transaction returned undefined');
    }
    
    return result;
  } catch (error) {
    console.error('[MongoDB] Transaction failed:', error);
    throw error;
  } finally {
    await session.endSession();
  }
}

export default client;
