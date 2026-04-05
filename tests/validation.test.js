import { describe, expect, it } from 'vitest';

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

