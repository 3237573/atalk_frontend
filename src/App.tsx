// src/App.tsx
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { CallProvider } from './context/CallContext'
import PrivateRoute from './routes/PrivateRoute'
import TaskPage from './pages/TaskPage'
import FinancePage from './pages/FinancePage'
import ChatPage from './pages/ChatPage'
import LoginPage from './pages/LoginPage'
import MainLayout from './layout/MainLayout'

export default function App() {
    return (
        <AuthProvider>
            <CallProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                            <Route path="/chat" element={<ChatPage />} />
                            <Route path="/tasks" element={<TaskPage />} />
                            <Route path="/finance" element={<FinancePage />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </CallProvider>
        </AuthProvider>
    )
}
