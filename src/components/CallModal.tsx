import {useCall} from '../context/CallContext'
import VoiceCall from './VoiceCall'

export default function CallModal() {
    const {isCallActive, peerId, incomingOffer, acceptCall, declineCall} = useCall()

    if (!isCallActive || !peerId) return null

    if (incomingOffer) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>📞 Вам звонит пользователь {peerId}</h3>
                    <button onClick={acceptCall}>✅ Принять</button>
                    <button onClick={declineCall}>❌ Отклонить</button>
                </div>
            </div>
        )
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <VoiceCall peerId={peerId}/>
            </div>
        </div>
    )
}
