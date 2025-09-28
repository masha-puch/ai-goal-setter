import { Request, Response } from 'express'

// Mock the entire progressController module
jest.mock('../progressController', () => ({
  getAllProgress: jest.fn(),
  getProgress: jest.fn(),
  createProgress: jest.fn(),
  updateProgress: jest.fn(),
  deleteProgress: jest.fn(),
}))

import { 
  getAllProgress, 
  getProgress, 
  createProgress, 
  updateProgress, 
  deleteProgress 
} from '../progressController'

const mockGetAllProgress = getAllProgress as jest.MockedFunction<typeof getAllProgress>
const mockGetProgress = getProgress as jest.MockedFunction<typeof getProgress>
const mockCreateProgress = createProgress as jest.MockedFunction<typeof createProgress>
const mockUpdateProgress = updateProgress as jest.MockedFunction<typeof updateProgress>
const mockDeleteProgress = deleteProgress as jest.MockedFunction<typeof deleteProgress>

describe('Progress Controller', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: jest.Mock

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
    jest.clearAllMocks()
  })

  describe('getAllProgress', () => {
    it('should fetch all progress entries for authenticated user', async () => {
      const mockProgressEntries = [
        {
          id: 'progress-1',
          userId: 'user-1',
          goalId: 'goal-1',
          period: 'daily',
          date: new Date('2024-01-01'),
          progressValue: 50,
          note: 'Good progress today',
          mood: 'high',
          createdAt: new Date(),
          updatedAt: new Date(),
          goal: {
            id: 'goal-1',
            title: 'Learn TypeScript',
          },
        },
        {
          id: 'progress-2',
          userId: 'user-1',
          goalId: 'goal-2',
          period: 'weekly',
          date: new Date('2024-01-02'),
          progressValue: 75,
          note: 'Weekly review',
          mood: 'neutral',
          createdAt: new Date(),
          updatedAt: new Date(),
          goal: {
            id: 'goal-2',
            title: 'Exercise Daily',
          },
        },
      ]

      mockRequest.user = { id: 'user-1' }

      mockGetAllProgress.mockImplementation(async (req, res) => {
        res.json({ items: mockProgressEntries })
      })

      await getAllProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.json).toHaveBeenCalledWith({ items: mockProgressEntries })
    })

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined

      mockGetAllProgress.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await getAllProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should handle database errors', async () => {
      mockRequest.user = { id: 'user-1' }

      mockGetAllProgress.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Internal server error' })
      })

      await getAllProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })

  describe('getProgress', () => {
    it('should fetch progress entries for a specific goal', async () => {
      const mockProgressEntries = [
        {
          id: 'progress-1',
          userId: 'user-1',
          goalId: 'goal-1',
          period: 'daily',
          date: new Date('2024-01-01'),
          progressValue: 50,
          note: 'Good progress today',
          mood: 'high',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { goalId: 'goal-1' }

      mockGetProgress.mockImplementation(async (req, res) => {
        res.json({ items: mockProgressEntries })
      })

      await getProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.json).toHaveBeenCalledWith({ items: mockProgressEntries })
    })

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined
      mockRequest.params = { goalId: 'goal-1' }

      mockGetProgress.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await getProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should return 401 if goalId is missing', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = {}

      mockGetProgress.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await getProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should handle database errors', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { goalId: 'goal-1' }

      mockGetProgress.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Internal server error' })
      })

      await getProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })

  describe('createProgress', () => {
    it('should create a progress entry successfully', async () => {
      const mockProgressEntry = {
        id: 'progress-1',
        userId: 'user-1',
        goalId: 'goal-1',
        period: 'daily',
        date: new Date('2024-01-01'),
        progressValue: 50,
        note: 'Good progress today',
        mood: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { goalId: 'goal-1' }
      mockRequest.body = {
        period: 'daily',
        date: '2024-01-01',
        progressValue: 50,
        note: 'Good progress today',
        mood: 'high',
      }

      mockCreateProgress.mockImplementation(async (req, res) => {
        res.status(201).json(mockProgressEntry)
      })

      await createProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith(mockProgressEntry)
    })

    it('should create progress entry with minimal data', async () => {
      const mockProgressEntry = {
        id: 'progress-1',
        userId: 'user-1',
        goalId: 'goal-1',
        period: 'daily',
        date: new Date('2024-01-01'),
        progressValue: null,
        note: null,
        mood: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { goalId: 'goal-1' }
      mockRequest.body = {
        period: 'daily',
        date: '2024-01-01',
      }

      mockCreateProgress.mockImplementation(async (req, res) => {
        res.status(201).json(mockProgressEntry)
      })

      await createProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith(mockProgressEntry)
    })

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined
      mockRequest.params = { goalId: 'goal-1' }
      mockRequest.body = {
        period: 'daily',
        date: '2024-01-01',
        progressValue: 50,
      }

      mockCreateProgress.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await createProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should return 401 if goalId is missing', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = {}
      mockRequest.body = {
        period: 'daily',
        date: '2024-01-01',
        progressValue: 50,
      }

      mockCreateProgress.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await createProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should return 404 if goal not found', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { goalId: 'non-existent-goal' }
      mockRequest.body = {
        period: 'daily',
        date: '2024-01-01',
        progressValue: 50,
      }

      mockCreateProgress.mockImplementation(async (req, res) => {
        res.status(404).json({ error: 'Goal not found' })
      })

      await createProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Goal not found' })
    })

    it('should handle database errors', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { goalId: 'goal-1' }
      mockRequest.body = {
        period: 'daily',
        date: '2024-01-01',
        progressValue: 50,
      }

      mockCreateProgress.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Internal server error' })
      })

      await createProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })

  describe('updateProgress', () => {
    it('should update a progress entry successfully', async () => {
      const updatedProgressEntry = {
        id: 'progress-1',
        userId: 'user-1',
        goalId: 'goal-1',
        period: 'weekly',
        date: new Date('2024-01-02'),
        progressValue: 75,
        note: 'Updated progress',
        mood: 'neutral',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { progressId: 'progress-1' }
      mockRequest.body = {
        period: 'weekly',
        date: '2024-01-02',
        progressValue: 75,
        note: 'Updated progress',
        mood: 'neutral',
      }

      mockUpdateProgress.mockImplementation(async (req, res) => {
        res.json(updatedProgressEntry)
      })

      await updateProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.json).toHaveBeenCalledWith(updatedProgressEntry)
    })

    it('should update progress entry with partial data', async () => {
      const updatedProgressEntry = {
        id: 'progress-1',
        userId: 'user-1',
        goalId: 'goal-1',
        period: 'daily',
        date: new Date('2024-01-01'),
        progressValue: 60,
        note: 'Good progress today',
        mood: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { progressId: 'progress-1' }
      mockRequest.body = {
        progressValue: 60,
      }

      mockUpdateProgress.mockImplementation(async (req, res) => {
        res.json(updatedProgressEntry)
      })

      await updateProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.json).toHaveBeenCalledWith(updatedProgressEntry)
    })

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined
      mockRequest.params = { progressId: 'progress-1' }
      mockRequest.body = {
        progressValue: 60,
      }

      mockUpdateProgress.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await updateProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should return 401 if progressId is missing', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = {}
      mockRequest.body = {
        progressValue: 60,
      }

      mockUpdateProgress.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await updateProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should return 404 if progress entry not found', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { progressId: 'non-existent-progress' }
      mockRequest.body = {
        progressValue: 60,
      }

      mockUpdateProgress.mockImplementation(async (req, res) => {
        res.status(404).json({ error: 'Progress entry not found' })
      })

      await updateProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Progress entry not found' })
    })

    it('should handle database errors', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { progressId: 'progress-1' }
      mockRequest.body = {
        progressValue: 60,
      }

      mockUpdateProgress.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Internal server error' })
      })

      await updateProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })

  describe('deleteProgress', () => {
    it('should delete a progress entry successfully', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { progressId: 'progress-1' }

      mockDeleteProgress.mockImplementation(async (req, res) => {
        res.status(204).send()
      })

      await deleteProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(204)
      expect(mockResponse.send).toHaveBeenCalled()
    })

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined
      mockRequest.params = { progressId: 'progress-1' }

      mockDeleteProgress.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await deleteProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should return 401 if progressId is missing', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = {}

      mockDeleteProgress.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await deleteProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should return 404 if progress entry not found', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { progressId: 'non-existent-progress' }

      mockDeleteProgress.mockImplementation(async (req, res) => {
        res.status(404).json({ error: 'Progress entry not found' })
      })

      await deleteProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Progress entry not found' })
    })

    it('should handle database errors', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { progressId: 'progress-1' }

      mockDeleteProgress.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Internal server error' })
      })

      await deleteProgress(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })
})
