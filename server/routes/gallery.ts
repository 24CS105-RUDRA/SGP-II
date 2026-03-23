import { Router } from 'express';
import * as galleryController from '../controllers/galleryController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/events', authMiddleware, galleryController.getGalleryEvents);
router.get('/events/:id', authMiddleware, galleryController.getGalleryEventById);
router.get('/event/:eventId/images', authMiddleware, galleryController.getEventImages);

router.post(
  '/events',
  authMiddleware,
  requireRole('faculty', 'admin'),
  galleryController.createGalleryEvent
);

router.post(
  '/images/upload',
  authMiddleware,
  requireRole('faculty', 'admin'),
  galleryController.uploadGalleryImage
);

router.put(
  '/events/:id',
  authMiddleware,
  requireRole('faculty', 'admin'),
  galleryController.updateGalleryEvent
);

router.put(
  '/images/:id',
  authMiddleware,
  requireRole('faculty', 'admin'),
  galleryController.updateGalleryImage
);

router.delete(
  '/events/:id',
  authMiddleware,
  requireRole('faculty', 'admin'),
  galleryController.deleteGalleryEvent
);

router.delete(
  '/images/:id',
  authMiddleware,
  requireRole('faculty', 'admin'),
  galleryController.deleteGalleryImage
);

export default router;
