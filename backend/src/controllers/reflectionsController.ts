import express from 'express';
import { PrismaClient } from '../../generated/prisma';
import type { AuthenticatedRequest } from '../middleware/authJwt';

const prisma = new PrismaClient();

export const getReflections = async (req: AuthenticatedRequest, res: express.Response) => {
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

    const reflections = await prisma.reflection.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ items: reflections, total: reflections.length });
  } catch (error) {
    console.error('Error fetching reflections:', error);
    res.status(500).json({ error: 'Failed to fetch reflections' });
  }
};

export const createReflection = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { year, text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const reflection = await prisma.reflection.create({
      data: {
        userId,
        year: parseInt(year),
        text,
      },
    });

    res.status(201).json(reflection);
  } catch (error) {
    console.error('Error creating reflection:', error);
    res.status(500).json({ error: 'Failed to create reflection' });
  }
};

export const updateReflection = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { reflectionId } = req.params;
    const { year, text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!reflectionId) {
      return res.status(400).json({ error: 'Reflection ID is required' });
    }

    // Verify the reflection belongs to the user
    const existingReflection = await prisma.reflection.findFirst({
      where: {
        id: reflectionId,
        userId,
      },
    });

    if (!existingReflection) {
      return res.status(404).json({ error: 'Reflection not found' });
    }

    const updateData: any = {};
    if (text !== undefined) updateData.text = text;
    if (year !== undefined) updateData.year = parseInt(year);

    const reflection = await prisma.reflection.update({
      where: { 
        id: reflectionId,
      },
      data: updateData,
    });

    res.json(reflection);
  } catch (error) {
    console.error('Error updating reflection:', error);
    res.status(500).json({ error: 'Failed to update reflection' });
  }
};

export const deleteReflection = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { reflectionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!reflectionId) {
      return res.status(400).json({ error: 'Reflection ID is required' });
    }

    // Verify the reflection belongs to the user
    const existingReflection = await prisma.reflection.findFirst({
      where: {
        id: reflectionId,
        userId,
      },
    });

    if (!existingReflection) {
      return res.status(404).json({ error: 'Reflection not found' });
    }

    await prisma.reflection.delete({
      where: { 
        id: reflectionId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting reflection:', error);
    res.status(500).json({ error: 'Failed to delete reflection' });
  }
};
