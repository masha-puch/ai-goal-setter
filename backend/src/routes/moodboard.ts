import { Router } from 'express';
import { authJwt } from '../middleware/authJwt';
import {
  createMoodBoard,
  getMoodBoards,
  getMoodBoard,
  updateMoodBoard,
  deleteMoodBoard,
  createMoodBoardItem,
  getMoodBoardItems,
  updateMoodBoardItem,
  deleteMoodBoardItem,
} from '../controllers/moodboardController';

const router = Router();
router.use(authJwt);

// MoodBoard routes
router.post('/', createMoodBoard);
router.get('/', getMoodBoards);
router.get('/:moodBoardId', getMoodBoard);
router.patch('/:moodBoardId', updateMoodBoard);
router.delete('/:moodBoardId', deleteMoodBoard);

// MoodBoardItem routes (nested under moodboards)
router.post('/:moodBoardId/items', createMoodBoardItem);
router.get('/:moodBoardId/items', getMoodBoardItems);
router.patch('/:moodBoardId/items/:itemId', updateMoodBoardItem);
router.delete('/:moodBoardId/items/:itemId', deleteMoodBoardItem);

export default router;
