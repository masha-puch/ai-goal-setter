import { Router } from 'express';
import { authJwt } from '../middleware/authJwt';

const router = Router();
router.use(authJwt);

router.get('/', (_req, res) => res.json({ items: [] }));

export default router;

