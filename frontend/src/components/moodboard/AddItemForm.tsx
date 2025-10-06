import { useState } from 'react'
import { Button, Card, Group, Select, TextInput, FileInput } from '@mantine/core'
import { IconPlus, IconUpload } from '@tabler/icons-react'

interface AddItemFormProps {
  selectedMoodBoardId: string | null
  onAddItem: (type: string | null, content: string, file: File | null) => Promise<void>
  isLoading: boolean
}

export function AddItemForm({ selectedMoodBoardId, onAddItem, isLoading }: AddItemFormProps) {
  const [itemType, setItemType] = useState<string | null>('image_url')
  const [itemContent, setItemContent] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onAddItem(itemType, itemContent, uploadedFile)
    setItemContent('')
    setUploadedFile(null)
  }

  return (
    <Card withBorder>
      <form onSubmit={handleSubmit}>
        <Group align="flex-end" gap="md">
          <Select 
            label="Type" 
            data={[
              { value: 'image_url', label: 'Image URL' },
              { value: 'image_upload', label: 'Image Upload' }
            ]} 
            value={itemType} 
            onChange={setItemType}
            style={{ flex: '0 0 200px' }}
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
              style={{ flex: 1 }}
            />
          ) : (
            <TextInput 
              label="Image URL"
              placeholder="https://example.com/image.jpg"
              value={itemContent} 
              onChange={(e) => setItemContent(e.currentTarget.value)} 
              required
              style={{ flex: 1 }}
            />
          )}
          
          <Button 
            type="submit" 
            loading={isLoading}
            leftSection={<IconPlus size={16} />}
            disabled={!selectedMoodBoardId}
          >
            Add Item
          </Button>
        </Group>
      </form>
    </Card>
  )
}

