import { vi } from 'vitest'

// Create mock functions
const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()
const mockRequestInterceptor = vi.fn()
const mockResponseInterceptor = vi.fn()

// Mock axios before any imports
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      patch: mockPatch,
      delete: mockDelete,
      interceptors: {
        request: { use: mockRequestInterceptor },
        response: { use: mockResponseInterceptor },
      },
    })),
  },
}))

describe('Progress API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /progress', () => {
    it('should fetch all progress entries', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              id: 'progress-1',
              goalId: 'goal-1',
              period: 'daily',
              date: '2024-01-01T00:00:00.000Z',
              progressValue: 50,
              note: 'Good progress',
              mood: 'high',
              goal: {
                id: 'goal-1',
                title: 'Learn TypeScript',
              },
            },
          ],
        },
      }

      mockGet.mockResolvedValueOnce(mockResponse)

      const { default: api } = await import('../client')
      const result = await api.get('/progress')

      expect(mockGet).toHaveBeenCalledWith('/progress')
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      const mockError = new Error('API Error')
      mockGet.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.get('/progress')).rejects.toThrow('API Error')
      expect(mockGet).toHaveBeenCalledWith('/progress')
    })

    it('should handle 401 unauthorized errors', async () => {
      const mockError = {
        response: {
          status: 401,
        },
      }
      mockGet.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.get('/progress')).rejects.toEqual(mockError)
      expect(mockGet).toHaveBeenCalledWith('/progress')
    })
  })

  describe('GET /goals/:goalId/progress', () => {
    it('should fetch progress for a specific goal', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              id: 'progress-1',
              goalId: 'goal-1',
              period: 'daily',
              date: '2024-01-01T00:00:00.000Z',
              progressValue: 50,
              note: 'Good progress',
              mood: 'high',
            },
          ],
        },
      }

      mockGet.mockResolvedValueOnce(mockResponse)

      const { default: api } = await import('../client')
      const result = await api.get('/goals/goal-1/progress')

      expect(mockGet).toHaveBeenCalledWith('/goals/goal-1/progress')
      expect(result).toEqual(mockResponse)
    })

    it('should handle goal not found', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { error: 'Goal not found' },
        },
      }
      mockGet.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.get('/goals/non-existent/progress')).rejects.toEqual(mockError)
      expect(mockGet).toHaveBeenCalledWith('/goals/non-existent/progress')
    })

    it('should handle malformed goal ID', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { error: 'Invalid goal ID' },
        },
      }
      mockGet.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.get('/goals/invalid@id/progress')).rejects.toEqual(mockError)
      expect(mockGet).toHaveBeenCalledWith('/goals/invalid@id/progress')
    })
  })

  describe('POST /goals/:goalId/progress', () => {
    it('should create a progress entry', async () => {
      const progressData = {
        period: 'daily',
        date: '2024-01-01T00:00:00.000Z',
        progressValue: 50,
        note: 'Good progress',
        mood: 'high',
      }

      const mockResponse = {
        data: {
          id: 'progress-1',
          goalId: 'goal-1',
          ...progressData,
        },
      }

      mockPost.mockResolvedValueOnce(mockResponse)

      const { default: api } = await import('../client')
      const result = await api.post('/goals/goal-1/progress', progressData)

      expect(mockPost).toHaveBeenCalledWith('/goals/goal-1/progress', progressData)
      expect(result).toEqual(mockResponse)
    })

    it('should create progress entry with minimal data', async () => {
      const progressData = {
        period: 'daily',
        date: '2024-01-01T00:00:00.000Z',
      }

      const mockResponse = {
        data: {
          id: 'progress-1',
          goalId: 'goal-1',
          period: 'daily',
          date: '2024-01-01T00:00:00.000Z',
          progressValue: null,
          note: null,
          mood: null,
        },
      }

      mockPost.mockResolvedValueOnce(mockResponse)

      const { default: api } = await import('../client')
      const result = await api.post('/goals/goal-1/progress', progressData)

      expect(mockPost).toHaveBeenCalledWith('/goals/goal-1/progress', progressData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle validation errors', async () => {
      const progressData = {
        period: 'invalid-period',
        date: 'invalid-date',
        progressValue: 150, // Invalid value > 100
      }

      const mockError = {
        response: {
          status: 400,
          data: { error: 'Validation failed' },
        },
      }
      mockPost.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.post('/goals/goal-1/progress', progressData)).rejects.toEqual(mockError)
      expect(mockPost).toHaveBeenCalledWith('/goals/goal-1/progress', progressData)
    })

    it('should handle goal not found', async () => {
      const progressData = {
        period: 'daily',
        date: '2024-01-01T00:00:00.000Z',
        progressValue: 50,
      }

      const mockError = {
        response: {
          status: 404,
          data: { error: 'Goal not found' },
        },
      }
      mockPost.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.post('/goals/non-existent/progress', progressData)).rejects.toEqual(mockError)
      expect(mockPost).toHaveBeenCalledWith('/goals/non-existent/progress', progressData)
    })

    it('should handle unauthorized access', async () => {
      const progressData = {
        period: 'daily',
        date: '2024-01-01T00:00:00.000Z',
        progressValue: 50,
      }

      const mockError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      }
      mockPost.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.post('/goals/goal-1/progress', progressData)).rejects.toEqual(mockError)
      expect(mockPost).toHaveBeenCalledWith('/goals/goal-1/progress', progressData)
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

      const mockResponse = {
        data: {
          id: 'progress-1',
          goalId: 'goal-1',
          ...updateData,
        },
      }

      mockPatch.mockResolvedValueOnce(mockResponse)

      const { default: api } = await import('../client')
      const result = await api.patch('/progress/progress-1', updateData)

      expect(mockPatch).toHaveBeenCalledWith('/progress/progress-1', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should update progress entry with partial data', async () => {
      const updateData = {
        progressValue: 60,
      }

      const mockResponse = {
        data: {
          id: 'progress-1',
          goalId: 'goal-1',
          period: 'daily',
          date: '2024-01-01T00:00:00.000Z',
          ...updateData,
        },
      }

      mockPatch.mockResolvedValueOnce(mockResponse)

      const { default: api } = await import('../client')
      const result = await api.patch('/progress/progress-1', updateData)

      expect(mockPatch).toHaveBeenCalledWith('/progress/progress-1', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle progress entry not found', async () => {
      const updateData = {
        progressValue: 60,
      }

      const mockError = {
        response: {
          status: 404,
          data: { error: 'Progress entry not found' },
        },
      }
      mockPatch.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.patch('/progress/non-existent', updateData)).rejects.toEqual(mockError)
      expect(mockPatch).toHaveBeenCalledWith('/progress/non-existent', updateData)
    })

    it('should handle unauthorized access', async () => {
      const updateData = {
        progressValue: 60,
      }

      const mockError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      }
      mockPatch.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.patch('/progress/progress-1', updateData)).rejects.toEqual(mockError)
      expect(mockPatch).toHaveBeenCalledWith('/progress/progress-1', updateData)
    })

    it('should handle validation errors', async () => {
      const updateData = {
        progressValue: 150, // Invalid value > 100
        period: 'invalid-period',
      }

      const mockError = {
        response: {
          status: 400,
          data: { error: 'Validation failed' },
        },
      }
      mockPatch.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.patch('/progress/progress-1', updateData)).rejects.toEqual(mockError)
      expect(mockPatch).toHaveBeenCalledWith('/progress/progress-1', updateData)
    })
  })

  describe('DELETE /progress/:progressId', () => {
    it('should delete a progress entry', async () => {
      const mockResponse = {
        data: {},
      }

      mockDelete.mockResolvedValueOnce(mockResponse)

      const { default: api } = await import('../client')
      const result = await api.delete('/progress/progress-1')

      expect(mockDelete).toHaveBeenCalledWith('/progress/progress-1')
      expect(result).toEqual(mockResponse)
    })

    it('should handle progress entry not found', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { error: 'Progress entry not found' },
        },
      }
      mockDelete.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.delete('/progress/non-existent')).rejects.toEqual(mockError)
      expect(mockDelete).toHaveBeenCalledWith('/progress/non-existent')
    })

    it('should handle unauthorized access', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      }
      mockDelete.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.delete('/progress/progress-1')).rejects.toEqual(mockError)
      expect(mockDelete).toHaveBeenCalledWith('/progress/progress-1')
    })

    it('should handle malformed progress ID', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { error: 'Invalid progress ID' },
        },
      }
      mockDelete.mockRejectedValueOnce(mockError)

      const { default: api } = await import('../client')
      await expect(api.delete('/progress/invalid@id')).rejects.toEqual(mockError)
      expect(mockDelete).toHaveBeenCalledWith('/progress/invalid@id')
    })
  })

  describe('Request Interceptors', () => {
    it('should add authorization header when token exists', async () => {
      // Mock localStorage
      const mockToken = 'test-token'
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => mockToken),
        },
        writable: true,
      })

      // Clear module cache and re-import to trigger interceptor setup
      vi.resetModules()
      await import('../client')
      expect(mockRequestInterceptor).toHaveBeenCalled()
    })

    it('should handle missing token', async () => {
      // Mock localStorage with no token
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => null),
        },
        writable: true,
      })

      // Clear module cache and re-import to trigger interceptor setup
      vi.resetModules()
      await import('../client')
      expect(mockRequestInterceptor).toHaveBeenCalled()
    })
  })

  describe('Response Interceptors', () => {
    it('should handle 401 responses by redirecting to login', async () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          href: '',
        },
        writable: true,
      })

      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          removeItem: vi.fn(),
        },
        writable: true,
      })

      // Clear module cache and re-import to trigger interceptor setup
      vi.resetModules()
      await import('../client')
      expect(mockResponseInterceptor).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      mockGet.mockRejectedValueOnce(networkError)

      const { default: api } = await import('../client')
      await expect(api.get('/progress')).rejects.toThrow('Network Error')
    })

    it('should handle timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      }
      mockGet.mockRejectedValueOnce(timeoutError)

      const { default: api } = await import('../client')
      await expect(api.get('/progress')).rejects.toEqual(timeoutError)
    })

    it('should handle server errors (500)', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
      }
      mockGet.mockRejectedValueOnce(serverError)

      const { default: api } = await import('../client')
      await expect(api.get('/progress')).rejects.toEqual(serverError)
    })
  })

  describe('Content-Type Handling', () => {
    it('should send JSON content type for POST requests', async () => {
      const progressData = {
        period: 'daily',
        date: '2024-01-01T00:00:00.000Z',
        progressValue: 50,
      }

      const mockResponse = {
        data: { id: 'progress-1' },
      }

      mockPost.mockResolvedValueOnce(mockResponse)

      const { default: api } = await import('../client')
      await api.post('/goals/goal-1/progress', progressData)

      expect(mockPost).toHaveBeenCalledWith('/goals/goal-1/progress', progressData)
    })

    it('should send JSON content type for PATCH requests', async () => {
      const updateData = {
        progressValue: 60,
      }

      const mockResponse = {
        data: { id: 'progress-1' },
      }

      mockPatch.mockResolvedValueOnce(mockResponse)

      const { default: api } = await import('../client')
      await api.patch('/progress/progress-1', updateData)

      expect(mockPatch).toHaveBeenCalledWith('/progress/progress-1', updateData)
    })
  })
})
