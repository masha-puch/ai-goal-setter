import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from './client'

// Goals
export function useGoals(year?: number) {
  return useQuery({ 
    queryKey: ['goals', year], 
    queryFn: async () => {
      const params = year ? { params: { year } } : {};
      return (await api.get('/goals', params)).data.items as any[];
    }
  })
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

// Moodboards - returns single moodboard for the year (or null)
export function useMoodBoard(year?: number) {
  return useQuery({ 
    queryKey: ['moodboards', year], 
    queryFn: async () => {
      const params = year ? { params: { year } } : {};
      const response = (await api.get('/moodboard', params)).data;
      // Return first item if exists, otherwise null
      return response.items && response.items.length > 0 ? response.items[0] : null;
    }
  })
}

export function useMoodBoardById(moodBoardId: string | null) {
  return useQuery({
    queryKey: ['moodboards', moodBoardId],
    queryFn: async () => (await api.get(`/moodboard/${moodBoardId}`)).data as any,
    enabled: !!moodBoardId,
  })
}

export function useCreateMoodBoard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => (await api.post('/moodboard', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moodboards'] }),
  })
}

export function useUpdateMoodBoard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ moodBoardId, data }: { moodBoardId: string; data: any }) => (await api.patch(`/moodboard/${moodBoardId}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moodboards'] }),
  })
}

export function useDeleteMoodBoard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (moodBoardId: string) => (await api.delete(`/moodboard/${moodBoardId}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moodboards'] }),
  })
}

// MoodBoard Items
export function useMoodBoardItems(moodBoardId: string | null) {
  return useQuery({
    queryKey: ['moodboards', moodBoardId, 'items'],
    queryFn: async () => (await api.get(`/moodboard/${moodBoardId}/items`)).data.items as any[],
    enabled: !!moodBoardId,
  })
}

export function useCreateMoodBoardItem(moodBoardId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
      if (!moodBoardId) throw new Error('MoodBoard ID is required')
      return (await api.post(`/moodboard/${moodBoardId}/items`, data)).data
    },
    onSuccess: () => {
      if (moodBoardId) {
        qc.invalidateQueries({ queryKey: ['moodboards', moodBoardId, 'items'] })
        qc.invalidateQueries({ queryKey: ['moodboards', moodBoardId] })
        qc.invalidateQueries({ queryKey: ['moodboards'] })
      }
    },
  })
}

export function useUpdateMoodBoardItem(moodBoardId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: any }) => {
      if (!moodBoardId) throw new Error('MoodBoard ID is required')
      return (await api.patch(`/moodboard/${moodBoardId}/items/${itemId}`, data)).data
    },
    onSuccess: () => {
      // Refetch in background to sync with server
      qc.invalidateQueries({ queryKey: ['moodboards'] })
    },
  })
}

export function useDeleteMoodBoardItem(moodBoardId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!moodBoardId) throw new Error('MoodBoard ID is required')
      return (await api.delete(`/moodboard/${moodBoardId}/items/${itemId}`)).data
    },
    onSuccess: () => {
      if (moodBoardId) {
        qc.invalidateQueries({ queryKey: ['moodboards', moodBoardId, 'items'] })
        qc.invalidateQueries({ queryKey: ['moodboards', moodBoardId] })
        qc.invalidateQueries({ queryKey: ['moodboards'] })
      }
    },
  })
}

// Achievements
export function useAchievements(year?: number) {
  return useQuery({ 
    queryKey: ['achievements', year], 
    queryFn: async () => {
      const params = year ? { params: { year } } : {};
      return (await api.get('/achievements', params)).data.items as any[];
    }
  })
}

export function useCreateAchievement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => (await api.post('/achievements', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['achievements'] }),
  })
}

export function useUpdateAchievement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ achievementId, data }: { achievementId: string; data: any }) => (await api.patch(`/achievements/${achievementId}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['achievements'] }),
  })
}

export function useDeleteAchievement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (achievementId: string) => (await api.delete(`/achievements/${achievementId}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['achievements'] }),
  })
}

