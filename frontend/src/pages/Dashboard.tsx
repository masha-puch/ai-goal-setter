import { Button, Card, Container, Group, SimpleGrid, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'

export function Dashboard() {
  return (
    <Container size="lg" my="md">
      <Title order={2}>Your Yearly Notebook</Title>
      <Text c="dimmed" mt="xs">Set goals, track progress, build your mood board, and reflect.</Text>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mt="lg">
        <Card withBorder>
          <Title order={4}>Goals</Title>
          <Text c="dimmed">Create and manage your goals</Text>
          <Group mt="sm"><Button component={Link} to="/goals" variant="light">Open</Button></Group>
        </Card>
        <Card withBorder>
          <Title order={4}>Progress</Title>
          <Text c="dimmed">Update progress entries</Text>
          <Group mt="sm"><Button component={Link} to="/progress" variant="light">Open</Button></Group>
        </Card>
        <Card withBorder>
          <Title order={4}>Mood Board</Title>
          <Text c="dimmed">Visualize your year</Text>
          <Group mt="sm"><Button component={Link} to="/moodboard" variant="light">Open</Button></Group>
        </Card>
        <Card withBorder>
          <Title order={4}>Reflections</Title>
          <Text c="dimmed">Capture end-of-year thoughts</Text>
          <Group mt="sm"><Button component={Link} to="/reflections" variant="light">Open</Button></Group>
        </Card>
      </SimpleGrid>
    </Container>
  )
}
