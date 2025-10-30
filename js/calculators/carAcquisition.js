/**
 * 자동차 취득세 계산기
 */

import AppState from '../core/appState.js';

class CarAcquisitionCalculator {
  constructor() {
    this.init();
  }

  init() {
    const form = document.getElementById('car-acq-form');
    const resetBtn = document.getElementById('reset-car-acq');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculate();
      });
    }
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
  }

  getRates() {
    const rates = AppState.getTaxRates?.() || {};
    return rates.vehicleAcquisition || {
      passenger: 0.07,
      commercial: 0.05,
      motorcycle: 0.02,
      hybrid: 0.03,
      electric: 0.0,
      localEducationTaxRate: 0.3,
    };
  }

  calculate() {
    const type = document.getElementById('car-type').value;
    const priceInput = parseFloat(document.getElementById('car-price').value);
    if (!(priceInput > 0)) {
      alert('차량 취득가액을 입력해주세요.');
      return;
    }

    const price = priceInput * 10000; // 만원 → 원
    const rates = this.getRates();
    const acqRate = rates[type] ?? 0.07;
    const eduRate = rates.localEducationTaxRate ?? 0.3;

    const acqTax = Math.floor(price * acqRate);
    const eduTax = Math.floor(acqTax * eduRate);
    const total = acqTax + eduTax;

    // 결과 표시
    document.getElementById('car-tax-acq').textContent = window.formatCurrency(acqTax);
    document.getElementById('car-tax-edu').textContent = window.formatCurrency(eduTax);
    document.getElementById('car-tax-total').textContent = window.formatCurrency(total);

    const result = document.getElementById('car-acq-result');
    if (result) {
      result.style.display = 'block';
      result.scrollIntoView({ behavior: 'smooth' });
    }

    this.renderSteps({ type, price, acqRate, eduRate, acqTax, eduTax, total });
  }

  renderSteps({ type, price, acqRate, eduRate, acqTax, eduTax, total }) {
    const steps = document.getElementById('car-acq-steps');
    if (!steps) return;
    const typeLabel = this.getTypeLabel(type);

    steps.innerHTML = `
      <div class="step-item"><h4>1. 입력값</h4><p>차량 유형: ${typeLabel}</p><p>취득가액: ${window.formatCurrency(price)}</p></div>
      <div class="step-item"><h4>2. 취득세</h4><p>세율: ${(acqRate * 100).toFixed(2)}%</p><p><strong>${window.formatCurrency(price)} × ${(acqRate * 100).toFixed(2)}% = ${window.formatCurrency(acqTax)}</strong></p></div>
      <div class="step-item"><h4>3. 지방교육세</h4><p>세율: ${(eduRate * 100).toFixed(1)}% (취득세의 비율)</p><p><strong>${window.formatCurrency(acqTax)} × ${(eduRate * 100).toFixed(1)}% = ${window.formatCurrency(eduTax)}</strong></p></div>
      <div class="step-item"><h4>4. 합계</h4><p><strong>${window.formatCurrency(total)}</strong></p></div>
      <div class="step-item"><h4>안내</h4><p>차종, 배기량, 친환경 감면 등에 따라 실제 세율이 달라질 수 있습니다. 최신 고시를 반영하려면 config/rates.json을 업데이트하세요.</p></div>
    `;
    steps.style.display = 'block';
    const toggleBtn = document.querySelector('#car-acq-result .toggle-steps');
    if (toggleBtn) toggleBtn.textContent = '▲ 계산 과정 숨기기';
  }

  getTypeLabel(type) {
    switch (type) {
      case 'passenger':
        return '승용';
      case 'commercial':
        return '영업용/상용';
      case 'motorcycle':
        return '이륜차';
      case 'hybrid':
        return '하이브리드';
      case 'electric':
        return '전기';
      default:
        return type;
    }
  }

  reset() {
    const result = document.getElementById('car-acq-result');
    if (result) result.style.display = 'none';
    const steps = document.getElementById('car-acq-steps');
    if (steps) steps.innerHTML = '';
  }
}

// init
document.addEventListener('DOMContentLoaded', () => new CarAcquisitionCalculator());

// 토글 전역 함수 재사용 (이미 정의되어 있으면 그대로 사용)
if (typeof window !== 'undefined') {
  window.toggleCalculationSteps = window.toggleCalculationSteps || function(button, calculatorType) {
    const stepsContent = document.getElementById(`${calculatorType}-steps`);
    if (!stepsContent) return;
    const isHidden = stepsContent.style.display === 'none';
    stepsContent.style.display = isHidden ? 'block' : 'none';
    button.textContent = isHidden ? '▲ 계산 과정 숨기기' : '▼ 계산 과정 보기';
  };
}

export default CarAcquisitionCalculator;
