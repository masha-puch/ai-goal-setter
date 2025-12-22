import express from 'express';
import { PrismaClient } from '../../generated/prisma';
import type { AuthenticatedRequest } from '../middleware/authJwt';

const prisma = new PrismaClient();

export const createGoal = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { description, category, priority, year, milestones } = req.body;
    const userId = req.user?.id; // Assuming auth middleware sets req.user

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Prevent creating goals in past years
    const currentYear = new Date().getFullYear();
    const goalYear = parseInt(year);
    if (goalYear < currentYear) {
      return res.status(400).json({ error: 'Cannot create goals in past years' });
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        description,
        category,
        priority: priority ? parseInt(priority) : null,
        year: goalYear,
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
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const whereClause: any = { userId };
    if (year !== undefined && !isNaN(year)) {
      whereClause.year = year;
    }

    const goals = await prisma.goal.findMany({
      where: whereClause,
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
    const { description, category, priority, year, milestones, status, completionNote } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!goalId) {
      return res.status(400).json({ error: 'Goal ID is required' });
    }

    // Verify the goal belongs to the user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Check if this is a status change (complete/drop) or an edit of other fields
    const currentYear = new Date().getFullYear();
    const goalYear = existingGoal.year || currentYear;
    const isPastYear = goalYear < currentYear;
    
    // For past year goals, only allow status changes (complete/drop) or moving forward to future years
    if (isPastYear) {
      const isStatusChange = status === 'completed' || status === 'dropped';
      const newYear = year !== undefined ? parseInt(year) : goalYear;
      const isMovingForward = newYear > goalYear;
      const hasOtherFieldChanges = 
        (description !== undefined && description !== existingGoal.description) ||
        (category !== undefined && category !== existingGoal.category) ||
        (priority !== undefined && (priority ? parseInt(priority) : null) !== existingGoal.priority) ||
        (milestones !== undefined);
      
      // Block editing other fields (description, category, priority, milestones)
      if (hasOtherFieldChanges) {
        return res.status(403).json({ error: 'Cannot edit other fields of past year goals. Only status changes (complete/drop) or moving to future years are allowed.' });
      }
      
      // Block moving backward or staying the same year (unless it's just a status change)
      if (year !== undefined && newYear <= goalYear && !isStatusChange) {
        return res.status(403).json({ error: 'Cannot move past year goals backward or keep them in the past. Only moving forward or status changes are allowed.' });
      }
    }

    const updateData: any = {};
    
    // Only include fields that are being updated
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority ? parseInt(priority) : null;
    if (milestones !== undefined) updateData.milestones = milestones ? JSON.parse(milestones) : null;
    if (status !== undefined) updateData.status = status;
    if (completionNote !== undefined) updateData.completionNote = completionNote;
    if (year !== undefined) updateData.year = parseInt(year);

    const goal = await prisma.goal.update({
      where: { 
        id: goalId,
      },
      data: updateData,
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

    // Verify the goal belongs to the user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Prevent deleting goals from past years
    const currentYear = new Date().getFullYear();
    const goalYear = existingGoal.year || currentYear;
    if (goalYear < currentYear) {
      return res.status(403).json({ error: 'Cannot delete goals from past years' });
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