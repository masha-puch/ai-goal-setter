import express from 'express';
import { verifyAccessToken } from '../services/jwtService';

export type AuthenticatedRequest = express.Request & { user?: { id: string } };

export function authJwt(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const header = req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing bearer token' } });
  }
  const token = header.substring('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
}