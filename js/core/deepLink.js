/**
 * Deep link helpers for calculator screens
 * - Restore screen/input state from URL query
 * - Build/share URL for current calculator state
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

export function restoreStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const screen = params.get('screen');
  if (!screen || !window.navigationManager) return false;

  const navigated = window.navigationManager.navigateTo(screen);
  if (!navigated) return false;

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

export async function copyShareUrl(paramsObj) {
  const url = buildShareUrl(paramsObj);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return url;
  }
  window.prompt('아래 URL을 복사하세요:', url);
  return url;
}

