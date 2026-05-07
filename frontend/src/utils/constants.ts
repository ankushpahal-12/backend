
export const EXPENSE_CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Housing & Rent',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Education',
    'Travel',
    'Insurance',
    'Subscriptions',
    'Gifts & Donations',
    'Personal Care',
    'Other',
] as const;

export const INCOME_CATEGORIES = [
    'Salary',
    'Freelance',
    'Investments',
    'Business',
    'Rental Income',
    'Refunds',
    'Other',
] as const;

// ── Pagination Defaults ───────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// ── Session / Auth ────────────────────────────────────────────────────
export const SESSION_WARNING_MS = 5 * 60 * 1000; // Warn 5 min before expiry
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_SECONDS = 600; // 10 minutes

// ── UI ────────────────────────────────────────────────────────────────
export const ANIMATION_DURATION = 400; // ms — matches CSS transition timing
export const DEBOUNCE_MS = 300;
