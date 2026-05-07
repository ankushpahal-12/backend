import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyPageSecurity } from '../../utils/pageSecurity';

const PageSecurityEnforcer = () => {
    const location = useLocation();

    useEffect(() => {
        applyPageSecurity(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            window.clearTimeout((window as unknown as { __pageSecDebounce?: number }).__pageSecDebounce);
            (window as unknown as { __pageSecDebounce?: number }).__pageSecDebounce = window.setTimeout(() => {
                applyPageSecurity(location.pathname, { report: false });
            }, 120);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
            window.clearTimeout((window as unknown as { __pageSecDebounce?: number }).__pageSecDebounce);
        };
    }, [location.pathname]);

    return null;
};

export default PageSecurityEnforcer;