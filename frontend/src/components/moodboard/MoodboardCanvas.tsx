import { useState, useRef } from 'react'
import { Box, Paper, Text, useMantineTheme, useMantineColorScheme } from '@mantine/core'
import { DndContext, useSensors, useSensor, PointerSensor, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { DraggableItem } from './DraggableItem'

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
  canvasWidth?: number | null
  canvasHeight?: number | null
  items?: MoodBoardItem[]
  createdAt: string
}

interface MoodboardCanvasProps {
  moodBoard: MoodBoard
  localPositions: Record<string, { x: number; y: number; width: number; height: number; zIndex?: number }>
  mode?: 'edit' | 'read'
  // Edit mode only props
  onDragEnd?: (event: DragEndEvent) => void
  onDeleteItem?: (id: string) => void
  onResize?: (id: string, size: { width: number; height: number }) => void
  onBringForward?: (id: string) => void
  onSendBackward?: (id: string) => void
  onCanvasResize?: (width: number, height: number) => void
}

export function MoodboardCanvas({ 
  moodBoard,
  localPositions, 
  mode = 'edit', 
  onDragEnd, 
  onDeleteItem, 
  onResize, 
  onBringForward, 
  onSendBackward,
  onCanvasResize 
}: MoodboardCanvasProps) {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const [, setIsResizing] = useState(false)
  const [tempSize, setTempSize] = useState<{ width: number; height: number } | null>(null)
  const resizeStartRef = useRef<{ width: number; height: number; startX: number; startY: number } | null>(null)
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
  const canvasWidth = moodBoard?.canvasWidth ?? 1200
  const canvasHeight = moodBoard?.canvasHeight ?? 800

  const displayWidth = tempSize?.width ?? canvasWidth
  const displayHeight = tempSize?.height ?? canvasHeight

  const handleCanvasResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation()
    }
    setIsResizing(true)
    resizeStartRef.current = {
      width: canvasWidth,
      height: canvasHeight,
      startX: e.clientX,
      startY: e.clientY,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStartRef.current) return
      
      const deltaX = moveEvent.clientX - resizeStartRef.current.startX
      const deltaY = moveEvent.clientY - resizeStartRef.current.startY
      
      const newWidth = Math.max(400, resizeStartRef.current.width + deltaX)
      const newHeight = Math.max(300, resizeStartRef.current.height + deltaY)
      
      // Update local state only for smooth UI during resize
      setTempSize({ width: newWidth, height: newHeight })
    }

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsResizing(false)
      
      // Calculate final size and send to parent when resize is finished
      if (resizeStartRef.current && onCanvasResize) {
        const deltaX = upEvent.clientX - resizeStartRef.current.startX
        const deltaY = upEvent.clientY - resizeStartRef.current.startY
        
        const finalWidth = Math.max(400, resizeStartRef.current.width + deltaX)
        const finalHeight = Math.max(300, resizeStartRef.current.height + deltaY)
        
        onCanvasResize(finalWidth, finalHeight)
      }
      
      setTempSize(null)
      resizeStartRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

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
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        backgroundColor: colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        borderRadius: '12px',
        border: `1px dashed ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
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
          localPosition={localPositions[item.id]}
          mode={mode}
          onDelete={mode === 'edit' ? onDeleteItem : undefined}
          onResize={mode === 'edit' ? onResize : undefined}
          onBringForward={mode === 'edit' ? onBringForward : undefined}
          onSendBackward={mode === 'edit' ? onSendBackward : undefined}
        />
      ))}
      {/* Canvas resize handle - only in edit mode */}
      {mode === 'edit' && onCanvasResize && (
        <div
          onMouseDown={handleCanvasResizeStart}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 20,
            height: 20,
            cursor: 'nwse-resize',
            background: 'linear-gradient(135deg, transparent 50%, rgba(100, 100, 100, 0.7) 50%)',
            borderBottomRightRadius: 12,
            zIndex: 1000,
            pointerEvents: 'auto',
            touchAction: 'none',
          }}
        />
      )}
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

