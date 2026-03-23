import { Router } from 'express';
import * as announcementController from '../controllers/announcementController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { announcementSchemas } from '../middleware/validation.js';

const router = Router();

router.get('/', authMiddleware, announcementController.getAllAnnouncements);
router.get('/audience/:audience', authMiddleware, announcementController.getAnnouncementsByAudience);
router.get('/:id', authMiddleware, announcementController.getAnnouncementById);

router.post(
  '/',
  authMiddleware,
  requireRole('faculty', 'admin'),
  validateRequest(announcementSchemas.create),
  announcementController.createAnnouncement
);

router.put(
  '/:id',
  authMiddleware,
  requireRole('faculty', 'admin'),
  announcementController.updateAnnouncement
);

router.put('/:id/publish', authMiddleware, requireRole('faculty', 'admin'), announcementController.publishAnnouncement);

router.delete('/:id', authMiddleware, requireRole('faculty', 'admin'), announcementController.deleteAnnouncement);

export default router;
