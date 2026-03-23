import { Router } from 'express';
import * as timetableController from '../controllers/timetableController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, timetableController.getTimetable);
router.get('/:id', authMiddleware, timetableController.getTimetableById);
router.get('/faculty/:facultyId', authMiddleware, timetableController.getFacultyTimetable);
router.get('/class/:standard/:division', authMiddleware, timetableController.getClassTimetable);

router.post('/', authMiddleware, requireRole('faculty', 'admin'), timetableController.createTimetable);

router.put('/:id', authMiddleware, requireRole('faculty', 'admin'), timetableController.updateTimetable);

router.delete('/:id', authMiddleware, requireRole('faculty', 'admin'), timetableController.deleteTimetable);
router.delete('/class/:standard/:division', authMiddleware, requireRole('admin'), timetableController.deleteClassTimetable);

export default router;
