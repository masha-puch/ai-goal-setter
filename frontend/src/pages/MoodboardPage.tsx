import { useState, useEffect } from 'react'
import { 
  Container, 
  Text, 
  Title, 
  Stack,
  Paper,
  Box,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core'
import { 
  useMoodBoard, 
  useCreateMoodBoard,
  useCreateMoodBoardItem, 
  useDeleteMoodBoardItem,
  useUpdateMoodBoardItem,
  useUpdateMoodBoard,
} from '../api/hooks'
import { useYear } from '../context/YearContext'
import { 
  AddItemForm, 
  MoodboardCanvas, 
  BoardHeader,
  useMoodboardItems,
  useMoodboardDragDrop,
} from '../components/moodboard'

export function MoodboardPage() {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const { year } = useYear()
  const { data: moodBoard, isLoading } = useMoodBoard(year)
  const createMoodBoard = useCreateMoodBoard()

  const [mode, setMode] = useState<'edit' | 'read'>('edit')

  // Auto-create moodboard if it doesn't exist
  useEffect(() => {
    if (!isLoading && !moodBoard && year) {
      createMoodBoard.mutate({ year })
    }
  }, [isLoading, moodBoard, year, createMoodBoard])

  const moodBoardId = moodBoard?.id || null
  const createItem = useCreateMoodBoardItem(moodBoardId || '')
  const deleteItem = useDeleteMoodBoardItem(moodBoardId || '')
  const updateItem = useUpdateMoodBoardItem(moodBoardId || '')
  const updateMoodBoard = useUpdateMoodBoard()

  const {
    localPositions,
    setLocalPositions,
    fileToBase64,
    getRandomPosition,
    handleAddItem,
    handleDragEnd,
    handleResize,
    handleBringForward,
    handleSendBackward,
  } = useMoodboardItems(moodBoard ? [moodBoard] : [], moodBoardId, createItem, updateItem)

  const handleCanvasResize = (newWidth: number, newHeight: number) => {
    if (!moodBoard || !moodBoardId) return

    const oldWidth = moodBoard.canvasWidth || 1200
    const oldHeight = moodBoard.canvasHeight || 800

    // Calculate scale ratios
    const scaleX = newWidth / oldWidth
    const scaleY = newHeight / oldHeight

    // Scale all items proportionally
    const updatedPositions: Record<string, { x: number; y: number; width: number; height: number; zIndex?: number }> = {}
    
    moodBoard.items?.forEach((item: any) => {
      const currentPos = localPositions[item.id] || item.position || { x: 0, y: 0, width: 250, height: 250, zIndex: 1 }
      updatedPositions[item.id] = {
        x: currentPos.x * scaleX,
        y: currentPos.y * scaleY,
        width: currentPos.width * scaleX,
        height: currentPos.height * scaleY,
        zIndex: currentPos.zIndex,
      }

      // Update item position in backend
      updateItem.mutate({
        itemId: item.id,
        data: { position: updatedPositions[item.id] }
      })
    })

    // Update local positions
    setLocalPositions(updatedPositions)

    // Update canvas size in backend
    updateMoodBoard.mutate({
      moodBoardId,
      data: { canvasWidth: newWidth, canvasHeight: newHeight }
    })
  }

  const {
    isDraggingFile,
    handlePageDragOver,
    handlePageDragEnter,
    handlePageDragLeave,
    handlePageDrop,
  } = useMoodboardDragDrop(moodBoardId, createItem, fileToBase64, getRandomPosition)

  return (
    <Container 
      size="xl" 
      my="md"
      onDragOver={handlePageDragOver}
      onDragEnter={handlePageDragEnter}
      onDragLeave={handlePageDragLeave}
      onDrop={handlePageDrop}
      style={{ 
        position: 'relative',
        outline: isDraggingFile ? `3px dashed ${theme.colors.blue[5]}` : 'none',
        outlineOffset: '-3px',
        transition: 'outline 0.2s ease',
      }}
    >
      {isDraggingFile && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colorScheme === 'dark' 
              ? 'rgba(66, 153, 225, 0.1)' 
              : 'rgba(66, 153, 225, 0.05)',
            pointerEvents: 'none',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
          }}
        >
          <Text size="xl" fw={500} c="blue">
            Drop images here to add to moodboard
          </Text>
        </Box>
      )}
      <Title order={2} mb="lg">Mood Board</Title>

      {moodBoard ? (
        <Stack gap="md" style={{ height: 'calc(100vh - 280px)' }}>
          <BoardHeader 
            board={moodBoard}
            mode={mode}
            onModeChange={setMode}
          />

          <AddItemForm 
            selectedMoodBoardId={moodBoardId}
            onAddItem={handleAddItem}
            isLoading={createItem.isPending}
          />

          <Box style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            {mode === 'edit' ? (
              <MoodboardCanvas 
                moodBoard={moodBoard}
                localPositions={localPositions}
                mode={mode}
                onDragEnd={handleDragEnd}
                onDeleteItem={(id) => deleteItem.mutate(id)}
                onResize={handleResize}
                onBringForward={handleBringForward}
                onSendBackward={handleSendBackward}
                onCanvasResize={handleCanvasResize}
              />
            ) : (
              <MoodboardCanvas 
                moodBoard={moodBoard}
                localPositions={localPositions}
                mode={mode}
              />
            )}
          </Box>
        </Stack>
      ) : (
        <Paper withBorder p="xl" radius="md">
          <Stack align="center" gap="md">
            <Text size="lg" c="dimmed">Loading moodboard...</Text>
          </Stack>
        </Paper>
      )}
    </Container>
  )
}
