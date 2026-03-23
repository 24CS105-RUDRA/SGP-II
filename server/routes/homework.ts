import { Router } from 'express';
import * as homeworkController from '../controllers/homeworkController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, homeworkController.getHomework);
router.get('/:id', authMiddleware, homeworkController.getHomeworkById);
router.get('/:id/submissions', authMiddleware, requireRole('faculty', 'admin'), homeworkController.getHomeworkSubmissions);
router.get('/student/:studentId/submissions', authMiddleware, homeworkController.getStudentSubmissions);

router.post(
  '/',
  authMiddleware,
  requireRole('faculty', 'admin'),
  homeworkController.createHomework
);

router.post('/submit', authMiddleware, requireRole('student'), homeworkController.submitHomework);

router.put(
  '/:id',
  authMiddleware,
  requireRole('faculty', 'admin'),
  homeworkController.updateHomework
);

router.put(
  '/submit/:submissionId/grade',
  authMiddleware,
  requireRole('faculty', 'admin'),
  homeworkController.gradeSubmission
);

router.delete('/:id', authMiddleware, requireRole('faculty', 'admin'), homeworkController.deleteHomework);

export default router;
