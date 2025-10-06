import { useState, useRef } from 'react'
import { Card, Group, Badge, ActionIcon } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface MoodBoardItem {
  id: string
  type: string
  content: string
  tags?: any
  position?: { x: number; y: number; width: number; height: number }
  createdAt: string
}

interface DraggableItemProps {
  item: MoodBoardItem
  onDelete: (id: string) => void
  onResize?: (id: string, size: { width: number; height: number }) => void
  localPosition?: { x: number; y: number; width: number; height: number }
}

export function DraggableItem({ item, onDelete, onResize, localPosition }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  })

  const [isResizing, setIsResizing] = useState(false)
  const resizeStartRef = useRef<{ width: number; height: number; startX: number; startY: number } | null>(null)

  const position = localPosition || item.position || { x: 0, y: 0, width: 250, height: 250 }
  
  const style = {
    position: 'absolute' as const,
    left: position.x,
    top: position.y,
    width: position.width,
    height: position.height,
    transform: (transform && !isResizing) ? CSS.Translate.toString(transform) : undefined,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging || isResizing ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
    transition: isDragging || isResizing ? 'none' : 'opacity 0.2s',
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation()
    }
    setIsResizing(true)
    resizeStartRef.current = {
      width: position.width,
      height: position.height,
      startX: e.clientX,
      startY: e.clientY,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStartRef.current || !onResize) return
      
      const deltaX = moveEvent.clientX - resizeStartRef.current.startX
      const deltaY = moveEvent.clientY - resizeStartRef.current.startY
      
      const newWidth = Math.max(100, resizeStartRef.current.width + deltaX)
      const newHeight = Math.max(100, resizeStartRef.current.height + deltaY)
      
      onResize(item.id, { width: newWidth, height: newHeight })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      resizeStartRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      withBorder
      shadow="sm"
      padding="xs"
    >
      <Group justify="space-between" mb="xs" {...listeners} style={{ cursor: 'grab' }}>
        <Badge variant="light" size="sm">
          {item.type === 'image_url' ? 'URL' : 'Upload'}
        </Badge>
        <ActionIcon
          color="red"
          variant="subtle"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
        >
          <IconX size={14} />
        </ActionIcon>
      </Group>
      <img
        src={item.content}
        alt="mood"
        {...listeners}
        style={{
          width: '100%',
          height: 'calc(100% - 40px)',
          objectFit: 'contain',
          borderRadius: 8,
          cursor: 'grab',
          userSelect: 'none',
        }}
      />
      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 20,
          height: 20,
          cursor: 'nwse-resize',
          background: 'linear-gradient(135deg, transparent 50%, rgba(100, 100, 100, 0.5) 50%)',
          borderBottomRightRadius: 8,
          zIndex: 10,
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
      />
    </Card>
  )
}

