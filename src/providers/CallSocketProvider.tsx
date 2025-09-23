import { useEffect } from 'react'
import { useCall } from '../context/CallContext'

type SignalMessage = {
    type: 'offer' | 'answer' | 'ice' | 'end'
    offer?: RTCSessionDescriptionInit
    answer?: RTCSessionDescriptionInit
    candidate?: RTCIceCandidateInit
    to: string
    from: string
}

export default function CallSocketProvider() {
    const { receiveOffer, endCall } = useCall()

    useEffect(() => {
        const token = localStorage.getItem('jwt')
        if (!token || token.length < 20) return

        const ws = new WebSocket(`ws://localhost:8080/call/ws?token=${token}`)

        ws.onopen = () => console.log('📞 Call WebSocket открыт')
        ws.onmessage = event => {
            try {
                const data: SignalMessage = JSON.parse(event.data)
                if (data.type === 'offer') {
                    console.log('📨 Входящий offer:', data)
                    receiveOffer(data)
                }
                if (data.type === 'end') {
                    console.log('🔚 Получен сигнал завершения от', data.from)
                    endCall()
                }
            } catch (err) {
                console.warn('⚠️ Ошибка парсинга сигнала:', err)
            }
        }
        ws.onclose = () => console.log('📴 Call WebSocket закрыт')

        return () => ws.close()
    }, [receiveOffer])

    return null
}
