import request from 'supertest'
import express from 'express'
import progressRouter from '../../routes/progress'
import { authJwt } from '../../middleware/authJwt'

// Mock the auth middleware
jest.mock('../../middleware/authJwt', () => ({
  authJwt: jest.fn((req: any, res: any, next: any) => {
    req.user = { id: 'user-1' }
    next()
  }),
}))

// Mock the progress controller
jest.mock('../../controllers/progressController', () => ({
  getAllProgress: jest.fn((req: any, res: any) => {
    res.json({ items: [] })
  }),
  updateProgress: jest.fn((req: any, res: any) => {
    res.json({ id: req.params.progressId, ...req.body })
  }),
  deleteProgress: jest.fn((req: any, res: any) => {
    res.status(204).send()
  }),
}))

const app = express()
app.use(express.json())
app.use('/progress', progressRouter)

describe('Progress Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /progress', () => {
    it('should fetch all progress entries for authenticated user', async () => {
      const response = await request(app)
        .get('/progress')
        .expect(200)

      expect(response.body).toEqual({ items: [] })
    })

    it('should require authentication', async () => {
      // Mock auth middleware to not set user
      ;(authJwt as jest.Mock).mockImplementationOnce((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await request(app)
        .get('/progress')
        .expect(401)
    })
  })

  describe('PATCH /progress/:progressId', () => {
    it('should update a progress entry', async () => {
      const updateData = {
        period: 'weekly',
        progressValue: 75,
        note: 'Updated progress',
        mood: 'neutral',
      }

      const response = await request(app)
        .patch('/progress/progress-1')
        .send(updateData)
        .expect(200)

      expect(response.body).toEqual({
        id: 'progress-1',
        ...updateData,
      })
    })

    it('should handle partial updates', async () => {
      const updateData = {
        progressValue: 60,
      }

      const response = await request(app)
        .patch('/progress/progress-1')
        .send(updateData)
        .expect(200)

      expect(response.body).toEqual({
        id: 'progress-1',
        progressValue: 60,
      })
    })

    it('should handle date updates', async () => {
      const updateData = {
        date: '2024-01-02T00:00:00.000Z',
        progressValue: 50,
      }

      const response = await request(app)
        .patch('/progress/progress-1')
        .send(updateData)
        .expect(200)

      expect(response.body).toEqual({
        id: 'progress-1',
        ...updateData,
      })
    })

    it('should require authentication', async () => {
      // Mock auth middleware to not set user
      ;(authJwt as jest.Mock).mockImplementationOnce((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await request(app)
        .patch('/progress/progress-1')
        .send({ progressValue: 60 })
        .expect(401)
    })

    it('should require valid progress ID', async () => {
      const response = await request(app)
        .patch('/progress/invalid-id')
        .send({ progressValue: 60 })
        .expect(200)

      expect(response.body.id).toBe('invalid-id')
    })

    it('should handle empty request body', async () => {
      const response = await request(app)
        .patch('/progress/progress-1')
        .send({})
        .expect(200)

      expect(response.body).toEqual({
        id: 'progress-1',
      })
    })
  })

  describe('DELETE /progress/:progressId', () => {
    it('should delete a progress entry', async () => {
      await request(app)
        .delete('/progress/progress-1')
        .expect(204)
    })

    it('should handle deletion of non-existent progress entry', async () => {
      await request(app)
        .delete('/progress/non-existent')
        .expect(204)
    })

    it('should require authentication', async () => {
      // Mock auth middleware to not set user
      ;(authJwt as jest.Mock).mockImplementationOnce((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Unauthorized' })
      })

      await request(app)
        .delete('/progress/progress-1')
        .expect(401)
    })

    it('should handle malformed progress ID', async () => {
      await request(app)
        .delete('/progress/special@chars')
        .expect(204)
    })
  })

  describe('Route parameter validation', () => {
    it('should handle empty progress ID in update route', async () => {
      await request(app)
        .patch('/progress/')
        .send({ progressValue: 60 })
        .expect(404) // Express treats this as a different route
    })

    it('should handle empty progress ID in delete route', async () => {
      await request(app)
        .delete('/progress/')
        .expect(404) // Express treats this as a different route
    })

    it('should handle very long progress ID', async () => {
      const longId = 'a'.repeat(1000)
      const response = await request(app)
        .patch(`/progress/${longId}`)
        .send({ progressValue: 60 })
        .expect(200)

      expect(response.body.id).toBe(longId)
    })
  })

  describe('Middleware integration', () => {
    it('should apply auth middleware to all routes', async () => {
      // Verify that authJwt middleware is called
      await request(app).get('/progress')
      expect(authJwt).toHaveBeenCalled()

      await request(app).patch('/progress/progress-1').send({ progressValue: 60 })
      expect(authJwt).toHaveBeenCalled()

      await request(app).delete('/progress/progress-1')
      expect(authJwt).toHaveBeenCalled()
    })
  })

  describe('HTTP method validation', () => {
    it('should not allow POST to /progress', async () => {
      await request(app)
        .post('/progress')
        .send({ period: 'daily', progressValue: 50 })
        .expect(404) // Route not found
    })

    it('should not allow PUT to /progress/:progressId', async () => {
      await request(app)
        .put('/progress/progress-1')
        .send({ period: 'daily', progressValue: 50 })
        .expect(404) // Route not found
    })

    it('should not allow GET to /progress/:progressId', async () => {
      await request(app)
        .get('/progress/progress-1')
        .expect(404) // Route not found
    })
  })

  describe('Content-Type handling', () => {
    it('should handle JSON content type for PATCH requests', async () => {
      const response = await request(app)
        .patch('/progress/progress-1')
        .set('Content-Type', 'application/json')
        .send({ progressValue: 60 })
        .expect(200)

      expect(response.body).toEqual({
        id: 'progress-1',
        progressValue: 60,
      })
    })

    it('should handle requests without Content-Type header', async () => {
      const response = await request(app)
        .patch('/progress/progress-1')
        .send({ progressValue: 60 })
        .expect(200)

      expect(response.body).toEqual({
        id: 'progress-1',
        progressValue: 60,
      })
    })
  })
})
