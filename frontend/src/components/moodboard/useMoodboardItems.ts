import { useState } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'

interface MoodBoard {
  id: string
  year: number
  items?: MoodBoardItem[]
  createdAt: string
}

interface MoodBoardItem {
  id: string
  type: string
  content: string
  tags?: any
  position?: { x: number; y: number; width: number; height: number; zIndex?: number }
  createdAt: string
}

export function useMoodboardItems(
  moodBoards: MoodBoard[] | undefined,
  selectedMoodBoardId: string | null,
  createItem: any,
  updateItem: any
) {
  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number; width: number; height: number; zIndex?: number }>>({})

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Get the maximum zIndex from current items
  const getMaxZIndex = () => {
    const currentBoard = moodBoards?.find((mb: MoodBoard) => mb.id === selectedMoodBoardId)
    if (!currentBoard?.items || currentBoard.items.length === 0) return 1
    
    const maxZ = Math.max(
      ...currentBoard.items.map((item: MoodBoardItem) => item.position?.zIndex ?? 1)
    )
    return maxZ
  }

  const getRandomPosition = () => {
    return {
      x: Math.random() * 600,
      y: Math.random() * 400,
      width: 200 + Math.random() * 150,
      height: 200 + Math.random() * 150,
      zIndex: getMaxZIndex() + 1,
    }
  }

  const handleAddItem = async (type: string | null, content: string, file: File | null) => {
    if (!selectedMoodBoardId) return
    
    let finalContent = content
    
    if (type === 'image_upload' && file) {
      finalContent = await fileToBase64(file)
    }
    
    const position = getRandomPosition()
    await createItem.mutateAsync({ type, content: finalContent, position })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    const itemId = active.id as string
    
    const currentBoard = moodBoards?.find((mb: MoodBoard) => mb.id === selectedMoodBoardId)
    const item = currentBoard?.items?.find((it: MoodBoardItem) => it.id === itemId)
    
    if (!item || !selectedMoodBoardId) return
    
    const currentPos = localPositions[itemId] || item.position || { x: 0, y: 0, width: 250, height: 250, zIndex: 1 }
    const newPosition = {
      ...currentPos,
      x: currentPos.x + delta.x,
      y: currentPos.y + delta.y,
    }
    
    setLocalPositions(prev => ({
      ...prev,
      [itemId]: newPosition
    }))
    
    updateItem.mutate({
      itemId,
      data: { position: newPosition }
    })
  }

  const handleResize = (itemId: string, newSize: { width: number; height: number }) => {
    const currentBoard = moodBoards?.find((mb: MoodBoard) => mb.id === selectedMoodBoardId)
    const item = currentBoard?.items?.find((it: MoodBoardItem) => it.id === itemId)
    
    if (!item || !selectedMoodBoardId) return
    
    const currentPos = localPositions[itemId] || item.position || { x: 0, y: 0, width: 250, height: 250, zIndex: 1 }
    const newPosition = {
      x: currentPos.x,  // Explicitly preserve x position
      y: currentPos.y,  // Explicitly preserve y position
      width: newSize.width,
      height: newSize.height,
      zIndex: currentPos.zIndex,  // Preserve zIndex
    }
    
    setLocalPositions(prev => ({
      ...prev,
      [itemId]: newPosition
    }))
    
    updateItem.mutate({
      itemId,
      data: { position: newPosition }
    })
  }

  const handleBringForward = (itemId: string) => {
    const currentBoard = moodBoards?.find((mb: MoodBoard) => mb.id === selectedMoodBoardId)
    const item = currentBoard?.items?.find((it: MoodBoardItem) => it.id === itemId)
    
    if (!item || !selectedMoodBoardId) return
    
    const currentPos = localPositions[itemId] || item.position || { x: 0, y: 0, width: 250, height: 250, zIndex: 1 }
    const newPosition = {
      ...currentPos,
      zIndex: (currentPos.zIndex ?? 1) + 1,
    }
    
    setLocalPositions(prev => ({
      ...prev,
      [itemId]: newPosition
    }))
    
    updateItem.mutate({
      itemId,
      data: { position: newPosition }
    })
  }

  const handleSendBackward = (itemId: string) => {
    const currentBoard = moodBoards?.find((mb: MoodBoard) => mb.id === selectedMoodBoardId)
    const item = currentBoard?.items?.find((it: MoodBoardItem) => it.id === itemId)
    
    if (!item || !selectedMoodBoardId) return
    
    const currentPos = localPositions[itemId] || item.position || { x: 0, y: 0, width: 250, height: 250, zIndex: 1 }
    const newZIndex = Math.max(1, (currentPos.zIndex ?? 1) - 1)
    const newPosition = {
      ...currentPos,
      zIndex: newZIndex,
    }
    
    setLocalPositions(prev => ({
      ...prev,
      [itemId]: newPosition
    }))
    
    updateItem.mutate({
      itemId,
      data: { position: newPosition }
    })
  }

  return {
    localPositions,
    setLocalPositions,
    fileToBase64,
    getRandomPosition,
    handleAddItem,
    handleDragEnd,
    handleResize,
    handleBringForward,
    handleSendBackward,
  }
}

