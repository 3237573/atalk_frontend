import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type {JSX} from "react";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated, isReady } = useAuth()
    if (!isReady) return null
    return isAuthenticated ? children : <Navigate to="/login" replace />
}
