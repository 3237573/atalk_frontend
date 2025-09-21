// src/context/AuthProvider.tsx
import { useEffect, useState } from 'react'
import { AuthContext, type AuthContextType } from './AuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem('jwt')
        setToken(stored)
        setIsAuthenticated(!!stored)
        setIsReady(true)
    }, [])

    const login = (newToken: string) => {
        localStorage.setItem('jwt', newToken)
        setToken(newToken)
        setIsAuthenticated(true)
    }

    const logout = () => {
        localStorage.removeItem('jwt')
        setToken(null)
        setIsAuthenticated(false)
    }

    const value: AuthContextType = {
        isAuthenticated,
        isReady,
        login,
        logout,
        token
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
