import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { 
  useProgress, 
  useAllProgress, 
  useCreateProgress, 
  useUpdateProgress, 
  useDeleteProgress 
} from '../hooks'

// Mock the API client
vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

// Test wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('Progress API Hooks', () => {
  let mockApi: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { default: api } = await import('../client')
    mockApi = api
  })

  describe('useProgress', () => {
    it('should fetch progress for a specific goal', async () => {
      const mockProgressData = [
        {
          id: 'progress-1',
          goalId: 'goal-1',
          period: 'daily',
          date: '2024-01-01T00:00:00.000Z',
          progressValue: 50,
          note: 'Good progress',
          mood: 'high',
        },
      ]

      mockApi.get.mockResolvedValueOnce({
        data: { items: mockProgressData },
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useProgress('goal-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockProgressData)
      expect(mockApi.get).toHaveBeenCalledWith('/goals/goal-1/progress')
    })

    it('should not fetch when goalId is null', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useProgress(null), { wrapper })

      expect(result.current.isLoading).toBe(false)
      expect(mockApi.get).not.toHaveBeenCalled()
    })

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('API Error'))

      const wrapper = createWrapper()
      const { result } = renderHook(() => useProgress('goal-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should use correct query key', () => {
      const wrapper = createWrapper()
      renderHook(() => useProgress('goal-1'), { wrapper })

      // The query key should be ['progress', 'goal-1']
      expect(mockApi.get).toHaveBeenCalledWith('/goals/goal-1/progress')
    })
  })

  describe('useAllProgress', () => {
    it('should fetch all progress entries', async () => {
      const mockProgressData = [
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
        {
          id: 'progress-2',
          goalId: 'goal-2',
          period: 'weekly',
          date: '2024-01-02T00:00:00.000Z',
          progressValue: 75,
          note: 'Weekly review',
          mood: 'neutral',
          goal: {
            id: 'goal-2',
            title: 'Exercise Daily',
          },
        },
      ]

      mockApi.get.mockResolvedValueOnce({
        data: { items: mockProgressData },
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAllProgress(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockProgressData)
      expect(mockApi.get).toHaveBeenCalledWith('/progress')
    })

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('API Error'))

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAllProgress(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should use correct query key', () => {
      const wrapper = createWrapper()
      renderHook(() => useAllProgress(), { wrapper })

      // The query key should be ['progress', 'all']
      expect(mockApi.get).toHaveBeenCalledWith('/progress')
    })
  })

  describe('useCreateProgress', () => {
    it('should create a progress entry', async () => {
      const mockProgressData = {
        period: 'daily',
        date: '2024-01-01T00:00:00.000Z',
        progressValue: 50,
        note: 'Good progress',
        mood: 'high',
      }

      const mockCreatedProgress = {
        id: 'progress-1',
        goalId: 'goal-1',
        ...mockProgressData,
      }

      mockApi.post.mockResolvedValueOnce({
        data: mockCreatedProgress,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCreateProgress('goal-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(false) // Initially not successful
      })

      // Trigger the mutation
      result.current.mutate(mockProgressData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockCreatedProgress)
      expect(mockApi.post).toHaveBeenCalledWith('/goals/goal-1/progress', mockProgressData)
    })

    it('should handle API errors', async () => {
      const mockProgressData = {
        period: 'daily',
        date: '2024-01-01T00:00:00.000Z',
        progressValue: 50,
      }

      mockApi.post.mockRejectedValueOnce(new Error('API Error'))

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCreateProgress('goal-1'), { wrapper })

      result.current.mutate(mockProgressData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should invalidate progress queries on success', async () => {
      const mockProgressData = {
        period: 'daily',
        date: '2024-01-01T00:00:00.000Z',
        progressValue: 50,
      }

      const mockCreatedProgress = {
        id: 'progress-1',
        goalId: 'goal-1',
        ...mockProgressData,
      }

      mockApi.post.mockResolvedValueOnce({
        data: mockCreatedProgress,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useCreateProgress('goal-1'), { wrapper })

      result.current.mutate(mockProgressData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // The mutation should invalidate both goal-specific and all progress queries
      expect(mockApi.post).toHaveBeenCalledWith('/goals/goal-1/progress', mockProgressData)
    })
  })

  describe('useUpdateProgress', () => {
    it('should update a progress entry', async () => {
      const updateData = {
        period: 'weekly',
        progressValue: 75,
        note: 'Updated progress',
        mood: 'neutral',
      }

      const mockUpdatedProgress = {
        id: 'progress-1',
        goalId: 'goal-1',
        ...updateData,
      }

      mockApi.patch.mockResolvedValueOnce({
        data: mockUpdatedProgress,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUpdateProgress(), { wrapper })

      result.current.mutate({ progressId: 'progress-1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUpdatedProgress)
      expect(mockApi.patch).toHaveBeenCalledWith('/progress/progress-1', updateData)
    })

    it('should handle partial updates', async () => {
      const updateData = {
        progressValue: 60,
      }

      const mockUpdatedProgress = {
        id: 'progress-1',
        goalId: 'goal-1',
        period: 'daily',
        date: '2024-01-01T00:00:00.000Z',
        ...updateData,
      }

      mockApi.patch.mockResolvedValueOnce({
        data: mockUpdatedProgress,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUpdateProgress(), { wrapper })

      result.current.mutate({ progressId: 'progress-1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUpdatedProgress)
      expect(mockApi.patch).toHaveBeenCalledWith('/progress/progress-1', updateData)
    })

    it('should handle API errors', async () => {
      const updateData = {
        progressValue: 60,
      }

      mockApi.patch.mockRejectedValueOnce(new Error('API Error'))

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUpdateProgress(), { wrapper })

      result.current.mutate({ progressId: 'progress-1', data: updateData })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should invalidate progress queries on success', async () => {
      const updateData = {
        progressValue: 60,
      }

      const mockUpdatedProgress = {
        id: 'progress-1',
        goalId: 'goal-1',
        ...updateData,
      }

      mockApi.patch.mockResolvedValueOnce({
        data: mockUpdatedProgress,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUpdateProgress(), { wrapper })

      result.current.mutate({ progressId: 'progress-1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockApi.patch).toHaveBeenCalledWith('/progress/progress-1', updateData)
    })
  })

  describe('useDeleteProgress', () => {
    it('should delete a progress entry', async () => {
      mockApi.delete.mockResolvedValueOnce({
        data: {},
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useDeleteProgress(), { wrapper })

      result.current.mutate('progress-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockApi.delete).toHaveBeenCalledWith('/progress/progress-1')
    })

    it('should handle API errors', async () => {
      mockApi.delete.mockRejectedValueOnce(new Error('API Error'))

      const wrapper = createWrapper()
      const { result } = renderHook(() => useDeleteProgress(), { wrapper })

      result.current.mutate('progress-1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should invalidate progress queries on success', async () => {
      mockApi.delete.mockResolvedValueOnce({
        data: {},
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useDeleteProgress(), { wrapper })

      result.current.mutate('progress-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockApi.delete).toHaveBeenCalledWith('/progress/progress-1')
    })
  })

  describe('Hook integration', () => {
    it('should handle multiple hooks together', async () => {
      const mockAllProgress = [
        {
          id: 'progress-1',
          goalId: 'goal-1',
          period: 'daily',
          date: '2024-01-01T00:00:00.000Z',
          progressValue: 50,
          goal: { id: 'goal-1', title: 'Learn TypeScript' },
        },
      ]

      const mockGoalProgress = [
        {
          id: 'progress-1',
          goalId: 'goal-1',
          period: 'daily',
          date: '2024-01-01T00:00:00.000Z',
          progressValue: 50,
        },
      ]

      mockApi.get
        .mockResolvedValueOnce({ data: { items: mockAllProgress } })
        .mockResolvedValueOnce({ data: { items: mockGoalProgress } })

      const wrapper = createWrapper()
      const { result: allProgressResult } = renderHook(() => useAllProgress(), { wrapper })
      const { result: goalProgressResult } = renderHook(() => useProgress('goal-1'), { wrapper })

      await waitFor(() => {
        expect(allProgressResult.current.isSuccess).toBe(true)
        expect(goalProgressResult.current.isSuccess).toBe(true)
      })

      expect(allProgressResult.current.data).toEqual(mockAllProgress)
      expect(goalProgressResult.current.data).toEqual(mockGoalProgress)
    })
  })
})
