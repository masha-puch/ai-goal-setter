import { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { Center, Loader } from '@mantine/core'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    )
  }

  return <>{children}</>
}
