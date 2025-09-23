import { useState } from 'react'
import UserList from './UserList'
import ChatPanel from './ChatPanel'
import VoiceCall from './VoiceCall'
import { useCall } from '../hooks/useCall'

export default function ChatWithCall({ currentUserId }: { currentUserId: string }) {
    const { isCallActive, peerId } = useCall()
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    return (
        <div className="chat-call-container">
            <UserList currentUserId={currentUserId} onSelect={setSelectedUserId} />

            {selectedUserId && !isCallActive &&(
                <ChatPanel
                    currentUserId={currentUserId}
                    receiverId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}

            {isCallActive && peerId && (
                <VoiceCall peerId={peerId} />
            )}
        </div>
    )
}
