import React from 'react'
import ReactDOM from 'react-dom/client'
import { createTheme, MantineProvider, ColorSchemeScript } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './style.css'
import { AuthProvider } from './context/AuthContext'
import { YearProvider } from './context/YearContext'
import { AuthGuard } from './components/AuthGuard'
import { AppLayout } from './ui/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AuthCallback } from './pages/AuthCallback'
import { Dashboard } from './pages/Dashboard'
import { GoalsPage } from './pages/GoalsPage'
import { ProgressPage } from './pages/ProgressPage'
import { MoodboardPage } from './pages/MoodboardPage'
import { ReflectionsPage } from './pages/ReflectionsPage'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'moodboard', element: <MoodboardPage /> },
      { path: 'reflections', element: <ReflectionsPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
])

const theme = createTheme({
  /** Add your theme customizations here */
})

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <ModalsProvider>
        <Notifications position="top-right" />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <YearProvider>
              <RouterProvider router={router} />
            </YearProvider>
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ModalsProvider>
    </MantineProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorSchemeScript />
    <App />
  </React.StrictMode>,
)
