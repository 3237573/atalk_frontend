import { useEffect, useState, useMemo } from 'react'
import { useCall } from '../hooks/useCall'
import { useWebSocketManager } from '../hooks/useWebSocketManager'
import {useAuth} from "../hooks/useAuth.ts";

type User = {
    userId: string
    nickname: string
    avatarUrl?: string
}

type UserListProps = Readonly<{
    currentUserId: string
    onSelect?: (userId: string) => void
}>

export default function UserList({ currentUserId, onSelect }: UserListProps) {
    const [users, setUsers] = useState<User[]>([])
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const { startCall } = useCall()
    const { token } = useAuth()

    useWebSocketManager('call', {
        onMessage: (data) => {
            if (data.type === 'offer' && data.to === currentUserId) {
                startCall(data.from)
            }
        }
    })

    useEffect(() => {
        if (!token) return

        fetch('/chat/users', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(setUsers)
            .catch(err => console.error('Ошибка загрузки пользователей:', err))
    }, [token])

    useEffect(() => {
        const fetchOnline = () => {
            fetch('/call/online')
                .then(res => res.json())
                .then(setOnlineUsers)
                .catch(err => console.error('Ошибка загрузки онлайн-статуса:', err))
        }

        fetchOnline()
        const interval = setInterval(fetchOnline, 30000)
        return () => clearInterval(interval)
    }, [])

    const filteredUsers = useMemo(() => {
        return users.filter(u => u.userId !== currentUserId)
    }, [users, currentUserId])

    const handleSelect = (userId: string) => {
        setSelectedUserId(userId)
        onSelect?.(userId)
    }

    return (
        <aside className="user-list">
            <h3>👥 Пользователи</h3>
            <ul>
                {filteredUsers.map(user => (
                    <li
                        key={user.userId}
                        onClick={() => handleSelect(user.userId)}
                        className={selectedUserId === user.userId ? 'active' : ''}
                        style={{ cursor: 'pointer', marginBottom: '8px' }}
                    >
                        <span>{user.nickname}</span>
                        <span style={{ marginLeft: '10px', color: onlineUsers.includes(user.userId) ? 'green' : 'gray' }}>
              {onlineUsers.includes(user.userId) ? '🟢 В сети' : '⚪️ Не в сети'}
            </span>
                        <button style={{ marginLeft: '10px' }} onClick={() => startCall(user.userId)}>📞 Позвонить</button>
                    </li>
                ))}
            </ul>
        </aside>
    )
}
