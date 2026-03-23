import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    });

    console.log('✅ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

export function disconnectDB() {
  return mongoose.disconnect();
}

export async function dropDB() {
  try {
    await mongoose.connection.dropDatabase();
    console.log('Database dropped');
  } catch (error) {
    console.error('Error dropping database:', error);
  }
}
