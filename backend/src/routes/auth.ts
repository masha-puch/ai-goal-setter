import { Router } from 'express';
import { authJwt } from '../middleware/authJwt';
import { login, logout, me, refresh, register, googleAuth, googleCallback } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authJwt, me);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;

