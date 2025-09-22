import { useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

type SignalMessage = {
    type: 'offer' | 'answer' | 'ice'
    offer?: RTCSessionDescriptionInit
    answer?: RTCSessionDescriptionInit
    candidate?: RTCIceCandidateInit
    to: string
    from: string
}

type JwtPayload = { userId: string }

export default function CallSocketProvider({ onSignal }: { onSignal: (msg: SignalMessage) => void }) {
    useEffect(() => {
        const token = localStorage.getItem('jwt')
        if (!token || token.length < 20) return

        const ws = new WebSocket(`ws://localhost:8080/call/ws?token=${token}`)

        ws.onopen = () => console.log('📞 Call WebSocket открыт')
        ws.onmessage = event => {
            try {
                const data: SignalMessage = JSON.parse(event.data)
                onSignal(data)
            } catch (err) {
                console.warn('⚠️ Ошибка парсинга сигнала:', err)
            }
        }
        ws.onclose = () => console.log('📴 Call WebSocket закрыт')

        return () => ws.close()
    }, [onSignal])

    return null
}
