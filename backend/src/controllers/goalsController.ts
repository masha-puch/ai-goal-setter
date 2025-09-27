import express from 'express';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export const createGoal = async (req: express.Request, res: express.Response) => {
  try {
    const { title, description, category, priority, targetDate, milestones } = req.body;
    const userId = req.user?.id; // Assuming auth middleware sets req.user

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        description,
        category,
        priority: priority ? parseInt(priority) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        milestones: milestones ? JSON.parse(milestones) : null,
      },
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

export const getGoals = async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ items: goals, total: goals.length });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

export const updateGoal = async (req: express.Request, res: express.Response) => {
  try {
    const { goalId } = req.params;
    const { title, description, category, priority, targetDate, milestones, status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const goal = await prisma.goal.update({
      where: { 
        id: goalId,
        userId, // Ensure user can only update their own goals
      },
      data: {
        title,
        description,
        category,
        priority: priority ? parseInt(priority) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        milestones: milestones ? JSON.parse(milestones) : null,
        status,
      },
    });

    res.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

export const deleteGoal = async (req: express.Request, res: express.Response) => {
  try {
    const { goalId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.goal.delete({
      where: { 
        id: goalId,
        userId, // Ensure user can only delete their own goals
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};