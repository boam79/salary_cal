/**
 * Salary domain logic (pure functions)
 * - No DOM access
 * - No global state
 */

export function calculateMonthlyFromHourly({ workHoursPerWeek, hourlyWage }) {
  if (!Number.isFinite(workHoursPerWeek) || workHoursPerWeek <= 0) {
    return { ok: false, error: 'invalid_work_hours' };
  }
  if (!Number.isFinite(hourlyWage) || hourlyWage <= 0) {
    return { ok: false, error: 'invalid_hourly_wage' };
  }

  const weeklySalary = workHoursPerWeek * hourlyWage;
  const weeklyHolidayPay = weeklySalary * 0.125; // 주휴수당 (주급의 12.5%)
  const monthlySalary = (weeklySalary + weeklyHolidayPay) * 4.33; // 주 4.33주 기준

  return { ok: true, monthlySalary };
}

export function validateHourlyWageAgainstMinimum({ hourlyWage, minimumWage }) {
  if (!Number.isFinite(minimumWage) || minimumWage <= 0) {
    return { ok: false, error: 'invalid_minimum_wage' };
  }
  if (!Number.isFinite(hourlyWage) || hourlyWage <= 0) {
    return { ok: false, error: 'invalid_hourly_wage' };
  }
  if (hourlyWage < minimumWage) {
    return { ok: false, error: 'below_minimum_wage' };
  }
  return { ok: true };
}

export function calculateMonthlySalaryFromHourlyWage({ workHoursPerWeek, hourlyWage, minimumWage }) {
  const minCheck = validateHourlyWageAgainstMinimum({ hourlyWage, minimumWage });
  if (!minCheck.ok) {
    if (minCheck.error === 'below_minimum_wage') return { ok: false, error: 'MINIMUM_WAGE' };
    return { ok: false, error: minCheck.error };
  }
  return calculateMonthlyFromHourly({ workHoursPerWeek, hourlyWage });
}

// Backward-compatible alias for existing calculator import
export function computeMonthlyFromHourlyWage({ workHoursPerWeek, hourlyWage, minimumWage }) {
  const r = calculateMonthlySalaryFromHourlyWage({ workHoursPerWeek, hourlyWage, minimumWage });
  if (!r.ok) {
    if (r.error === 'MINIMUM_WAGE') {
      return { ok: false, error: r.error, errorMessage: '시급은 최저시급 이상이어야 합니다.' };
    }
    return { ok: false, error: r.error, errorMessage: '월급 계산 중 오류가 발생했습니다.' };
  }
  return { ok: true, monthlySalary: r.monthlySalary };
}

