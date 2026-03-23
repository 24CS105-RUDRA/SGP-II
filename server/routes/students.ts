import { Router } from 'express';
import * as studentController from '../controllers/studentController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { studentSchemas } from '../middleware/validation.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  requireRole('faculty', 'admin'),
  studentController.getAllStudents
);
router.get(
  '/by-class',
  authMiddleware,
  requireRole('faculty', 'admin'),
  studentController.getStudentsByClass
);
router.get(
  '/:id',
  authMiddleware,
  studentController.getStudentById
);
router.get(
  '/:id/attendance',
  authMiddleware,
  studentController.getStudentAttendance
);

router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  validateRequest(studentSchemas.create),
  studentController.createStudent
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  validateRequest(studentSchemas.update),
  studentController.updateStudent
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  studentController.deleteStudent
);

export default router;
