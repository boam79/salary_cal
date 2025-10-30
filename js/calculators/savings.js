/**
 * 적금/예금 계산기
 */

class SavingsCalculator {
  constructor() {
    this.taxRate = 0.154; // 이자소득세 15.4%
    this.init();
  }

  init() {
    this.bindTabs();
    this.bindForms();
  }

  bindTabs() {
    const tabButtons = document.querySelectorAll('#savings-screen .tab-btn');
    const simpleForm = document.getElementById('simple-interest-form');
    const compoundForm = document.getElementById('compound-interest-form');
    const recurringForm = document.getElementById('recurring-form');

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        simpleForm.style.display = tab === 'simple' ? 'block' : 'none';
        compoundForm.style.display = tab === 'compound' ? 'block' : 'none';
        recurringForm.style.display = tab === 'recurring' ? 'block' : 'none';
        const result = document.getElementById('savings-result');
        if (result) result.style.display = 'none';
      });
    });
  }

  bindForms() {
    const simpleForm = document.getElementById('simple-interest-form');
    const compoundForm = document.getElementById('compound-interest-form');
    const recurringForm = document.getElementById('recurring-form');

    if (simpleForm) {
      simpleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const principal = parseFloat(document.getElementById('simple-principal').value) * 10000;
        const rate = parseFloat(document.getElementById('simple-rate').value) / 100;
        const months = parseInt(document.getElementById('simple-months').value, 10);
        if (!this.validate(principal, rate, months)) return;
        const interest = principal * rate * (months / 12);
        const total = principal + interest;
        const tax = interest * this.taxRate;
        const net = total - tax;
        this.showResult(interest, total, tax, net);
        this.drawChartLumpSum(principal, rate, months, false);
        this.showStepsLumpSum({ principal, rate, months, interest, total, tax, net, isCompound: false });
      });
      const reset = document.getElementById('reset-simple');
      if (reset) reset.addEventListener('click', () => this.reset());
    }

    if (compoundForm) {
      compoundForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const principal = parseFloat(document.getElementById('compound-principal').value) * 10000;
        const rate = parseFloat(document.getElementById('compound-rate').value) / 100;
        const months = parseInt(document.getElementById('compound-months').value, 10);
        if (!this.validate(principal, rate, months)) return;
        const total = principal * Math.pow(1 + rate / 12, months);
        const interest = total - principal;
        const tax = interest * this.taxRate;
        const net = total - tax;
        this.showResult(interest, total, tax, net);
        this.drawChartLumpSum(principal, rate, months, true);
        this.showStepsLumpSum({ principal, rate, months, interest, total, tax, net, isCompound: true });
      });
      const reset = document.getElementById('reset-compound');
      if (reset) reset.addEventListener('click', () => this.reset());
    }

    if (recurringForm) {
      recurringForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const monthly = parseFloat(document.getElementById('recurring-monthly').value) * 10000;
        const rate = parseFloat(document.getElementById('recurring-rate').value) / 100;
        const months = parseInt(document.getElementById('recurring-months').value, 10);
        if (!this.validate(monthly, rate, months)) return;
        const i = rate / 12;
        // 말기불 적금의 미래가치: PMT * [((1+i)^n - 1) / i]
        const total = i === 0 ? monthly * months : monthly * ((Math.pow(1 + i, months) - 1) / i);
        const principal = monthly * months;
        const interest = total - principal;
        const tax = interest * this.taxRate;
        const net = total - tax;
        this.showResult(interest, total, tax, net);
        this.drawChartRecurring(monthly, rate, months);
        this.showStepsRecurring({ monthly, rate, months, principal, interest, total, tax, net });
      });
      const reset = document.getElementById('reset-recurring');
      if (reset) reset.addEventListener('click', () => this.reset());
    }
  }

  validate(amount, rate, months) {
    if (!(amount > 0)) {
      alert('금액을 입력해주세요.');
      return false;
    }
    if (!(rate >= 0)) {
      alert('이자율을 확인해주세요.');
      return false;
    }
    if (!(months > 0)) {
      alert('기간(개월)을 입력해주세요.');
      return false;
    }
    return true;
  }

  showResult(interest, total, tax, net) {
    const result = document.getElementById('savings-result');
    document.getElementById('savings-interest').textContent = window.formatCurrency(interest);
    document.getElementById('savings-total').textContent = window.formatCurrency(total);
    document.getElementById('savings-tax').textContent = window.formatCurrency(tax);
    document.getElementById('savings-net').textContent = window.formatCurrency(net);
    if (result) {
      result.style.display = 'block';
      result.scrollIntoView({ behavior: 'smooth' });
    }
  }

  drawChartLumpSum(principal, rate, months, isCompound) {
    const canvas = document.getElementById('savings-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    const data = [];
    for (let m = 0; m <= months; m++) {
      let total;
      if (isCompound) total = principal * Math.pow(1 + rate / 12, m);
      else total = principal + principal * rate * (m / 12);
      data.push({ m, total });
    }
    this.renderLineChart(ctx, width, height, data, months);
  }

  drawChartRecurring(monthly, rate, months) {
    const canvas = document.getElementById('savings-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    const i = rate / 12;
    const data = [];
    for (let m = 0; m <= months; m++) {
      const total = i === 0 ? monthly * m : monthly * ((Math.pow(1 + i, m) - 1) / i);
      data.push({ m, total });
    }
    this.renderLineChart(ctx, width, height, data, months);
  }

  renderLineChart(ctx, width, height, data, months) {
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data.map((d) => d.total));
    const scaleY = chartHeight / maxValue;

    ctx.strokeStyle = '#e0e0e0';
    for (let i = 0; i <= 10; i++) {
      const y = padding + (chartHeight / 10) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      const value = Math.floor(maxValue - (maxValue / 10) * i);
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(window.formatCurrency(value), padding - 10, y + 4);
    }

    ctx.strokeStyle = '#2b7cff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (chartWidth / months) * d.m;
      const y = height - padding - d.total * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  showStepsLumpSum({ principal, rate, months, interest, total, tax, net, isCompound }) {
    const steps = document.getElementById('savings-steps');
    if (!steps) return;
    const principalStr = window.formatCurrency(principal);
    const rateStr = (rate * 100).toFixed(2) + '%';

    const formula = isCompound
      ? `${principalStr} × (1 + ${rateStr} / 12)^${months}`
      : `${principalStr} + ${principalStr} × ${rateStr} × (${months}/12)`;

    steps.innerHTML = `
      <div class="step-item"><h4>1. 입력값</h4><p>원금: ${principalStr}</p><p>연 이자율: ${rateStr}</p><p>기간: ${months}개월</p></div>
      <div class="step-item"><h4>2. 원리금 계산</h4><p>계산식: ${formula}</p><p><strong>원리금 합계 = ${window.formatCurrency(total)}</strong></p></div>
      <div class="step-item"><h4>3. 이자</h4><p><strong>${window.formatCurrency(interest)}</strong></p></div>
      <div class="step-item"><h4>4. 이자소득세(15.4%)</h4><p><strong>${window.formatCurrency(tax)}</strong></p></div>
      <div class="step-item"><h4>5. 실수령액</h4><p><strong>${window.formatCurrency(net)}</strong></p></div>
    `;
    steps.style.display = 'block';
    const toggleBtn = document.querySelector('#savings-result .toggle-steps');
    if (toggleBtn) toggleBtn.textContent = '▲ 계산 과정 숨기기';
  }

  showStepsRecurring({ monthly, rate, months, principal, interest, total, tax, net }) {
    const steps = document.getElementById('savings-steps');
    if (!steps) return;
    const monthlyStr = window.formatCurrency(monthly);
    const rateStr = (rate * 100).toFixed(2) + '%';
    const iStr = `${(rate / 12 * 100).toFixed(4)}%`;

    steps.innerHTML = `
      <div class="step-item"><h4>1. 입력값</h4><p>월 납입액: ${monthlyStr}</p><p>연 이자율: ${rateStr}</p><p>기간: ${months}개월</p></div>
      <div class="step-item"><h4>2. 원리금 계산</h4><p>계산식: ${monthlyStr} × ((1 + i)^n - 1) / i, i = 월이율 ${iStr}</p><p><strong>원리금 합계 = ${window.formatCurrency(total)}</strong></p></div>
      <div class="step-item"><h4>3. 납입원금</h4><p><strong>${window.formatCurrency(principal)}</strong></p></div>
      <div class="step-item"><h4>4. 이자</h4><p><strong>${window.formatCurrency(interest)}</strong></p></div>
      <div class="step-item"><h4>5. 이자소득세(15.4%)</h4><p><strong>${window.formatCurrency(tax)}</strong></p></div>
      <div class="step-item"><h4>6. 실수령액</h4><p><strong>${window.formatCurrency(net)}</strong></p></div>
    `;
    steps.style.display = 'block';
    const toggleBtn = document.querySelector('#savings-result .toggle-steps');
    if (toggleBtn) toggleBtn.textContent = '▲ 계산 과정 숨기기';
  }

  reset() {
    const result = document.getElementById('savings-result');
    if (result) result.style.display = 'none';
    const canvas = document.getElementById('savings-chart');
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }
}

// init
document.addEventListener('DOMContentLoaded', () => new SavingsCalculator());

// 토글 함수 전역 노출 (퇴직금과 공유)
if (typeof window !== 'undefined') {
  window.toggleCalculationSteps = window.toggleCalculationSteps || function(button, calculatorType) {
    const stepsContent = document.getElementById(`${calculatorType}-steps`);
    if (!stepsContent) return;
    const isHidden = stepsContent.style.display === 'none';
    stepsContent.style.display = isHidden ? 'block' : 'none';
    button.textContent = isHidden ? '▲ 계산 과정 숨기기' : '▼ 계산 과정 보기';
  };
}

export default SavingsCalculator;
