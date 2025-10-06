import { Paper, Group, Title, Text, ActionIcon } from '@mantine/core'
import { IconEdit, IconTrash } from '@tabler/icons-react'

interface MoodBoard {
  id: string
  title: string
  description?: string
  items?: any[]
  createdAt: string
}

interface BoardHeaderProps {
  board: MoodBoard
  onEdit: (board: MoodBoard) => void
  onDelete: (boardId: string) => void
}

export function BoardHeader({ board, onEdit, onDelete }: BoardHeaderProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <div>
          <Title order={3}>{board.title}</Title>
          {board.description && (
            <Text size="sm" c="dimmed" mt={4}>{board.description}</Text>
          )}
        </div>
        <Group gap="xs">
          <ActionIcon 
            variant="light" 
            color="blue"
            onClick={() => onEdit(board)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon 
            variant="light" 
            color="red"
            onClick={() => onDelete(board.id)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  )
}

