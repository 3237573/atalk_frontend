import { useEffect, useRef } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useCall } from '../hooks/useCall'

type SignalMessage = {
    type: 'offer' | 'answer' | 'ice'
    offer?: RTCSessionDescriptionInit
    answer?: RTCSessionDescriptionInit
    candidate?: RTCIceCandidateInit
    to: string
    from: string
}

type JwtPayload = { userId: string }

export default function VoiceCall({ peerId }: { peerId: string }) {
    const socket = useRef<WebSocket | null>(null)
    const peer = useRef<RTCPeerConnection | null>(null)
    const localStream = useRef<MediaStream | null>(null)
    const { endCall } = useCall()

    const token = localStorage.getItem('jwt')
    const currentUserId = token ? jwtDecode<JwtPayload>(token).userId : ''

    useEffect(() => {
        socket.current = new WebSocket(`ws://localhost:8080/call/ws?token=${token}`)
        peer.current = new RTCPeerConnection()

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            localStream.current = stream
            stream.getTracks().forEach(track => peer.current!.addTrack(track, stream))
        }).catch(err => console.error('❌ Микрофон недоступен:', err))

        peer.current.onicecandidate = event => {
            if (event.candidate) {
                socket.current?.send(JSON.stringify({
                    type: 'ice',
                    candidate: event.candidate,
                    to: peerId,
                    from: currentUserId
                }))
            }
        }

        peer.current.ontrack = event => {
            const remoteAudio = new Audio()
            remoteAudio.srcObject = event.streams[0]
            remoteAudio.autoplay = true
            remoteAudio.play().catch(err => console.warn('🔇 Ошибка воспроизведения:', err))
        }

        socket.current.onmessage = async event => {
            const data: SignalMessage = JSON.parse(event.data)
            if (!peer.current) return

            try {
                switch (data.type) {
                    case 'offer':
                        await peer.current.setRemoteDescription(new RTCSessionDescription(data.offer!))
                        const answer = await peer.current.createAnswer()
                        await peer.current.setLocalDescription(answer)
                        socket.current!.send(JSON.stringify({
                            type: 'answer',
                            answer,
                            to: data.from,
                            from: currentUserId
                        }))
                        break
                    case 'answer':
                        await peer.current.setRemoteDescription(new RTCSessionDescription(data.answer!))
                        break
                    case 'ice':
                        await peer.current.addIceCandidate(new RTCIceCandidate(data.candidate!))
                        break
                }
            } catch (err) {
                console.error('❌ Ошибка сигналинга:', err)
            }
        }

        socket.current.onopen = async () => {
            if (peerId !== currentUserId) {
                const offer = await peer.current!.createOffer()
                await peer.current!.setLocalDescription(offer)
                socket.current!.send(JSON.stringify({
                    type: 'offer',
                    offer,
                    to: peerId,
                    from: currentUserId
                }))
            }
        }

        socket.current.onerror = err => console.error('❌ WebSocket ошибка:', err)
        socket.current.onclose = () => console.warn('🔌 WebSocket закрыт')

        return () => {
            socket.current?.close()
            peer.current?.close()
            localStream.current?.getTracks().forEach(track => track.stop())
        }
    }, [peerId])

    const endCallHandler = () => {
        localStream.current?.getTracks().forEach(track => track.stop())
        peer.current?.close()
        peer.current = null
        socket.current?.close()
        socket.current = null
        endCall()
    }

    return (
        <div>
            <h2>🔊 Звонок с пользователем {peerId}</h2>
            <button onClick={endCallHandler} style={{ marginTop: '10px', backgroundColor: '#e74c3c', color: 'white' }}>
                🔚 Завершить звонок
            </button>
        </div>
    )
}
