import { Router } from 'express';
import * as feeController from '../controllers/feeController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, requireRole('admin'), feeController.getFees);
router.get('/stats', authMiddleware, requireRole('admin'), feeController.getFeeStats);
router.get('/:id', authMiddleware, feeController.getFeeById);
router.get('/student/:studentId', authMiddleware, feeController.getStudentFees);

router.post('/', authMiddleware, requireRole('admin'), feeController.createFee);

router.put('/:id/payment', authMiddleware, requireRole('admin'), feeController.updatePayment);

router.delete('/:id', authMiddleware, requireRole('admin'), feeController.deleteFee);

export default router;
