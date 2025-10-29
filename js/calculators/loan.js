/**
 * ===================================
 * Loan Calculator (금융대출/주택대출)
 * ===================================
 * 금융대출 및 주택대출 계산기
 */

import AppState from '../core/appState.js';

/**
 * 상환방식별 계산 공식 설명
 */
function getRepaymentFormula(type) {
    switch (type) {
        case 'equalPrincipalInterest':
            return `월 상환액 = P × r × (1+r)^n / ((1+r)^n - 1)<br>
                    P: 대출원금, r: 월이자율, n: 총 상환개월 수`;
        case 'equalPrincipal':
            return `월 원금 = P / n<br>
                    월 이자 = 잔여원금 × r<br>
                    월 상환액 = 월 원금 + 월 이자`;
        case 'maturity':
            return `월 이자 = P × r<br>
                    만기 상환액 = P + (총 이자)`;
        default:
            return '';
    }
}

/**
 * 금융대출 계산
 */
function calculateLoan() {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'loan-screen') {
        console.error('calculateLoan: Not on loan screen');
        return;
    }
    
    // 금융대출 탭이 활성화되어 있는지 확인
    const financialLoanTab = document.getElementById('financial-loan-tab');
    if (!financialLoanTab || !financialLoanTab.classList.contains('active')) {
        console.error('calculateLoan: Financial loan tab is not active');
        return;
    }
    
    const principal = window.getValueWithUnit('loan-amount', 100000000);
    if (principal === null) return;
    
    const annualRate = window.validateInput(
        document.getElementById('interest-rate').value,
        '연이자율',
        { max: 30, isPercent: true }
    );
    const years = window.validateInput(
        document.getElementById('loan-period').value,
        '대출기간',
        { min: 1, max: 50 }
    );
    
    if (annualRate === null || years === null) return;
    
    const repaymentType = document.getElementById('repayment-type').value;
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    
    let monthlyPayment = 0;
    let totalInterest = 0;
    let schedule = [];
    
    // 상환방식별 계산
    if (repaymentType === 'equalPrincipalInterest') {
        monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                         (Math.pow(1 + monthlyRate, months) - 1);
        
        let balance = principal;
        for (let i = 1; i <= months; i++) {
            const interest = balance * monthlyRate;
            const principalPayment = monthlyPayment - interest;
            balance -= principalPayment;
            totalInterest += interest;
            
            if (i <= 12 || i % 12 === 0 || i === months) {
                schedule.push({
                    month: i,
                    principal: principalPayment,
                    interest: interest,
                    payment: monthlyPayment,
                    balance: Math.max(0, balance)
                });
            }
        }
    } else if (repaymentType === 'equalPrincipal') {
        const principalPayment = principal / months;
        let balance = principal;
        
        for (let i = 1; i <= months; i++) {
            const interest = balance * monthlyRate;
            const payment = principalPayment + interest;
            balance -= principalPayment;
            totalInterest += interest;
            
            if (i <= 12 || i % 12 === 0 || i === months) {
                schedule.push({
                    month: i,
                    principal: principalPayment,
                    interest: interest,
                    payment: payment,
                    balance: Math.max(0, balance)
                });
            }
        }
        monthlyPayment = principalPayment + (principal * monthlyRate);
    } else if (repaymentType === 'maturity') {
        monthlyPayment = principal * monthlyRate;
        totalInterest = monthlyPayment * months;
        
        for (let i = 1; i <= months; i++) {
            if (i <= 12 || i % 12 === 0 || i === months) {
                schedule.push({
                    month: i,
                    principal: i === months ? principal : 0,
                    interest: monthlyPayment,
                    payment: i === months ? principal + monthlyPayment : monthlyPayment,
                    balance: i === months ? 0 : principal
                });
            }
        }
    }
    
    const totalPayment = principal + totalInterest;
    
    const repaymentTypeNames = {
        'equalPrincipalInterest': '원리금균등상환',
        'equalPrincipal': '원금균등상환',
        'maturity': '만기일시상환'
    };
    
    const summaryElement = document.getElementById('loan-summary');
    const explanationElement = document.getElementById('loan-explanation');
    
    if (!summaryElement || !explanationElement) {
        console.error('calculateLoan: Required elements not found', {
            summaryElement: !!summaryElement,
            explanationElement: !!explanationElement,
            currentTab: document.querySelector('.tab-content.active')?.id
        });
        
        // ErrorLogger가 있으면 사용
        if (window.ErrorLogger && window.ErrorLogger.log) {
            window.ErrorLogger.log(new Error('Required DOM elements not found'), 'calculateLoan');
        }
        return;
    }
    
    summaryElement.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">월 상환액</span>
                <span class="result-value">${window.formatCurrency(monthlyPayment)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">총 이자</span>
                <span class="result-value">${window.formatCurrency(totalInterest)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">총 상환액</span>
                <span class="result-value">${window.formatCurrency(totalPayment)}</span>
            </div>
        </div>
        <div class="result-details">
            <h4>상환 스케줄 (주요 월차)</h4>
            <div class="table-wrapper">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>월차</th>
                            <th>원금</th>
                            <th>이자</th>
                            <th>월 상환액</th>
                            <th>잔액</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${schedule.map(s => `
                            <tr>
                                <td>${s.month}개월</td>
                                <td>${window.formatCurrency(s.principal)}</td>
                                <td>${window.formatCurrency(s.interest)}</td>
                                <td>${window.formatCurrency(s.payment)}</td>
                                <td>${window.formatCurrency(s.balance)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    explanationElement.innerHTML = `
        <div class="explanation-step">
            <strong>상환방식</strong><br>
            ${repaymentTypeNames[repaymentType]}
        </div>
        <div class="explanation-step">
            <strong>계산 공식</strong><br>
            ${getRepaymentFormula(repaymentType)}
        </div>
        <div class="explanation-step">
            <strong>계산 결과</strong><br>
            • 대출원금: ${window.formatCurrency(principal)}<br>
            • 연이자율: ${annualRate}% (월 ${window.formatNumber(monthlyRate * 100)}%)<br>
            • 대출기간: ${years}년 (${months}개월)<br>
            • 월 상환액: <strong>${window.formatCurrency(monthlyPayment)}</strong><br>
            • 총 이자: <strong>${window.formatCurrency(totalInterest)}</strong>
        </div>
    `;
    
    document.getElementById('loan-result').style.display = 'block';
    document.getElementById('loan-chart-section').style.display = 'block';
    
    // Store chart data globally for resize
    window.loanChartData = { schedule, principal };
    drawLoanChart('loan-chart', schedule, principal);
}

/**
 * 주택대출 계산
 */
function calculateHousingLoan() {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'loan-screen') {
        console.error('calculateHousingLoan: Not on loan screen');
        return;
    }
    
    // 주택대출 탭이 활성화되어 있는지 확인
    const housingLoanTab = document.getElementById('housing-loan-tab');
    if (!housingLoanTab || !housingLoanTab.classList.contains('active')) {
        console.error('calculateHousingLoan: Housing loan tab is not active');
        return;
    }
    
    const housePrice = window.getValueWithUnit('house-price', 100000000);
    const ownFunds = window.getValueWithUnit('own-funds', 100000000);
    const annualIncome = window.getValueWithUnit('housing-annual-income', 10000);
    const annualRate = window.validateInput(
        document.getElementById('housing-interest-rate').value,
        '연이자율',
        { max: 30, isPercent: true }
    );
    const years = window.validateInput(
        document.getElementById('housing-loan-period').value,
        '대출기간',
        { min: 1, max: 50 }
    );
    
    if (housePrice === null || ownFunds === null || annualIncome === null || 
        annualRate === null || years === null) return;
    
    const rates = AppState.getTaxRates();
    if (!rates) {
        console.error('calculateHousingLoan: Tax rates not loaded');
        return;
    }
    
    // 상환방식 가져오기
    const repaymentType = document.getElementById('housing-repayment-type').value;
    
    // LTV, DTI 계산
    const ltvRate = rates.loanInterest.housing.ltv.max;
    const dtiRate = rates.loanInterest.housing.dti.max;
    const maxLoanByLTV = housePrice * ltvRate;
    const maxMonthlyPaymentByDTI = (annualIncome * dtiRate) / 12;
    const requiredLoan = housePrice - ownFunds;
    
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    
    const maxLoanByDTI = maxMonthlyPaymentByDTI * (Math.pow(1 + monthlyRate, months) - 1) / 
                         (monthlyRate * Math.pow(1 + monthlyRate, months));
    
    const maxLoan = Math.min(maxLoanByLTV, maxLoanByDTI, requiredLoan);
    
    let monthlyPayment = 0;
    let totalInterest = 0;
    let schedule = [];
    
    // 상환방식별 계산
    if (repaymentType === 'equalPrincipalInterest') {
        // 원리금균등상환
        monthlyPayment = maxLoan * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                         (Math.pow(1 + monthlyRate, months) - 1);
        
        let balance = maxLoan;
        for (let i = 1; i <= months; i++) {
            const interest = balance * monthlyRate;
            const principalPayment = monthlyPayment - interest;
            balance -= principalPayment;
            totalInterest += interest;
            
            if (i <= 12 || i % 12 === 0 || i === months) {
                schedule.push({
                    month: i,
                    principal: principalPayment,
                    interest: interest,
                    payment: monthlyPayment,
                    balance: Math.max(0, balance)
                });
            }
        }
    } else if (repaymentType === 'equalPrincipal') {
        // 원금균등상환
        const principalPayment = maxLoan / months;
        let balance = maxLoan;
        
        for (let i = 1; i <= months; i++) {
            const interest = balance * monthlyRate;
            const payment = principalPayment + interest;
            balance -= principalPayment;
            totalInterest += interest;
            
            if (i <= 12 || i % 12 === 0 || i === months) {
                schedule.push({
                    month: i,
                    principal: principalPayment,
                    interest: interest,
                    payment: payment,
                    balance: Math.max(0, balance)
                });
            }
        }
        monthlyPayment = principalPayment + (maxLoan * monthlyRate);
    } else if (repaymentType === 'maturity') {
        // 만기일시상환
        monthlyPayment = maxLoan * monthlyRate;
        totalInterest = monthlyPayment * months;
        
        for (let i = 1; i <= months; i++) {
            if (i <= 12 || i % 12 === 0 || i === months) {
                schedule.push({
                    month: i,
                    principal: i === months ? maxLoan : 0,
                    interest: monthlyPayment,
                    payment: i === months ? maxLoan + monthlyPayment : monthlyPayment,
                    balance: i === months ? 0 : maxLoan
                });
            }
        }
    }
    
    const totalPayment = maxLoan + totalInterest;
    
    const summaryElement = document.getElementById('housing-loan-summary');
    const explanationElement = document.getElementById('housing-loan-explanation');
    
    if (!summaryElement || !explanationElement) {
        console.error('calculateHousingLoan: Required elements not found', {
            summaryElement: !!summaryElement,
            explanationElement: !!explanationElement,
            currentTab: document.querySelector('.tab-content.active')?.id
        });
        
        // ErrorLogger가 있으면 사용
        if (window.ErrorLogger && window.ErrorLogger.log) {
            window.ErrorLogger.log(new Error('Required DOM elements not found'), 'calculateHousingLoan');
        }
        return;
    }
    
    summaryElement.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">대출가능액</span>
                <span class="result-value">${window.formatCurrency(maxLoan)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">월 상환액</span>
                <span class="result-value">${window.formatCurrency(monthlyPayment)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">총 이자</span>
                <span class="result-value">${window.formatCurrency(totalInterest)}</span>
            </div>
        </div>
        <div class="result-details">
            <h4>대출 한도 분석</h4>
            <div class="table-wrapper">
                <table class="result-table">
                    <tbody>
                        <tr>
                            <td>LTV 기준 (${ltvRate * 100}%)</td>
                            <td>${window.formatCurrency(maxLoanByLTV)}</td>
                        </tr>
                        <tr>
                            <td>DTI 기준 (${dtiRate * 100}%)</td>
                            <td>${window.formatCurrency(maxLoanByDTI)}</td>
                        </tr>
                        <tr>
                            <td>필요 대출액</td>
                            <td>${window.formatCurrency(requiredLoan)}</td>
                        </tr>
                        <tr style="font-weight: 700; background-color: var(--color-surface);">
                            <td>최종 대출가능액</td>
                            <td>${window.formatCurrency(maxLoan)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    explanationElement.innerHTML = `
        <div class="explanation-step">
            <strong>1단계: LTV 한도 계산</strong><br>
            주택가격 ${window.formatCurrency(housePrice)} × ${ltvRate * 100}% = ${window.formatCurrency(maxLoanByLTV)}
        </div>
        <div class="explanation-step">
            <strong>2단계: DTI 한도 계산</strong><br>
            연소득 ${window.formatCurrency(annualIncome)} × ${dtiRate * 100}% = ${window.formatCurrency(annualIncome * dtiRate)}<br>
            이를 기반으로 최대 대출액: ${window.formatCurrency(maxLoanByDTI)}
        </div>
        <div class="explanation-step">
            <strong>3단계: 최종 대출액 결정</strong><br>
            최종 대출가능액: <strong>${window.formatCurrency(maxLoan)}</strong>
        </div>
    `;
    
    document.getElementById('housing-loan-result').style.display = 'block';
    document.getElementById('housing-loan-chart-section').style.display = 'block';
    
    // Store chart data globally for resize
    window.housingLoanChartData = { schedule, principal: maxLoan };
    drawLoanChart('housing-loan-chart', schedule, maxLoan);
}

// Export to global scope
window.calculateLoan = calculateLoan;
window.calculateHousingLoan = calculateHousingLoan;
window.getRepaymentFormula = getRepaymentFormula;

console.log('✅ Loan Calculator 모듈 로드 완료');

