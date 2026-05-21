import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SystemProvisionProps {
    children: React.ReactNode;
    accessTiers?: string[];
}

const SystemProvision: React.FC<SystemProvisionProps> = ({ children, accessTiers }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (accessTiers && user && !accessTiers.includes(user.role)) {
        // User doesn't have required access tier
        console.warn('[System Sync] Provisioning mismatch. User role:', user.role, 'Required tiers:', accessTiers);
        
        if (location.pathname.startsWith('/admin')) {
            // Non-admin user trying to access admin page - redirect to user dashboard
            return <Navigate to="/user/dashboard" state={{ from: location }} replace />;
        }
        // Other mismatch - route based on user role
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
    }

    return <>{children}</>;
};

export default SystemProvision;
