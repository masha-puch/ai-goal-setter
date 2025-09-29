import express from 'express';
import { PrismaClient } from '../../generated/prisma';
import bcrypt from 'bcrypt';
import { registerSchema, loginSchema } from '../utils/validators';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/jwtService';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const prisma = new PrismaClient();

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_PATH = '/api/v1/auth/refresh';

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  console.log('Google OAuth profile received:', {
    id: profile.id,
    email: profile.emails?.[0]?.value,
    displayName: profile.displayName
  });
  
  try {
    // Check if user already exists with this Google ID
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (user) {
      console.log('Found existing user by Google ID:', user.email);
      return done(null, user);
    }

    // Check if user exists with this email
    const email = profile.emails?.[0]?.value;
    if (email) {
      user = await prisma.user.findUnique({
        where: { email }
      });
    }

    if (user) {
      console.log('Found existing user by email, linking Google account:', user.email);
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.id, avatar: profile.photos?.[0]?.value || null }
      });
      return done(null, user);
    }

    console.log('Creating new user for:', profile.emails?.[0]?.value);
    // Create new user
    user = await prisma.user.create({
      data: {
        email: profile.emails?.[0]?.value!,
        displayName: profile.displayName,
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value || null
      }
    });

    console.log('Created new user:', user.email);
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth strategy error:', error);
    return done(error, undefined);
  }
}));

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
  const user = await prisma.user.create({ data: { email, displayName: displayName || null, passwordHash } });

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

  const ok = await bcrypt.compare(password, user.passwordHash || '');
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

// Google OAuth routes
export function googleAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
}

export function googleCallback(req: express.Request, res: express.Response, next: express.NextFunction) {
  passport.authenticate('google', (err: any, user: any) => {
    if (err) {
      console.error('Google OAuth error:', err);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/login?error=oauth_error`);
    }
    if (!user) {
      console.error('Google OAuth: No user returned');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/login?error=oauth_failed`);
    }

    console.log('Google OAuth success for user:', user.email);
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    setRefreshCookie(res, refreshToken);

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/auth/callback?token=${accessToken}`;
    res.redirect(redirectUrl);
  })(req, res, next);
}

