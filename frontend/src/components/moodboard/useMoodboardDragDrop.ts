import { useState } from 'react'

export function useMoodboardDragDrop(
  selectedMoodBoardId: string | null,
  createItem: any,
  fileToBase64: (file: File) => Promise<string>,
  getRandomPosition: () => { x: number; y: number; width: number; height: number }
) {
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  const handlePageDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(true)
  }

  const handlePageDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(true)
  }

  const handlePageDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDraggingFile(false)
    }
  }

  const handlePageDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(false)

    if (!selectedMoodBoardId) return

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    for (const file of imageFiles) {
      const content = await fileToBase64(file)
      const position = getRandomPosition()
      await createItem.mutateAsync({ type: 'image_upload', content, position })
    }
  }

  return {
    isDraggingFile,
    handlePageDragOver,
    handlePageDragEnter,
    handlePageDragLeave,
    handlePageDrop,
  }
}

