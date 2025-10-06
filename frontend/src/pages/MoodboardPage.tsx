import { useState, useEffect } from 'react'
import { 
  Button, 
  Card, 
  Container, 
  Group, 
  Select, 
  Text, 
  TextInput, 
  Title, 
  Stack,
  Tabs,
  Modal,
  Textarea,
  Badge,
  ActionIcon,
  Paper,
  FileInput,
  Box,
} from '@mantine/core'
import { IconPlus, IconTrash, IconEdit, IconX, IconUpload } from '@tabler/icons-react'
import { 
  DndContext, 
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  useDraggable,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { 
  useMoodBoards, 
  useCreateMoodBoard, 
  useUpdateMoodBoard, 
  useDeleteMoodBoard,
  useCreateMoodBoardItem, 
  useDeleteMoodBoardItem,
  useUpdateMoodBoardItem,
} from '../api/hooks'

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
  position?: { x: number; y: number; width: number; height: number }
  createdAt: string
}

interface DraggableItemProps {
  item: MoodBoardItem
  onDelete: (id: string) => void
  localPosition?: { x: number; y: number; width: number; height: number }
}

function DraggableItem({ item, onDelete, localPosition }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  })

  const position = localPosition || item.position || { x: 0, y: 0, width: 250, height: 250 }
  
  const style = {
    position: 'absolute' as const,
    left: position.x,
    top: position.y,
    width: position.width,
    height: position.height,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.8 : 1,
    transition: isDragging ? 'none' : 'opacity 0.2s',
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      withBorder
      shadow="sm"
      padding="xs"
    >
      <Group justify="space-between" mb="xs">
        <Badge variant="light" size="sm">
          {item.type === 'image_url' ? 'URL' : 'Upload'}
        </Badge>
        <ActionIcon
          color="red"
          variant="subtle"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
        >
          <IconX size={14} />
        </ActionIcon>
      </Group>
      <img
        src={item.content}
        alt="mood"
        style={{
          width: '100%',
          height: 'calc(100% - 40px)',
          objectFit: 'cover',
          borderRadius: 8,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </Card>
  )
}

export function MoodboardPage() {
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

  // Item creation state
  const [itemType, setItemType] = useState<string | null>('image_url')
  const [itemContent, setItemContent] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  // Local state for immediate position updates (prevents flicker)
  const [localPositions, setLocalPositions] = useState<Record<string, { x: number; y: number; width: number; height: number }>>({})

  // Always call hooks unconditionally (even if selectedMoodBoardId is null)
  const createItem = useCreateMoodBoardItem(selectedMoodBoardId || '')
  const deleteItem = useDeleteMoodBoardItem(selectedMoodBoardId || '')
  const updateItem = useUpdateMoodBoardItem(selectedMoodBoardId || '')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Auto-select first moodboard if none selected
  useEffect(() => {
    if (!selectedMoodBoardId && moodBoards && moodBoards.length > 0) {
      setSelectedMoodBoardId(moodBoards[0].id)
    }
  }, [selectedMoodBoardId, moodBoards])

  // Clear local positions when switching moodboards
  useEffect(() => {
    setLocalPositions({})
  }, [selectedMoodBoardId])

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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMoodBoardId) return
    
    let content = itemContent
    
    // If type is image_upload, convert file to base64
    if (itemType === 'image_upload' && uploadedFile) {
      content = await fileToBase64(uploadedFile)
    }
    
    // Generate random position for new item
    const position = getRandomPosition()
    
    await createItem.mutateAsync({ type: itemType, content, position })
    setItemContent('')
    setUploadedFile(null)
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    const itemId = active.id as string
    
    const currentBoard = moodBoards?.find((mb: MoodBoard) => mb.id === selectedMoodBoardId)
    const item = currentBoard?.items?.find((it: MoodBoardItem) => it.id === itemId)
    
    if (!item || !selectedMoodBoardId) return
    
    const currentPos = localPositions[itemId] || item.position || { x: 0, y: 0, width: 250, height: 250 }
    const newPosition = {
      ...currentPos,
      x: currentPos.x + delta.x,
      y: currentPos.y + delta.y,
    }
    
    // Update local state IMMEDIATELY (synchronous, no flicker)
    setLocalPositions(prev => ({
      ...prev,
      [itemId]: newPosition
    }))
    
    // Then update server in background
    updateItem.mutate({
      itemId,
      data: { position: newPosition }
    })
  }

  const getRandomPosition = () => {
    return {
      x: Math.random() * 600,
      y: Math.random() * 400,
      width: 200 + Math.random() * 150,
      height: 200 + Math.random() * 150,
    }
  }

  return (
    <Container size="xl" my="md">
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
              <Stack gap="md">
                {/* Board Header */}
                <Paper withBorder p="md" radius="md">
                  <Group justify="space-between">
                    <div>
                      <Title order={3}>{board.title}</Title>
                      {board.description && (
                        <Text size="sm" c="dimmed" mt={4}>{board.description}</Text>
                      )}
                    </div>
                    <Group gap="xs">
                      <ActionIcon 
                        variant="light" 
                        color="blue"
                        onClick={() => openEditModal(board)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="light" 
                        color="red"
                        onClick={() => handleDeleteMoodBoard(board.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Paper>

                {/* Add Item Form */}
                <Card withBorder>
                  <form onSubmit={handleAddItem}>
                    <Stack gap="md">
                      <Select 
                        label="Type" 
                        data={[
                          { value: 'image_url', label: 'Image URL' },
                          { value: 'image_upload', label: 'Image Upload' }
                        ]} 
                        value={itemType} 
                        onChange={setItemType} 
                      />
                      
                      {itemType === 'image_upload' ? (
                        <FileInput
                          label="Upload Image"
                          placeholder="Choose image file"
                          accept="image/*"
                          value={uploadedFile}
                          onChange={setUploadedFile}
                          leftSection={<IconUpload size={16} />}
                          required
                        />
                      ) : (
                        <TextInput 
                          label="Image URL"
                          placeholder="https://example.com/image.jpg"
                          value={itemContent} 
                          onChange={(e) => setItemContent(e.currentTarget.value)} 
                          required 
                        />
                      )}
                      
                      <Button 
                        type="submit" 
                        loading={createItem.isPending}
                        leftSection={<IconPlus size={16} />}
                        disabled={!selectedMoodBoardId}
                      >
                        Add Item
                      </Button>
                    </Stack>
                  </form>
                </Card>

                {/* Collage Canvas */}
                {board.items && board.items.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <Box
                      style={{
                        position: 'relative',
                        width: '100%',
                        minHeight: '800px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        border: '2px dashed #dee2e6',
                        padding: '20px',
                      }}
                    >
                      {board.items.map((item: MoodBoardItem) => (
                        <DraggableItem
                          key={item.id}
                          item={item}
                          localPosition={localPositions[item.id]}
                          onDelete={(id) => deleteItem.mutate(id)}
                        />
                      ))}
                    </Box>
                  </DndContext>
                ) : (
                  <Paper withBorder p="xl" radius="md">
                    <Text ta="center" c="dimmed">
                      No items yet. Add your first item above!
                    </Text>
                  </Paper>
                )}
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

      {/* Create Moodboard Modal */}
      <Modal 
        opened={showCreateModal} 
        onClose={() => {
          setShowCreateModal(false)
          setNewBoardTitle('')
          setNewBoardDescription('')
        }}
        title="Create New Moodboard"
      >
        <form onSubmit={handleCreateMoodBoard}>
          <Stack gap="md">
            <TextInput 
              label="Title" 
              value={newBoardTitle} 
              onChange={(e) => setNewBoardTitle(e.currentTarget.value)} 
              required 
              placeholder="My Vision Board"
            />
            <Textarea 
              label="Description" 
              value={newBoardDescription} 
              onChange={(e) => setNewBoardDescription(e.currentTarget.value)} 
              placeholder="Optional description..."
              rows={3}
            />
            <Group justify="flex-end" gap="xs">
              <Button 
                variant="subtle" 
                onClick={() => {
                  setShowCreateModal(false)
                  setNewBoardTitle('')
                  setNewBoardDescription('')
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={createMoodBoard.isPending}>
                Create
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Moodboard Modal */}
      <Modal 
        opened={showEditModal} 
        onClose={() => {
          setShowEditModal(false)
          setEditingBoard(null)
          setNewBoardTitle('')
          setNewBoardDescription('')
        }}
        title="Edit Moodboard"
      >
        <form onSubmit={handleUpdateMoodBoard}>
          <Stack gap="md">
            <TextInput 
              label="Title" 
              value={newBoardTitle} 
              onChange={(e) => setNewBoardTitle(e.currentTarget.value)} 
              required 
            />
            <Textarea 
              label="Description" 
              value={newBoardDescription} 
              onChange={(e) => setNewBoardDescription(e.currentTarget.value)} 
              placeholder="Optional description..."
              rows={3}
            />
            <Group justify="flex-end" gap="xs">
              <Button 
                variant="subtle" 
                onClick={() => {
                  setShowEditModal(false)
                  setEditingBoard(null)
                  setNewBoardTitle('')
                  setNewBoardDescription('')
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={updateMoodBoard.isPending}>
                Save
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  )
}
