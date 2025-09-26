import { useState } from 'react'
import { Button, Card, Container, Group, Select, SimpleGrid, Text, TextInput, Title } from '@mantine/core'
import { useCreateMoodItem, useDeleteMoodItem, useMoodboard } from '../api/hooks'

export function MoodboardPage() {
  const { data: items } = useMoodboard()
  const createItem = useCreateMoodItem()
  const deleteItem = useDeleteMoodItem()
  const [type, setType] = useState<string | null>('text')
  const [content, setContent] = useState('')

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await createItem.mutateAsync({ type, content })
    setContent('')
  }

  return (
    <Container size="lg" my="md">
      <Title order={2}>Mood Board</Title>
      <Card withBorder mt="md">
        <form onSubmit={onAdd}>
          <Group align="end" wrap="wrap">
            <Select label="Type" data={[ 'text','image','link' ]} value={type} onChange={setType} w={140} />
            <TextInput label="Content" value={content} onChange={(e) => setContent(e.currentTarget.value)} w={400} required />
            <Button type="submit" loading={createItem.isPending}>Add</Button>
          </Group>
        </form>
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mt="lg">
        {(items || []).map((it: any) => (
          <Card key={it.id} withBorder>
            <Title order={5}>{it.type}</Title>
            {it.type === 'image' ? (
              <img src={it.content} alt="mood" style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }} />
            ) : (
              <Text mt="xs">{it.content}</Text>
            )}
            <Group mt="sm">
              <Button color="red" variant="light" onClick={() => deleteItem.mutate(it.id)}>Delete</Button>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  )
}



