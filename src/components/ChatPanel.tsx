import { useState, useEffect, useRef } from 'react'
import EmojiPicker from 'emoji-picker-react'
import './ChatPanel.css'
import { useCall } from '../hooks/useCall'
import {useAuth} from "../hooks/useAuth.ts";

type Message = {
    id: string
    senderId: string
    senderNickname?: string
    content: string
    timestamp?: string
    type?: 'TEXT' | 'IMAGE' | 'FILE'
}

type ChatPanelProps = Readonly<{
    currentUserId: string
    receiverId: string
}>

export default function ChatPanel({ currentUserId, receiverId }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [showEmoji, setShowEmoji] = useState(false)
    const { startCall } = useCall()
    const { token } = useAuth()
    const socketRef = useRef<WebSocket | null>(null)

    // Подключение к WebSocket
    useEffect(() => {
        if (!token) return

        const ws = new WebSocket(`ws://localhost:8080/chat?token=${token}`)

        ws.onopen = () => {
            console.log('✅ Chat WebSocket открыт')
        }

        ws.onmessage = event => {
            try {
                const data: Message = JSON.parse(event.data)
                setMessages(prev => [...prev, data])
            } catch (err) {
                console.warn('⚠️ Ошибка парсинга сообщения:', err)
            }
        }

        ws.onerror = err => {
            console.error('❌ Chat WebSocket ошибка:', err)
        }

        ws.onclose = () => {
            console.warn('🔌 Chat WebSocket закрыт')
        }

        socketRef.current = ws

        return () => {
            ws.close()
            socketRef.current = null
        }
    }, [token])

    // Загрузка истории сообщений
    useEffect(() => {
        if (!token) return

        fetch(`/chat/history/${receiverId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(setMessages)
            .catch(err => console.error('Ошибка загрузки истории:', err))
    }, [receiverId, token])

    const sendMessage = () => {
        if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return

        const payload = {
            receiverId,
            roomId: null,
            content: input,
            encrypted: false,
            type: 'TEXT' as const
        }

        socketRef.current.send(JSON.stringify(payload))

        setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                senderId: currentUserId,
                senderNickname: 'Вы',
                content: input
            }
        ])

        setInput('')
    }

    const handleEmojiClick = (emoji: any) => {
        setInput(prev => prev + emoji.emoji)
        setShowEmoji(false)
    }

    return (
        <div className="chat-main">
            <div className="chat-input">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Введите сообщение..."
                />
                <button onClick={sendMessage}>📤</button>
                <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>
                <button onClick={() => startCall(receiverId)}>📞 Позвонить</button>
            </div>

            {showEmoji && (
                <div className="emoji-picker">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}

            <div className="chat-messages">
                {messages.map(m => (
                    <div key={m.id} className="chat-message">
                        <strong>{m.senderId === currentUserId ? 'Вы' : m.senderNickname ?? 'Собеседник'}:</strong> {m.content}
                    </div>
                ))}
            </div>
        </div>
    )
}
