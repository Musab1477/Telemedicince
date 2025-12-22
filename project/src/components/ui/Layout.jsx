import { useState } from 'preact/hooks'
import { NavBar } from './NavBar'
import { SideBar } from './SideBar'
import { useAuth } from '../../contexts/AuthContext'

export function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useAuth()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <NavBar 
        onMenuToggle={toggleSidebar} 
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex">
        {/* Sidebar - only show for authenticated users */}
        {user && (
          <SideBar 
            isOpen={isSidebarOpen} 
            onClose={closeSidebar}
          />
        )}

        {/* Main content */}
        <main className={`flex-1 ${user ? 'md:ml-0' : ''}`}>
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}