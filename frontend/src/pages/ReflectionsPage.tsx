import { useState } from 'react'
import { Button, Card, Container, Group, NumberInput, SimpleGrid, Text, Textarea, Title } from '@mantine/core'
import { useCreateReflection, useDeleteReflection, useReflections } from '../api/hooks'

export function ReflectionsPage() {
  const { data: items } = useReflections()
  const createReflection = useCreateReflection()
  const deleteReflection = useDeleteReflection()
  const [year, setYear] = useState<number | ''>(new Date().getFullYear())
  const [text, setText] = useState('')

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await createReflection.mutateAsync({ year: typeof year === 'number' ? year : new Date().getFullYear(), text })
    setText('')
  }

  return (
    <Container size="lg" my="md">
      <Title order={2}>Reflections</Title>
      <Card withBorder mt="md">
        <form onSubmit={onAdd}>
          <Group align="end" wrap="wrap">
            <NumberInput label="Year" value={year} onChange={setYear as any} w={140} min={2000} max={2100} />
            <Textarea label="Reflection" value={text} onChange={(e) => setText(e.currentTarget.value)} w={500} autosize minRows={2} required />
            <Button type="submit" loading={createReflection.isPending}>Add</Button>
          </Group>
        </form>
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mt="lg">
        {(items || []).map((r: any) => (
          <Card key={r.id} withBorder>
            <Title order={4}>{r.year}</Title>
            <Text mt="xs">{r.text}</Text>
            <Group mt="sm">
              <Button color="red" variant="light" onClick={() => deleteReflection.mutate(r.id)}>Delete</Button>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  )
}




