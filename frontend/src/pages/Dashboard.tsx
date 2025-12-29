import { useState, useEffect, useRef } from 'react'
import { Button, Card, Container, Group, SimpleGrid, Text, Title, Box, Paper } from '@mantine/core'
import { Link } from 'react-router-dom'
import { useMoodBoard, useCreateMoodBoard } from '../api/hooks'
import { useYear } from '../context/YearContext'
import { MoodboardCanvas } from '../components/moodboard'

export function Dashboard() {
  const { year } = useYear()
  const { data: moodBoard, isLoading } = useMoodBoard(year)
  const createMoodBoard = useCreateMoodBoard()
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-create moodboard if it doesn't exist
  useEffect(() => {
    if (!isLoading && !moodBoard && year) {
      createMoodBoard.mutate({ year })
    }
  }, [isLoading, moodBoard, year, createMoodBoard])


  // Calculate scale to fit canvas within container on initial load
  useEffect(() => {
    if (!moodBoard || !containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.clientWidth - 32 // Account for padding
    const containerHeight = 500 // Max height for moodboard section
    
    const canvasWidth = moodBoard.canvasWidth ?? 1200
    const canvasHeight = moodBoard.canvasHeight ?? 800

    const scaleX = containerWidth / canvasWidth
    const scaleY = containerHeight / canvasHeight
    const newScale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down

    setScale(newScale)
  }, [moodBoard])

  return (
    <Container size="lg" my="md">
      <Title order={2}>Your Yearly Notebook</Title>
      <Text c="dimmed" mt="xs">Set goals, build your mood board, and record achievements.</Text>
      
      {/* Moodboard*/}
      <Box mt="lg" mb="lg">
        <Group justify="space-between" mb="sm">
          <Title order={4}>Mood Board</Title>
          <Button component={Link} to="/moodboard" variant="light" size="xs">
            Edit
          </Button>
        </Group>
        {moodBoard && moodBoard.items && moodBoard.items.length > 0 ? (
          <Paper withBorder p="md" radius="md" style={{ overflow: 'hidden' }}>
            <Box 
              ref={containerRef}
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'flex-start',
                width: '100%',
                height: '500px'
              }}
            >
              <Box
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top center',
                  width: moodBoard.canvasWidth ?? 1200,
                  height: moodBoard.canvasHeight ?? 800,
                }}
              >
                <MoodboardCanvas 
                  moodBoard={moodBoard}
                  mode="read"
                />
              </Box>
            </Box>
          </Paper>
        ) : (
          <Paper withBorder p="xl" radius="md">
            <Text c="dimmed" ta="center">No moodboard items yet. <Link to="/moodboard">Create your moodboard</Link></Text>
          </Paper>
        )}
      </Box>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Card withBorder>
          <Title order={4}>Goals</Title>
          <Text c="dimmed">Create and manage your goals</Text>
          <Group mt="sm"><Button component={Link} to="/goals" variant="light">Open</Button></Group>
        </Card>
        <Card withBorder>
          <Title order={4}>Achievements</Title>
          <Text c="dimmed">Record your year's achievements</Text>
          <Group mt="sm"><Button component={Link} to="/achievements" variant="light">Open</Button></Group>
        </Card>
      </SimpleGrid>
    </Container>
  )
}
