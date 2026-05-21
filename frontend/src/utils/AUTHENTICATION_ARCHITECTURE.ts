

import { useState, useEffect } from 'react';

// Mock types/variables for documentation purposes
declare const jwt: any;
declare const user: any;
declare const SecureStorage: any;
declare const process: any;

interface User {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}


async function login(req: any, res: any) {
  // ... validation ...

  // Generate JWT
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie('auth_token', token, {
    httpOnly: true,           // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',       // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',                // Available to entire app
    domain: process.env.COOKIE_DOMAIN, // Optional: restrict to domain
  });

  // Return success (don't send token in body)
  res.json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
}

async function logout(req: any, res: any) {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.json({ success: true, message: 'Logged out' });
}

/**
 * Middleware to verify token from cookie:
 */
function verifyTokenFromCookie(req: any, res: any, next: any) {
  // Token is in req.cookies.auth_token (set by cookie-parser)
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'No authentication token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ============================================================
// FRONTEND: Authentication (Corrected)
// ============================================================

/**
 * Frontend Hook - useAuthentication (Corrected)
 */
export const useAuthentication = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // ✅ IMPORTANT: Send HTTP-only cookie
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include', // ✅ Receive HTTP-only cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // ✅ Send cookie for logout
      });

      setUser(null);
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { user, loading, error, login, logout, checkAuth };
};

/**
 * API Call Helper (Corrected)
 */
export const secureAPI = {
  async call(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // ✅ Always include cookies
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token likely expired → redirect to login
          window.location.href = '/login';
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[API] Error:', error);
      throw error;
    }
  },

  async get(url: string) {
    return this.call(url, { method: 'GET' });
  },

  async post(url: string, data: unknown) {
    return this.call(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put(url: string, data: unknown) {
    return this.call(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(url: string) {
    return this.call(url, { method: 'DELETE' });
  },
};

// ============================================================
// FRONTEND: What SecureStorage SHOULD Store
// ============================================================

/**
 * ✅ CORRECT Use Cases for SecureStorage:
 */

// User preferences (non-sensitive)
SecureStorage.setItem('theme', 'dark');
SecureStorage.setItem('language', 'en');
SecureStorage.setItem('sidebarCollapsed', true);

// Cached data (non-sensitive)
SecureStorage.setItem('userPreferences', {
  currency: 'USD',
  timezone: 'UTC',
  notifications: true,
}, 60); // Expires in 60 minutes

// Feature flags
SecureStorage.setItem('features', {
  betaAccess: true,
  darkMode: true,
}, 1440); // 24 hours

// Temporary UI state
SecureStorage.setItem('lastViewedTransaction', '123abc', 30); // 30 min

/**
 * ❌ NEVER store in SecureStorage:
 */

// ❌ WRONG - Don't store tokens
// SecureStorage.setItem('authToken', token);

// ❌ WRONG - Don't store refresh tokens
// SecureStorage.setItem('refreshToken', refreshToken);

// ❌ WRONG - Don't store API keys
// SecureStorage.setItem('apiKey', key);

// ❌ WRONG - Don't store private keys
// SecureStorage.setItem('privateKey', privateKey);

// ✅ Instead: Use HTTP-only cookies (via backend)
// Backend sends cookie automatically

// ============================================================
// MIGRATION GUIDE: From Old to New
// ============================================================

/**
 * Step 1: Update Backend (app.js)
 * 
 * Add cookie-parser:
 * const cookieParser = require('cookie-parser');
 * app.use(cookieParser());
 * 
 * Add login controller that sets HTTP-only cookie
 * Add logout controller that clears cookie
 * Add middleware to verify token from cookie
 */

/**
 * Step 2: Update Frontend
 * 
 * Replace all manual token storage:
 * ❌ localStorage.setItem('token', token);
 * ✅ Backend sets HTTP-only cookie (automatic)
 * 
 * Update all API calls:
 * ❌ headers: { 'Authorization': `Bearer ${token}` }
 * ✅ credentials: 'include' (sends HTTP-only cookie)
 * 
 * Update authentication state:
 * ❌ token = localStorage.getItem('token');
 * ✅ const { user } = useAuthentication();
 */

/**
 * Step 3: Test
 * 
 * 1. Login and verify cookie is set
 *    DevTools → Application → Cookies
 *    Should see: auth_token with HttpOnly flag
 * 
 * 2. Try to read cookie in console
 *    console.log(document.cookie)
 *    Should NOT show auth_token (HttpOnly prevents this)
 * 
 * 3. Make API call
 *    fetch('/api/protected', { credentials: 'include' })
 *    Backend receives token from cookie automatically
 * 
 * 4. Logout
 *    Cookie should be deleted
 */

// ============================================================
// SECURITY BENEFITS OF THIS APPROACH
// ============================================================

/**
 * 1. XSS Protection
 *    • Attacker cannot steal token via XSS
 *    • HttpOnly prevents JavaScript access
 *    • Even if JS is compromised, token is safe
 * 
 * 2. CSRF Protection
 *    • SameSite=Strict prevents cross-site requests
 *    • Browser automatically enforces
 *    • No extra token handling needed
 * 
 * 3. No Key Exposure
 *    • Encryption key is NOT used for tokens
 *    • No secrets in frontend
 *    • Backend controls security
 * 
 * 4. Session Binding
 *    • Cookie tied to specific domain
 *    • Cookie tied to secure connection
 *    • Automatic expiry
 * 
 * 5. Server-Side Validation
 *    • Backend validates every request
 *    • Can revoke sessions immediately
 *    • Can detect anomalies
 * 
 * 6. Modern Browser Support
 *    • All modern browsers support HttpOnly
 *    • Works with SameSite restrictions
 *    • Automatic cookie management
 */

export {};
