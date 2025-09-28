import { useState } from 'react'
import { Button, Card, Container, PasswordInput, TextInput, Title, Divider } from '@mantine/core'
import { IconBrandGoogle } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} my="xl">
      <Title ta="center">Welcome back</Title>
      <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
        <form onSubmit={onSubmit}>
          <TextInput label="Email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} required />
          <PasswordInput mt="sm" label="Password" value={password} onChange={(e) => setPassword(e.currentTarget.value)} required />
          <Button type="submit" fullWidth mt="md" loading={loading}>Login</Button>
          <Button component={Link} to="/register" variant="subtle" fullWidth mt="sm">Create an account</Button>
        </form>
        
        <Divider label="or" labelPosition="center" my="md" />
        
        <Button 
          leftSection={<IconBrandGoogle size={16} />}
          variant="outline" 
          fullWidth 
          onClick={loginWithGoogle}
        >
          Continue with Google
        </Button>
      </Card>
    </Container>
  )
}



