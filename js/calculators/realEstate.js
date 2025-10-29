/**
 * ===================================
 * Real Estate Calculator
 * ===================================
 * 부동산 계산기 (중개수수료, 양도소득세, 보유세, DSR)
 */

/**
 * 중개수수료 계산
 */
function calculateBrokerageFee() {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'real-estate-screen') {
        console.error('calculateBrokerageFee: Not on real-estate screen');
        return;
    }
    
    const propertyPrice = window.getValueWithUnit('property-price', 100000000);
    if (propertyPrice === null) return;
    
    let feeRate = 0;
    if (propertyPrice < 50000000) feeRate = 0.006;
    else if (propertyPrice < 200000000) feeRate = 0.005;
    else if (propertyPrice < 600000000) feeRate = 0.004;
    else if (propertyPrice < 900000000) feeRate = 0.005;
    else feeRate = 0.009;
    
    const totalFee = propertyPrice * feeRate;
    const buyerFee = totalFee / 2;
    const sellerFee = totalFee / 2;
    
    const resultSummary = document.getElementById('brokerage-fee-summary');
    if (!resultSummary) return;
    
    resultSummary.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">총 중개수수료</span>
                <span class="result-value">${window.formatCurrency(totalFee)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">매수자 부담</span>
                <span class="result-value">${window.formatCurrency(buyerFee)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">매도자 부담</span>
                <span class="result-value">${window.formatCurrency(sellerFee)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">적용 수수료율</span>
                <span class="result-value">${(feeRate * 100).toFixed(2)}%</span>
            </div>
        </div>
    `;
    
    document.getElementById('brokerage-fee-explanation').innerHTML = `
        <div class="explanation-step">
            <strong>1단계: 중개수수료율 확인</strong><br>
            부동산 가격 ${window.formatCurrency(propertyPrice)}에 따른 중개수수료율: ${(feeRate * 100).toFixed(1)}%
        </div>
        <div class="explanation-step">
            <strong>2단계: 중개수수료 계산</strong><br>
            총 중개수수료: ${window.formatCurrency(propertyPrice)} × ${(feeRate * 100).toFixed(1)}% = ${window.formatCurrency(totalFee)}
        </div>
    `;
    
    document.getElementById('brokerage-fee-result').style.display = 'block';
}

/**
 * 양도소득세 계산
 */
function calculateCapitalGains() {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'real-estate-screen') return;
    
    const acquisitionPrice = window.getValueWithUnit('capital-gains-acquisition-price', 100000000);
    const transferPrice = window.getValueWithUnit('transfer-price', 100000000);
    const holdingPeriod = window.validateInput(
        document.getElementById('capital-gains-holding-period').value,
        '보유기간'
    );
    
    if (acquisitionPrice === null || transferPrice === null || holdingPeriod === null) return;
    
    const capitalGain = transferPrice - acquisitionPrice;
    if (capitalGain <= 0) {
        alert('양도차익이 없습니다.');
        return;
    }
    
    // 장기보유특별공제
    let deductionRate = 0;
    if (holdingPeriod >= 10) deductionRate = 0.80;
    else if (holdingPeriod >= 9) deductionRate = 0.72;
    else if (holdingPeriod >= 8) deductionRate = 0.64;
    else if (holdingPeriod >= 7) deductionRate = 0.56;
    else if (holdingPeriod >= 6) deductionRate = 0.48;
    else if (holdingPeriod >= 5) deductionRate = 0.40;
    else if (holdingPeriod >= 4) deductionRate = 0.32;
    else if (holdingPeriod >= 3) deductionRate = 0.24;
    
    const deduction = capitalGain * deductionRate;
    const taxableGain = capitalGain - deduction;
    
    // 양도소득세율
    let taxRate = 0;
    if (taxableGain <= 12000000) taxRate = 0.06;
    else if (taxableGain <= 46000000) taxRate = 0.15;
    else if (taxableGain <= 88000000) taxRate = 0.24;
    else if (taxableGain <= 150000000) taxRate = 0.35;
    else if (taxableGain <= 300000000) taxRate = 0.38;
    else if (taxableGain <= 500000000) taxRate = 0.40;
    else taxRate = 0.42;
    
    const tax = taxableGain * taxRate;
    
    const summaryElement = document.getElementById('capital-gains-summary');
    const explanationElement = document.getElementById('capital-gains-explanation');
    
    if (!summaryElement || !explanationElement) return;
    
    summaryElement.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">양도소득세</span>
                <span class="result-value">${window.formatCurrency(tax)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">양도차익</span>
                <span class="result-value">${window.formatCurrency(capitalGain)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">장기보유특별공제</span>
                <span class="result-value">${window.formatCurrency(deduction)} (${(deductionRate * 100).toFixed(0)}%)</span>
            </div>
        </div>
    `;
    
    explanationElement.innerHTML = `
        <div class="explanation-step">
            <strong>1단계: 양도차익 계산</strong><br>
            ${window.formatCurrency(transferPrice)} - ${window.formatCurrency(acquisitionPrice)} = ${window.formatCurrency(capitalGain)}
        </div>
        <div class="explanation-step">
            <strong>2단계: 장기보유특별공제</strong><br>
            보유기간: ${holdingPeriod}년 (공제율: ${(deductionRate * 100).toFixed(0)}%)
        </div>
    `;
    
    document.getElementById('capital-gains-result').style.display = 'block';
}

/**
 * 보유세 계산 (재산세 + 종합부동산세)
 */
function calculatePropertyTax() {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'real-estate-screen') return;
    
    const propertyValue = window.getValueWithUnit('property-value', 100000000);
    if (propertyValue === null) return;
    
    let propertyTaxRate = 0;
    if (propertyValue <= 60000000) propertyTaxRate = 0.001;
    else if (propertyValue <= 150000000) propertyTaxRate = 0.0015;
    else if (propertyValue <= 300000000) propertyTaxRate = 0.0025;
    else propertyTaxRate = 0.004;
    
    const propertyTax = propertyValue * propertyTaxRate;
    
    let comprehensiveTax = 0;
    if (propertyValue > 600000000) {
        const taxableAmount = propertyValue - 600000000;
        if (taxableAmount <= 300000000) comprehensiveTax = taxableAmount * 0.006;
        else if (taxableAmount <= 600000000) comprehensiveTax = 300000000 * 0.006 + (taxableAmount - 300000000) * 0.008;
        else if (taxableAmount <= 1200000000) comprehensiveTax = 300000000 * 0.006 + 300000000 * 0.008 + (taxableAmount - 600000000) * 0.012;
        else comprehensiveTax = 300000000 * 0.006 + 300000000 * 0.008 + 600000000 * 0.012 + (taxableAmount - 1200000000) * 0.016;
    }
    
    const totalTax = propertyTax + comprehensiveTax;
    
    const summaryElement = document.getElementById('property-tax-summary');
    if (summaryElement) {
        summaryElement.innerHTML = `
            <div class="result-summary">
                <div class="result-item highlight">
                    <span class="result-label">연간 보유세 총액</span>
                    <span class="result-value">${window.formatCurrency(totalTax)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">재산세</span>
                    <span class="result-value">${window.formatCurrency(propertyTax)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">종합부동산세</span>
                    <span class="result-value">${window.formatCurrency(comprehensiveTax)}</span>
                </div>
            </div>
        `;
    }
    
    const explanationElement = document.getElementById('property-tax-explanation');
    if (explanationElement) {
        explanationElement.innerHTML = `
            <div class="explanation-step">
                <strong>1단계: 부동산 가치 확인</strong><br>
                부동산 가치: ${window.formatCurrency(propertyValue)}
            </div>
            <div class="explanation-step">
                <strong>2단계: 재산세 계산</strong><br>
                재산세율: ${(propertyTaxRate * 100)}%<br>
                재산세: ${window.formatCurrency(propertyValue)} × ${(propertyTaxRate * 100)}% = ${window.formatCurrency(propertyTax)}
            </div>
            <div class="explanation-step">
                <strong>3단계: 종합부동산세 계산</strong><br>
                ${comprehensiveTax > 0 ?
                    `과세표준: ${window.formatCurrency(propertyValue - 600000000)}<br>
                    종합부동산세: ${window.formatCurrency(propertyValue - 600000000)} × 0.6% = ${window.formatCurrency(comprehensiveTax)}` :
                    '종합부동산세 과세대상 아님 (6억원 이하)'
                }
            </div>
            <div class="explanation-step">
                <strong>4단계: 총 보유세</strong><br>
                재산세 + 종합부동산세 = <strong>${window.formatCurrency(totalTax)}</strong>
            </div>
        `;
    }
    
    document.getElementById('property-tax-result').style.display = 'block';
}

/**
 * DSR (총부채원리금상환비율) 계산
 */
function calculateDSR() {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'real-estate-screen') return;
    
    // DSR 탭이 활성화되어 있는지 확인
    const dsrTab = document.getElementById('dsr-tab');
    if (!dsrTab || !dsrTab.classList.contains('active')) {
        console.error('calculateDSR: DSR tab is not active');
        return;
    }
    
    const annualIncome = window.getValueWithUnit('annual-income', 10000);
    const loanAmount = window.getValueWithUnit('dsr-loan-amount', 100000000);
    const interestRate = window.validateInput(
        document.getElementById('dsr-interest-rate').value,
        '연이자율',
        { max: 30, isPercent: true }
    );
    
    if (annualIncome === null || loanAmount === null || interestRate === null) return;
    
    // 상환방식 가져오기
    const repaymentType = document.getElementById('dsr-repayment-type').value || 'equalPrincipalInterest';
    
    const monthlyRate = interestRate / 100 / 12;
    const loanPeriod = 30 * 12; // 30년
    
    let monthlyPayment;
    
    // 상환방식에 따른 월 상환액 계산
    switch (repaymentType) {
        case 'equalPrincipalInterest':
            // 원리금균등상환
            monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanPeriod)) / 
                           (Math.pow(1 + monthlyRate, loanPeriod) - 1);
            break;
        case 'equalPrincipal':
            // 원금균등상환
            const monthlyPrincipal = loanAmount / loanPeriod;
            monthlyPayment = monthlyPrincipal + (loanAmount * monthlyRate);
            break;
        case 'maturity':
            // 만기일시상환
            monthlyPayment = loanAmount * monthlyRate;
            break;
        default:
            monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanPeriod)) / 
                           (Math.pow(1 + monthlyRate, loanPeriod) - 1);
    }
    
    const annualPayment = monthlyPayment * 12;
    const dsrRatio = (annualPayment / annualIncome) * 100;
    
    const resultSection = document.getElementById('dsr-result');
    if (resultSection) {
        // 상환방식별 표시명
        const repaymentTypeNames = {
            'equalPrincipalInterest': '원리금균등상환',
            'equalPrincipal': '원금균등상환',
            'maturity': '만기일시상환'
        };
        
        resultSection.innerHTML = `
            <h3 class="result-title">DSR 계산 결과</h3>
            <div class="result-item highlight">
                <span class="result-label">DSR 비율</span>
                <span class="result-value">${dsrRatio.toFixed(2)}%</span>
            </div>
            <div class="result-item">
                <span class="result-label">월 상환액</span>
                <span class="result-value">${window.formatCurrency(monthlyPayment)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">상환방식</span>
                <span class="result-value">${repaymentTypeNames[repaymentType] || '원리금균등상환'}</span>
            </div>
            <div class="result-item">
                <span class="result-label">DSR 평가</span>
                <span class="result-value">${dsrRatio <= 40 ? '✅ 적정 범위' : '⚠️ 높은 부담'}</span>
            </div>
            <div class="explanation-section">
                <button class="explanation-toggle">▼ 계산 과정 보기</button>
                <div class="explanation-content" id="dsr-explanation"></div>
            </div>
        `;
        
        // 설명 내용 생성
        const explanationElement = document.getElementById('dsr-explanation');
        if (explanationElement) {
            explanationElement.innerHTML = `
                <div class="explanation-step">
                    <strong>1단계: 기본 정보 확인</strong><br>
                    연소득: ${window.formatCurrency(annualIncome)}<br>
                    대출금액: ${window.formatCurrency(loanAmount)}<br>
                    연이자율: ${interestRate}%
                </div>
                <div class="explanation-step">
                    <strong>2단계: 월 상환액 계산</strong><br>
                    상환방식: ${repaymentTypeNames[repaymentType] || '원리금균등상환'}<br>
                    월 상환액: ${window.formatCurrency(monthlyPayment)}
                </div>
                <div class="explanation-step">
                    <strong>3단계: DSR 계산</strong><br>
                    DSR = (월 상환액 × 12) ÷ 연소득 × 100<br>
                    DSR = (${window.formatCurrency(monthlyPayment)} × 12) ÷ ${window.formatCurrency(annualIncome)} × 100<br>
                    DSR = ${dsrRatio.toFixed(2)}%
                </div>
                <div class="explanation-step">
                    <strong>4단계: DSR 평가</strong><br>
                    ${dsrRatio <= 40 ? 
                        '✅ 적정 범위 (40% 이하)' : 
                        '⚠️ 높은 부담 (40% 초과)'
                    }
                </div>
            `;
        }
        
        resultSection.style.display = 'block';
    }
}

// Export to global scope
window.calculateBrokerageFee = calculateBrokerageFee;
window.calculateCapitalGains = calculateCapitalGains;
window.calculatePropertyTax = calculatePropertyTax;
window.calculateDSR = calculateDSR;

console.log('✅ Real Estate Calculator 모듈 로드 완료');

