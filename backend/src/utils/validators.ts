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
  description: z.string().min(1).max(2000),
  category: z.enum(['health', 'career', 'finance', 'learning', 'relationships', 'other']).optional(),
  priority: z.enum(['1', '2', '3']).transform((v) => Number(v)).optional().or(z.number().int().min(1).max(3).optional()),
  year: z.number().int().min(2000).max(2100),
  milestones: z
    .array(
      z.object({ id: z.string().optional(), title: z.string(), done: z.boolean().default(false), dueDate: z.string().datetime().optional() })
    )
    .optional(),
  status: z.enum(['in_progress', 'dropped', 'completed']).optional(),
});

export const goalPatchSchema = goalCreateSchema.partial();

export const moodBoardCreateSchema = z.object({
  type: z.enum(['image', 'text', 'link']),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  position: z
    .object({ x: z.number(), y: z.number(), w: z.number().optional(), h: z.number().optional() })
    .optional(),
});

export const moodBoardPatchSchema = moodBoardCreateSchema.partial();

export const achievementCreateSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  text: z.string().min(1),
});

export const achievementPatchSchema = achievementCreateSchema.partial();

