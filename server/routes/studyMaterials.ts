import { Router } from 'express';
import * as studyMaterialController from '../controllers/studyMaterialController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, studyMaterialController.getStudyMaterials);
router.get('/:id', authMiddleware, studyMaterialController.getStudyMaterialById);
router.get('/faculty/:facultyId', authMiddleware, studyMaterialController.getFacultyMaterials);

router.post(
  '/',
  authMiddleware,
  requireRole('faculty', 'admin'),
  studyMaterialController.uploadStudyMaterial
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('faculty', 'admin'),
  studyMaterialController.updateStudyMaterial
);

router.delete('/:id', authMiddleware, requireRole('faculty', 'admin'), studyMaterialController.deleteStudyMaterial);

export default router;
