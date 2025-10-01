import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AppShell, Burger, Button, Group, Text, Title, ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useEffect } from 'react'
import { IconSun, IconMoon } from '@tabler/icons-react'

export function AppLayout() {
  const { user, logout } = useAuth()
  const [opened, { toggle }] = useDisclosure()
  const location = useLocation()
  const navigate = useNavigate()
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    if (!user && !['/login', '/register'].includes(location.pathname)) {
      navigate('/login')
    }
  }, [user, location.pathname, navigate])

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 0, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
      padding="md"
   >
      <AppShell.Header p="xs">
        <Group justify="space-between" align="center" h="100%">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}><Link to="/">Smart Notebook</Link></Title>
          </Group>
          <Group>
            <ActionIcon
              onClick={toggleColorScheme}
              variant="default"
              size="lg"
              aria-label="Toggle color scheme"
            >
              {computedColorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
            {user ? (
              <>
                <Text>Hi, {user.displayName || user.email}</Text>
                <Button variant="light" onClick={() => logout()}>Logout</Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" variant="subtle">Login</Button>
                <Button component={Link} to="/register">Sign up</Button>
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
