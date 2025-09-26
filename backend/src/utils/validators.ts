import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const goalCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['health', 'career', 'finance', 'learning', 'relationships', 'other']).optional(),
  priority: z.enum(['1', '2', '3']).transform((v) => Number(v)).optional().or(z.number().int().min(1).max(3).optional()),
  targetDate: z.string().datetime().optional(),
  milestones: z
    .array(
      z.object({ id: z.string().optional(), title: z.string(), done: z.boolean().default(false), dueDate: z.string().datetime().optional() })
    )
    .optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'paused', 'dropped']).optional(),
});

export const goalPatchSchema = goalCreateSchema.partial();

export const progressCreateSchema = z.object({
  period: z.enum(['monthly', 'quarterly', 'custom']),
  date: z.string().datetime(),
  progressValue: z.number().min(0).max(100).optional(),
  note: z.string().optional(),
  mood: z.enum(['low', 'neutral', 'high']).optional(),
});

export const progressPatchSchema = progressCreateSchema.partial();

export const moodBoardCreateSchema = z.object({
  type: z.enum(['image', 'text', 'link']),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  position: z
    .object({ x: z.number(), y: z.number(), w: z.number().optional(), h: z.number().optional() })
    .optional(),
});

export const moodBoardPatchSchema = moodBoardCreateSchema.partial();

export const reflectionCreateSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  text: z.string().min(1),
});

export const reflectionPatchSchema = reflectionCreateSchema.partial();

