/**
 * securityGuard.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * React-layer security integrations.
 * Import this ONCE at the very top of main.tsx (before App renders).
 *
 * Works in tandem with public/security.js which handles pre-React protections.
 * This module handles React-aware security features that need access to
 * the router, auth state, and component lifecycle.
 */

// ─── Type for the global security guard exposed by security.js ───────────────
declare global {
    interface Window {
        __secGuard?: {
            reportEvent: (type: string, detail: string) => void;
            activatePrintMask: () => void;
        };
        __nativeConsole?: {
            log: typeof console.log;
            error: typeof console.error;
            warn: typeof console.warn;
        };
    }
}

type StaleCallback = (hiddenMs: number) => void;
const staleCallbacks: StaleCallback[] = [];

export function onSessionStale(cb: StaleCallback): () => void {
    staleCallbacks.push(cb);
    return () => {
        const idx = staleCallbacks.indexOf(cb);
        if (idx !== -1) staleCallbacks.splice(idx, 1);
    };
}

document.addEventListener('sec:session_stale', (e: Event) => {
    const detail = (e as CustomEvent<{ hiddenMs: number }>).detail;
    staleCallbacks.forEach(cb => cb(detail.hiddenMs));
});

export function markSensitive(el: HTMLElement | null, blockClipboard = false) {
    if (!el) return;
    el.dataset.sensitive = blockClipboard ? 'block' : 'true';
}

export function unmarkSensitive(el: HTMLElement | null) {
    if (!el) return;
    delete el.dataset.sensitive;
}

export function reportSecurityEvent(type: string, detail = '') {
    window.__secGuard?.reportEvent(type, detail);
}

export function bindSecureInput(
    el: HTMLInputElement | HTMLTextAreaElement | null,
    options: { blockPaste?: boolean; blockCopy?: boolean; blockCut?: boolean } = {}
): () => void {
    if (!el) return () => { };

    const { blockPaste = true, blockCopy = true, blockCut = true } = options;

    const handler = (e: Event) => {
        e.preventDefault();
        reportSecurityEvent('clipboard_attempt', (e as ClipboardEvent).type || e.type);
    };

    if (blockPaste) el.addEventListener('paste', handler as EventListener);
    if (blockCopy)  el.addEventListener('copy', handler as EventListener);
    if (blockCut)   el.addEventListener('cut', handler as EventListener);

    markSensitive(el as HTMLElement);

    return () => {
        if (blockPaste) el.removeEventListener('paste', handler as EventListener);
        if (blockCopy)  el.removeEventListener('copy', handler as EventListener);
        if (blockCut)   el.removeEventListener('cut', handler as EventListener);
        unmarkSensitive(el as HTMLElement);
    };
}
export function pushAuthBarrier() {
    if (typeof history !== 'undefined') {
        history.pushState(null, '', location.href);
        window.addEventListener('popstate', () => {
            history.pushState(null, '', location.href);
        });
    }
}

const TOKEN_EXEMPT_PATHS = ['/verify-email'];
export function sanitizeUrlTokens() {
    const url = new URL(window.location.href);


    if (TOKEN_EXEMPT_PATHS.some(p => url.pathname === p || url.pathname.startsWith(p + '/'))) {
        return;
    }

    const dangerousParams = ['token', 'access_token', 'jwt', 'auth', 'key', 'secret', 'apiKey'];
    let changed = false;

    dangerousParams.forEach(param => {
        if (url.searchParams.has(param)) {
            url.searchParams.delete(param);
            changed = true;
            reportSecurityEvent('token_in_url', param);
        }
    });

    if (changed) {
        history.replaceState({}, '', url.toString());
    }
}


const SENSITIVE_STORAGE_KEYS = [
    'token', 'jwt', 'access_token', 'refresh_token',
    'password', 'secret', 'apiKey', 'api_key',
];

export function cleanSensitiveStorage() {
    SENSITIVE_STORAGE_KEYS.forEach(key => {
        if (localStorage.getItem(key) !== null) {
            localStorage.removeItem(key);
            reportSecurityEvent('storage_leak_cleaned', key);
        }
        if (sessionStorage.getItem(key) !== null) {
            sessionStorage.removeItem(key);
            reportSecurityEvent('storage_leak_cleaned_session', key);
        }
    });
}
export function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
export function obfuscateEmail(email: string): string {
    const [user, domain] = email.split('@');
    if (!domain) return escapeHtml(email);
    const [domainName, tld] = domain.split('.');
    return [
        '<span aria-hidden="true" style="unicode-bidi:bidi-override;direction:ltr">',
        escapeHtml(user),
        '<span>&#64;</span>',
        escapeHtml(domainName),
        '<span>&#46;</span>',
        escapeHtml(tld || ''),
        '</span>',
    ].join('');
}

export function initSecurityGuard() {
    sanitizeUrlTokens();

    cleanSensitiveStorage();

    const log = window.__nativeConsole?.log ?? console.log;
    log('[SEC] Security guard initialised at', new Date().toISOString());
}
