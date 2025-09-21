import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../hooks/useAuth'
import { logout } from '../service/main-service'
import ChatWithCall from '../components/ChatWithCall'

type JwtPayload = {
    userId: string
    email: string
}

export default function ChatPage() {
    const navigate = useNavigate()
    const { token, isAuthenticated, isReady } = useAuth()
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

    useEffect(() => {
        if (!isReady) return

        if (!isAuthenticated || !token) {
            console.warn('❌ Пользователь не авторизован — переход на /login')
            navigate('/login', { replace: true })
            return
        }

        try {
            const decoded = jwtDecode<JwtPayload>(token)
            setCurrentUserId(decoded.userId)
            setCurrentUserEmail(decoded.email)
        } catch (err) {
            console.error('❌ Ошибка декодирования токена:', err)
            navigate('/login', { replace: true })
        }
    }, [isAuthenticated, isReady, token, navigate])

    if (!currentUserId || !currentUserEmail) return null

    return (
        <div>
            <h2>
                💬 Чат пользователя: {currentUserEmail}
                <button onClick={logout} style={{ marginLeft: '1rem' }}>Выход</button>
            </h2>
            <ChatWithCall currentUserId={currentUserId} />
        </div>
    )
}
