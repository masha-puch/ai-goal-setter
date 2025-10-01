import express from 'express';
import { PrismaClient } from '../../generated/prisma';
import type { AuthenticatedRequest } from '../middleware/authJwt';

const prisma = new PrismaClient();

export const createGoal = async (req: AuthenticatedRequest, res: express.Response) => {
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

export const getGoals = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Sort by status: in_progress, completed, dropped
    const statusOrder = { 'in_progress': 0, 'completed': 1, 'dropped': 2 };
    goals.sort((a, b) => {
      const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 0;
      const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 0;
      return aOrder - bOrder;
    });

    res.json({ items: goals, total: goals.length });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

export const updateGoal = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { goalId } = req.params;
    const { title, description, category, priority, targetDate, milestones, status, completionNote } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!goalId) {
      return res.status(400).json({ error: 'Goal ID is required' });
    }

    const goal = await prisma.goal.update({
      where: { 
        id: goalId,
      },
      data: {
        title,
        description,
        category,
        priority: priority ? parseInt(priority) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        milestones: milestones ? JSON.parse(milestones) : null,
        status,
        completionNote,
      },
    });

    res.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

export const deleteGoal = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { goalId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!goalId) {
      return res.status(400).json({ error: 'Goal ID is required' });
    }

    await prisma.goal.delete({
      where: { 
        id: goalId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};