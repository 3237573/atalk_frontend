// src/layout/MainLayout.tsx
import { Outlet } from 'react-router-dom'
import CallSocketProvider from '../providers/CallSocketProvider'
import CallModal from '../components/CallModal'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function MainLayout() {
    return (
        <>
            {/* Подключение WebSocket для звонков */}
            <CallSocketProvider onSignal={(msg) => {
                // Можно передать в CallContext или показать уведомление
                console.log('📨 Входящий сигнал:', msg)
            }} />

            {/* Модалка звонка */}
            <CallModal />

            {/* Контент страницы */}
            <Outlet />

            {/* Уведомления */}
            <ToastContainer position="bottom-right" />
        </>
    )
}
