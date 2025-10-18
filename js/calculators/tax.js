/**
 * ===================================
 * Tax Calculator (상속세/증여세)
 * ===================================
 * 상속세 및 증여세 계산기
 */

import AppState from '../core/appState.js';

/**
 * 상속세 계산
 * 상속 재산가액에서 공제액을 차감하고 누진세율 적용
 */
function calculateInheritanceTax() {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'tax-screen') {
        console.error('calculateInheritanceTax: Not on tax screen, current screen:', currentScreen?.id);
        return;
    }
    
    const amount = window.getValueWithUnit('inheritance-amount', 100000000); // 억원 단위
    if (amount === null) return;
    
    const rates = AppState.getTaxRates();
    if (!rates) {
        console.error('calculateInheritanceTax: Tax rates not loaded');
        return;
    }
    
    // 일괄공제 5억원 (간소화)
    const deduction = 500000000;
    const taxBase = Math.max(0, amount - deduction);
    
    // 상속세 계산
    let tax = 0;
    const brackets = rates.inheritanceTax.brackets;
    for (let i = 0; i < brackets.length; i++) {
        if (taxBase <= brackets[i].max) {
            tax = taxBase * brackets[i].rate - brackets[i].deduction;
            break;
        }
    }
    
    // 결과 표시
    const resultSection = document.getElementById('inheritance-result');
    const summaryElement = document.getElementById('inheritance-summary');
    const explanationElement = document.getElementById('inheritance-explanation');
    
    if (!resultSection || !summaryElement || !explanationElement) {
        console.error('calculateInheritanceTax: Required elements not found');
        return;
    }
    
    summaryElement.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">상속세액</span>
                <span class="result-value">${window.formatCurrency(tax)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">과세표준</span>
                <span class="result-value">${window.formatCurrency(taxBase)}</span>
            </div>
        </div>
    `;
    
    explanationElement.innerHTML = `
        <div class="explanation-step">
            <strong>1단계: 과세표준 계산</strong><br>
            상속재산 ${window.formatCurrency(amount)} - 일괄공제 ${window.formatCurrency(deduction)} = ${window.formatCurrency(taxBase)}
        </div>
        <div class="explanation-step">
            <strong>2단계: 상속세 계산</strong><br>
            과세표준 ${window.formatCurrency(taxBase)}에 누진세율 적용<br>
            상속세액: <strong>${window.formatCurrency(tax)}</strong>
        </div>
    `;
    
    resultSection.style.display = 'block';
}

/**
 * 증여세 계산
 * 증여 재산가액에서 관계별 공제액을 차감하고 누진세율 적용
 */
function calculateGiftTax() {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'tax-screen') {
        console.error('calculateGiftTax: Not on tax screen, current screen:', currentScreen?.id);
        return;
    }
    
    const amount = window.getValueWithUnit('gift-amount', 100000000); // 억원 단위
    if (amount === null) return;
    
    const relation = document.getElementById('gift-relation').value;
    const rates = AppState.getTaxRates();
    if (!rates) {
        console.error('calculateGiftTax: Tax rates not loaded');
        return;
    }
    
    // 공제액
    const deduction = rates.giftTax.deductions[relation];
    const taxBase = Math.max(0, amount - deduction);
    
    // 증여세 계산
    let tax = 0;
    const brackets = rates.giftTax.brackets;
    for (let i = 0; i < brackets.length; i++) {
        if (taxBase <= brackets[i].max) {
            tax = taxBase * brackets[i].rate - brackets[i].deduction;
            break;
        }
    }
    
    const relationNames = {
        spouse: '배우자',
        linealDescendant: '직계존비속(성인)',
        linealDescendantMinor: '직계존비속(미성년자)',
        otherRelative: '기타 친족'
    };
    
    // 결과 표시
    const resultSection = document.getElementById('gift-result');
    const summaryElement = document.getElementById('gift-summary');
    const explanationElement = document.getElementById('gift-explanation');
    
    if (!resultSection || !summaryElement || !explanationElement) {
        console.error('calculateGiftTax: Required elements not found');
        if (window.ErrorLogger && window.ErrorLogger.log) {
            window.ErrorLogger.log(new Error('Required DOM elements not found'), 'calculateGiftTax');
            window.ErrorLogger.showErrorToUser(
                '증여세 계산 결과를 표시할 수 없습니다.',
                '페이지를 새로고침 후 다시 시도해주세요.'
            );
        }
        return;
    }
    
    summaryElement.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">증여세액</span>
                <span class="result-value">${window.formatCurrency(tax)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">과세표준</span>
                <span class="result-value">${window.formatCurrency(taxBase)}</span>
            </div>
        </div>
    `;
    
    explanationElement.innerHTML = `
        <div class="explanation-step">
            <strong>1단계: 공제액 적용</strong><br>
            증여자 관계: ${relationNames[relation]}<br>
            공제액: ${window.formatCurrency(deduction)} (10년간)
        </div>
        <div class="explanation-step">
            <strong>2단계: 과세표준 계산</strong><br>
            증여재산 ${window.formatCurrency(amount)} - 공제액 ${window.formatCurrency(deduction)} = ${window.formatCurrency(taxBase)}
        </div>
        <div class="explanation-step">
            <strong>3단계: 증여세 계산</strong><br>
            과세표준 ${window.formatCurrency(taxBase)}에 누진세율 적용<br>
            증여세액: <strong>${window.formatCurrency(tax)}</strong>
        </div>
    `;
    
    resultSection.style.display = 'block';
}

// Export to global scope
window.calculateInheritanceTax = calculateInheritanceTax;
window.calculateGiftTax = calculateGiftTax;

console.log('✅ Tax Calculator 모듈 로드 완료');

