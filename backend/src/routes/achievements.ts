import { Router } from 'express';
import { authJwt } from '../middleware/authJwt';
import { getAchievements, createAchievement, updateAchievement, deleteAchievement } from '../controllers/achievementsController';

const router = Router();
router.use(authJwt);

router.get('/', getAchievements);
router.post('/', createAchievement);
router.patch('/:achievementId', updateAchievement);
router.delete('/:achievementId', deleteAchievement);

export default router;

