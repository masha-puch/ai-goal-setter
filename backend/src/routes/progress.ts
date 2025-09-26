import { Router } from 'express';
import { authJwt } from '../middleware/authJwt';

const router = Router();
router.use(authJwt);

router.get('/_placeholder', (_req, res) => res.json({ ok: true }));

export default router;

