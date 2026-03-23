import { Router } from 'express';
import * as facultyController from '../controllers/facultyController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, requireRole('admin'), facultyController.getAllFaculty);
router.get('/:id/details', authMiddleware, facultyController.getFacultyById);
router.get('/employee/:employeeId', authMiddleware, facultyController.getFacultyByEmployeeId);
router.get('/:id/classes', authMiddleware, facultyController.getFacultyAssignedClasses);

router.post('/', authMiddleware, requireRole('admin'), facultyController.createFaculty);

router.put('/:id', authMiddleware, requireRole('admin'), facultyController.updateFaculty);
router.put('/:id/assignments', authMiddleware, requireRole('admin'), facultyController.updateFacultyAssignments);

router.delete('/:id', authMiddleware, requireRole('admin'), facultyController.deleteFaculty);

export default router;
