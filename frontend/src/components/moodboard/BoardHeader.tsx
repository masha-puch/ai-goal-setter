import { Paper, Group, Title, SegmentedControl } from '@mantine/core'

interface MoodBoard {
  id: string
  year: number
  items?: any[]
  createdAt: string
}

interface BoardHeaderProps {
  board: MoodBoard
  mode?: 'edit' | 'read'
  onModeChange?: (mode: 'edit' | 'read') => void
}

export function BoardHeader({ board, mode = 'edit', onModeChange }: BoardHeaderProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <Title order={3}>{board.year}</Title>
        {onModeChange && (
          <SegmentedControl
            value={mode}
            onChange={(value) => onModeChange(value as 'edit' | 'read')}
            data={[
              { label: 'Edit', value: 'edit' },
              { label: 'Read', value: 'read' },
            ]}
          />
        )}
      </Group>
    </Paper>
  )
}

