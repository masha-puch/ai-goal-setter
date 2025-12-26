import { Router } from 'express';
import auth from './auth';
import goals from './goals';
import moodboard from './moodboard';
import achievements from './achievements';

const router = Router();

router.use('/auth', auth);
router.use('/goals', goals);
router.use('/moodboard', moodboard);
router.use('/achievements', achievements);

export default router;

