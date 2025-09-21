import {useEffect, useRef} from 'react'
import {jwtDecode} from 'jwt-decode'
import {useCall} from "../hooks/useCall";

type SignalMessage = {
    type: 'offer' | 'answer' | 'ice'
    offer?: RTCSessionDescriptionInit
    answer?: RTCSessionDescriptionInit
    candidate?: RTCIceCandidateInit
    to: string
    from?: string
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
        console.log('🔧 VoiceCall монтирован для peerId:', peerId)
        console.log('🔐 Текущий пользователь:', currentUserId)

        // 1. Инициализация WebSocket
        socket.current = new WebSocket(`ws://localhost:8080/call/ws?token=${token}`)

        // 2. Создание peer-соединения
        peer.current = new RTCPeerConnection()
        console.log('📡 RTCPeerConnection создан')

        // 3. Получение аудио
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            console.log('🎙 Получен локальный аудиопоток')
            localStream.current = stream
            stream.getTracks().forEach(track => peer.current!.addTrack(track, stream))
        }).catch(err => {
            console.error('❌ Ошибка доступа к микрофону:', err)
        })

        // 4. ICE-кандидаты
        peer.current.onicecandidate = event => {
            if (event.candidate) {
                console.log('❄️ ICE-кандидат найден:', event.candidate)
                socket.current?.send(JSON.stringify({
                    type: 'ice',
                    candidate: event.candidate,
                    to: peerId,
                    from: currentUserId
                }))
            }
        }

        // 5. Получение удалённого аудио
        peer.current.ontrack = event => {
            console.log('🔈 Получен удалённый аудиотрек')
            const remoteAudio = new Audio()
            remoteAudio.srcObject = event.streams[0]
            remoteAudio.autoplay = true
            remoteAudio.play().catch(err => console.warn('🔇 Не удалось воспроизвести аудио:', err))
        }

        // 6. Обработка сигналинга
        socket.current.onmessage = async event => {
            const data: SignalMessage = JSON.parse(event.data)
            console.log('📨 Получено сообщение по WebSocket:', data)

            if (!peer.current) {
                console.warn('⚠️ peer-соединение уже закрыто — игнорируем сообщение:', data)
                return
            }

            try {
                if (data.type === 'offer') {
                    console.log('📞 Получен offer от:', data.from)
                    await peer.current!.setRemoteDescription(new RTCSessionDescription(data.offer!))
                    console.log('✅ Установлен remoteDescription')
                    const answer = await peer.current!.createAnswer()
                    await peer.current!.setLocalDescription(answer)
                    console.log('📤 Отправка answer')
                    socket.current!.send(JSON.stringify({
                        type: 'answer',
                        answer,
                        to: data.from!,
                        from: currentUserId
                    }))
                }

                if (data.type === 'answer') {
                    console.log('📞 Получен answer от:', data.from)
                    await peer.current!.setRemoteDescription(new RTCSessionDescription(data.answer!))
                    console.log('✅ Установлен remoteDescription от answer')
                }

                if (data.type === 'ice') {
                    console.log('❄️ Получен ICE-кандидат от:', data.from)
                    await peer.current!.addIceCandidate(new RTCIceCandidate(data.candidate!))
                    console.log('✅ ICE-кандидат добавлен')
                }
            } catch (err) {
                console.error('❌ Ошибка обработки сигналинга:', err)
            }
        }

        // 7. Инициатор звонка
        socket.current.onopen = async () => {
            console.log('✅ WebSocket соединение открыто')

            if (peerId !== currentUserId) {
                console.log('🚀 Инициация звонка к:', peerId)
                try {
                    const offer = await peer.current!.createOffer()
                    await peer.current!.setLocalDescription(offer)
                    console.log('📤 Отправка offer:', offer)
                    socket.current!.send(JSON.stringify({
                        type: 'offer',
                        offer,
                        to: peerId,
                        from: currentUserId
                    }))
                } catch (err) {
                    console.error('❌ Ошибка при создании offer:', err)
                }
            } else {
                console.log('⚠️ Самозвонок заблокирован')
            }
        }

        socket.current.onerror = err => {
            console.error('❌ WebSocket ошибка:', err)
            console.log('⚠️ Возможно, токен недействителен или сервер закрыл соединение')
        }

        socket.current.onclose = () => {
            console.warn('🔌 WebSocket соединение закрыто')
        }

        return () => {
            console.log('🧹 Очистка VoiceCall')
            socket.current?.close()
            peer.current?.close()
            localStream.current?.getTracks().forEach(track => track.stop())
        }
    }, [peerId])

    const endCallHandler = () => {
        console.log('🔚 Завершение звонка')
        // Отключить микрофон
        localStream.current?.getTracks().forEach(track => {
            console.log('🎙 Отключение трека:', track.kind)
            track.stop()
        })
        // Закрыть соединения
        peer.current?.close()
        peer.current = null
        socket.current?.close()
        socket.current = null
        endCall()
    }

    return (
        <div>
            <h2>🔊 Голосовой звонок с пользователем {peerId}</h2>
            <button onClick={endCallHandler} style={{ marginTop: '10px', backgroundColor: '#e74c3c', color: 'white' }}>
                🔚 Завершить звонок
            </button>
        </div>
    )
}
