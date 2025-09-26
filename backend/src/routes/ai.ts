import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authJwt } from '../middleware/authJwt';

const router = Router();
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

router.use(authJwt);
router.use(limiter);

router.post('/recommendations', (_req, res) => res.json({ recommendations: [] }));
router.post('/moodboard/suggestions', (_req, res) => res.json({ suggestions: [] }));
router.post('/motivation', (_req, res) => res.json({ message: 'You can do it!' }));
router.post('/adjust', (_req, res) => res.json({ adjustments: [] }));
router.post('/summary', (_req, res) => res.json({ summary: 'Great job this year!' }));

export default router;

