import { route } from 'preact-router'
import { useState, useEffect, useRef } from 'preact/hooks'

export default function HealthAgent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const chatInitialized = useRef(false)

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Initialize n8n chat for this page (different webhook)
  useEffect(() => {
    if (chatInitialized.current) return
    chatInitialized.current = true

    // Add n8n chat CSS
    if (!document.getElementById('n8n-health-agent-css')) {
      const link = document.createElement('link')
      link.id = 'n8n-health-agent-css'
      link.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }

    // Add n8n chat script for Health Agent
    const script = document.createElement('script')
    script.type = 'module'
    script.id = 'n8n-health-agent-script'
    script.textContent = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
      
      // Remove existing chat if any
      const existingChat = document.querySelector('.n8n-chat');
      if (existingChat) existingChat.remove();
      
      createChat({
        webhookUrl: 'https://barmaja.app.n8n.cloud/webhook/77847d52-c125-4a6c-8bc2-cad82dac0687/chat',
        mode: 'fullscreen',
        target: '#health-agent-chat',
        chatInputPlaceholder: 'Ask me about your health...',
        chatWindowTitle: '🤖 Health Agent',
        showWelcomeScreen: true,
        initialMessages: [
          'Hi! I am your Health Agent 🏥',
          'I can help you with health questions, symptoms, medications, and more.',
          'How can I assist you today?'
        ]
      });
    `
    document.body.appendChild(script)

    return () => {
      // Cleanup on unmount
      const scriptEl = document.getElementById('n8n-health-agent-script')
      if (scriptEl) scriptEl.remove()
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDark
    setIsDark(newMode)
    localStorage.setItem('darkMode', newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', path: '/patient/dashboard' },
    { icon: '📅', label: 'Appointments', path: '/patient/appointments' },
    { icon: '🏥', label: 'Hospitals', path: '/patient/hospitals' },
    { icon: '📋', label: 'Health Records', path: '/patient/reports' },
    { icon: '👥', label: 'Community', path: '/patient/community' },
    { icon: '🤖', label: 'Health Agent', path: '/patient/health-agent', active: true },
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
          <div className="h-full px-3 py-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-3">
              <div className="text-3xl">🏥</div>
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400">SwasthLink</h2>
            </div>

            {/* Menu Items */}
            <nav className="space-y-1">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => route(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Emergency Button */}
            <div className="mt-auto pt-6">
              <button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 font-medium transition-colors">
                <span className="text-xl">🚨</span>
                <span className="text-sm">Emergency: 108</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:ml-64 h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🤖 Health Agent</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ask me anything about your health</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {isDark ? '☀️' : '🌙'}
                  </button>
                  <button
                    onClick={() => route('/patient/dashboard')}
                    className="flex items-center gap-2 bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Chat Container - Full height */}
          <div id="health-agent-chat" className="flex-1 bg-white dark:bg-gray-800" />
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          ></div>
        )}
      </div>
    </div>
  )
}
