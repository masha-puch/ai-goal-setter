import { Button, Card, Container, Group, Modal, SimpleGrid, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'
import { useDisclosure } from '@mantine/hooks'
import { useAiAdjust, useAiMoodboardSuggestions, useAiMotivation, useAiRecommendations, useAiSummary } from '../api/hooks'
import { useState } from 'react'

export function Dashboard() {
  const [opened, { open, close }] = useDisclosure(false)
  const [content, setContent] = useState<string>('')
  const rec = useAiRecommendations()
  const mood = useAiMoodboardSuggestions()
  const mot = useAiMotivation()
  const adj = useAiAdjust()
  const sum = useAiSummary()

  const show = (text: string) => { setContent(text); open(); }

  return (
    <Container size="lg" my="md">
      <Title order={2}>Your Yearly Notebook</Title>
      <Text c="dimmed" mt="xs">Set goals, track progress, build your mood board, and reflect.</Text>
      <Group mt="md">
        <Button onClick={async () => show((await rec.mutateAsync()).text)}>AI Recommendations</Button>
        <Button variant="light" onClick={async () => show((await mood.mutateAsync()).text)}>Moodboard Suggestions</Button>
        <Button variant="outline" onClick={async () => show((await mot.mutateAsync()).text)}>Motivation</Button>
        <Button variant="default" onClick={async () => show((await adj.mutateAsync()).text)}>Adjust Plan</Button>
        <Button color="grape" onClick={async () => show((await sum.mutateAsync()).text)}>Year Summary</Button>
      </Group>
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
      <Modal opened={opened} onClose={close} title="AI Response" size="lg">
        <Text style={{ whiteSpace: 'pre-wrap' }}>{content}</Text>
      </Modal>
    </Container>
  )
}
