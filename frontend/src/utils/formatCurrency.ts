/**
 * Currency formatter — uses INR locale with symbol by default.
 * Can be extended with other locales via the `locale` and `currency` params.
 */
export const formatCurrency = (
    amount: number,
    locale: string = 'en-IN',
    currency: string = 'INR'
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Short formatter for dashboard stats (e.g., ₹4.2L, ₹1.8Cr)
 */
export const formatCompact = (amount: number): string => {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (abs >= 1_00_00_000) {
        return `${sign}₹${(abs / 1_00_00_000).toFixed(1)}Cr`;
    }
    if (abs >= 1_00_000) {
        return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`;
    }
    if (abs >= 1_000) {
        return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
    }
    return `${sign}₹${abs.toFixed(0)}`;
};
