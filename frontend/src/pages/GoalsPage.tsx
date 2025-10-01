import { useState } from 'react'
import { Button, Card, Container, Group, Select, SimpleGrid, Text, TextInput, Textarea, Title } from '@mantine/core'
import { useCreateGoal, useDeleteGoal, useGoals, useCompleteGoal, useDropGoal } from '../api/hooks'
import { GoalCompletionModal } from '../components/GoalCompletionModal'

export function GoalsPage() {
  const { data: goals } = useGoals()
  const createGoal = useCreateGoal()
  const deleteGoal = useDeleteGoal()
  const completeGoal = useCompleteGoal()
  const dropGoal = useDropGoal()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [priority, setPriority] = useState<string | null>(null)
  
  // Modal state
  const [modalOpened, setModalOpened] = useState(false)
  const [modalAction, setModalAction] = useState<'complete' | 'drop'>('complete')
  const [selectedGoal, setSelectedGoal] = useState<{ id: string; title: string } | null>(null)

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await createGoal.mutateAsync({ 
      title, 
      description: description || undefined, 
      category, 
      priority: priority ? Number(priority) : undefined 
    })
    setTitle('')
    setDescription('')
    setCategory(null)
    setPriority(null)
  }

  const handleMarkCompleted = (goalId: string, goalTitle: string) => {
    setSelectedGoal({ id: goalId, title: goalTitle })
    setModalAction('complete')
    setModalOpened(true)
  }

  const handleMarkDropped = (goalId: string, goalTitle: string) => {
    setSelectedGoal({ id: goalId, title: goalTitle })
    setModalAction('drop')
    setModalOpened(true)
  }

  const handleModalConfirm = async (note: string) => {
    if (!selectedGoal) return
    
    if (modalAction === 'complete') {
      await completeGoal.mutateAsync({ goalId: selectedGoal.id, note })
    } else {
      await dropGoal.mutateAsync({ goalId: selectedGoal.id, note })
    }
    
    setModalOpened(false)
    setSelectedGoal(null)
  }


  const getCardStyle = (status: string) => {
    switch (status) {
      case 'completed': 
        return { 
          backgroundColor: 'rgba(45, 90, 45, 0.3)', 
        }
      case 'dropped': 
        return { 
          backgroundColor: 'rgba(100, 100, 100, 0.3)', 
        }
      default: 
        return {}
    }
  }

  const getTextStyle = (status: string) => {
    switch (status) {
      case 'completed': 
        return { textDecoration: 'line-through' }
      case 'dropped': 
        return { textDecoration: 'line-through' }
      default: 
        return {}
    }
  }

  return (
    <Container size="lg" my="md">
      <Title order={2}>Goals</Title>
      <Card withBorder mt="md">
        <form onSubmit={onAdd}>
          <Group align="end" wrap="wrap" mb="md">
            <TextInput label="Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required w={280} />
            <Select label="Category" data={[ 'health','career','finance','learning','relationships','other' ]} value={category} onChange={setCategory} w={200} clearable />
            <Select label="Priority" data={[{value:'1',label:'High'},{value:'2',label:'Medium'},{value:'3',label:'Low'}]} value={priority} onChange={setPriority} w={160} clearable />
            <Button type="submit" loading={createGoal.isPending}>Add Goal</Button>
          </Group>
          <Textarea 
            label="Description" 
            placeholder="Describe your goal in detail..." 
            value={description} 
            onChange={(e) => setDescription(e.currentTarget.value)} 
            minRows={3}
            maxRows={6}
          />
        </form>
      </Card>

      <SimpleGrid cols={1} spacing="md" mt="lg">
        {(goals || []).map((g: any) => (
          <Card key={g.id} withBorder style={getCardStyle(g.status)}>
            <Title order={3} style={getTextStyle(g.status)}>{g.title}</Title>
            {g.description && (
              <Text size="md" mt="md" style={{ whiteSpace: 'pre-wrap', ...getTextStyle(g.status) }}>
                {g.description}
              </Text>
            )}
            {g.completionNote && (
              <Text size="sm" mt="md" c="dimmed" style={{ fontStyle: 'italic'}}>
                <strong>Note:</strong> {g.completionNote}
              </Text>
            )}
            <Text c="dimmed" mt="xs">{g.category} {g.status && g.priority && '•'} {g.priority === 1 ? 'High' : g.priority === 2 ? 'Medium' : g.priority === 3 ? 'Low' : g.priority}</Text>
            <Group mt="sm" gap="xs">
              {g.status !== 'completed' && g.status !== 'dropped' && (
                <>
                  <Button 
                    color="green" 
                    variant="light" 
                    size="xs"
                    onClick={() => handleMarkCompleted(g.id, g.title)}
                    loading={completeGoal.isPending}
                  >
                    Complete
                  </Button>
                  <Button 
                    color="orange" 
                    variant="light" 
                    size="xs"
                    onClick={() => handleMarkDropped(g.id, g.title)}
                    loading={dropGoal.isPending}
                  >
                    Drop
                  </Button>
                </>
              )}
              <Button 
                color="red" 
                variant="light" 
                size="xs"
                onClick={() => deleteGoal.mutate(g.id)}
                loading={deleteGoal.isPending}
              >
                Delete
              </Button>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <GoalCompletionModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onConfirm={handleModalConfirm}
        action={modalAction}
        goalTitle={selectedGoal?.title || ''}
        loading={completeGoal.isPending || dropGoal.isPending}
      />
    </Container>
  )
}




