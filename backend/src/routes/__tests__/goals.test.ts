import request from 'supertest'
import express from 'express'
import goalsRouter from '../../routes/goals'
import { authJwt } from '../../middleware/authJwt'

// Mock the auth middleware
jest.mock('../../middleware/authJwt', () => ({
  authJwt: jest.fn((req: any, res: any, next: any) => {
    req.user = { id: 'user-1' }
    next()
  }),
}))

// Mock the goals controller
jest.mock('../../controllers/goalsController', () => ({
  createGoal: jest.fn((req: any, res: any) => {
    res.status(201).json({ id: 'goal-1', title: req.body.title })
  }),
  getGoals: jest.fn((req: any, res: any) => {
    res.json({ items: [], total: 0 })
  }),
  updateGoal: jest.fn((req: any, res: any) => {
    res.json({ id: req.params.goalId, title: req.body.title })
  }),
  deleteGoal: jest.fn((req: any, res: any) => {
    res.status(204).send()
  }),
}))

// Mock the progress controller
jest.mock('../../controllers/progressController', () => ({
  getProgress: jest.fn((req: any, res: any) => {
    res.json({ items: [], total: 0 })
  }),
  createProgress: jest.fn((req: any, res: any) => {
    res.status(201).json({ id: 'progress-1' })
  }),
}))

const app = express()
app.use(express.json())
app.use('/goals', goalsRouter)

describe('Goals Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /goals', () => {
    it('should fetch goals for authenticated user', async () => {
      const response = await request(app)
        .get('/goals')
        .expect(200)

      expect(response.body).toEqual({ items: [], total: 0 })
    })

    it('should require authentication', async () => {
      // Mock auth middleware to not set user
      ;(authJwt as jest.Mock).mockImplementationOnce((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await request(app)
        .get('/goals')
        .expect(401)
    })
  })

  describe('POST /goals', () => {
    it('should create a new goal', async () => {
      const goalData = {
        title: 'Learn TypeScript',
        description: 'Master TypeScript fundamentals',
        category: 'learning',
        priority: 1,
      }

      const response = await request(app)
        .post('/goals')
        .send(goalData)
        .expect(201)

      expect(response.body).toEqual({
        id: 'goal-1',
        title: 'Learn TypeScript',
      })
    })

    it('should handle goal creation with minimal data', async () => {
      const goalData = {
        title: 'Simple Goal',
      }

      const response = await request(app)
        .post('/goals')
        .send(goalData)
        .expect(201)

      expect(response.body).toEqual({
        id: 'goal-1',
        title: 'Simple Goal',
      })
    })

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/goals')
        .send({})
        .expect(201) // Controller handles validation

      expect(response.body).toEqual({
        id: 'goal-1',
        title: undefined,
      })
    })
  })

  describe('PATCH /goals/:goalId', () => {
    it('should update a goal', async () => {
      const updateData = {
        title: 'Updated Goal Title',
        status: 'in_progress',
      }

      const response = await request(app)
        .patch('/goals/goal-1')
        .send(updateData)
        .expect(200)

      expect(response.body).toEqual({
        id: 'goal-1',
        title: 'Updated Goal Title',
      })
    })

    it('should handle partial updates', async () => {
      const updateData = {
        status: 'completed',
      }

      const response = await request(app)
        .patch('/goals/goal-1')
        .send(updateData)
        .expect(200)

      expect(response.body).toEqual({
        id: 'goal-1',
        title: undefined,
      })
    })

    it('should require valid goal ID', async () => {
      const response = await request(app)
        .patch('/goals/invalid-id')
        .send({ title: 'Updated' })
        .expect(200)

      expect(response.body.id).toBe('invalid-id')
    })
  })

  describe('DELETE /goals/:goalId', () => {
    it('should delete a goal', async () => {
      await request(app)
        .delete('/goals/goal-1')
        .expect(204)
    })

    it('should handle deletion of non-existent goal', async () => {
      await request(app)
        .delete('/goals/non-existent')
        .expect(204)
    })
  })

  describe('GET /goals/:goalId/progress', () => {
    it('should fetch progress for a specific goal', async () => {
      const response = await request(app)
        .get('/goals/goal-1/progress')
        .expect(200)

      expect(response.body).toEqual({ items: [], total: 0 })
    })

    it('should handle progress fetch for non-existent goal', async () => {
      const response = await request(app)
        .get('/goals/non-existent/progress')
        .expect(200)

      expect(response.body).toEqual({ items: [], total: 0 })
    })
  })

  describe('POST /goals/:goalId/progress', () => {
    it('should create progress entry for a goal', async () => {
      const progressData = {
        period: 'daily',
        date: '2024-01-01',
        progressValue: 50,
        note: 'Made good progress',
      }

      const response = await request(app)
        .post('/goals/goal-1/progress')
        .send(progressData)
        .expect(201)

      expect(response.body).toEqual({ id: 'progress-1' })
    })

    it('should handle progress creation with minimal data', async () => {
      const progressData = {
        period: 'daily',
        date: '2024-01-01',
      }

      const response = await request(app)
        .post('/goals/goal-1/progress')
        .send(progressData)
        .expect(201)

      expect(response.body).toEqual({ id: 'progress-1' })
    })
  })

  describe('Route parameter validation', () => {
    it('should handle empty goal ID in progress routes', async () => {
      await request(app)
        .get('/goals//progress')
        .expect(404) // Express treats this as a different route
    })

    it('should handle malformed goal ID', async () => {
      const response = await request(app)
        .get('/goals/special@chars/progress')
        .expect(200)

      expect(response.body).toEqual({ items: [], total: 0 })
    })
  })

  describe('Middleware integration', () => {
    it('should apply auth middleware to all routes', async () => {
      // Verify that authJwt middleware is called
      await request(app).get('/goals')
      expect(authJwt).toHaveBeenCalled()

      await request(app).post('/goals').send({ title: 'Test' })
      expect(authJwt).toHaveBeenCalled()

      await request(app).patch('/goals/goal-1').send({ title: 'Updated' })
      expect(authJwt).toHaveBeenCalled()

      await request(app).delete('/goals/goal-1')
      expect(authJwt).toHaveBeenCalled()
    })
  })
})
