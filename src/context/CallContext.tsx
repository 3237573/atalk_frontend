import {createContext, useContext, useState} from 'react'

type SignalMessage = {
    type: 'offer' | 'answer' | 'ice' | 'end'
    offer?: RTCSessionDescriptionInit
    answer?: RTCSessionDescriptionInit
    candidate?: RTCIceCandidateInit
    to: string
    from: string
}

type CallContextType = {
    isCallActive: boolean
    peerId: string | null
    incomingOffer: RTCSessionDescriptionInit | null
    fromUserId: string | null
    isIncoming: boolean
    startCall: (peerId: string) => void
    receiveOffer: (msg: SignalMessage) => void
    acceptCall: () => void
    declineCall: () => void
    endCall: () => void
}

export const CallContext = createContext<CallContextType | undefined>(undefined)

export const CallProvider = ({children}: { children: React.ReactNode }) => {
    const [isCallActive, setIsCallActive] = useState(false)
    const [peerId, setPeerId] = useState<string | null>(null)
    const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null)
    const [fromUserId, setFromUserId] = useState<string | null>(null)
    const [isIncoming, setIsIncoming] = useState(false)
    const startCall = (id: string, incoming = false) => {
        setPeerId(id)
        setIsIncoming(incoming)
        setIsCallActive(true)
    }

    const receiveOffer = (msg: SignalMessage) => {
        setPeerId(msg.from)
        setIncomingOffer(msg.offer || null)
        setFromUserId(msg.from)
        setIsIncoming(true)
        setIsCallActive(true)
    }

    const acceptCall = () => {
        console.log('✅ Звонок принят')
        // Здесь можно инициировать VoiceCall или WebRTC
    }

    const declineCall = () => {
        console.log('❌ Звонок отклонён')
        endCall()
    }

    const endCall = () => {
        setPeerId(null)
        setIncomingOffer(null)
        setFromUserId(null)
        setIsIncoming(false)
        setIsCallActive(false)
    }

    return (
        <CallContext.Provider value={{isCallActive, isIncoming, peerId, incomingOffer, fromUserId, startCall, receiveOffer, acceptCall, declineCall, endCall}}>
            {children}
        </CallContext.Provider>
    )
}

export const useCall = () => {
    const context = useContext(CallContext)
    if (!context) throw new Error('useCall must be used within a CallProvider')
    return context
}
