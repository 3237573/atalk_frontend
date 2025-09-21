import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from '../pages/LoginPage.tsx'
import ChatPage from '../pages/ChatPage.tsx'
import TaskPage from '../pages/TaskPage.tsx'
import FinancePage from '../pages/FinancePage.tsx'

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/tasks" element={<TaskPage />} />
                <Route path="/finance" element={<FinancePage />} />
            </Routes>
        </Router>
    )
}
