import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom'
import {AuthProvider} from "./context/AuthProvider.tsx";
import {CallProvider} from './context/CallContext'
import PrivateRoute from './routes/PrivateRoute'
import TaskPage from './pages/TaskPage'
import FinancePage from './pages/FinancePage'
import ChatPage from './pages/ChatPage'
import LoginPage from './pages/LoginPage'
import VoiceCall from './components/VoiceCall'
import {useCall} from './hooks/useCall'
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><TaskPage /></PrivateRoute>} />
            <Route path="/finance" element={<PrivateRoute><FinancePage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

function CallModal() {
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

// function NotificationSocket() {
//     useWebSocketManager('notify', {
//         onMessage: (data) => {
//             if (data.type === 'ALERT') {
//                 toast(data.message)
//             }
//         }
//     })
//
//     return null
// }

export default function App() {
    return (
        <AuthProvider>
            <CallProvider>
                <Router>
                    <AppRoutes />
                    <CallModal />
                    {/*<NotificationSocket />*/}
                    <ToastContainer position="bottom-right" />
                </Router>
            </CallProvider>
        </AuthProvider>
    )
}
