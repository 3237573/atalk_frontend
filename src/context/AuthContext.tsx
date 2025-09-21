// src/context/AuthContext.ts
import { createContext } from 'react'

export type AuthContextType = {
    isAuthenticated: boolean
    isReady: boolean
    login: (token: string) => void
    logout: () => void
    token: string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
