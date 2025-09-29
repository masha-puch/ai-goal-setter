import { useState } from 'react'
import { Button, Card, Container, Group, Select, SimpleGrid, Text, TextInput, Title } from '@mantine/core'
import { useCreateGoal, useDeleteGoal, useGoals, useUpdateGoal } from '../api/hooks'

export function GoalsPage() {
  const { data: goals } = useGoals()
  const createGoal = useCreateGoal()
  const deleteGoal = useDeleteGoal()
  const updateGoal = useUpdateGoal()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [priority, setPriority] = useState<string | null>(null)

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await createGoal.mutateAsync({ title, category, priority: priority ? Number(priority) : undefined })
    setTitle('')
    setCategory(null)
    setPriority(null)
  }

  const handleMarkAchieved = async (goalId: string) => {
    await updateGoal.mutateAsync({ goalId, data: { status: 'achieved' } })
  }

  const handleMarkDropped = async (goalId: string) => {
    await updateGoal.mutateAsync({ goalId, data: { status: 'dropped' } })
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'green'
      case 'in_progress': return 'yellow'
      case 'dropped': return 'gray'
      default: return 'gray'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'achieved': return 'Achieved'
      case 'in_progress': return 'In Progress'
      case 'dropped': return 'Dropped'
      default: return 'In Progress'
    }
  }

  return (
    <Container size="lg" my="md">
      <Title order={2}>Goals</Title>
      <Card withBorder mt="md">
        <form onSubmit={onAdd}>
          <Group align="end" wrap="wrap">
            <TextInput label="Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required w={280} />
            <Select label="Category" data={[ 'health','career','finance','learning','relationships','other' ]} value={category} onChange={setCategory} w={200} clearable />
            <Select label="Priority" data={[{value:'1',label:'High'},{value:'2',label:'Medium'},{value:'3',label:'Low'}]} value={priority} onChange={setPriority} w={160} clearable />
            <Button type="submit" loading={createGoal.isPending}>Add Goal</Button>
          </Group>
        </form>
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mt="lg">
        {(goals || []).map((g: any) => (
          <Card key={g.id} withBorder>
            <Title order={4}>{g.title}</Title>
            <Text c="dimmed">{g.category || 'uncategorized'} • Priority: {g.priority ?? '-'}</Text>
            <Text size="sm" c={getStatusColor(g.status)} fw={500} mt="xs">
              Status: {getStatusLabel(g.status)}
            </Text>
            <Group mt="sm" gap="xs">
              {g.status !== 'achieved' && g.status !== 'dropped' && (
                <>
                  <Button 
                    color="green" 
                    variant="light" 
                    size="xs"
                    onClick={() => handleMarkAchieved(g.id)}
                    loading={updateGoal.isPending}
                  >
                    Mark Achieved
                  </Button>
                  <Button 
                    color="orange" 
                    variant="light" 
                    size="xs"
                    onClick={() => handleMarkDropped(g.id)}
                    loading={updateGoal.isPending}
                  >
                    Mark Dropped
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




