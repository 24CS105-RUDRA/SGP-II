import { Router } from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { attendanceSchemas } from '../middleware/validation.js';

const router = Router();

router.get('/:studentId', authMiddleware, attendanceController.getAttendance);
router.get('/class/report', authMiddleware, requireRole('faculty', 'admin'), attendanceController.getClassAttendance);
router.get('/stats/summary', authMiddleware, attendanceController.getAttendanceStats);

router.post(
  '/mark',
  authMiddleware,
  requireRole('faculty', 'admin'),
  validateRequest(attendanceSchemas.mark),
  attendanceController.markAttendance
);

router.post(
  '/bulk-mark',
  authMiddleware,
  requireRole('faculty', 'admin'),
  attendanceController.bulkMarkAttendance
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('faculty', 'admin'),
  attendanceController.updateAttendance
);

export default router;
