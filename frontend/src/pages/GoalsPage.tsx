import { useState } from 'react'
import { Button, Card, Container, Group, SimpleGrid, Text, Title } from '@mantine/core'
import { useCreateGoal, useDeleteGoal, useGoals, useCompleteGoal, useDropGoal, useUpdateGoal } from '../api/hooks'
import { useYear } from '../context/YearContext'
import { GoalCompletionModal } from '../components/GoalCompletionModal'
import { GoalEditModal } from '../components/GoalEditModal'

export function GoalsPage() {
  const { year } = useYear()
  const { data: goals } = useGoals(year)
  const createGoal = useCreateGoal()
  const deleteGoal = useDeleteGoal()
  const completeGoal = useCompleteGoal()
  const dropGoal = useDropGoal()
  const updateGoal = useUpdateGoal()
  const currentYear = new Date().getFullYear()
  
  // Completion modal state
  const [modalOpened, setModalOpened] = useState(false)
  const [modalAction, setModalAction] = useState<'complete' | 'drop'>('complete')
  const [selectedGoal, setSelectedGoal] = useState<{ id: string; description: string } | null>(null)

  // Edit modal state
  const [editModalOpened, setEditModalOpened] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any>(null)

  const handleAddGoal = () => {
    setEditingGoal(null)
    setEditModalOpened(true)
  }

  const handleMarkCompleted = (goalId: string, goalDescription: string) => {
    setSelectedGoal({ id: goalId, description: goalDescription })
    setModalAction('complete')
    setModalOpened(true)
  }

  const handleMarkDropped = (goalId: string, goalDescription: string) => {
    setSelectedGoal({ id: goalId, description: goalDescription })
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

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal)
    setEditModalOpened(true)
  }

  const handleEditConfirm = async (data: any) => {
    if (editingGoal) {
      // Editing existing goal
      await updateGoal.mutateAsync({
        goalId: editingGoal.id,
        data,
      })
    } else {
      // Creating new goal
      // Prevent creating goals in past years
      if (year < currentYear) {
        return
      }
      
      await createGoal.mutateAsync({
        description: data.description,
        category: data.category,
        priority: data.priority,
        year,
      })
    }
    
    setEditModalOpened(false)
    setEditingGoal(null)
  }

  const handleMoveToNextYear = async (goal: any) => {
    const goalYear = goal.year || currentYear
    const nextYear = goalYear + 1
    
    await updateGoal.mutateAsync({
      goalId: goal.id,
      data: { year: nextYear },
    })
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

  const isPastYear = year < currentYear

  return (
    <Container size="lg" my="md">
      <Group justify="space-between" align="center" mb="md">
        <Title order={2}>Goals</Title>
        <Button 
          onClick={handleAddGoal} 
          disabled={isPastYear}
          loading={createGoal.isPending}
        >
          Add Goal
        </Button>
      </Group>
      
      {isPastYear && (
        <Text c="dimmed" mb="md" size="sm">
          Cannot add new goals to past years. Switch to current or future year to create goals.
        </Text>
      )}

      <SimpleGrid cols={1} spacing="md" mt="lg">
        {(goals || []).map((g: any) => (
          <Card key={g.id} withBorder style={getCardStyle(g.status)}>
            <Text size="md" style={{ whiteSpace: 'pre-wrap', ...getTextStyle(g.status) }}>
              {g.description}
            </Text>
            {g.completionNote && (
              <Text size="sm" mt="md" c="dimmed" style={{ fontStyle: 'italic'}}>
                <strong>Note:</strong> {g.completionNote}
              </Text>
            )}
            <Text c="dimmed" mt="xs">{g.category} {g.status && g.priority && '•'} {g.priority === 1 ? 'High' : g.priority === 2 ? 'Medium' : g.priority === 3 ? 'Low' : g.priority}</Text>
            <Group mt="sm" gap="xs">
              {g.status !== 'completed' && g.status !== 'dropped' && (
                <>
                  {(g.year || currentYear) >= currentYear && (
                    <Button 
                      color="blue" 
                      variant="light" 
                      size="xs"
                      onClick={() => handleEditGoal(g)}
                      loading={updateGoal.isPending}
                    >
                      Edit
                    </Button>
                  )}
                  <Button 
                    color="green" 
                    variant="light" 
                    size="xs"
                    onClick={() => handleMarkCompleted(g.id, g.description)}
                    loading={completeGoal.isPending}
                  >
                    Complete
                  </Button>
                  <Button 
                    color="orange" 
                    variant="light" 
                    size="xs"
                    onClick={() => handleMarkDropped(g.id, g.description)}
                    loading={dropGoal.isPending}
                  >
                    Drop
                  </Button>
                </>
              )}
              {g.status !== 'completed' && g.status !== 'dropped' && (
                <Button 
                  color="violet" 
                  variant="light" 
                  size="xs"
                  onClick={() => handleMoveToNextYear(g)}
                  loading={updateGoal.isPending}
                >
                  Move to Next Year
                </Button>
              )}
              {(g.year || currentYear) >= currentYear && (
                <Button 
                  color="red" 
                  variant="light" 
                  size="xs"
                  onClick={() => deleteGoal.mutate(g.id)}
                  loading={deleteGoal.isPending}
                >
                  Delete
                </Button>
              )}
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <GoalCompletionModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onConfirm={handleModalConfirm}
        action={modalAction}
        goalDescription={selectedGoal?.description || ''}
        loading={completeGoal.isPending || dropGoal.isPending}
      />

      <GoalEditModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        onConfirm={handleEditConfirm}
        goal={editingGoal}
        loading={updateGoal.isPending}
      />
    </Container>
  )
}




