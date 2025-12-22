import { render } from 'preact'
import { App } from './app.jsx'
import './index.css'

// Providers
import { AuthProvider } from './contexts/AuthContext'
import { I18nProvider } from './contexts/I18nContext'
import { NetworkProvider } from './contexts/NetworkContext'
import { ThemeProvider } from './contexts/ThemeContext'

// PWA features disabled in development to avoid service worker errors
// Will be enabled in production build

console.log('SwasthLink Telemedicine Platform - Development Mode')

render(
	<AuthProvider>
		<I18nProvider>
			<NetworkProvider>
				<ThemeProvider>
					<App />
				</ThemeProvider>
			</NetworkProvider>
		</I18nProvider>
	</AuthProvider>,
	document.getElementById('app')
)