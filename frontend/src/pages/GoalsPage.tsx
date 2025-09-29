import { useState } from 'react'
import { Button, Card, Container, Group, Select, SimpleGrid, Text, TextInput, Textarea, Title } from '@mantine/core'
import { useCreateGoal, useDeleteGoal, useGoals, useUpdateGoal } from '../api/hooks'

export function GoalsPage() {
  const { data: goals } = useGoals()
  const createGoal = useCreateGoal()
  const deleteGoal = useDeleteGoal()
  const updateGoal = useUpdateGoal()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [priority, setPriority] = useState<string | null>(null)

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

  const handleMarkCompleted = async (goalId: string) => {
    await updateGoal.mutateAsync({ goalId, data: { status: 'completed' } })
  }

  const handleMarkDropped = async (goalId: string) => {
    await updateGoal.mutateAsync({ goalId, data: { status: 'dropped' } })
  }


  const getCardStyle = (status: string) => {
    switch (status) {
      case 'completed': 
        return { 
          backgroundColor: 'rgba(45, 90, 45, 0.5)', 
        }
      case 'dropped': 
        return { 
          backgroundColor: 'rgba(100, 100, 100, 0.5)', 
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

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mt="lg">
        {(goals || []).map((g: any) => (
          <Card key={g.id} withBorder style={getCardStyle(g.status)}>
            <Title order={4} style={getTextStyle(g.status)}>{g.title}</Title>
            {g.description && (
              <Text size="sm" c="dimmed" mt="xs" style={{ whiteSpace: 'pre-wrap', ...getTextStyle(g.status) }}>
                {g.description}
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
                    onClick={() => handleMarkCompleted(g.id)}
                    loading={updateGoal.isPending}
                  >
                    Complete
                  </Button>
                  <Button 
                    color="orange" 
                    variant="light" 
                    size="xs"
                    onClick={() => handleMarkDropped(g.id)}
                    loading={updateGoal.isPending}
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
    </Container>
  )
}




