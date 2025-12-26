import express from 'express';
import { PrismaClient } from '../../generated/prisma';
import type { AuthenticatedRequest } from '../middleware/authJwt';

const prisma = new PrismaClient();

export const getAchievements = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.id;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const whereClause: any = { userId };
    if (year !== undefined && !isNaN(year)) {
      whereClause.year = year;
    }

    const achievements = await prisma.achievement.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ items: achievements, total: achievements.length });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

export const createAchievement = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { year, text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const achievement = await prisma.achievement.create({
      data: {
        userId,
        year: parseInt(year),
        text,
      },
    });

    res.status(201).json(achievement);
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ error: 'Failed to create achievement' });
  }
};

export const updateAchievement = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { achievementId } = req.params;
    const { year, text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!achievementId) {
      return res.status(400).json({ error: 'Achievement ID is required' });
    }

    // Verify the achievement belongs to the user
    const existingAchievement = await prisma.achievement.findFirst({
      where: {
        id: achievementId,
        userId,
      },
    });

    if (!existingAchievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    const updateData: any = {};
    if (text !== undefined) updateData.text = text;
    if (year !== undefined) updateData.year = parseInt(year);

    const achievement = await prisma.achievement.update({
      where: { 
        id: achievementId,
      },
      data: updateData,
    });

    res.json(achievement);
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json({ error: 'Failed to update achievement' });
  }
};

export const deleteAchievement = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { achievementId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!achievementId) {
      return res.status(400).json({ error: 'Achievement ID is required' });
    }

    // Verify the achievement belongs to the user
    const existingAchievement = await prisma.achievement.findFirst({
      where: {
        id: achievementId,
        userId,
      },
    });

    if (!existingAchievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    await prisma.achievement.delete({
      where: { 
        id: achievementId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
};

