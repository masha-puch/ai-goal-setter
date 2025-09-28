import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { vi } from 'vitest'
import { ProgressPage } from './src/pages/ProgressPage'
import { useCreateProgress, useGoals, useAllProgress } from './src/api/hooks'

// Mock the API hooks
vi.mock('./src/api/hooks', () => ({
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

  return ({ children }) => {
    return React.createElement(
      MantineProvider,
      {},
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    )
  }
}

const mockGoals = [
  { id: 'goal-1', title: 'Learn TypeScript' },
  { id: 'goal-2', title: 'Exercise Daily' },
  { id: 'goal-3', title: 'Read Books' },
]

const mockProgressEntries = []

const mockCreateProgressMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
}

// Setup default mock implementations
vi.mocked(useGoals).mockReturnValue({ data: mockGoals })
vi.mocked(useAllProgress).mockReturnValue({ data: mockProgressEntries })
vi.mocked(useCreateProgress).mockReturnValue(mockCreateProgressMutation)

const wrapper = createWrapper()
render(<ProgressPage />, { wrapper })

console.log('=== FULL DOM ===')
console.log(document.body.innerHTML)

console.log('\n=== COMBINING SELECTORS ===')
const comboboxes = document.querySelectorAll('[role="combobox"]')
console.log('Comboboxes found:', comboboxes.length)
comboboxes.forEach((cb, i) => {
  console.log(`Combobox ${i}:`, cb.outerHTML)
})

console.log('\n=== TEXTBOXES ===')
const textboxes = document.querySelectorAll('input[type="text"]')
console.log('Textboxes found:', textboxes.length)
textboxes.forEach((tb, i) => {
  console.log(`Textbox ${i}:`, tb.outerHTML)
})

console.log('\n=== ALL INPUTS ===')
const inputs = document.querySelectorAll('input')
console.log('All inputs found:', inputs.length)
inputs.forEach((input, i) => {
  console.log(`Input ${i}:`, input.outerHTML)
})
