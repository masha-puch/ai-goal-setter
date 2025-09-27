import jwt from 'jsonwebtoken';

type JwtPayload = {
  sub: string;
  typ: 'access' | 'refresh';
};

export function signAccessToken(userId: string): string {
  const secret = process.env.JWT_ACCESS_SECRET as string;
  const expiresIn = process.env.JWT_ACCESS_EXPIRES || '15m';
  return jwt.sign({ sub: userId, typ: 'access' } as JwtPayload, secret, { expiresIn } as any);
}

export function signRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET as string;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES || '30d';
  return jwt.sign({ sub: userId, typ: 'refresh' } as JwtPayload, secret, { expiresIn } as any);
}

export function verifyAccessToken(token: string): JwtPayload {
  const secret = process.env.JWT_ACCESS_SECRET as string;
  return jwt.verify(token, secret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.verify(token, secret) as JwtPayload;
}

