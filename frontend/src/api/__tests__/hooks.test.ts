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