import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { vi } from 'vitest'
import { ProgressPage } from '../ProgressPage'
import { useCreateProgress, useGoals, useAllProgress } from '../../api/hooks'

// Mock the API hooks
vi.mock('../../api/hooks', () => ({
  useCreateProgress: vi.fn(),
  useGoals: vi.fn(),
  useAllProgress: vi.fn(),
}))

// Test wrapper for React Query and Mantine
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      MantineProvider,
      {},
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    )
  }
}

describe('ProgressPage', () => {
  const mockGoals = [
    { id: 'goal-1', title: 'Learn TypeScript' },
    { id: 'goal-2', title: 'Exercise Daily' },
    { id: 'goal-3', title: 'Read Books' },
  ]

  const mockProgressEntries = [
    {
      id: 'progress-1',
      goalId: 'goal-1',
      period: 'daily',
      date: '2024-01-01T00:00:00.000Z',
      progressValue: 50,
      note: 'Good progress today',
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

  const mockCreateProgressMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock implementations
    vi.mocked(useGoals).mockReturnValue({ data: mockGoals })
    vi.mocked(useAllProgress).mockReturnValue({ data: mockProgressEntries })
    vi.mocked(useCreateProgress).mockReturnValue(mockCreateProgressMutation)
  })

  describe('Component Rendering', () => {
    it('should render the progress page title', () => {
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      expect(screen.getByText('Progress')).toBeInTheDocument()
    })

    it('should render the form with all input fields', () => {
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      // Check form elements using proper Mantine Select selectors
      expect(screen.getByRole('textbox', { name: /goal/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /period/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /date/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /progress/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /mood/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /note/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    })

    it('should render the progress entries table', () => {
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      // Check table headers using getAllByText to handle multiple matches
      expect(screen.getAllByText('Goal')[0]).toBeInTheDocument()
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getAllByText('Period')[0]).toBeInTheDocument()
      expect(screen.getByText('Value')).toBeInTheDocument()
      expect(screen.getAllByText('Mood')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Note')[0]).toBeInTheDocument()
    })

    it('should display progress entries in the table', () => {
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      // Check that progress entries are displayed using getAllByText for multiple matches
      expect(screen.getAllByText('Learn TypeScript')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Exercise Daily')[0]).toBeInTheDocument()
      expect(screen.getByText('daily')).toBeInTheDocument()
      expect(screen.getByText('weekly')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('75')).toBeInTheDocument()
      expect(screen.getAllByText('high')[1]).toBeInTheDocument()
      expect(screen.getAllByText('neutral')[1]).toBeInTheDocument()
      expect(screen.getByText('Good progress today')).toBeInTheDocument()
      expect(screen.getByText('Weekly review')).toBeInTheDocument()
    })

    it('should handle empty progress entries', () => {
      vi.mocked(useAllProgress).mockReturnValue({ data: [] })
      
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      // Table should still be rendered but with no data rows
      expect(screen.getAllByText('Goal')[0]).toBeInTheDocument()
      expect(screen.queryByText('1/1/2024')).not.toBeInTheDocument()
    })

    it('should handle undefined progress entries', () => {
      vi.mocked(useAllProgress).mockReturnValue({ data: undefined })
      
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      // Table should still be rendered but with no data rows
      expect(screen.getAllByText('Goal')[0]).toBeInTheDocument()
      expect(screen.queryByText('1/1/2024')).not.toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('should update goal selection', () => {
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      const goalSelect = screen.getByRole('textbox', { name: /goal/i })
      fireEvent.click(goalSelect)
      const option = screen.getByRole('option', { name: 'Exercise Daily' })
      fireEvent.click(option)

      expect(goalSelect).toHaveValue('Exercise Daily')
    })

    it('should update period selection', () => {
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      const periodSelect = screen.getByRole('textbox', { name: /period/i })
      fireEvent.click(periodSelect)
      const option = screen.getByRole('option', { name: 'quarterly' })
      fireEvent.click(option)

      expect(periodSelect).toHaveValue('quarterly')
    })

    it('should update date input', () => {
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      const dateInput = screen.getByRole('textbox', { name: /date/i })
      const newDate = '2024-02-01T00:00:00.000Z'
      fireEvent.change(dateInput, { target: { value: newDate } })

      expect(dateInput).toHaveValue(newDate)
    })

    it('should update progress value input', () => {
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      const valueInput = screen.getByRole('textbox', { name: /progress/i })
      fireEvent.change(valueInput, { target: { value: '80' } })

      expect(valueInput).toHaveValue('80')
    })

    it('should update mood selection', () => {
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      const moodSelect = screen.getByRole('textbox', { name: /mood/i })
      fireEvent.click(moodSelect)
      const option = screen.getByRole('option', { name: 'low' })
      fireEvent.click(option)

      expect(moodSelect).toHaveValue('low')
    })

    it('should update note input', () => {
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      const noteInput = screen.getByRole('textbox', { name: /note/i })
      const noteText = 'This is a test note'
      fireEvent.change(noteInput, { target: { value: noteText } })

      expect(noteInput).toHaveValue(noteText)
    })
  })

  describe('Form Submission', () => {
    it('should submit form with all fields filled', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({})
      vi.mocked(useCreateProgress).mockReturnValue({
        ...mockCreateProgressMutation,
        mutateAsync: mockMutateAsync,
      })

      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      // Fill out the form
      const goalSelect = screen.getByRole('textbox', { name: /goal/i })
      fireEvent.click(goalSelect)
      fireEvent.click(screen.getByRole('option', { name: 'Learn TypeScript' }))
      
      const periodSelect = screen.getByRole('textbox', { name: /period/i })
      fireEvent.click(periodSelect)
      fireEvent.click(screen.getByRole('option', { name: 'quarterly' }))
      
      fireEvent.change(screen.getByRole('textbox', { name: /date/i }), { target: { value: '2024-01-01T00:00:00.000Z' } })
      fireEvent.change(screen.getByRole('textbox', { name: /progress/i }), { target: { value: '50' } })
      
      const moodSelect = screen.getByRole('textbox', { name: /mood/i })
      fireEvent.click(moodSelect)
      fireEvent.click(screen.getByRole('option', { name: 'high' }))
      
      fireEvent.change(screen.getByRole('textbox', { name: /note/i }), { target: { value: 'Test note' } })

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          period: 'quarterly',
          date: '2024-01-01T00:00:00.000Z',
          progressValue: 50,
          note: 'Test note',
          mood: 'high',
        })
      })
    })

    it('should submit form with minimal required fields', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({})
      vi.mocked(useCreateProgress).mockReturnValue({
        ...mockCreateProgressMutation,
        mutateAsync: mockMutateAsync,
      })

      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      // Fill out only required fields
      const goalSelect = screen.getByRole('textbox', { name: /goal/i })
      fireEvent.click(goalSelect)
      fireEvent.click(screen.getByRole('option', { name: 'Learn TypeScript' }))
      
      const periodSelect = screen.getByRole('textbox', { name: /period/i })
      fireEvent.click(periodSelect)
      fireEvent.click(screen.getByRole('option', { name: 'monthly' }))
      
      fireEvent.change(screen.getByRole('textbox', { name: /date/i }), { target: { value: '2024-01-01T00:00:00.000Z' } })

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          period: 'monthly',
          date: '2024-01-01T00:00:00.000Z',
          progressValue: undefined,
          note: '',
          mood: null,
        })
      })
    })

    it('should not submit form when no goal is selected', async () => {
      const mockMutateAsync = vi.fn()
      vi.mocked(useCreateProgress).mockReturnValue({
        ...mockCreateProgressMutation,
        mutateAsync: mockMutateAsync,
      })

      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      // Try to submit without selecting a goal
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      // Should not call the mutation
      expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('should clear form fields after successful submission', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({})
      vi.mocked(useCreateProgress).mockReturnValue({
        ...mockCreateProgressMutation,
        mutateAsync: mockMutateAsync,
      })

      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      // Fill out the form
      const goalSelect = screen.getByRole('textbox', { name: /goal/i })
      fireEvent.click(goalSelect)
      fireEvent.click(screen.getByRole('option', { name: 'Learn TypeScript' }))
      
      fireEvent.change(screen.getByRole('textbox', { name: /progress/i }), { target: { value: '50' } })
      fireEvent.change(screen.getByRole('textbox', { name: /note/i }), { target: { value: 'Test note' } })
      
      const moodSelect = screen.getByRole('textbox', { name: /mood/i })
      fireEvent.click(moodSelect)
      fireEvent.click(screen.getByRole('option', { name: 'high' }))

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled()
      })

      // Check that form fields are cleared
      expect(screen.getByRole('textbox', { name: /progress/i })).toHaveValue('')
      expect(screen.getByRole('textbox', { name: /note/i })).toHaveValue('')
      expect(screen.getByRole('textbox', { name: /mood/i })).toHaveValue('')
    })

    it('should show loading state during submission', () => {
      vi.mocked(useCreateProgress).mockReturnValue({
        ...mockCreateProgressMutation,
        isPending: true,
      })

      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      const submitButton = screen.getByRole('button', { name: 'Add' })
      expect(submitButton).toBeDisabled()
    })

    it('should handle submission errors', async () => {
      const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Submission failed'))
      vi.mocked(useCreateProgress).mockReturnValue({
        ...mockCreateProgressMutation,
        mutateAsync: mockMutateAsync,
      })

      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      // Fill out required fields and submit the form
      const goalSelect = screen.getByRole('textbox', { name: /goal/i })
      fireEvent.click(goalSelect)
      fireEvent.click(screen.getByRole('option', { name: 'Learn TypeScript' }))
      
      const periodSelect = screen.getByRole('textbox', { name: /period/i })
      fireEvent.click(periodSelect)
      fireEvent.click(screen.getByRole('option', { name: 'quarterly' }))
      
      fireEvent.change(screen.getByRole('textbox', { name: /date/i }), { target: { value: '2024-01-01T00:00:00.000Z' } })
      
      // Mock console.error to prevent unhandled rejection from showing in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled()
      })

      // Form should still be functional after error
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
      
      // Restore console.error
      consoleSpy.mockRestore()
    })
  })

  describe('Data Display', () => {
    it('should format dates correctly in the table', () => {
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      // Check that dates are formatted (exact format may vary by locale)
      const dateCells = screen.getAllByText(/1\/1\/2024|2\/1\/2024/)
      expect(dateCells.length).toBeGreaterThan(0)
    })

    it('should display dash for null values', () => {
      const progressWithNulls = [
        {
          id: 'progress-1',
          goalId: 'goal-1',
          period: 'daily',
          date: '2024-01-01T00:00:00.000Z',
          progressValue: null,
          note: null,
          mood: null,
          goal: {
            id: 'goal-1',
            title: 'Learn TypeScript',
          },
        },
      ]

      vi.mocked(useAllProgress).mockReturnValue({ data: progressWithNulls })

      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      // Check that null values are displayed as dashes
      const dashElements = screen.getAllByText('-')
      expect(dashElements.length).toBeGreaterThan(0)
    })

    it('should display unknown goal when goal is missing', () => {
      const progressWithMissingGoal = [
        {
          id: 'progress-1',
          goalId: 'goal-1',
          period: 'daily',
          date: '2024-01-01T00:00:00.000Z',
          progressValue: 50,
          note: 'Test',
          mood: 'high',
          goal: null,
        },
      ]

      vi.mocked(useAllProgress).mockReturnValue({ data: progressWithMissingGoal })

      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      expect(screen.getByText('Unknown Goal')).toBeInTheDocument()
    })
  })

  describe('Goal Options', () => {
    it('should populate goal select with available goals', () => {
      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      const goalSelect = screen.getByRole('textbox', { name: /goal/i })
      expect(goalSelect).toBeInTheDocument()

      // Check that goal options are available
      fireEvent.click(goalSelect)
      expect(screen.getAllByText('Learn TypeScript').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Exercise Daily').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Read Books').length).toBeGreaterThan(0)
    })

    it('should handle empty goals list', () => {
      vi.mocked(useGoals).mockReturnValue({ data: [] })

      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      const goalSelect = screen.getByRole('textbox', { name: /goal/i })
      expect(goalSelect).toBeInTheDocument()
    })

    it('should handle undefined goals', () => {
      vi.mocked(useGoals).mockReturnValue({ data: undefined })

      const wrapper = createWrapper()
      render(<ProgressPage />, { wrapper })

      const goalSelect = screen.getByRole('textbox', { name: /goal/i })
      expect(goalSelect).toBeInTheDocument()
    })
  })
})
