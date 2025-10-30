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
    this.bindTabs();
    this.bindForm();
    this.bindRefundForm();
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

  bindTabs() {
    // VAT 화면 내부 탭 버튼 동작
    const tabButtons = document.querySelectorAll('#vat-screen .tab-btn');
    const calcTab = document.getElementById('vat-calc-tab');
    const refundTab = document.getElementById('vat-refund-tab');
    if (!tabButtons.length || !calcTab || !refundTab) return;
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        calcTab.classList.toggle('active', tab === 'vat-calc');
        refundTab.classList.toggle('active', tab === 'vat-refund');
        // 탭 전환 시 결과 섹션 숨김
        const result1 = document.getElementById('vat-result');
        const result2 = document.getElementById('vat-refund-result');
        if (result1) result1.style.display = 'none';
        if (result2) result2.style.display = 'none';
      });
    });
  }

  bindRefundForm() {
    const form = document.getElementById('vat-refund-form');
    const resetBtn = document.getElementById('reset-vat-refund');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculateRefund();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const result = document.getElementById('vat-refund-result');
        if (result) result.style.display = 'none';
      });
    }
  }

  calculateRefund() {
    const salesTax = parseFloat(document.getElementById('sales-tax')?.value || '0');
    const purchaseTaxDeductible = parseFloat(document.getElementById('purchase-tax-deductible')?.value || '0');
    const purchaseTaxNonDeductible = parseFloat(document.getElementById('purchase-tax-nondeductible')?.value || '0');
    const reductionCredit = parseFloat(document.getElementById('reduction-credit')?.value || '0');

    if (!(salesTax >= 0) || !(purchaseTaxDeductible >= 0) || !(purchaseTaxNonDeductible >= 0) || !(reductionCredit >= 0)) {
      alert('입력값을 확인해주세요. (0 이상 정수)');
      return;
    }

    // 간이 계산식: 납부세액 = 매출세액 - 공제가능 매입세액 - 경감·공제세액
    // 공제불가 매입세액은 공제대상이 아니므로 참조용으로만 표시
    const payableRaw = salesTax - purchaseTaxDeductible - reductionCredit;
    const payable = payableRaw > 0 ? Math.floor(payableRaw) : 0;
    const refund = payableRaw < 0 ? Math.abs(Math.floor(payableRaw)) : 0;

    this.renderRefundResult({ payable, refund });
    this.renderRefundSteps({ salesTax, purchaseTaxDeductible, purchaseTaxNonDeductible, reductionCredit, payable, refund });
  }

  renderRefundResult({ payable, refund }) {
    const result = document.getElementById('vat-refund-result');
    document.getElementById('vat-payable').textContent = payable ? window.formatCurrency(payable) : '-';
    document.getElementById('vat-refund').textContent = refund ? window.formatCurrency(refund) : '-';
    if (result) {
      result.style.display = 'block';
      result.scrollIntoView({ behavior: 'smooth' });
    }
  }

  renderRefundSteps({ salesTax, purchaseTaxDeductible, purchaseTaxNonDeductible, reductionCredit, payable, refund }) {
    const steps = document.getElementById('vat-refund-steps');
    if (!steps) return;
    steps.innerHTML = `
      <div class="step-item"><h4>1. 입력값</h4>
        <p>매출세액: <strong>${window.formatCurrency(salesTax)}</strong></p>
        <p>공제가능 매입세액: <strong>${window.formatCurrency(purchaseTaxDeductible)}</strong></p>
        <p>공제불가 매입세액(참고): <strong>${window.formatCurrency(purchaseTaxNonDeductible)}</strong></p>
        <p>경감·공제세액: <strong>${window.formatCurrency(reductionCredit)}</strong></p>
      </div>
      <div class="step-item"><h4>2. 계산식</h4>
        <p>납부세액 = 매출세액 − 공제가능 매입세액 − 경감·공제세액</p>
      </div>
      <div class="step-item"><h4>3. 결과</h4>
        <p>납부세액: <strong>${payable ? window.formatCurrency(payable) : '-'}</strong></p>
        <p>환급세액: <strong>${refund ? window.formatCurrency(refund) : '-'}</strong></p>
      </div>
      <div class="step-item"><small>참고: 공제불가 매입세액은 공제 대상이 아니므로 납부/환급 계산에는 포함되지 않습니다.</small></div>
    `;
    steps.style.display = 'block';
    const toggleBtn = document.querySelector('#vat-refund-result .toggle-steps');
    if (toggleBtn) toggleBtn.textContent = '▲ 계산 과정 숨기기';
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


