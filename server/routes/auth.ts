import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validateRequest } from '../middleware/validation.js';
import { authSchemas } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', validateRequest(authSchemas.login), authController.login);
router.post('/register', validateRequest(authSchemas.register), authController.register);
router.post(
  '/change-password',
  authMiddleware,
  validateRequest(authSchemas.passwordChange),
  authController.changePassword
);

export default router;
