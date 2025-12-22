import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useYear } from '../context/YearContext'
import { AppShell, Burger, Button, Group, Text, Title, ActionIcon, useMantineColorScheme, useComputedColorScheme, Select } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useEffect, useMemo } from 'react'
import { IconSun, IconMoon } from '@tabler/icons-react'

export function AppLayout() {
  const { user, logout } = useAuth()
  const { year, setYear } = useYear()
  const [opened, { toggle }] = useDisclosure()
  const location = useLocation()
  const navigate = useNavigate()
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = -5; i <= 5; i++) {
      years.push({
        value: String(currentYear + i),
        label: String(currentYear + i),
      })
    }
    return years
  }, [])

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
            <Select
              value={String(year)}
              onChange={(value) => setYear(value ? parseInt(value, 10) : new Date().getFullYear())}
              data={yearOptions}
              w={100}
              size="sm"
            />
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
