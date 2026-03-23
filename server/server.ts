import express, { Request, Response, NextFunction, Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';

import { getEnv } from './config/environment.js';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import facultyRoutes from './routes/faculty.js';
import attendanceRoutes from './routes/attendance.js';
import announcementRoutes from './routes/announcements.js';
import homeworkRoutes from './routes/homework.js';
import feeRoutes from './routes/fees.js';
import timetableRoutes from './routes/timetable.js';
import studyMaterialRoutes from './routes/studyMaterials.js';
import galleryRoutes from './routes/gallery.js';

export async function createApp(): Promise<Express> {
  const env = getEnv();
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/faculty', facultyRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/homework', homeworkRoutes);
  app.use('/api/fees', feeRoutes);
  app.use('/api/timetable', timetableRoutes);
  app.use('/api/study-materials', studyMaterialRoutes);
  app.use('/api/gallery', galleryRoutes);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      statusCode: 404,
    });
  });

  // Error Handler (must be last)
  app.use(errorHandler);

  return app;
}

export async function startServer() {
  try {
    const env = getEnv();

    // Connect to database
    await connectDB();

    const app = await createApp();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
