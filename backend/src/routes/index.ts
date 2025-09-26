import { Router } from 'express';
import auth from './auth';
import goals from './goals';
import progress from './progress';
import moodboard from './moodboard';
import reflections from './reflections';
import ai from './ai';

const router = Router();

router.use('/auth', auth);
router.use('/goals', goals);
router.use('/progress', progress);
router.use('/moodboard', moodboard);
router.use('/reflections', reflections);
router.use('/ai', ai);

export default router;

