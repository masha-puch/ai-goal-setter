import { useEffect, useState } from 'react'
import { Button, Group, Modal, Select, TextInput, Textarea } from '@mantine/core'

interface GoalEditModalProps {
  opened: boolean
  onClose: () => void
  onConfirm: (data: {
    title: string
    description?: string
    category?: string
    priority?: number
  }) => void
  goal: {
    id: string
    title: string
    description?: string
    category?: string
    priority?: number
  } | null
  loading?: boolean
}

export function GoalEditModal({ opened, onClose, onConfirm, goal, loading }: GoalEditModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [priority, setPriority] = useState<string | null>(null)

  // Update form when goal changes
  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '')
      setDescription(goal.description || '')
      setCategory(goal.category || null)
      setPriority(goal.priority ? String(goal.priority) : null)
    }
  }, [goal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      title,
      description: description || undefined,
      category: category || undefined,
      priority: priority ? Number(priority) : undefined,
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Goal"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
          mb="md"
        />
        
        <Textarea
          label="Description"
          placeholder="Describe your goal in detail..."
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
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

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </Group>
      </form>
    </Modal>
  )
}

