import { useParams } from 'react-router-dom'
import VoiceCall from './VoiceCall'

export default function VoiceCallWrapper() {
    const { peerId } = useParams()
    console.log("peerId: ", peerId)
    if (!peerId) return <div>❌ Нет пользователя для звонка</div>
    return <VoiceCall peerId={peerId} />
}
