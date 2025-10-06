import { useState, useEffect } from 'react'
import { 
  Button, 
  Container, 
  Group, 
  Text, 
  Title, 
  Stack,
  Tabs,
  Badge,
  Paper,
  Box,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { 
  useMoodBoards, 
  useCreateMoodBoard, 
  useUpdateMoodBoard, 
  useDeleteMoodBoard,
  useCreateMoodBoardItem, 
  useDeleteMoodBoardItem,
  useUpdateMoodBoardItem,
} from '../api/hooks'
import { 
  AddItemForm, 
  MoodboardCanvas, 
  MoodboardModals, 
  BoardHeader,
  useMoodboardItems,
  useMoodboardDragDrop,
} from '../components/moodboard'

interface MoodBoard {
  id: string
  title: string
  description?: string
  items?: MoodBoardItem[]
  createdAt: string
}

interface MoodBoardItem {
  id: string
  type: string
  content: string
  tags?: any
  position?: { x: number; y: number; width: number; height: number; zIndex?: number }
  createdAt: string
}

export function MoodboardPage() {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const { data: moodBoards } = useMoodBoards()
  const createMoodBoard = useCreateMoodBoard()
  const updateMoodBoard = useUpdateMoodBoard()
  const deleteMoodBoard = useDeleteMoodBoard()

  const [selectedMoodBoardId, setSelectedMoodBoardId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')
  const [editingBoard, setEditingBoard] = useState<MoodBoard | null>(null)
  const [mode, setMode] = useState<'edit' | 'read'>('edit')

  const createItem = useCreateMoodBoardItem(selectedMoodBoardId || '')
  const deleteItem = useDeleteMoodBoardItem(selectedMoodBoardId || '')
  const updateItem = useUpdateMoodBoardItem(selectedMoodBoardId || '')

  const {
    localPositions,
    setLocalPositions,
    fileToBase64,
    getRandomPosition,
    handleAddItem,
    handleDragEnd,
    handleResize,
    handleBringForward,
    handleSendBackward,
  } = useMoodboardItems(moodBoards, selectedMoodBoardId, createItem, updateItem)

  const {
    isDraggingFile,
    handlePageDragOver,
    handlePageDragEnter,
    handlePageDragLeave,
    handlePageDrop,
  } = useMoodboardDragDrop(selectedMoodBoardId, createItem, fileToBase64, getRandomPosition)

  // Auto-select first moodboard if none selected
  useEffect(() => {
    if (!selectedMoodBoardId && moodBoards && moodBoards.length > 0) {
      setSelectedMoodBoardId(moodBoards[0].id)
    }
  }, [selectedMoodBoardId, moodBoards])

  // Clear local positions when switching moodboards
  useEffect(() => {
    setLocalPositions({})
  }, [selectedMoodBoardId, setLocalPositions])

  const handleCreateMoodBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMoodBoard.mutateAsync({ 
      title: newBoardTitle, 
      description: newBoardDescription 
    })
    setNewBoardTitle('')
    setNewBoardDescription('')
    setShowCreateModal(false)
  }

  const handleUpdateMoodBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBoard) return
    await updateMoodBoard.mutateAsync({
      moodBoardId: editingBoard.id,
      data: { 
        title: newBoardTitle, 
        description: newBoardDescription 
      }
    })
    setNewBoardTitle('')
    setNewBoardDescription('')
    setEditingBoard(null)
    setShowEditModal(false)
  }

  const handleDeleteMoodBoard = async (boardId: string) => {
    if (confirm('Are you sure you want to delete this moodboard? All items will be deleted.')) {
      await deleteMoodBoard.mutateAsync(boardId)
      if (selectedMoodBoardId === boardId) {
        setSelectedMoodBoardId(null)
      }
    }
  }

  const openEditModal = (board: MoodBoard) => {
    setEditingBoard(board)
    setNewBoardTitle(board.title)
    setNewBoardDescription(board.description || '')
    setShowEditModal(true)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setNewBoardTitle('')
    setNewBoardDescription('')
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingBoard(null)
    setNewBoardTitle('')
    setNewBoardDescription('')
  }

  return (
    <Container 
      size="xl" 
      my="md"
      onDragOver={handlePageDragOver}
      onDragEnter={handlePageDragEnter}
      onDragLeave={handlePageDragLeave}
      onDrop={handlePageDrop}
      style={{ 
        position: 'relative',
        outline: isDraggingFile ? `3px dashed ${theme.colors.blue[5]}` : 'none',
        outlineOffset: '-3px',
        transition: 'outline 0.2s ease',
      }}
    >
      {isDraggingFile && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colorScheme === 'dark' 
              ? 'rgba(66, 153, 225, 0.1)' 
              : 'rgba(66, 153, 225, 0.05)',
            pointerEvents: 'none',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
          }}
        >
          <Text size="xl" fw={500} c="blue">
            Drop images here to add to moodboard
          </Text>
        </Box>
      )}
      <Group justify="space-between" mb="lg">
        <Title order={2}>Mood Boards</Title>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={() => setShowCreateModal(true)}
        >
          New Moodboard
        </Button>
      </Group>

      {/* Moodboards Tabs */}
      {moodBoards && moodBoards.length > 0 ? (
        <Tabs value={selectedMoodBoardId} onChange={(value) => setSelectedMoodBoardId(value)}>
          <Tabs.List>
            {moodBoards.map((board: MoodBoard) => (
              <Tabs.Tab key={board.id} value={board.id}>
                <Group gap="xs">
                  {board.title}
                  <Badge size="xs">{board.items?.length || 0}</Badge>
                </Group>
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {moodBoards.map((board: MoodBoard) => (
            <Tabs.Panel key={board.id} value={board.id} pt="md">
              <Stack gap="md" style={{ height: 'calc(100vh - 280px)' }}>
                <BoardHeader 
                  board={board}
                  onEdit={openEditModal}
                  onDelete={handleDeleteMoodBoard}
                  mode={mode}
                  onModeChange={setMode}
                />

                <AddItemForm 
                  selectedMoodBoardId={selectedMoodBoardId}
                  onAddItem={handleAddItem}
                  isLoading={createItem.isPending}
                />

                <MoodboardCanvas 
                  items={board.items}
                  localPositions={localPositions}
                  onDragEnd={handleDragEnd}
                  onDeleteItem={(id) => deleteItem.mutate(id)}
                  onResize={handleResize}
                  onBringForward={handleBringForward}
                  onSendBackward={handleSendBackward}
                  mode={mode}
                />
              </Stack>
            </Tabs.Panel>
          ))}
        </Tabs>
      ) : (
        <Paper withBorder p="xl" radius="md">
          <Stack align="center" gap="md">
            <Text size="lg" c="dimmed">No moodboards yet</Text>
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Moodboard
            </Button>
          </Stack>
        </Paper>
      )}

      <MoodboardModals 
        showCreateModal={showCreateModal}
        showEditModal={showEditModal}
        newBoardTitle={newBoardTitle}
        newBoardDescription={newBoardDescription}
        isCreating={createMoodBoard.isPending}
        isUpdating={updateMoodBoard.isPending}
        onCreateSubmit={handleCreateMoodBoard}
        onUpdateSubmit={handleUpdateMoodBoard}
        onCreateClose={closeCreateModal}
        onEditClose={closeEditModal}
        onTitleChange={setNewBoardTitle}
        onDescriptionChange={setNewBoardDescription}
      />
    </Container>
  )
}
