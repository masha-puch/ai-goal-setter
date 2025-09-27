import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { 
  useGoals, 
  useCreateGoal, 
  useUpdateGoal, 
  useDeleteGoal 
} from '../hooks'

// Mock the API client
vi.mock('../client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
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

describe('Goals API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useGoals', () => {
    it('should be defined', () => {
      expect(useGoals).toBeDefined()
    })
  })

  describe('useCreateGoal', () => {
    it('should be defined', () => {
      expect(useCreateGoal).toBeDefined()
    })
  })

  describe('useUpdateGoal', () => {
    it('should be defined', () => {
      expect(useUpdateGoal).toBeDefined()
    })
  })

  describe('useDeleteGoal', () => {
    it('should be defined', () => {
      expect(useDeleteGoal).toBeDefined()
    })
  })
})