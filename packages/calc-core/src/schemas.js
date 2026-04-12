/**
 * 공유 URL / 딥링크 쿼리 파라미터 스키마 (Zod)
 * js/core/deepLink.js 의 ALLOWED_SHARE_KEYS 와 동기화할 것
 */

import { z } from 'zod';

export const SHARE_QUERY_SCHEMA_VERSION = 1;

const optionalString = z
  .string()
  .max(256)
  .optional()
  .transform((v) => (v === undefined || v === '' ? undefined : v));

export const shareQueryParamSchema = z
  .object({
    qSchema: z.coerce.number().int().optional(),
    screen: z.string().max(64).optional(),
    tab: optionalString,
    salaryType: z.enum(['annual', 'monthly']).optional(),
    annualSalary: optionalString,
    workHours: optionalString,
    hourlyWage: optionalString,
    salaryDetailEnabled: optionalString,
    salaryDependents: optionalString,
    salaryNonTaxable: optionalString,
    inheritanceAmount: optionalString,
    giftAmount: optionalString,
    giftRelation: optionalString,
    loanAmount: optionalString,
    interestRate: optionalString,
    loanPeriod: optionalString,
    repaymentType: optionalString,
    housePrice: optionalString,
    ownFunds: optionalString,
    housingAnnualIncome: optionalString,
    housingInterestRate: optionalString,
    housingLoanPeriod: optionalString,
    housingRepaymentType: optionalString,
  })
  .strict();

/**
 * @param {string} search - "?foo=bar" 또는 "foo=bar"
 */
export function parseShareSearchParams(search) {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const obj = {};
  params.forEach((v, k) => {
    obj[k] = v;
  });
  const parsed = shareQueryParamSchema.safeParse(obj);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten(), data: null };
  }
  return { ok: true, error: null, data: parsed.data };
}

/** UI/URL 빌더용: undefined 키 제거 */
export function safeShareParamsObject(data) {
  if (!data || typeof data !== 'object') return {};
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== null && String(v) !== ''),
  );
}
