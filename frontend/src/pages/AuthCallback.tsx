import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      navigate('/login?error=oauth_failed')
      return
    }

    if (token) {
      // Store the token and redirect to dashboard
      localStorage.setItem('token', token)
      // The AuthContext will automatically detect the token and fetch user info
      navigate('/')
    } else {
      navigate('/login?error=no_token')
    }
  }, [searchParams, navigate])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Completing sign in...
    </div>
  )
}
