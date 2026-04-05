import { describe, expect, it } from 'vitest';
import { calculateMonthlySalaryFromHourlyWage } from '../js/domain/salary.js';
import { calculateInheritanceTax, calculateGiftTaxByRelation } from '../js/domain/tax.js';
import { validateNumber } from '../js/domain/validation.js';

describe('validateNumber (smoke)', () => {
  it('returns null for empty input', () => {
    expect(validateNumber('').ok).toBe(false);
  });

  it('returns number for valid input', () => {
    const r = validateNumber('100');
    expect(r.ok).toBe(true);
    expect(r.value).toBe(100);
  });

  it('enforces allowZero=false by default', () => {
    expect(validateNumber('0').ok).toBe(false);
  });
});

describe('salary domain (smoke)', () => {
  it('rejects hourly wage below minimum wage', () => {
    const r = calculateMonthlySalaryFromHourlyWage({
      workHoursPerWeek: 40,
      hourlyWage: 10029,
      minimumWage: 10030,
    });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('MINIMUM_WAGE');
  });

  it('accepts hourly wage equal to minimum wage', () => {
    const r = calculateMonthlySalaryFromHourlyWage({
      workHoursPerWeek: 40,
      hourlyWage: 10030,
      minimumWage: 10030,
    });
    expect(r.ok).toBe(true);
    expect(r.monthlySalary).toBeGreaterThan(0);
  });
});

describe('tax domain (bracket boundaries)', () => {
  const inheritanceBrackets = [
    { max: 100_000_000, rate: 0.1, deduction: 0 },
    { max: 500_000_000, rate: 0.2, deduction: 10_000_000 },
    { max: 1_000_000_000, rate: 0.3, deduction: 60_000_000 },
    { max: 3_000_000_000, rate: 0.4, deduction: 160_000_000 },
    { max: 999_999_999_999, rate: 0.5, deduction: 460_000_000 },
  ];
  const giftBrackets = [...inheritanceBrackets];

  it('inheritance: boundary just below / equal / above first bracket max', () => {
    const basicDeduction = 500_000_000;
    // taxBase = amount - basicDeduction
    const taxBaseBelow = 100_000_000 - 1;
    const taxBaseEqual = 100_000_000;
    const taxBaseAbove = 100_000_000 + 1;

    const r1 = calculateInheritanceTax({
      amount: basicDeduction + taxBaseBelow,
      basicDeduction,
      brackets: inheritanceBrackets,
    });
    expect(r1.ok).toBe(true);
    expect(r1.taxBase).toBe(taxBaseBelow);
    expect(r1.tax).toBe(taxBaseBelow * 0.1);

    const r2 = calculateInheritanceTax({
      amount: basicDeduction + taxBaseEqual,
      basicDeduction,
      brackets: inheritanceBrackets,
    });
    expect(r2.ok).toBe(true);
    expect(r2.taxBase).toBe(taxBaseEqual);
    expect(r2.tax).toBe(taxBaseEqual * 0.1);

    const r3 = calculateInheritanceTax({
      amount: basicDeduction + taxBaseAbove,
      basicDeduction,
      brackets: inheritanceBrackets,
    });
    expect(r3.ok).toBe(true);
    expect(r3.taxBase).toBe(taxBaseAbove);
    // second bracket formula
    expect(r3.tax).toBe(taxBaseAbove * 0.2 - 10_000_000);
  });

  it('gift: returns error for unknown relation (missing deduction)', () => {
    const r = calculateGiftTaxByRelation({
      amount: 200_000_000,
      relation: 'linealDescendantMinor',
      deductionsByRelation: { spouse: 600_000_000, linealDescendant: 50_000_000, otherRelative: 10_000_000 },
      brackets: giftBrackets,
    });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('UNKNOWN_RELATION');
  });
});

