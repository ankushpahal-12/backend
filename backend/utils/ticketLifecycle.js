// ─── Ticket Status Lifecycle Rules ──────────────────────────────────────────
//
//   OPEN → IN_PROGRESS
//   IN_PROGRESS → WAITING_FOR_USER | RESOLVED
//   WAITING_FOR_USER → IN_PROGRESS
//   RESOLVED → CLOSED
//   CLOSED → (terminal — no further transitions)
//
// These rules are enforced at the service layer, not just the UI.
// Invalid transitions return a 400 error.

const TRANSITIONS = {
    OPEN: ['IN_PROGRESS'],
    IN_PROGRESS: ['WAITING_FOR_USER', 'RESOLVED'],
    WAITING_FOR_USER: ['IN_PROGRESS'],
    RESOLVED: ['CLOSED'],
    CLOSED: [],
};

/**
 * Returns true if transitioning from `from` → `to` is a valid lifecycle move.
 * @param {string} from - Current ticket status
 * @param {string} to   - Desired new status
 * @returns {boolean}
 */
export const isValidTransition = (from, to) => {
    const allowed = TRANSITIONS[from];
    if (!allowed) return false;
    return allowed.includes(to);
};

/**
 * Returns the list of statuses a ticket can move to from its current status.
 * Used to build UI dropdowns and disable invalid buttons.
 * @param {string} currentStatus
 * @returns {string[]}
 */
export const getAllowedTransitions = (currentStatus) => {
    return TRANSITIONS[currentStatus] || [];
};

/**
 * Human-readable labels for status values.
 */
export const STATUS_LABELS = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    WAITING_FOR_USER: 'Waiting for User',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
};

export const ALL_STATUSES = Object.keys(TRANSITIONS);
