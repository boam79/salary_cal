/**
 * Loan domain logic (pure functions)
 * - No DOM access
 * - No global state
 *
 * Notes:
 * - Rates are decimal (e.g., 0.05 for 5% annual)
 * - Payments returned are not rounded; UI can format/round as needed.
 */

function isFiniteNumber(n) {
  return Number.isFinite(n);
}

export function computeLoanTerms({ principal, annualRatePercent, years }) {
  if (!isFiniteNumber(principal) || principal <= 0) return { ok: false, error: 'invalid_principal' };
  if (!isFiniteNumber(annualRatePercent) || annualRatePercent < 0 || annualRatePercent > 30) {
    return { ok: false, error: 'invalid_rate' };
  }
  if (!isFiniteNumber(years) || years <= 0 || years > 50) return { ok: false, error: 'invalid_years' };

  const monthlyRate = annualRatePercent / 100 / 12;
  const months = Math.round(years * 12);
  return { ok: true, monthlyRate, months };
}

export function calculateEqualPrincipalInterest({ principal, monthlyRate, months }) {
  if (!isFiniteNumber(principal) || principal <= 0) return { ok: false, error: 'invalid_principal' };
  if (!isFiniteNumber(monthlyRate) || monthlyRate < 0) return { ok: false, error: 'invalid_monthly_rate' };
  if (!Number.isInteger(months) || months <= 0) return { ok: false, error: 'invalid_months' };

  // If rate is 0, payment is simple division.
  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    const pow = Math.pow(1 + monthlyRate, months);
    monthlyPayment = (principal * monthlyRate * pow) / (pow - 1);
  }

  let balance = principal;
  let totalInterest = 0;
  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principalPayment = monthlyPayment - interest;
    balance -= principalPayment;
    totalInterest += interest;
  }

  return {
    ok: true,
    monthlyPayment,
    totalInterest,
    totalPayment: principal + totalInterest,
  };
}

export function calculateEqualPrincipal({ principal, monthlyRate, months }) {
  if (!isFiniteNumber(principal) || principal <= 0) return { ok: false, error: 'invalid_principal' };
  if (!isFiniteNumber(monthlyRate) || monthlyRate < 0) return { ok: false, error: 'invalid_monthly_rate' };
  if (!Number.isInteger(months) || months <= 0) return { ok: false, error: 'invalid_months' };

  const principalPayment = principal / months;
  let balance = principal;
  let totalInterest = 0;
  let firstMonthPayment = 0;

  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const payment = principalPayment + interest;
    if (i === 1) firstMonthPayment = payment;
    balance -= principalPayment;
    totalInterest += interest;
  }

  return {
    ok: true,
    // 기존 UI는 "월 상환액" 단일 값으로 보여주므로(원금균등은 감소),
    // 첫 달 상환액을 대표값으로 반환한다.
    monthlyPayment: firstMonthPayment,
    totalInterest,
    totalPayment: principal + totalInterest,
  };
}

export function calculateMaturity({ principal, monthlyRate, months }) {
  if (!isFiniteNumber(principal) || principal <= 0) return { ok: false, error: 'invalid_principal' };
  if (!isFiniteNumber(monthlyRate) || monthlyRate < 0) return { ok: false, error: 'invalid_monthly_rate' };
  if (!Number.isInteger(months) || months <= 0) return { ok: false, error: 'invalid_months' };

  const monthlyPayment = principal * monthlyRate; // interest only per month
  const totalInterest = monthlyPayment * months;
  return {
    ok: true,
    monthlyPayment,
    totalInterest,
    totalPayment: principal + totalInterest,
  };
}

export function calculateLoanByType({ principal, annualRatePercent, years, repaymentType }) {
  const t = computeLoanTerms({ principal, annualRatePercent, years });
  if (!t.ok) return t;
  const { monthlyRate, months } = t;

  if (repaymentType === 'equalPrincipalInterest') {
    return { ...calculateEqualPrincipalInterest({ principal, monthlyRate, months }), months, monthlyRate };
  }
  if (repaymentType === 'equalPrincipal') {
    return { ...calculateEqualPrincipal({ principal, monthlyRate, months }), months, monthlyRate };
  }
  if (repaymentType === 'maturity') {
    return { ...calculateMaturity({ principal, monthlyRate, months }), months, monthlyRate };
  }
  return { ok: false, error: 'invalid_repayment_type' };
}

export function calculateLoanSchedule({ principal, annualRatePercent, years, repaymentType }) {
  const t = computeLoanTerms({ principal, annualRatePercent, years });
  if (!t.ok) return { ok: false, error: t.error };
  const { monthlyRate, months } = t;

  if (repaymentType === 'equalPrincipalInterest') {
    // constant payment
    const calc = calculateEqualPrincipalInterest({ principal, monthlyRate, months });
    if (!calc.ok) return calc;
    const monthlyPayment = calc.monthlyPayment;
    let balance = principal;
    const schedule = [];
    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const principalPayment = monthlyPayment - interest;
      balance -= principalPayment;
      schedule.push({
        month: i,
        principal: principalPayment,
        interest,
        payment: monthlyPayment,
        balance: Math.max(0, balance),
      });
    }
    return schedule;
  }

  if (repaymentType === 'equalPrincipal') {
    const principalPayment = principal / months;
    let balance = principal;
    const schedule = [];
    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const payment = principalPayment + interest;
      balance -= principalPayment;
      schedule.push({
        month: i,
        principal: principalPayment,
        interest,
        payment,
        balance: Math.max(0, balance),
      });
    }
    return schedule;
  }

  if (repaymentType === 'maturity') {
    const monthlyInterest = principal * monthlyRate;
    const schedule = [];
    for (let i = 1; i <= months; i++) {
      const isLast = i === months;
      schedule.push({
        month: i,
        principal: isLast ? principal : 0,
        interest: monthlyInterest,
        payment: isLast ? principal + monthlyInterest : monthlyInterest,
        balance: isLast ? 0 : principal,
      });
    }
    return schedule;
  }

  return { ok: false, error: 'invalid_repayment_type' };
}

export function summarizeSchedule(schedule) {
  if (!Array.isArray(schedule) || schedule.length === 0) return { ok: false, error: 'invalid_schedule' };
  let totalInterest = 0;
  let totalPayment = 0;
  for (const row of schedule) {
    totalInterest += row.interest || 0;
    totalPayment += row.payment || 0;
  }
  const endingBalance = schedule[schedule.length - 1].balance;
  return { ok: true, totalInterest, totalPayment, endingBalance };
}

export function sampleSchedule(schedule) {
  if (!Array.isArray(schedule)) return [];
  const months = schedule.length;
  const sampled = [];
  for (let i = 0; i < months; i++) {
    const m = schedule[i].month;
    if (m <= 12 || m % 12 === 0 || m === months) sampled.push(schedule[i]);
  }
  return sampled;
}

export function calculateLoanSummary({ principal, annualRatePercent, years, repaymentType, scheduleSampled = true }) {
  const schedule = calculateLoanSchedule({ principal, annualRatePercent, years, repaymentType });
  if (!Array.isArray(schedule)) return schedule;
  const s = summarizeSchedule(schedule);
  if (!s.ok) return s;
  const monthlyPayment = schedule[0]?.payment ?? 0;
  return {
    ok: true,
    monthlyPayment,
    totalInterest: s.totalInterest,
    totalPayment: s.totalPayment,
    schedule: scheduleSampled ? sampleSchedule(schedule) : schedule,
  };
}

