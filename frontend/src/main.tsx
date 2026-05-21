import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initSecurityGuard } from './utils/securityGuard'
import { AppSecuritySetup } from '../FRONTEND_SECURITY_INTEGRATION.tsx'
import { initializeCSRFToken } from './utils/api'
import { initMonitoring } from './features/support_chatBot/monitoring/sessionManager'

// ── Security layer (React-aware, runs after security.js pre-boot) ──
initSecurityGuard();

// ── Initialize CSRF token to prevent 429 rate limiting on first requests ──
initializeCSRFToken().catch(err => console.warn('CSRF init warning:', err));

// ── Initialize client-side monitoring pipeline ──
// Captures console errors, API failures, runtime crashes, and user events.
// Logs stay local in sessionStorage until a support ticket is created.
initMonitoring();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppSecuritySetup>
      <App />
    </AppSecuritySetup>
  </StrictMode>,
)
