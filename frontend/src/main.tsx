import App from './App.tsx'
import { StrictMode} from 'react'
import React from 'react'
import { createRoot} from 'react-dom/client'
import ReactDOM from 'react-dom/client'
import './index.css'
import { initSecurityGuard } from './utils/securityGuard'
import { AppSecuritySetup } from '../FRONTEND_SECURITY_INTEGRATION.tsx'
import { initializeCSRFToken } from './utils/api'
import { initMonitoring } from './features/support_chatBot/monitoring/sessionManager'
import {TooltipProvider}from "@/components/ui/tooltip"
// ── Security layer (React-aware, runs after security.js pre-boot) ──

initSecurityGuard();

// ── Initialize CSRF token to prevent 429 rate limiting on first requests ──
initializeCSRFToken().catch(err => console.warn('CSRF init warning:', err));

// ── Initialize client-side monitoring pipeline ──
// Captures console errors, API failures, runtime crashes, and user events.
// Logs stay local in sessionStorage until a support ticket is created.
initMonitoring();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppSecuritySetup>
      <App />
    </AppSecuritySetup>
  </React.StrictMode>,
)
