import { useMemo, useState } from 'react'
import { Button, Card, Container, Group, NumberInput, Select, Table, TextInput, Title } from '@mantine/core'
import { useCreateProgress, useGoals, useAllProgress } from '../api/hooks'

export function ProgressPage() {
  const { data: goals } = useGoals()
  const [goalId, setGoalId] = useState<string | null>(null)
  const { data: entries } = useAllProgress()
  const createProgress = useCreateProgress(goalId || '')

  const goalOptions = useMemo(() => (goals || []).map((g: any) => ({ value: g.id, label: g.title })), [goals])

  const [period, setPeriod] = useState('monthly')
  const [date, setDate] = useState<string>(new Date().toISOString())
  const [value, setValue] = useState<number | ''>('' as any)
  const [note, setNote] = useState('')
  const [mood, setMood] = useState<string | null>(null)

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalId) return
    await createProgress.mutateAsync({ period, date, progressValue: typeof value === 'number' ? value : undefined, note, mood })
    setValue('' as any)
    setNote('')
    setMood(null)
  }

  return (
    <Container size="lg" my="md">
      <Title order={2}>Progress</Title>
      <Card withBorder mt="md">
        <form onSubmit={onAdd}>
          <Group align="end" wrap="wrap">
            <Select label="Goal" data={goalOptions} value={goalId} onChange={(value) => setGoalId(value)} required w={260} />
            <Select label="Period" data={[ 'monthly','quarterly','custom' ]} value={period} onChange={(value) => setPeriod(value || 'monthly')} w={160} />
            <TextInput label="Date (ISO)" value={date} onChange={(e) => setDate(e.currentTarget.value)} w={260} />
            <NumberInput label="Progress (0-100)" value={value} onChange={setValue as any} min={0} max={100} w={180} />
            <Select label="Mood" data={[ 'low','neutral','high' ]} value={mood} onChange={setMood} w={140} clearable />
            <TextInput label="Note" value={note} onChange={(e) => setNote(e.currentTarget.value)} w={260} />
            <Button type="submit" disabled={!goalId} loading={createProgress.isPending}>Add</Button>
          </Group>
        </form>
      </Card>

      <Card withBorder mt="md">
        <Table withRowBorders={false} withColumnBorders={false} striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Goal</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Period</Table.Th>
              <Table.Th>Value</Table.Th>
              <Table.Th>Mood</Table.Th>
              <Table.Th>Note</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(entries || []).map((e: any) => (
              <Table.Tr key={e.id}>
                <Table.Td>{e.goal?.title || 'Unknown Goal'}</Table.Td>
                <Table.Td>{new Date(e.date).toLocaleDateString()}</Table.Td>
                <Table.Td>{e.period}</Table.Td>
                <Table.Td>{e.progressValue ?? '-'}</Table.Td>
                <Table.Td>{e.mood ?? '-'}</Table.Td>
                <Table.Td>{e.note ?? '-'}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Container>
  )
}




