import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import React from 'react'
import { vi } from 'vitest'

// Mock the API hooks
vi.mock('../../api/hooks', () => ({
  useGoals: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useCreateGoal: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateGoal: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useDeleteGoal: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}))

// Import GoalsPage after mocking
import { GoalsPage } from '../GoalsPage'

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(MantineProvider, {}, children)
  )
}

describe('GoalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render goals page with title', () => {
    render(
      React.createElement(TestWrapper, {}, React.createElement(GoalsPage))
    )

    expect(screen.getByText('Goals')).toBeInTheDocument()
  })

  it('should render goals form with input fields', async () => {
    render(
      React.createElement(TestWrapper, {}, React.createElement(GoalsPage))
    )

    // Check for form elements using different approaches
    // Get all textbox elements (includes both TextInput and Select inputs)
    const textboxes = screen.getAllByRole('textbox')
    expect(textboxes).toHaveLength(4) // Title, Category, Priority, Description
    
    // Find the actual TextInput (Title field) by checking for required attribute
    const titleInput = textboxes.find(input => input.hasAttribute('required'))
    expect(titleInput).toBeInTheDocument()
    
    // Find the Select inputs by checking for aria-haspopup="listbox" attribute
    const selectInputs = textboxes.filter(input => input.getAttribute('aria-haspopup') === 'listbox')
    expect(selectInputs).toHaveLength(2) // Category and Priority selects
    
    // Verify the form elements exist
    expect(screen.getByText('Add Goal')).toBeInTheDocument()
  })
})