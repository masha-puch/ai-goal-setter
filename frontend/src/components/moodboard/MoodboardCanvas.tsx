import { useRef } from 'react'
import { Box, Paper, Text, useMantineTheme, useMantineColorScheme } from '@mantine/core'
import { DndContext, useSensors, useSensor, PointerSensor, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { DraggableItem } from './DraggableItem'

export const CANVAS_WIDTH = 1200
export const CANVAS_HEIGHT = 800

interface MoodBoardItem {
  id: string
  type: string
  content: string
  tags?: any
  position?: { x: number; y: number; width: number; height: number; zIndex?: number }
  createdAt: string
}

interface MoodBoard {
  id: string
  year: number
  items?: MoodBoardItem[]
  createdAt: string
}

interface MoodboardCanvasProps {
  moodBoard: MoodBoard
  localPositions?: Record<string, { x: number; y: number; width: number; height: number; zIndex?: number }>
  mode?: 'edit' | 'read'
  // Edit mode only props
  onDragEnd?: (event: DragEndEvent) => void
  onDeleteItem?: (id: string) => void
  onResize?: (id: string, size: { width: number; height: number }) => void
  onBringForward?: (id: string) => void
  onSendBackward?: (id: string) => void
}

export function MoodboardCanvas({ 
  moodBoard,
  localPositions, 
  mode = 'edit', 
  onDragEnd, 
  onDeleteItem, 
  onResize, 
  onBringForward, 
  onSendBackward
}: MoodboardCanvasProps) {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const canvasRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Extract values from moodboard
  const items = moodBoard?.items

  if (!items || items.length === 0) {
    return (
      <Paper withBorder p="xl" radius="md" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text ta="center" c="dimmed">
          No items yet. Add your first item above!
        </Text>
      </Paper>
    )
  }

  const canvasContent = (
    <Box
      ref={canvasRef}
      style={{
        position: 'relative',
        width: `${CANVAS_WIDTH}px`,
        height: `${CANVAS_HEIGHT}px`,
        backgroundColor: mode === 'read' ? 'transparent' : (colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]),
        borderRadius: mode === 'read' ? '0' : '12px',
        border: mode === 'read' ? 'none' : `1px dashed ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        padding: '20px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {items.map((item: MoodBoardItem) => (
        <DraggableItem
          key={item.id}
          item={item}
          localPosition={localPositions?.[item.id]}
          mode={mode}
          onDelete={mode === 'edit' ? onDeleteItem : undefined}
          onResize={mode === 'edit' ? onResize : undefined}
          onBringForward={mode === 'edit' ? onBringForward : undefined}
          onSendBackward={mode === 'edit' ? onSendBackward : undefined}
        />
      ))}
    </Box>
  )

  // Only wrap in DndContext if in edit mode and onDragEnd is provided
  if (mode === 'edit' && onDragEnd) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        {canvasContent}
      </DndContext>
    )
  }

  return canvasContent
}

