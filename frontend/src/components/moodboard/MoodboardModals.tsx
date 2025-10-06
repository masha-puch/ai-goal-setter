import { Modal, Stack, TextInput, Textarea, Group, Button } from '@mantine/core'

interface MoodBoard {
  id: string
  title: string
  description?: string
  items?: any[]
  createdAt: string
}

interface MoodboardModalsProps {
  showCreateModal: boolean
  showEditModal: boolean
  newBoardTitle: string
  newBoardDescription: string
  isCreating: boolean
  isUpdating: boolean
  onCreateSubmit: (e: React.FormEvent) => void
  onUpdateSubmit: (e: React.FormEvent) => void
  onCreateClose: () => void
  onEditClose: () => void
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

export function MoodboardModals({
  showCreateModal,
  showEditModal,
  newBoardTitle,
  newBoardDescription,
  isCreating,
  isUpdating,
  onCreateSubmit,
  onUpdateSubmit,
  onCreateClose,
  onEditClose,
  onTitleChange,
  onDescriptionChange,
}: MoodboardModalsProps) {
  return (
    <>
      {/* Create Moodboard Modal */}
      <Modal 
        opened={showCreateModal} 
        onClose={onCreateClose}
        title="Create New Moodboard"
      >
        <form onSubmit={onCreateSubmit}>
          <Stack gap="md">
            <TextInput 
              label="Title" 
              value={newBoardTitle} 
              onChange={(e) => onTitleChange(e.currentTarget.value)} 
              required 
              placeholder="My Vision Board"
            />
            <Textarea 
              label="Description" 
              value={newBoardDescription} 
              onChange={(e) => onDescriptionChange(e.currentTarget.value)} 
              placeholder="Optional description..."
              rows={3}
            />
            <Group justify="flex-end" gap="xs">
              <Button 
                variant="subtle" 
                onClick={onCreateClose}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isCreating}>
                Create
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Moodboard Modal */}
      <Modal 
        opened={showEditModal} 
        onClose={onEditClose}
        title="Edit Moodboard"
      >
        <form onSubmit={onUpdateSubmit}>
          <Stack gap="md">
            <TextInput 
              label="Title" 
              value={newBoardTitle} 
              onChange={(e) => onTitleChange(e.currentTarget.value)} 
              required 
            />
            <Textarea 
              label="Description" 
              value={newBoardDescription} 
              onChange={(e) => onDescriptionChange(e.currentTarget.value)} 
              placeholder="Optional description..."
              rows={3}
            />
            <Group justify="flex-end" gap="xs">
              <Button 
                variant="subtle" 
                onClick={onEditClose}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isUpdating}>
                Save
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  )
}

