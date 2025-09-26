import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5174';
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

app.use('/api/v1', routes);

app.use(errorHandler);

export default app;

