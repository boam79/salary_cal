/**
 * Validation domain logic (pure functions)
 * - No DOM access
 * - No alert
 * - No global state
 */

function isBlank(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}

/**
 * Pure validation: returns structured result instead of alert/null.
 */
export function validateNumber(value, options = {}) {
  const {
    min = 0.01,
    max = Infinity,
    allowZero = false,
    isPercent = false,
  } = options;

  if (isBlank(value)) return { ok: false, error: 'EMPTY' };

  const num = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(num)) return { ok: false, error: 'NOT_A_NUMBER' };
  if (num < 0) return { ok: false, error: 'NEGATIVE' };
  if (!allowZero && num === 0) return { ok: false, error: 'ZERO_NOT_ALLOWED' };
  if (!isPercent && num > 0 && num < min) return { ok: false, error: 'BELOW_MIN', meta: { min } };
  if (num > max) return { ok: false, error: 'ABOVE_MAX', meta: { max } };

  return { ok: true, value: num };
}

export function validateEmailFormat(email) {
  const s = String(email || '');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return { ok: emailRegex.test(s) };
}

export function validateKoreanPhoneFormat(phone) {
  const s = String(phone || '');
  const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
  return { ok: phoneRegex.test(s) };
}

// Backward-compatible exports for the browser wrapper (`js/utils/validation.js`)
// Keep these stable so that browser bundles don't fail to load.
export function getMinValueForUnit(defaultUnit) {
  // defaultUnit >= 1억(100,000,000) 입력은 최소 0.1(=1천만원)부터
  return defaultUnit >= 100_000_000 ? 0.1 : 0.01;
}

export function validateInputRaw(value, options = {}) {
  const r = validateNumber(value, options);
  if (!r.ok) {
    // Map to existing wrapper error keys (lowercase) to avoid UX regressions.
    const map = {
      EMPTY: 'empty',
      NOT_A_NUMBER: 'nan',
      NEGATIVE: 'negative',
      ZERO_NOT_ALLOWED: 'zero_not_allowed',
      BELOW_MIN: 'below_min',
      ABOVE_MAX: 'above_max',
    };
    return { ok: false, error: map[r.error] || 'invalid' };
  }
  return { ok: true, value: r.value };
}

export function validateEmail(email) {
  return validateEmailFormat(email).ok;
}

export function validatePhone(phone) {
  return validateKoreanPhoneFormat(phone).ok;
}

