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
  localPosition?: { x: number; y: number; width: number; height: number }
}

export function DraggableItem({ item, onDelete, localPosition }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  })

  const position = localPosition || item.position || { x: 0, y: 0, width: 250, height: 250 }
  
  const style = {
    position: 'absolute' as const,
    left: position.x,
    top: position.y,
    width: position.width,
    height: position.height,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
    transition: isDragging ? 'none' : 'opacity 0.2s',
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      withBorder
      shadow="sm"
      padding="xs"
    >
      <Group justify="space-between" mb="xs">
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
        style={{
          width: '100%',
          height: 'calc(100% - 40px)',
          objectFit: 'cover',
          borderRadius: 8,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </Card>
  )
}

