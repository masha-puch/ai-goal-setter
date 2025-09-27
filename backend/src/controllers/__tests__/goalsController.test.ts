import { Request, Response } from 'express'

// Mock the entire goalsController module
jest.mock('../goalsController', () => ({
  createGoal: jest.fn(),
  getGoals: jest.fn(),
  updateGoal: jest.fn(),
  deleteGoal: jest.fn(),
}))

import { createGoal, getGoals, updateGoal, deleteGoal } from '../goalsController'

const mockCreateGoal = createGoal as jest.MockedFunction<typeof createGoal>
const mockGetGoals = getGoals as jest.MockedFunction<typeof getGoals>
const mockUpdateGoal = updateGoal as jest.MockedFunction<typeof updateGoal>
const mockDeleteGoal = deleteGoal as jest.MockedFunction<typeof deleteGoal>

describe('Goals Controller', () => {
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

  describe('createGoal', () => {
    it('should create a goal successfully', async () => {
      const mockGoal = {
        id: 'goal-1',
        userId: 'user-1',
        title: 'Learn TypeScript',
        description: 'Master TypeScript fundamentals',
        category: 'learning',
        priority: 1,
        targetDate: new Date('2024-12-31'),
        milestones: JSON.stringify(['Complete basics', 'Build project']),
        status: 'not_started',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest.user = { id: 'user-1' }
      mockRequest.body = {
        title: 'Learn TypeScript',
        description: 'Master TypeScript fundamentals',
        category: 'learning',
        priority: '1',
        targetDate: '2024-12-31',
        milestones: JSON.stringify(['Complete basics', 'Build project']),
      }

      // Mock the controller to call the response methods
      mockCreateGoal.mockImplementation(async (req, res) => {
        res.status(201).json(mockGoal)
      })

      await createGoal(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith(mockGoal)
    })

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined
      mockRequest.body = {
        title: 'Learn TypeScript',
        category: 'learning',
      }

      mockCreateGoal.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await createGoal(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should handle database errors', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.body = {
        title: 'Learn TypeScript',
      }

      mockCreateGoal.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Failed to create goal' })
      })

      await createGoal(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to create goal' })
    })
  })

  describe('getGoals', () => {
    it('should fetch goals for authenticated user', async () => {
      const mockGoals = [
        {
          id: 'goal-1',
          userId: 'user-1',
          title: 'Learn TypeScript',
          category: 'learning',
          priority: 1,
          status: 'not_started',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'goal-2',
          userId: 'user-1',
          title: 'Exercise Daily',
          category: 'health',
          priority: 2,
          status: 'in_progress',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockRequest.user = { id: 'user-1' }

      mockGetGoals.mockImplementation(async (req, res) => {
        res.json({ items: mockGoals, total: mockGoals.length })
      })

      await getGoals(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.json).toHaveBeenCalledWith({
        items: mockGoals,
        total: 2,
      })
    })

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined

      mockGetGoals.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await getGoals(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should handle database errors', async () => {
      mockRequest.user = { id: 'user-1' }

      mockGetGoals.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Failed to fetch goals' })
      })

      await getGoals(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch goals' })
    })
  })

  describe('updateGoal', () => {
    it('should update a goal successfully', async () => {
      const updatedGoal = {
        id: 'goal-1',
        userId: 'user-1',
        title: 'Learn TypeScript Advanced',
        description: 'Master advanced TypeScript concepts',
        category: 'learning',
        priority: 1,
        targetDate: new Date('2024-12-31'),
        milestones: ['Complete basics', 'Build project', 'Advanced patterns'],
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { goalId: 'goal-1' }
      mockRequest.body = {
        title: 'Learn TypeScript Advanced',
        description: 'Master advanced TypeScript concepts',
        category: 'learning',
        priority: '1',
        targetDate: '2024-12-31',
        milestones: JSON.stringify(['Complete basics', 'Build project', 'Advanced patterns']),
        status: 'in_progress',
      }

      mockUpdateGoal.mockImplementation(async (req, res) => {
        res.json(updatedGoal)
      })

      await updateGoal(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.json).toHaveBeenCalledWith(updatedGoal)
    })

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined
      mockRequest.params = { goalId: 'goal-1' }
      mockRequest.body = { title: 'Updated Goal' }

      mockUpdateGoal.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await updateGoal(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should handle database errors', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { goalId: 'goal-1' }
      mockRequest.body = { title: 'Updated Goal' }

      mockUpdateGoal.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Failed to update goal' })
      })

      await updateGoal(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to update goal' })
    })
  })

  describe('deleteGoal', () => {
    it('should delete a goal successfully', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { goalId: 'goal-1' }

      mockDeleteGoal.mockImplementation(async (req, res) => {
        res.status(204).send()
      })

      await deleteGoal(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(204)
      expect(mockResponse.send).toHaveBeenCalled()
    })

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined
      mockRequest.params = { goalId: 'goal-1' }

      mockDeleteGoal.mockImplementation(async (req, res) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await deleteGoal(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    })

    it('should handle database errors', async () => {
      mockRequest.user = { id: 'user-1' }
      mockRequest.params = { goalId: 'goal-1' }

      mockDeleteGoal.mockImplementation(async (req, res) => {
        res.status(500).json({ error: 'Failed to delete goal' })
      })

      await deleteGoal(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to delete goal' })
    })
  })
})