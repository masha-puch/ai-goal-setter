import express from 'express';
import { PrismaClient } from '../../generated/prisma';
import type { AuthenticatedRequest } from '../middleware/authJwt';

const prisma = new PrismaClient();

export const getAllProgress = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.id;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const whereClause: any = { userId };
    if (year !== undefined && !isNaN(year)) {
      whereClause.goal = {
        year: year,
      };
    }

    const progressEntries = await prisma.progressEntry.findMany({
      where: whereClause,
      include: {
        goal: {
          select: {
            id: true,
            description: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json({ items: progressEntries });
  } catch (error) {
    console.error('Error fetching all progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProgress = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { goalId } = req.params;
    const userId = req.user?.id;

    if (!userId || !goalId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const progressEntries = await prisma.progressEntry.findMany({
      where: {
        goalId,
        userId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json({ items: progressEntries });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProgress = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { goalId } = req.params;
    const userId = req.user?.id;
    const { period, date, progressValue, note, mood } = req.body;

    if (!userId || !goalId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the goal belongs to the user
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const progressEntry = await prisma.progressEntry.create({
      data: {
        userId,
        goalId,
        period,
        date: new Date(date),
        progressValue,
        note,
        mood,
      },
    });

    res.status(201).json(progressEntry);
  } catch (error) {
    console.error('Error creating progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProgress = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { progressId } = req.params;
    const userId = req.user?.id;
    const { period, date, progressValue, note, mood } = req.body;

    if (!userId || !progressId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the progress entry belongs to the user
    const existingProgress = await prisma.progressEntry.findFirst({
      where: {
        id: progressId,
        userId,
      },
    });

    if (!existingProgress) {
      return res.status(404).json({ error: 'Progress entry not found' });
    }

    const updateData: any = {
      period,
      progressValue,
      note,
      mood,
    };

    if (date) {
      updateData.date = new Date(date);
    }

    const progressEntry = await prisma.progressEntry.update({
      where: {
        id: progressId,
      },
      data: updateData,
    });

    res.json(progressEntry);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProgress = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { progressId } = req.params;
    const userId = req.user?.id;

    if (!userId || !progressId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the progress entry belongs to the user
    const existingProgress = await prisma.progressEntry.findFirst({
      where: {
        id: progressId,
        userId,
      },
    });

    if (!existingProgress) {
      return res.status(404).json({ error: 'Progress entry not found' });
    }

    await prisma.progressEntry.delete({
      where: {
        id: progressId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};