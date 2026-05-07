import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface GuestProvisionProps {
    children: React.ReactNode;
}

/**
 * GuestProvision blocks authenticated users from accessing authentication pages 
 * (Login, Register, Forgot Password). If a user is already logged in, it instantly 
 * routes them to their respective dashboard instead of showing the login screen.
 * 
 * It also enforces that a valid `sid` query parameter is present on login/register
 * routes. Without a session ID (obtained via POST /auth/init-session), the user
 * is redirected back to the landing page.
 */
const GuestProvision: React.FC<GuestProvisionProps> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const allowAuthenticatedSignup =
        location.pathname === '/user/register' && params.get('mode') === 'signup';

    if (isAuthenticated && user && !allowAuthenticatedSignup) {
        // Prevent logged-in users from accessing auth pages
        console.warn(`[System Provision] Authenticated user attempted to access guest route: ${location.pathname}. Re-routing.`);
        
        // Route admins to admin dashboard, standard users to user dashboard
        if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/user/dashboard" replace />; // Redirect to main dashboard
    }

    // Enforce session ID on login and register routes
    const requiresSid = ['/user/login', '/user/register'].includes(location.pathname);
    if (requiresSid) {
        const sid = params.get('sid');

        if (!sid) {
            console.warn(`[System Provision] No session ID found on ${location.pathname}. Redirecting to landing.`);
            return <Navigate to="/" replace />;
        }
    }

    // If not authenticated and has valid sid, allow them to see the auth page
    return <>{children}</>;
};

export default GuestProvision;
