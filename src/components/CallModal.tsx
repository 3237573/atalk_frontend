// src/components/CallModal.tsx
import VoiceCall from './VoiceCall'
import { useCall } from '../hooks/useCall'

export default function CallModal() {
    const { isCallActive, peerId } = useCall()

    if (!isCallActive || !peerId) return null

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <VoiceCall peerId={peerId} />
            </div>
        </div>
    )
}
