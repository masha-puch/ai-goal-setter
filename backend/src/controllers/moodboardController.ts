import express from 'express';
import { PrismaClient } from '../../generated/prisma';
import type { AuthenticatedRequest } from '../middleware/authJwt';

const prisma = new PrismaClient();

// MoodBoard CRUD operations
export const createMoodBoard = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { year } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const yearValue = year ? parseInt(year) : new Date().getFullYear();

    // Use upsert to ensure only one moodboard per year per user
    const moodBoard = await prisma.moodBoard.upsert({
      where: {
        userId_year: {
          userId,
          year: yearValue,
        },
      },
      update: {}, // If exists, just return it
      create: {
        userId,
        year: yearValue,
      },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.status(201).json(moodBoard);
  } catch (error) {
    console.error('Error creating moodboard:', error);
    res.status(500).json({ error: 'Failed to create moodboard' });
  }
};

export const getMoodBoards = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const userId = req.user?.id;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Return single moodboard for the year (or null if doesn't exist)
    const moodBoard = await prisma.moodBoard.findUnique({
      where: {
        userId_year: {
          userId,
          year: year,
        },
      },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Return in same format as before for compatibility, but with single item
    res.json({ items: moodBoard ? [moodBoard] : [], total: moodBoard ? 1 : 0 });
  } catch (error) {
    console.error('Error fetching moodboards:', error);
    res.status(500).json({ error: 'Failed to fetch moodboards' });
  }
};

export const getMoodBoard = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { moodBoardId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!moodBoardId) {
      return res.status(400).json({ error: 'MoodBoard ID is required' });
    }

    const moodBoard = await prisma.moodBoard.findFirst({
      where: {
        id: moodBoardId,
        userId,
      },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!moodBoard) {
      return res.status(404).json({ error: 'MoodBoard not found' });
    }

    res.json(moodBoard);
  } catch (error) {
    console.error('Error fetching moodboard:', error);
    res.status(500).json({ error: 'Failed to fetch moodboard' });
  }
};

export const deleteMoodBoard = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { moodBoardId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!moodBoardId) {
      return res.status(400).json({ error: 'MoodBoard ID is required' });
    }

    // Verify the moodboard belongs to the user
    const existingMoodBoard = await prisma.moodBoard.findFirst({
      where: {
        id: moodBoardId,
        userId,
      },
    });

    if (!existingMoodBoard) {
      return res.status(404).json({ error: 'MoodBoard not found' });
    }

    await prisma.moodBoard.delete({
      where: { 
        id: moodBoardId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting moodboard:', error);
    res.status(500).json({ error: 'Failed to delete moodboard' });
  }
};

// MoodBoardItem CRUD operations
export const createMoodBoardItem = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { moodBoardId } = req.params;
    const { type, content, tags, position } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!moodBoardId) {
      return res.status(400).json({ error: 'MoodBoard ID is required' });
    }

    // Verify the moodboard belongs to the user
    const moodBoard = await prisma.moodBoard.findFirst({
      where: {
        id: moodBoardId,
        userId,
      },
    });

    if (!moodBoard) {
      return res.status(404).json({ error: 'MoodBoard not found' });
    }

    const item = await prisma.moodBoardItem.create({
      data: {
        moodBoardId,
        type,
        content,
        tags,
        position,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating moodboard item:', error);
    res.status(500).json({ error: 'Failed to create moodboard item' });
  }
};

export const getMoodBoardItems = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { moodBoardId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!moodBoardId) {
      return res.status(400).json({ error: 'MoodBoard ID is required' });
    }

    // Verify the moodboard belongs to the user
    const moodBoard = await prisma.moodBoard.findFirst({
      where: {
        id: moodBoardId,
        userId,
      },
    });

    if (!moodBoard) {
      return res.status(404).json({ error: 'MoodBoard not found' });
    }

    const items = await prisma.moodBoardItem.findMany({
      where: { moodBoardId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ items, total: items.length });
  } catch (error) {
    console.error('Error fetching moodboard items:', error);
    res.status(500).json({ error: 'Failed to fetch moodboard items' });
  }
};

export const updateMoodBoardItem = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { moodBoardId, itemId } = req.params;
    const { type, content, tags, position } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!moodBoardId || !itemId) {
      return res.status(400).json({ error: 'MoodBoard ID and Item ID are required' });
    }

    // Verify the moodboard belongs to the user and the item belongs to the moodboard
    const moodBoard = await prisma.moodBoard.findFirst({
      where: {
        id: moodBoardId,
        userId,
      },
    });

    if (!moodBoard) {
      return res.status(404).json({ error: 'MoodBoard not found' });
    }

    const existingItem = await prisma.moodBoardItem.findFirst({
      where: {
        id: itemId,
        moodBoardId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'MoodBoard item not found' });
    }

    // Build update data object, only including defined fields
    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (content !== undefined) updateData.content = content;
    if (tags !== undefined) updateData.tags = tags;
    if (position !== undefined) updateData.position = position;

    const item = await prisma.moodBoardItem.update({
      where: { 
        id: itemId,
      },
      data: updateData,
    });

    res.json(item);
  } catch (error) {
    console.error('Error updating moodboard item:', error);
    res.status(500).json({ error: 'Failed to update moodboard item' });
  }
};

export const deleteMoodBoardItem = async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { moodBoardId, itemId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!moodBoardId || !itemId) {
      return res.status(400).json({ error: 'MoodBoard ID and Item ID are required' });
    }

    // Verify the moodboard belongs to the user and the item belongs to the moodboard
    const moodBoard = await prisma.moodBoard.findFirst({
      where: {
        id: moodBoardId,
        userId,
      },
    });

    if (!moodBoard) {
      return res.status(404).json({ error: 'MoodBoard not found' });
    }

    const existingItem = await prisma.moodBoardItem.findFirst({
      where: {
        id: itemId,
        moodBoardId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'MoodBoard item not found' });
    }

    await prisma.moodBoardItem.delete({
      where: { 
        id: itemId,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting moodboard item:', error);
    res.status(500).json({ error: 'Failed to delete moodboard item' });
  }
};
