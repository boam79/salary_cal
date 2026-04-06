/**
 * Deep link/share helpers for calculator screens
 * - Restore screen/input state from URL query
 * - Keep URL query in sync
 * - Build/copy share URL
 */

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
  const params = new URLSearchParams();
  Object.entries(paramsObj || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') {
      params.set(k, String(v));
    }
  });
  const query = params.toString();
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
  params.set('screen', screenId);
  Object.entries(state || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || String(v) === '') {
      params.delete(k);
      return;
    }
    params.set(k, String(v));
  });
  next.search = params.toString();
  window.history.replaceState({}, '', `${next.pathname}${next.search}`);
}

export function getShareStateFromUrl(screenId) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('screen') !== screenId) return null;
  const state = {};
  params.forEach((v, k) => {
    if (k !== 'screen') state[k] = v;
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
        const params = typeof builder === 'function' ? builder() : {};
        const url = buildShareUrl({
          screen: document.querySelector('.screen.active')?.id || 'home-screen',
          ...(params || {}),
        });
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

