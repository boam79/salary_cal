import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  flattenShareStateForUrl,
  buildShareUrl,
  SHARE_SCHEMA_VERSION,
} from '../js/core/deepLink.js';

describe('deepLink share URL', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      location: {
        origin: 'https://example.com',
        pathname: '/',
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('flattens nested financial/housing keys without collision', () => {
    const flat = flattenShareStateForUrl({
      screen: 'loan-screen',
      financial: {
        loanAmount: '1',
        interestRate: '4',
        loanPeriod: '20',
        repaymentType: 'equalPrincipalInterest',
      },
      housing: {
        housePrice: '5',
        ownFunds: '1',
        annualIncome: '8000',
        interestRate: '3.5',
        loanPeriod: '30',
        repaymentType: 'maturity',
      },
    });
    expect(flat.loanAmount).toBe('1');
    expect(flat.interestRate).toBe('4');
    expect(flat.housingInterestRate).toBe('3.5');
    expect(flat.housePrice).toBe('5');
  });

  it('buildShareUrl includes qSchema and strips unknown keys', () => {
    const url = buildShareUrl({
      screen: 'tax-screen',
      tab: 'gift',
      giftAmount: '5',
      evil: '<script>',
    });
    expect(url).toContain('qSchema=' + String(SHARE_SCHEMA_VERSION));
    expect(url).toContain('screen=tax-screen');
    expect(url).toContain('giftAmount=5');
    expect(url).not.toContain('evil');
  });
});
