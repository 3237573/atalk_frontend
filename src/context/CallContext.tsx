import { createContext, useState } from 'react'

type CallContextType = {
    isCallActive: boolean
    peerId: string | null
    startCall: (peerId: string) => void
    endCall: () => void
}

export const CallContext = createContext<CallContextType | undefined>(undefined)

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
    const [isCallActive, setIsCallActive] = useState(false)
    const [peerId, setPeerId] = useState<string | null>(null)

    const startCall = (id: string) => {
        setPeerId(id)
        setIsCallActive(true)
    }

    const endCall = () => {
        setPeerId(null)
        setIsCallActive(false)
    }

    return (
        <CallContext.Provider value={{ isCallActive, peerId, startCall, endCall }}>
            {children}
        </CallContext.Provider>
    )
}
