import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from './client'

// Goals
export function useGoals() {
  return useQuery({ queryKey: ['goals'], queryFn: async () => (await api.get('/goals')).data.items as any[] })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => (await api.post('/goals', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useUpdateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, data }: { goalId: string; data: any }) => (await api.patch(`/goals/${goalId}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useCompleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, note }: { goalId: string; note?: string }) => 
      (await api.patch(`/goals/${goalId}`, { status: 'completed', completionNote: note })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useDropGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goalId, note }: { goalId: string; note?: string }) => 
      (await api.patch(`/goals/${goalId}`, { status: 'dropped', completionNote: note })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (goalId: string) => (await api.delete(`/goals/${goalId}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

// Progress (per goal)
export function useProgress(goalId: string | null) {
  return useQuery({
    queryKey: ['progress', goalId],
    queryFn: async () => (await api.get(`/goals/${goalId}/progress`)).data.items as any[],
    enabled: !!goalId,
  })
}

// Progress (all goals)
export function useAllProgress() {
  return useQuery({
    queryKey: ['progress', 'all'],
    queryFn: async () => (await api.get('/progress')).data.items as any[],
  })
}

export function useCreateProgress(goalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => (await api.post(`/goals/${goalId}/progress`, data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress', goalId] });
      qc.invalidateQueries({ queryKey: ['progress', 'all'] });
    },
  })
}

export function useUpdateProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ progressId, data }: { progressId: string; data: any }) => (await api.patch(`/progress/${progressId}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['progress'] }),
  })
}

export function useDeleteProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (progressId: string) => (await api.delete(`/progress/${progressId}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['progress'] }),
  })
}

// Moodboard
export function useMoodboard() {
  return useQuery({ queryKey: ['moodboard'], queryFn: async () => (await api.get('/moodboard')).data.items as any[] })
}

export function useCreateMoodItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => (await api.post('/moodboard', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moodboard'] }),
  })
}

export function useUpdateMoodItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: any }) => (await api.patch(`/moodboard/${itemId}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moodboard'] }),
  })
}

export function useDeleteMoodItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (itemId: string) => (await api.delete(`/moodboard/${itemId}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moodboard'] }),
  })
}

// Reflections
export function useReflections() {
  return useQuery({ queryKey: ['reflections'], queryFn: async () => (await api.get('/reflections')).data.items as any[] })
}

export function useCreateReflection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => (await api.post('/reflections', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reflections'] }),
  })
}

export function useUpdateReflection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ reflectionId, data }: { reflectionId: string; data: any }) => (await api.patch(`/reflections/${reflectionId}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reflections'] }),
  })
}

export function useDeleteReflection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (reflectionId: string) => (await api.delete(`/reflections/${reflectionId}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reflections'] }),
  })
}

// AI
export function useAiRecommendations() {
  return useMutation({ mutationFn: async () => (await api.post('/ai/recommendations', {})).data as { text: string } })
}
export function useAiMoodboardSuggestions() {
  return useMutation({ mutationFn: async () => (await api.post('/ai/moodboard/suggestions', {})).data as { text: string } })
}
export function useAiMotivation() {
  return useMutation({ mutationFn: async () => (await api.post('/ai/motivation', {})).data as { text: string } })
}
export function useAiAdjust() {
  return useMutation({ mutationFn: async () => (await api.post('/ai/adjust', {})).data as { text: string } })
}
export function useAiSummary() {
  return useMutation({ mutationFn: async () => (await api.post('/ai/summary', {})).data as { text: string } })
}

