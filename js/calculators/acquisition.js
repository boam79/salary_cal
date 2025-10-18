/**
 * ===================================
 * Acquisition Tax Calculator
 * ===================================
 * 취득세 및 등록면허세 계산기
 */

import AppState from '../core/appState.js';

/**
 * 취득세 및 등록면허세 계산
 * 부동산 유형에 따라 취득세율을 적용하고 등록면허세, 지방교육세 계산
 */
function calculateAcquisitionTax() {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'acquisition-tax-screen') {
        console.error('calculateAcquisitionTax: Not on acquisition-tax screen');
        return;
    }
    
    const price = window.getValueWithUnit('acquisition-price', 100000000); // 억원
    if (price === null) return;
    
    const propertyType = document.getElementById('property-type').value;
    const rates = AppState.getTaxRates();
    if (!rates) {
        console.error('calculateAcquisitionTax: Tax rates not loaded');
        return;
    }
    
    let acquisitionRate = 0;
    let typeName = '';
    
    switch (propertyType) {
        case 'house-first':
            acquisitionRate = rates.acquisitionTax.house.first;
            typeName = '주택 (1주택)';
            break;
        case 'house-second':
            acquisitionRate = rates.acquisitionTax.house.second;
            typeName = '주택 (2주택)';
            break;
        case 'house-third':
            acquisitionRate = rates.acquisitionTax.house.third;
            typeName = '주택 (3주택 이상)';
            break;
        case 'land':
            acquisitionRate = rates.acquisitionTax.land;
            typeName = '토지';
            break;
        case 'farmland':
            acquisitionRate = rates.acquisitionTax.farmland;
            typeName = '농지';
            break;
    }
    
    const acquisitionTax = price * acquisitionRate;
    const registrationTax = price * rates.acquisitionTax.registrationTax;
    const localEducationTax = price * rates.acquisitionTax.localEducationTax;
    const totalTax = acquisitionTax + registrationTax + localEducationTax;
    
    const resultSection = document.getElementById('acquisition-result');
    if (!resultSection) {
        console.error('calculateAcquisitionTax: result element not found');
        return;
    }
    
    resultSection.innerHTML = `
        <h3 class="result-title">계산 결과</h3>
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">총 세금</span>
                <span class="result-value">${formatCurrency(totalTax)}</span>
            </div>
        </div>
        <div class="result-details">
            <h4>세금 상세 내역</h4>
            <div class="table-wrapper">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>항목</th>
                            <th>세율</th>
                            <th>금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>취득세</td>
                            <td>${(acquisitionRate * 100)}%</td>
                            <td>${formatCurrency(acquisitionTax)}</td>
                        </tr>
                        <tr>
                            <td>등록면허세</td>
                            <td>2%</td>
                            <td>${formatCurrency(registrationTax)}</td>
                        </tr>
                        <tr>
                            <td>지방교육세</td>
                            <td>0.4%</td>
                            <td>${formatCurrency(localEducationTax)}</td>
                        </tr>
                        <tr style="font-weight: 700; background-color: var(--color-surface);">
                            <td>합계</td>
                            <td></td>
                            <td>${formatCurrency(totalTax)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="explanation-section">
            <button class="explanation-toggle">▼ 계산 과정 보기</button>
            <div class="explanation-content">
                <div class="explanation-step">
                    <strong>1단계: 부동산 유형 확인</strong><br>
                    유형: ${typeName}<br>
                    취득가액: ${formatCurrency(price)}
                </div>
                <div class="explanation-step">
                    <strong>2단계: 각 세금 계산</strong><br>
                    • 취득세: ${formatCurrency(price)} × ${(acquisitionRate * 100)}% = ${formatCurrency(acquisitionTax)}<br>
                    • 등록면허세: ${formatCurrency(price)} × 2% = ${formatCurrency(registrationTax)}<br>
                    • 지방교육세: ${formatCurrency(price)} × 0.4% = ${formatCurrency(localEducationTax)}
                </div>
                <div class="explanation-step">
                    <strong>3단계: 총 세금</strong><br>
                    ${formatCurrency(acquisitionTax)} + ${formatCurrency(registrationTax)} + ${formatCurrency(localEducationTax)} = 
                    <strong>${formatCurrency(totalTax)}</strong>
                </div>
            </div>
        </div>
    `;
    
    resultSection.style.display = 'block';
    
    // Re-setup explanation toggles for dynamically added content
    if (typeof setupExplanationToggles === 'function') {
        setupExplanationToggles();
    }
}

// Export to global scope
window.calculateAcquisitionTax = calculateAcquisitionTax;

console.log('✅ Acquisition Tax Calculator 모듈 로드 완료');

