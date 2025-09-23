import { Outlet } from 'react-router-dom'
import CallSocketProvider from '../providers/CallSocketProvider'
import CallModal from '../components/CallModal'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function MainLayout() {
    return (
        <>
            <CallSocketProvider />
            <CallModal />
            <Outlet />
            <ToastContainer position="bottom-right" />
        </>
    )
}
