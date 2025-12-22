import { useState } from 'react'
import { Button, Modal, Textarea, Text, Group } from '@mantine/core'

interface GoalCompletionModalProps {
  opened: boolean
  onClose: () => void
  onConfirm: (note: string) => void
  action: 'complete' | 'drop'
  goalDescription: string
  loading?: boolean
}

export function GoalCompletionModal({ 
  opened, 
  onClose, 
  onConfirm, 
  action, 
  goalDescription, 
  loading = false 
}: GoalCompletionModalProps) {
  const [note, setNote] = useState('')

  const handleConfirm = () => {
    onConfirm(note)
    setNote('')
  }

  const handleClose = () => {
    setNote('')
    onClose()
  }

  const actionText = action === 'complete' ? 'Complete' : 'Drop'
  const actionColor = action === 'complete' ? 'green' : 'orange'
  const placeholder = action === 'complete' 
    ? 'Add a note about how you achieved this goal...' 
    : 'Add a note about why you\'re dropping this goal...'

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`${actionText} Goal`}
      size="md"
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Text mb="md">
        Are you sure you want to {action} this goal?
      </Text>
      <Text size="sm" c="dimmed" mb="md" style={{ whiteSpace: 'pre-wrap' }}>
        {goalDescription.length > 100 ? goalDescription.substring(0, 100) + '...' : goalDescription}
      </Text>
      
      <Textarea
        label="Note (optional)"
        placeholder={placeholder}
        value={note}
        onChange={(e) => setNote(e.currentTarget.value)}
        minRows={3}
        maxRows={6}
        mb="md"
      />

      <Group justify="flex-end">
        <Button variant="outline" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          color={actionColor} 
          onClick={handleConfirm} 
          loading={loading}
        >
          {actionText} Goal
        </Button>
      </Group>
    </Modal>
  )
}
