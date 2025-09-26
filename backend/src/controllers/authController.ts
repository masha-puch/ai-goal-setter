import express from 'express';
import { PrismaClient } from '../../generated/prisma';
import bcrypt from 'bcrypt';
import { registerSchema, loginSchema } from '../utils/validators';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/jwtService';

const prisma = new PrismaClient();

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_PATH = '/api/v1/auth/refresh';

function setRefreshCookie(res: express.Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: REFRESH_PATH,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
}

export async function register(req: express.Request, res: express.Response) {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid body', details: parse.error.flatten() } });
  }
  const { email, password, displayName } = parse.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: { code: 'EMAIL_IN_USE', message: 'Email already registered' } });
  }

  const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
  const passwordHash = await bcrypt.hash(password, rounds);
  const user = await prisma.user.create({ data: { email, displayName, passwordHash } });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  setRefreshCookie(res, refreshToken);

  return res.status(201).json({
    user: { id: user.id, email: user.email, displayName: user.displayName, createdAt: user.createdAt },
    accessToken,
  });
}

export async function login(req: express.Request, res: express.Response) {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid body', details: parse.error.flatten() } });
  }
  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  setRefreshCookie(res, refreshToken);
  return res.json({ user: { id: user.id, email: user.email, displayName: user.displayName }, accessToken });
}

export async function me(req: express.Request, res: express.Response) {
  const userId = (req as any).user?.id as string | undefined;
  if (!userId) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing user' } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
  return res.json({ id: user.id, email: user.email, displayName: user.displayName, createdAt: user.createdAt });
}

export async function refresh(req: express.Request, res: express.Response) {
  const token = (req as any).cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!token) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing refresh token' } });
  try {
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken(payload.sub);
    const newRefresh = signRefreshToken(payload.sub);
    setRefreshCookie(res, newRefresh);
    return res.json({ accessToken });
  } catch (_err) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
  }
}

export async function logout(_req: express.Request, res: express.Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_PATH });
  return res.status(204).send();
}

