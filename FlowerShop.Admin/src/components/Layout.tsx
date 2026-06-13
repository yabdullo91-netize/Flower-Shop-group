import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ToastContainer } from './ui'

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f1f3f9' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  )
}
