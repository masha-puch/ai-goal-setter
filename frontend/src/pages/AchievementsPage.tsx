import { useState } from 'react'
import { Button, Card, Container, Group, NumberInput, SimpleGrid, Text, Textarea, Title } from '@mantine/core'
import { useCreateAchievement, useDeleteAchievement, useAchievements } from '../api/hooks'
import { useYear } from '../context/YearContext'

export function AchievementsPage() {
  const { year } = useYear()
  const { data: items } = useAchievements(year)
  const createAchievement = useCreateAchievement()
  const deleteAchievement = useDeleteAchievement()
  const [text, setText] = useState('')

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await createAchievement.mutateAsync({ year, text })
    setText('')
  }

  return (
    <Container size="lg" my="md">
      <Title order={2}>Achievements</Title>
      <Card withBorder mt="md">
        <form onSubmit={onAdd}>
          <Group align="end" wrap="wrap">
            <Textarea label="Achievement" value={text} onChange={(e) => setText(e.currentTarget.value)} w={500} autosize minRows={2} required />
            <Button type="submit" loading={createAchievement.isPending}>Add</Button>
          </Group>
        </form>
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mt="lg">
        {(items || []).map((a: any) => (
          <Card key={a.id} withBorder>
            <Title order={4}>{a.year}</Title>
            <Text mt="xs">{a.text}</Text>
            <Group mt="sm">
              <Button color="red" variant="light" onClick={() => deleteAchievement.mutate(a.id)}>Delete</Button>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  )
}

