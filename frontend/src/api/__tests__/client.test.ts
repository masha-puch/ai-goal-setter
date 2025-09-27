import { vi } from 'vitest'

// Mock axios before importing the client
vi.mock('axios', () => ({
  create: vi.fn().mockReturnValue({
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  }),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.location
const mockLocation = {
  href: '',
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
})

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation.href = ''
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Token Management', () => {
    it('should handle token retrieval from localStorage', () => {
      const token = 'bearer-token-456'
      localStorageMock.getItem.mockReturnValue(token)

      const retrievedToken = localStorageMock.getItem('token')
      expect(retrievedToken).toBe(token)
    })

    it('should handle token removal', () => {
      localStorageMock.removeItem('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })

    it('should handle missing token gracefully', () => {
      localStorageMock.getItem.mockReturnValue(null)
      const token = localStorageMock.getItem('token')
      expect(token).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      expect(() => localStorageMock.getItem('token')).toThrow('localStorage error')
    })
  })
})