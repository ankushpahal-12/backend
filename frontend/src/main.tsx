import App from './App.tsx'
import { StrictMode} from 'react'
import React from 'react'
import { createRoot} from 'react-dom/client'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ENV } from './config/env'
import { initSecurityGuard } from './utils/securityGuard'
import { AppSecuritySetup } from '../FRONTEND_SECURITY_INTEGRATION.tsx'
import { initializeCSRFToken } from './utils/api'
import { initMonitoring } from './features/support_chatBot/monitoring/sessionManager'
import {TooltipProvider}from "@/components/ui/tooltip"

// ── Expose API configuration to pre-React security scripts ──
// security.js and advanced-protection.js (loaded in index.html head) check these globals
// to determine where to send security events. This must happen early in React initialization.
// 
// For Vercel deployments with separate frontend/backend:
// - Set VITE_API_URL env var to your backend URL (e.g., https://api.example.com/api)
// - Frontend will automatically expose it to security scripts
if (ENV.apiUrl) {
    window.__API_BASE__ = ENV.apiUrl.replace('/api', '');
    window.__VITE_API_URL = ENV.apiUrl;
}

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
