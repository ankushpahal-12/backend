import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initSecurityGuard } from './utils/securityGuard'
import { AppSecuritySetup } from '../FRONTEND_SECURITY_INTEGRATION.tsx'
import { initializeCSRFToken } from './utils/api'

// ── Security layer (React-aware, runs after security.js pre-boot) ──
initSecurityGuard();

// ── Initialize CSRF token to prevent 429 rate limiting on first requests ──
initializeCSRFToken().catch(err => console.warn('CSRF init warning:', err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppSecuritySetup>
      <App />
    </AppSecuritySetup>
  </StrictMode>,
)
