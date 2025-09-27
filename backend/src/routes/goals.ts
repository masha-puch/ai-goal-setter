import { Router } from 'express';
import { authJwt } from '../middleware/authJwt';
import { createGoal, getGoals, updateGoal, deleteGoal } from '../controllers/goalsController';
import { getProgress, createProgress } from '../controllers/progressController';

const router = Router();

router.use(authJwt);

// Goals endpoints
router.get('/', getGoals);
router.post('/', createGoal);
router.patch('/:goalId', updateGoal);
router.delete('/:goalId', deleteGoal);

// Progress endpoints (nested under goals)
router.get('/:goalId/progress', getProgress);
router.post('/:goalId/progress', createProgress);

export default router;

