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

interface MoodboardCanvasProps {
  items?: MoodBoardItem[]
  localPositions: Record<string, { x: number; y: number; width: number; height: number; zIndex?: number }>
  onDragEnd: (event: DragEndEvent) => void
  onDeleteItem: (id: string) => void
  onResize?: (id: string, size: { width: number; height: number }) => void
  onBringForward?: (id: string) => void
  onSendBackward?: (id: string) => void
  mode?: 'edit' | 'read'
}

export function MoodboardCanvas({ items, localPositions, onDragEnd, onDeleteItem, onResize, onBringForward, onSendBackward, mode = 'edit' }: MoodboardCanvasProps) {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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
      style={{
        position: 'relative',
        width: '100%',
        flex: 1,
        minHeight: 0,
        backgroundColor: colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        borderRadius: '12px',
        border: `1px dashed ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        padding: '20px',
      }}
    >
      {items.map((item: MoodBoardItem) => (
        <DraggableItem
          key={item.id}
          item={item}
          localPosition={localPositions[item.id]}
          onDelete={onDeleteItem}
          onResize={onResize}
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
          mode={mode}
        />
      ))}
    </Box>
  )

  // Only wrap in DndContext if in edit mode
  if (mode === 'edit') {
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

