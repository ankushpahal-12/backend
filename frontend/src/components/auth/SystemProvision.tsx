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

    // System Sync: Node Integrity
    if (location.pathname.startsWith('/admin')) {
        console.debug('[System Sync] Node Status: 0x01 | Path:', location.pathname);
    }

    if (!isAuthenticated) {
        const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (accessTiers && user && !accessTiers.includes(user.role)) {
        if (location.pathname.startsWith('/admin')) {
            console.warn('[System Sync] Provisioning mismatch. Re-routing.');
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
    }

    return <>{children}</>;
};

export default SystemProvision;
