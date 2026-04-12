/**
 * Deep link/share helpers for calculator screens
 * - Restore screen/input state from URL query
 * - Keep URL query in sync
 * - Build/copy share URL
 * - qSchema=1: allowlist + length limits (share URL safety)
 */

export const SHARE_SCHEMA_VERSION = 1;
const MAX_TOTAL_QUERY_CHARS = 2048;
const MAX_PARAM_VALUE_LEN = 256;

/** Keys allowed in share URLs (flat). `screen` is always allowed. */
const ALLOWED_SHARE_KEYS = new Set([
  'screen',
  'qSchema',
  'tab',
  'salaryType',
  'annualSalary',
  'workHours',
  'hourlyWage',
  'salaryDetailEnabled',
  'salaryDependents',
  'salaryNonTaxable',
  'inheritanceAmount',
  'giftAmount',
  'giftRelation',
  'loanAmount',
  'interestRate',
  'loanPeriod',
  'repaymentType',
  'housePrice',
  'ownFunds',
  'housingAnnualIncome',
  'housingInterestRate',
  'housingLoanPeriod',
  'housingRepaymentType',
]);

function sanitizeParamValue(raw) {
  if (raw === undefined || raw === null) return '';
  let s = String(raw).trim();
  s = s.replace(/[\r\n\t]/g, ' ');
  if (s.length > MAX_PARAM_VALUE_LEN) s = s.slice(0, MAX_PARAM_VALUE_LEN);
  return s;
}

/**
 * Flatten nested share state objects for URL (one level of nesting: financial/housing).
 */
export function flattenShareStateForUrl(obj) {
  const out = {};
  if (!obj || typeof obj !== 'object') return out;

  const mapNestedKey = (parent, innerKey) => {
    if (parent === 'housing') {
      if (innerKey === 'annualIncome') return 'housingAnnualIncome';
      if (innerKey === 'interestRate') return 'housingInterestRate';
      if (innerKey === 'loanPeriod') return 'housingLoanPeriod';
      if (innerKey === 'repaymentType') return 'housingRepaymentType';
    }
    return innerKey;
  };

  Object.entries(obj).forEach(([k, v]) => {
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.entries(v).forEach(([k2, v2]) => {
        const key = mapNestedKey(k, k2);
        if (ALLOWED_SHARE_KEYS.has(key)) {
          const sv = sanitizeParamValue(v2);
          if (sv !== '') out[key] = sv;
        }
      });
      return;
    }
    if (ALLOWED_SHARE_KEYS.has(k)) {
      const sv = sanitizeParamValue(v);
      if (sv !== '') out[k] = sv;
    }
  });
  return out;
}

function safeSetValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = value ?? '';
}

function clickTabButton(screenId, tabName) {
  const btn = document.querySelector(`#${screenId} .tab-btn[data-tab="${tabName}"]`);
  if (btn) btn.click();
}

function clickRepaymentTab(menuId, value) {
  const btn = document.querySelector(`#${menuId} .tab-button[data-value="${value}"]`);
  if (btn) btn.click();
}

function applyStateForScreen(screen, params) {
  if (screen === 'salary-screen') {
    const salaryType = params.get('salaryType');
    if (salaryType === 'annual' || salaryType === 'monthly') {
      const radio = document.querySelector(`input[name="salary-type"][value="${salaryType}"]`);
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
      }
    }
    safeSetValue('annual-salary', params.get('annualSalary'));
    safeSetValue('work-hours', params.get('workHours'));
    safeSetValue('hourly-wage', params.get('hourlyWage'));

    const detailEnabled = params.get('salaryDetailEnabled');
    const detailCb = document.getElementById('salary-detail-enabled');
    if (detailCb && (detailEnabled === '1' || detailEnabled === 'true')) {
      detailCb.checked = true;
      detailCb.dispatchEvent(new Event('change'));
    }
    safeSetValue('salary-dependents', params.get('salaryDependents'));
    safeSetValue('salary-non-taxable', params.get('salaryNonTaxable'));
    return true;
  }

  if (screen === 'tax-screen') {
    const tab = params.get('tab');
    if (tab === 'inheritance' || tab === 'gift') {
      clickTabButton('tax-screen', tab);
    }
    safeSetValue('inheritance-amount', params.get('inheritanceAmount'));
    safeSetValue('gift-amount', params.get('giftAmount'));
    const relation = params.get('giftRelation');
    if (relation) safeSetValue('gift-relation', relation);
    return true;
  }

  if (screen === 'loan-screen') {
    const tab = params.get('tab');
    if (tab === 'financial-loan' || tab === 'housing-loan') {
      clickTabButton('loan-screen', tab);
    }

    safeSetValue('loan-amount', params.get('loanAmount'));
    safeSetValue('interest-rate', params.get('interestRate'));
    safeSetValue('loan-period', params.get('loanPeriod'));
    const repaymentType = params.get('repaymentType');
    if (repaymentType) {
      safeSetValue('repayment-type', repaymentType);
      clickRepaymentTab('repayment-type-tabs', repaymentType);
    }

    safeSetValue('house-price', params.get('housePrice'));
    safeSetValue('own-funds', params.get('ownFunds'));
    safeSetValue('housing-annual-income', params.get('housingAnnualIncome'));
    safeSetValue('housing-interest-rate', params.get('housingInterestRate'));
    safeSetValue('housing-loan-period', params.get('housingLoanPeriod'));
    const housingRepaymentType = params.get('housingRepaymentType');
    if (housingRepaymentType) {
      safeSetValue('housing-repayment-type', housingRepaymentType);
      clickRepaymentTab('housing-repayment-type-tabs', housingRepaymentType);
    }
    return true;
  }

  return true;
}

export function restoreStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const screen = params.get('screen');
  if (!screen || !window.navigationManager) return false;

  const navigated = window.navigationManager.navigateTo(screen);
  if (!navigated) return false;
  return applyStateForScreen(screen, params);
}

let initialDeepLinkApplied = false;

export function restoreDeepLinkOnInit() {
  if (initialDeepLinkApplied) return false;
  initialDeepLinkApplied = true;
  return restoreStateFromUrl();
}

export function scheduleDeepLinkApplyForScreen(screenId) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('screen') !== screenId) return;
  // Delay until the target screen DOM/tab state is fully activated.
  setTimeout(() => {
    applyStateForScreen(screenId, params);
  }, 0);
}

export function buildShareUrl(paramsObj) {
  const flat =
    paramsObj && typeof paramsObj === 'object' && !Array.isArray(paramsObj)
      ? flattenShareStateForUrl(paramsObj)
      : {};

  const params = new URLSearchParams();
  params.set('qSchema', String(SHARE_SCHEMA_VERSION));

  Object.entries(flat).forEach(([k, v]) => {
    if (!ALLOWED_SHARE_KEYS.has(k)) return;
    const sv = sanitizeParamValue(v);
    if (sv !== '') params.set(k, sv);
  });

  let query = params.toString();
  if (query.length > MAX_TOTAL_QUERY_CHARS) {
    const screen = params.get('screen') || 'home-screen';
    const minimal = new URLSearchParams();
    minimal.set('qSchema', String(SHARE_SCHEMA_VERSION));
    minimal.set('screen', sanitizeParamValue(screen));
    query = minimal.toString();
  }

  return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`;
}

export async function copyTextToClipboard(text) {
  if (!text) return false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback below
    }
  }
  try {
    window.prompt('아래 텍스트를 복사하세요:', text);
    return true;
  } catch {
    return false;
  }
}

export async function copyShareUrl(paramsObj) {
  const url = buildShareUrl(paramsObj);
  await copyTextToClipboard(url);
  return url;
}

export function updateShareUrl(screenId, state = {}) {
  const next = new URL(window.location.href);
  const params = next.searchParams;

  const merged = { ...(state || {}), screen: screenId };
  const flat = flattenShareStateForUrl(merged);

  const keysToClear = new Set(Array.from(params.keys()));
  keysToClear.forEach((k) => params.delete(k));

  params.set('screen', sanitizeParamValue(screenId));
  params.set('qSchema', String(SHARE_SCHEMA_VERSION));

  Object.entries(flat).forEach(([k, v]) => {
    if (k === 'screen') return;
    if (!ALLOWED_SHARE_KEYS.has(k)) return;
    const sv = sanitizeParamValue(v);
    if (sv !== '') params.set(k, sv);
  });

  let search = params.toString();
  if (search.length > MAX_TOTAL_QUERY_CHARS) {
    params.forEach((_, k) => params.delete(k));
    params.set('screen', sanitizeParamValue(screenId));
    params.set('qSchema', String(SHARE_SCHEMA_VERSION));
    search = params.toString();
  }

  next.search = search ? `?${search}` : '';
  window.history.replaceState({}, '', `${next.pathname}${next.search}`);
}

export function getShareStateFromUrl(screenId) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('screen') !== screenId) return null;
  const state = {};
  params.forEach((v, k) => {
    if (k === 'screen' || k === 'qSchema') return;
    if (!ALLOWED_SHARE_KEYS.has(k)) return;
    state[k] = sanitizeParamValue(v);
  });
  return state;
}

export function setupShareCopyButtons(mapping) {
  if (!mapping || typeof mapping !== 'object') return;
  Object.entries(mapping).forEach(([selector, builder]) => {
    document.querySelectorAll(selector).forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.addEventListener('click', async () => {
        const original = btn.textContent;
        const raw = typeof builder === 'function' ? builder() : {};
        const flat =
          raw && typeof raw === 'object' && !Array.isArray(raw)
            ? flattenShareStateForUrl(raw)
            : {};
        const screen =
          document.querySelector('.screen.active')?.id || flat.screen || 'home-screen';
        const url = buildShareUrl({ ...flat, screen });
        const ok = await copyTextToClipboard(url);
        btn.textContent = ok ? '복사됨!' : '복사 실패';
        setTimeout(() => {
          btn.textContent = original;
        }, 1200);
      });
      btn.dataset.bound = 'true';
    });
  });
}

export function updateShareButtons() {
  // Legacy compatibility no-op hook.
  // Existing calculators call this after results are rendered.
}

export function setupSummaryCopyButtons(mapping) {
  if (!mapping || typeof mapping !== 'object') return;
  Object.entries(mapping).forEach(([selector, builder]) => {
    document.querySelectorAll(selector).forEach((btn) => {
      if (btn.dataset.summaryBound) return;
      btn.addEventListener('click', async () => {
        const original = btn.textContent;
        const text = typeof builder === 'function' ? builder() : '';
        const ok = await copyTextToClipboard(text || '');
        btn.textContent = ok ? '복사됨!' : '복사 실패';
        setTimeout(() => {
          btn.textContent = original;
        }, 1200);
      });
      btn.dataset.summaryBound = 'true';
    });
  });
}
