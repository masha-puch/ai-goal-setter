import { Router } from 'express';
import { authJwt } from '../middleware/authJwt';
import { getReflections, createReflection, updateReflection, deleteReflection } from '../controllers/reflectionsController';

const router = Router();
router.use(authJwt);

router.get('/', getReflections);
router.post('/', createReflection);
router.patch('/:reflectionId', updateReflection);
router.delete('/:reflectionId', deleteReflection);

export default router;

