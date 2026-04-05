import { describe, expect, it } from 'vitest';
import { calculateLoanSchedule, summarizeSchedule } from '../js/domain/loan.js';

describe('loan domain (repayment types)', () => {
  it('equalPrincipalInterest: monthly payment is constant and balance reaches ~0', () => {
    const schedule = calculateLoanSchedule({
      principal: 10_000_000,
      annualRatePercent: 12,
      years: 1,
      repaymentType: 'equalPrincipalInterest',
    });
    const s = summarizeSchedule(schedule);

    expect(s.ok).toBe(true);
    expect(schedule.length).toBe(12);

    const p0 = schedule[0].payment;
    const p1 = schedule[1].payment;
    expect(Math.abs(p0 - p1)).toBeLessThan(1e-6);

    expect(s.totalPayment).toBeGreaterThan(10_000_000);
    expect(Math.abs(s.endingBalance)).toBeLessThan(1e-3);
  });

  it('equalPrincipal: principal component is constant; total interest lower than equalPrincipalInterest (same inputs)', () => {
    const a = calculateLoanSchedule({
      principal: 10_000_000,
      annualRatePercent: 12,
      years: 1,
      repaymentType: 'equalPrincipal',
    });
    const b = calculateLoanSchedule({
      principal: 10_000_000,
      annualRatePercent: 12,
      years: 1,
      repaymentType: 'equalPrincipalInterest',
    });
    const sa = summarizeSchedule(a);
    const sb = summarizeSchedule(b);

    expect(sa.ok).toBe(true);
    expect(sb.ok).toBe(true);

    // equalPrincipal monthly principal is constant
    expect(Math.abs(a[0].principal - a[1].principal)).toBeLessThan(1e-6);
    // first payment should be larger than last payment (declining interest)
    expect(a[0].payment).toBeGreaterThan(a[a.length - 1].payment);

    // with same terms, equal principal usually pays less total interest
    expect(sa.totalInterest).toBeLessThan(sb.totalInterest);
  });

  it('maturity: pays interest monthly and principal at final month', () => {
    const schedule = calculateLoanSchedule({
      principal: 10_000_000,
      annualRatePercent: 12,
      years: 1,
      repaymentType: 'maturity',
    });
    const s = summarizeSchedule(schedule);

    expect(s.ok).toBe(true);
    expect(schedule.length).toBe(12);
    // months 1..11: no principal
    for (let i = 0; i < 11; i++) {
      expect(schedule[i].principal).toBe(0);
      expect(schedule[i].interest).toBeGreaterThan(0);
    }
    // final month: principal + interest
    expect(schedule[11].principal).toBe(10_000_000);
    expect(Math.abs(s.endingBalance)).toBeLessThan(1e-6);
    // total interest should be roughly principal * monthlyRate * months
    expect(s.totalInterest).toBeCloseTo(10_000_000 * (0.12 / 12) * 12, 6);
  });
});

