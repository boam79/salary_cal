import { describe, it, expect } from 'vitest';
import { parseShareSearchParams, SHARE_QUERY_SCHEMA_VERSION } from '../packages/calc-core/src/schemas.js';

describe('share query schema', () => {
  it('parses valid salary deep link params', () => {
    const q = `qSchema=${SHARE_QUERY_SCHEMA_VERSION}&screen=salary-screen&salaryType=annual&annualSalary=5000`;
    const r = parseShareSearchParams(q);
    expect(r.ok).toBe(true);
    expect(r.data.screen).toBe('salary-screen');
    expect(r.data.salaryType).toBe('annual');
    expect(r.data.annualSalary).toBe('5000');
  });

  it('rejects unknown keys (strict)', () => {
    const r = parseShareSearchParams('screen=salary-screen&evil=1');
    expect(r.ok).toBe(false);
  });
});
