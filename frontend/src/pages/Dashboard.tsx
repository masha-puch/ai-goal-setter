import { Button, Card, Container, Group, SimpleGrid, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'

export function Dashboard() {
  return (
    <Container size="lg" my="md">
      <Title order={2}>Your Yearly Notebook</Title>
      <Text c="dimmed" mt="xs">Set goals, build your mood board, and record achievements.</Text>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mt="lg">
        <Card withBorder>
          <Title order={4}>Goals</Title>
          <Text c="dimmed">Create and manage your goals</Text>
          <Group mt="sm"><Button component={Link} to="/goals" variant="light">Open</Button></Group>
        </Card>
        <Card withBorder>
          <Title order={4}>Mood Board</Title>
          <Text c="dimmed">Visualize your year</Text>
          <Group mt="sm"><Button component={Link} to="/moodboard" variant="light">Open</Button></Group>
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
