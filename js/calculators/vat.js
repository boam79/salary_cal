/**
 * 부가세 계산기
 */

import AppState from '../core/appState.js';

class VATCalculator {
  constructor() {
    this.vatRates = { standard: 0.1, zero: 0.0 };
    this.init();
  }

  init() {
    const rates = AppState.getTaxRates();
    if (rates && rates.vat) {
      this.vatRates = {
        standard: typeof rates.vat.standard === 'number' ? rates.vat.standard : 0.1,
        zero: typeof rates.vat.zero === 'number' ? rates.vat.zero : 0.0,
      };
    }
    this.bindForm();
  }

  bindForm() {
    const form = document.getElementById('vat-form');
    const resetBtn = document.getElementById('reset-vat');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculate();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }
  }

  calculate() {
    const direction = (document.getElementById('vat-direction')?.value) || 'supplyToTotal';
    const type = (document.getElementById('vat-type')?.value) || 'standard';
    const inputAmountManwon = parseFloat(document.getElementById('vat-amount')?.value);
    if (!(inputAmountManwon >= 0)) {
      alert('금액을 올바르게 입력해주세요.');
      return;
    }

    const rate = (type === 'standard') ? this.vatRates.standard : this.vatRates.zero; // 면세도 0%
    const inputAmount = inputAmountManwon * 10000; // 원 단위

    let supplyAmount = 0;
    let vatAmount = 0;
    let totalAmount = 0;

    if (direction === 'supplyToTotal') {
      supplyAmount = inputAmount;
      vatAmount = Math.floor(supplyAmount * rate);
      totalAmount = supplyAmount + vatAmount;
    } else {
      totalAmount = inputAmount;
      supplyAmount = rate === 0 ? totalAmount : Math.floor(totalAmount / (1 + rate));
      vatAmount = totalAmount - supplyAmount;
    }

    this.renderResult({ supplyAmount, vatAmount, totalAmount, rate, direction, type });
    this.renderSteps({ supplyAmount, vatAmount, totalAmount, rate, direction, type, inputAmount });
  }

  renderResult({ supplyAmount, vatAmount, totalAmount }) {
    const result = document.getElementById('vat-result');
    document.getElementById('vat-supply').textContent = window.formatCurrency(supplyAmount);
    document.getElementById('vat-tax').textContent = window.formatCurrency(vatAmount);
    document.getElementById('vat-total').textContent = window.formatCurrency(totalAmount);
    if (result) {
      result.style.display = 'block';
      result.scrollIntoView({ behavior: 'smooth' });
    }
  }

  renderSteps({ supplyAmount, vatAmount, totalAmount, rate, direction, type, inputAmount }) {
    const steps = document.getElementById('vat-steps');
    if (!steps) return;

    const ratePct = (rate * 100).toFixed(2) + '%';
    const dirLabel = direction === 'supplyToTotal' ? '공급가액 → 총액' : '총액 → 공급가액';
    const typeLabel = (type === 'standard') ? '표준과세' : (type === 'zero' ? '영세율' : '면세');
    const inputLabel = direction === 'supplyToTotal' ? '입력 공급가액' : '입력 총액(부가세포함)';

    const formula = direction === 'supplyToTotal'
      ? `부가세 = 공급가액 × ${ratePct}, 총액 = 공급가액 × (1 + ${ratePct})`
      : `공급가액 = 총액 ÷ (1 + ${ratePct}), 부가세 = 총액 - 공급가액`;

    steps.innerHTML = `
      <div class="step-item"><h4>1. 설정</h4><p>계산 방향: ${dirLabel}</p><p>과세 유형: ${typeLabel} (${ratePct})</p></div>
      <div class="step-item"><h4>2. 입력값</h4><p>${inputLabel}: <strong>${window.formatCurrency(inputAmount)}</strong></p></div>
      <div class="step-item"><h4>3. 계산식</h4><p>${formula}</p></div>
      <div class="step-item"><h4>4. 결과</h4>
        <p>공급가액: <strong>${window.formatCurrency(supplyAmount)}</strong></p>
        <p>부가가치세: <strong>${window.formatCurrency(vatAmount)}</strong></p>
        <p>총액(부가세포함): <strong>${window.formatCurrency(totalAmount)}</strong></p>
      </div>
    `;
    steps.style.display = 'block';
    const toggleBtn = document.querySelector('#vat-result .toggle-steps');
    if (toggleBtn) toggleBtn.textContent = '▲ 계산 과정 숨기기';
  }

  reset() {
    const result = document.getElementById('vat-result');
    if (result) result.style.display = 'none';
  }
}

// init
document.addEventListener('DOMContentLoaded', () => new VATCalculator());

// 계산 과정 토글 전역 노출 유지
if (typeof window !== 'undefined') {
  window.toggleCalculationSteps = window.toggleCalculationSteps || function(button, calculatorType) {
    const stepsContent = document.getElementById(`${calculatorType}-steps`);
    if (!stepsContent) return;
    const isHidden = stepsContent.style.display === 'none';
    stepsContent.style.display = isHidden ? 'block' : 'none';
    button.textContent = isHidden ? '▲ 계산 과정 숨기기' : '▼ 계산 과정 보기';
  };
}

export default VATCalculator;


