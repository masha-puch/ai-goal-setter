import { Router } from 'express';
import { authJwt } from '../middleware/authJwt';

const router = Router();

router.use(authJwt);

// Placeholder endpoints; will implement fully later
router.get('/', (_req, res) => {
  res.json({ items: [], total: 0 });
});

export default router;

