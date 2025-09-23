import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function FallbackRedirect() {
    const { isAuthenticated } = useAuth()
    return <Navigate to={isAuthenticated ? '/chat' : '/login'} replace />
}
