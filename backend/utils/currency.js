/**
 * Currency conversion helpers for AED ↔ fils (smallest unit, 1 AED = 100 fils).
 *
 * Centralised here so rounding logic can never drift between callers.
 * Stripe expects amounts in the smallest currency unit (fils for AED).
 */

/**
 * Convert an AED amount to fils for use with the Stripe API.
 * @param {number} amount - Amount in AED
 * @returns {number} Amount in fils (integer)
 */
export const aedToFils = (amount) => Math.round(Number(amount) * 100);

/**
 * Convert a fils amount back to AED.
 * @param {number} fils - Amount in fils (integer)
 * @returns {number} Amount in AED
 */
export const filsToAed = (fils) => Number(fils) / 100;
