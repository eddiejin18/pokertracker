/**
 * Blinds/stakes stored as two numeric parts: "smallBlind/bigBlind" (no currency symbols).
 * Accepts optional $ and whitespace; normalizes to plain numbers.
 */

const NUM_PART = /^\d+(?:\.\d+)?$/;

/**
 * @param {unknown} raw
 * @returns {string | null} normalized "left/right" or null if invalid/empty
 */
export function normalizeBlindsInput(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const parts = s.split('/');
  if (parts.length !== 2) return null;
  const left = parts[0].replace(/[$€£\s,]/g, '').trim();
  const right = parts[1].replace(/[$€£\s,]/g, '').trim();
  if (!NUM_PART.test(left) || !NUM_PART.test(right)) return null;
  return `${left}/${right}`;
}

export const BLINDS_INVALID_MESSAGE =
  'Blinds/stakes must be two numbers in the form #/# (e.g. 0.25/0.50 or 0.0002/5). Dollar signs are optional.';
