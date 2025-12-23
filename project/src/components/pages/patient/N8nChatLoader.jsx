import { useEffect, useRef } from 'react'
import { useAuth } from '../../../contexts/AuthContext'

export default function N8nChatLoader() {
  const { user, USER_ROLES } = useAuth()
  const hasInitialized = useRef(false)
  
  const isPatient = user && user.role === USER_ROLES.PATIENT

  useEffect(() => {
    if (!isPatient) return
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Add n8n chat CSS
    const link = document.createElement('link')
    link.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Add n8n chat script
    const script = document.createElement('script')
    script.type = 'module'
    script.textContent = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
      createChat({
        webhookUrl: 'https://outwave.app.n8n.cloud/webhook/77847d52-c125-4a6c-8bc2-cad82dac0687/chat',
        mode: 'window',
        chatInputPlaceholder: 'Ask me about health...',
        chatWindowTitle: 'Health Assistant',
        showWelcomeScreen: true
      });
    `
    document.body.appendChild(script)

    console.log('[N8n] Chat loaded for patient')

  }, [isPatient, user])

  return null
}
