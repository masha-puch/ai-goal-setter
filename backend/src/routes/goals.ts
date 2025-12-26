import { Router } from 'express';
import { authJwt } from '../middleware/authJwt';
import { createGoal, getGoals, updateGoal, deleteGoal } from '../controllers/goalsController';

const router = Router();

router.use(authJwt);

// Goals endpoints
router.get('/', getGoals);
router.post('/', createGoal);
router.patch('/:goalId', updateGoal);
router.delete('/:goalId', deleteGoal);

export default router;

