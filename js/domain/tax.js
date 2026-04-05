/**
 * Tax domain logic (pure functions)
 * - No DOM access
 * - No global state
 */

function isFiniteNumber(n) {
  return Number.isFinite(n);
}

/**
 * Progressive tax calculation using brackets with (max, rate, deduction).
 * Returns 0 for negative/zero base.
 */
export function calculateProgressiveTax({ taxBase, brackets }) {
  if (!isFiniteNumber(taxBase)) return { ok: false, error: 'invalid_tax_base' };
  if (!Array.isArray(brackets) || brackets.length === 0) return { ok: false, error: 'invalid_brackets' };
  if (taxBase <= 0) return { ok: true, tax: 0 };

  for (const b of brackets) {
    if (!b || !isFiniteNumber(b.max) || !isFiniteNumber(b.rate) || !isFiniteNumber(b.deduction)) {
      return { ok: false, error: 'invalid_bracket' };
    }
    if (taxBase <= b.max) {
      const tax = taxBase * b.rate - b.deduction;
      return { ok: true, tax: Math.max(0, tax) };
    }
  }

  // Should be unreachable if last bracket max is huge, but keep safe.
  const last = brackets[brackets.length - 1];
  const tax = taxBase * last.rate - last.deduction;
  return { ok: true, tax: Math.max(0, tax) };
}

export function calculateInheritanceTax({ amount, basicDeduction, brackets }) {
  if (!isFiniteNumber(amount)) return { ok: false, error: 'invalid_amount' };
  if (!isFiniteNumber(basicDeduction) || basicDeduction < 0) return { ok: false, error: 'invalid_deduction' };

  const taxBase = Math.max(0, amount - basicDeduction);
  const r = calculateProgressiveTax({ taxBase, brackets });
  if (!r.ok) return r;
  return { ok: true, taxBase, tax: r.tax, deduction: basicDeduction };
}

export function resolveGiftDeduction({ relation, deductionsByRelation }) {
  if (!relation || typeof relation !== 'string') return { ok: false, error: 'invalid_relation' };
  if (!deductionsByRelation || typeof deductionsByRelation !== 'object') {
    return { ok: false, error: 'invalid_deductions_map' };
  }
  const deduction = deductionsByRelation[relation];
  if (!isFiniteNumber(deduction) || deduction < 0) return { ok: false, error: 'UNKNOWN_RELATION' };
  return { ok: true, deduction };
}

export function calculateGiftTax({ amount, deduction, brackets }) {
  if (!isFiniteNumber(amount)) return { ok: false, error: 'invalid_amount' };
  if (!isFiniteNumber(deduction) || deduction < 0) return { ok: false, error: 'invalid_deduction' };

  const taxBase = Math.max(0, amount - deduction);
  const r = calculateProgressiveTax({ taxBase, brackets });
  if (!r.ok) return r;
  return { ok: true, taxBase, tax: r.tax, deduction };
}

export function calculateGiftTaxByRelation({ amount, relation, deductionsByRelation, brackets }) {
  const d = resolveGiftDeduction({ relation, deductionsByRelation });
  if (!d.ok) return d;
  return calculateGiftTax({ amount, deduction: d.deduction, brackets });
}

