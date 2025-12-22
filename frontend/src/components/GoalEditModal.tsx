import { useEffect, useState } from 'react'
import { Button, Group, Modal, NumberInput, Select, Textarea } from '@mantine/core'

interface GoalEditModalProps {
  opened: boolean
  onClose: () => void
  onConfirm: (data: {
    description: string
    category?: string
    priority?: number
    year?: number
  }) => void
  goal: {
    id: string
    description: string
    category?: string
    priority?: number
    year?: number
  } | null
  loading?: boolean
}

export function GoalEditModal({ opened, onClose, onConfirm, goal, loading }: GoalEditModalProps) {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [priority, setPriority] = useState<string | null>(null)
  const [year, setYear] = useState<number | ''>(new Date().getFullYear())

  // Update form when goal changes or modal opens/closes
  useEffect(() => {
    if (goal) {
      setDescription(goal.description || '')
      setCategory(goal.category || null)
      setPriority(goal.priority ? String(goal.priority) : null)
      setYear(goal.year || new Date().getFullYear())
    } else {
      // Reset form for creating new goal
      setDescription('')
      setCategory(null)
      setPriority(null)
      setYear(new Date().getFullYear())
    }
  }, [goal, opened])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      description,
      category: category || undefined,
      priority: priority ? Number(priority) : undefined,
      year: typeof year === 'number' ? year : new Date().getFullYear(),
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={goal ? "Edit Goal" : "Add Goal"}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Textarea
          label="Description"
          placeholder="Describe your goal in detail..."
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          required
          minRows={3}
          maxRows={6}
          mb="md"
        />
        
        <Select
          label="Category"
          data={['health', 'career', 'finance', 'learning', 'relationships', 'other']}
          value={category}
          onChange={setCategory}
          clearable
          mb="md"
        />
        
        <Select
          label="Priority"
          data={[
            { value: '1', label: 'High' },
            { value: '2', label: 'Medium' },
            { value: '3', label: 'Low' },
          ]}
          value={priority}
          onChange={setPriority}
          clearable
          mb="md"
        />
        
        {goal && (
          <NumberInput
            label="Year"
            value={year}
            onChange={setYear as any}
            min={2000}
            max={2100}
            required
            mb="md"
          />
        )}

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {goal ? "Save Changes" : "Add Goal"}
          </Button>
        </Group>
      </form>
    </Modal>
  )
}

