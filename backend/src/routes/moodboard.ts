import { Router } from 'express';
import type { RequestHandler } from 'express';
import { authJwt } from '../middleware/authJwt';
import {
  createMoodBoard,
  getMoodBoards,
  getMoodBoard,
  deleteMoodBoard,
  createMoodBoardItem,
  getMoodBoardItems,
  updateMoodBoardItem,
  deleteMoodBoardItem,
} from '../controllers/moodboardController';

const router = Router();
router.use(authJwt as unknown as RequestHandler);

// MoodBoard routes
router.post('/', createMoodBoard as unknown as RequestHandler);
router.get('/', getMoodBoards as unknown as RequestHandler);
router.get('/:moodBoardId', getMoodBoard as unknown as RequestHandler);
router.delete('/:moodBoardId', deleteMoodBoard as unknown as RequestHandler);

// MoodBoardItem routes (nested under moodboards)
router.post('/:moodBoardId/items', createMoodBoardItem as unknown as RequestHandler);
router.get('/:moodBoardId/items', getMoodBoardItems as unknown as RequestHandler);
router.patch('/:moodBoardId/items/:itemId', updateMoodBoardItem as unknown as RequestHandler);
router.delete('/:moodBoardId/items/:itemId', deleteMoodBoardItem as unknown as RequestHandler);

export default router;
