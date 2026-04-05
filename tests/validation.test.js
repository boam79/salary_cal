import { describe, expect, it } from 'vitest';
import { calculateMonthlySalaryFromHourlyWage } from '../js/domain/salary.js';
import { calculateInheritanceTax, calculateGiftTaxByRelation } from '../js/domain/tax.js';

// validation.js 는 IIFE로 window에 붙이는 형태라, 테스트에서는 필요한 로직을 직접 재현한다.
// (품질 고도화 단계에서 순수 함수로 분리하면 이 테스트는 실제 모듈 import로 교체)
function validateInput(value, name, options = {}) {
  const {
    min = 0.01,
    max = Infinity,
    allowZero = false,
    isPercent = false,
  } = options;

  if (!value || (typeof value === 'string' && value.trim() === '')) return null;
  const num = parseFloat(value);
  if (Number.isNaN(num)) return null;
  if (num < 0) return null;
  if (!allowZero && num === 0) return null;
  if (!isPercent && num > 0 && num < min) return null;
  if (num > max) return null;
  return num;
}

describe('validateInput (smoke)', () => {
  it('returns null for empty input', () => {
    expect(validateInput('', '금액')).toBeNull();
  });

  it('returns number for valid input', () => {
    expect(validateInput('100', '금액')).toBe(100);
  });

  it('enforces allowZero=false by default', () => {
    expect(validateInput('0', '금액')).toBeNull();
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

