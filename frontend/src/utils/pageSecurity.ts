import { reportSecurityEvent, sanitizeUrlTokens } from './securityGuard';

type PageProfile = {
    title: string;
    sensitive: boolean;
    noIndex: boolean;
};

const APP_NAME = 'Expense Tracker';

function ensureMeta(name: string): HTMLMetaElement {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
    }
    return meta;
}

function getPageProfile(pathname: string): PageProfile {
    if (pathname.startsWith('/admin')) {
        return {
            title: `Admin Console | ${APP_NAME}`,
            sensitive: true,
            noIndex: true,
        };
    }

    if (pathname.startsWith('/user/login') || pathname.startsWith('/user/register') || pathname.startsWith('/user/forgot-password') || pathname.startsWith('/user/reset-password') || pathname.startsWith('/auth/2fa')) {
        return {
            title: `Secure Access | ${APP_NAME}`,
            sensitive: true,
            noIndex: true,
        };
    }

    if (pathname.startsWith('/user/settings')) {
        return {
            title: `User Settings | ${APP_NAME}`,
            sensitive: true,
            noIndex: true,
        };
    }

    if (pathname === '/privacy-policy') {
        return {
            title: `Privacy Policy | ${APP_NAME}`,
            sensitive: false,
            noIndex: false,
        };
    }

    if (pathname === '/terms-of-service') {
        return {
            title: `Terms of Service | ${APP_NAME}`,
            sensitive: false,
            noIndex: false,
        };
    }

    if (pathname === '/') {
        return {
            title: `${APP_NAME} | Smart Personal Finance`,
            sensitive: false,
            noIndex: false,
        };
    }

    if (pathname.startsWith('/verify-email')) {
        return {
            title: `Email Verification | ${APP_NAME}`,
            sensitive: true,
            noIndex: true,
        };
    }

    return {
        title: `Secure Page | ${APP_NAME}`,
        sensitive: false,
        noIndex: true,
    };
}

function hardenExternalLinks() {
    const links = document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]');
    links.forEach((link) => {
        const rel = link.getAttribute('rel') ?? '';
        if (!/noopener/i.test(rel) || !/noreferrer/i.test(rel)) {
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

function updateMetaPolicies(noIndex: boolean) {
    const robots = ensureMeta('robots');
    robots.content = noIndex ? 'noindex,nofollow,noarchive' : 'index,follow,max-image-preview:large';

    const referrer = ensureMeta('referrer');
    referrer.content = 'strict-origin-when-cross-origin';
}

export function applyPageSecurity(pathname: string, options: { report?: boolean } = {}) {
    const { report = true } = options;

    sanitizeUrlTokens();

    const profile = getPageProfile(pathname);
    document.title = profile.title;

    document.body.dataset.securityZone = profile.sensitive ? 'sensitive' : 'standard';
    updateMetaPolicies(profile.noIndex);
    hardenExternalLinks();

    if (report) {
        reportSecurityEvent('page_security_applied', pathname);
    }
}