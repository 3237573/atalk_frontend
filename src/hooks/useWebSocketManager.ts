import { useEffect, useRef } from 'react'

type WebSocketType = 'chat' | 'call' | 'notify'

type EventHandler = {
    onMessage?: (data: any) => void
    onOpen?: () => void
    onClose?: () => void
    onError?: (err: Event) => void
}

export function useWebSocketManager(type: WebSocketType, handlers: EventHandler) {
    const socketRef = useRef<WebSocket | null>(null)
    const reconnectTimer = useRef<number | null>(null)
    const heartbeatTimer = useRef<number | null>(null)
    const reconnectLock = useRef(false)
    const shouldReconnect = useRef(true)

    useEffect(() => {
        const token = localStorage.getItem('jwt')
        if (!token || token.length < 20) {
            console.warn(`⛔️ WebSocket ${type} не запущен — токен отсутствует или недействителен`)
            return
        }

        const endpoint = {
            chat: `ws://localhost:8080/chat?token=${token}`,
            call: `ws://localhost:8080/call/ws?token=${token}`,
            notify: `ws://localhost:8080/notify/ws?token=${token}`
        }[type]

        const connect = () => {
            const current = socketRef.current
            if (current && (current.readyState === WebSocket.OPEN || current.readyState === WebSocket.CONNECTING)) {
                console.warn(`⚠️ WebSocket ${type} уже открыт или в процессе — повторное подключение отменено`)
                return
            }

            if (!shouldReconnect.current) {
                console.warn(`🛑 WebSocket ${type} переподключение отключено`)
                return
            }

            reconnectLock.current = false
            const ws = new WebSocket(endpoint)

            ws.onopen = () => {
                console.log(`✅ WebSocket открыт: ${type}`)
                handlers.onOpen?.()

                heartbeatTimer.current = window.setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'PING' }))
                    }
                }, 10000)
            }

            ws.onmessage = event => {
                try {
                    const data = JSON.parse(event.data)
                    handlers.onMessage?.(data)
                } catch (err) {
                    console.warn(`⚠️ Ошибка парсинга ${type}:`, err)
                }
            }

            ws.onerror = err => {
                console.error(`❌ WebSocket ошибка: ${type}`, err)
                handlers.onError?.(err)
            }

            ws.onclose = (event) => {
                console.warn(`🔌 WebSocket закрыт: ${type}, код: ${event.code}, причина: ${event.reason || 'нет причины'}`)
                handlers.onClose?.()

                if (heartbeatTimer.current) {
                    clearInterval(heartbeatTimer.current)
                    heartbeatTimer.current = null
                }

                if (event.code === 1000) {
                    console.warn(`🛑 WebSocket ${type} закрыт нормально — переподключение отключено`)
                    shouldReconnect.current = false
                    return
                }

                if (!reconnectLock.current) {
                    reconnectLock.current = true
                    reconnectTimer.current = window.setTimeout(() => {
                        console.log(`🔄 Переподключение: ${type}`)
                        connect()
                    }, 3000)
                }
            }

            socketRef.current = ws
        }

        connect()

        return () => {
            shouldReconnect.current = false
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
            if (heartbeatTimer.current) clearInterval(heartbeatTimer.current)
            socketRef.current?.close()
            socketRef.current = null
        }
    }, [type, handlers])
}
