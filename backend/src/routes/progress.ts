import { Router } from 'express';
import { authJwt } from '../middleware/authJwt';
import { getAllProgress, updateProgress, deleteProgress } from '../controllers/progressController';

const router = Router();
router.use(authJwt);

// Get all progress entries for the user
router.get('/', getAllProgress);

// Individual progress entry operations
router.patch('/:progressId', updateProgress);
router.delete('/:progressId', deleteProgress);

export default router;

