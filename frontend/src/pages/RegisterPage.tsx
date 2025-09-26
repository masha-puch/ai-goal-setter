import { useState } from 'react'
import { Button, Card, Container, PasswordInput, TextInput, Title } from '@mantine/core'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(email, password, displayName)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} my="xl">
      <Title ta="center">Create your account</Title>
      <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
        <form onSubmit={onSubmit}>
          <TextInput label="Display name" value={displayName} onChange={(e) => setDisplayName(e.currentTarget.value)} />
          <TextInput mt="sm" label="Email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} required />
          <PasswordInput mt="sm" label="Password" value={password} onChange={(e) => setPassword(e.currentTarget.value)} required />
          <Button type="submit" fullWidth mt="md" loading={loading}>Sign up</Button>
          <Button component={Link} to="/login" variant="subtle" fullWidth mt="sm">Have an account? Login</Button>
        </form>
      </Card>
    </Container>
  )
}



