/**
 * ===================================
 * Loan Calculator (금융대출/주택대출)
 * ===================================
 * 금융대출 및 주택대출 계산기
 */

import AppState from '../core/appState.js';
import { calculateLoanSummary } from '../domain/loan.js';
import { buildShareUrl, copyTextToClipboard } from '../core/deepLink.js';
import {
    getRecentCalculatorInputs,
    saveCalculatorInput,
    removeRecentCalculatorInput,
    clearRecentCalculatorInputs,
} from '../core/storage.js';

const FINANCIAL_LOAN_STORAGE_KEY = 'loan-financial';
const HOUSING_LOAN_STORAGE_KEY = 'loan-housing';

function getLoanShareState() {
    return {
        screen: 'loan-screen',
        financial: {
            loanAmount: document.getElementById('loan-amount')?.value || '',
            interestRate: document.getElementById('interest-rate')?.value || '',
            loanPeriod: document.getElementById('loan-period')?.value || '',
            repaymentType: document.getElementById('repayment-type')?.value || 'equalPrincipalInterest',
        },
        housing: {
            housePrice: document.getElementById('house-price')?.value || '',
            ownFunds: document.getElementById('own-funds')?.value || '',
            annualIncome: document.getElementById('housing-annual-income')?.value || '',
            interestRate: document.getElementById('housing-interest-rate')?.value || '',
            loanPeriod: document.getElementById('housing-loan-period')?.value || '',
            repaymentType: document.getElementById('housing-repayment-type')?.value || 'equalPrincipalInterest',
        },
    };
}

async function copyLoanShareUrl() {
    const btn = document.getElementById('copy-loan-share');
    if (!btn) return;
    const original = btn.textContent;
    const url = buildShareUrl(getLoanShareState());
    const ok = await copyTextToClipboard(url);
    btn.textContent = ok ? '복사됨!' : '복사 실패';
    setTimeout(() => {
        btn.textContent = original;
    }, 1200);
}

function getFinancialLoanInputState() {
    return {
        loanAmount: document.getElementById('loan-amount')?.value || '',
        interestRate: document.getElementById('interest-rate')?.value || '',
        loanPeriod: document.getElementById('loan-period')?.value || '',
        repaymentType: document.getElementById('repayment-type')?.value || 'equalPrincipalInterest',
        createdAt: Date.now(),
    };
}

function applyFinancialLoanInputState(state) {
    if (!state || typeof state !== 'object') return;
    const loanAmountEl = document.getElementById('loan-amount');
    const interestRateEl = document.getElementById('interest-rate');
    const loanPeriodEl = document.getElementById('loan-period');
    const repaymentTypeEl = document.getElementById('repayment-type');
    if (loanAmountEl) loanAmountEl.value = state.loanAmount ?? '';
    if (interestRateEl) interestRateEl.value = state.interestRate ?? '';
    if (loanPeriodEl) loanPeriodEl.value = state.loanPeriod ?? '';
    if (repaymentTypeEl) repaymentTypeEl.value = state.repaymentType ?? 'equalPrincipalInterest';
    const tabBtn = document.querySelector(`#repayment-type-tabs .tab-button[data-value="${repaymentTypeEl?.value}"]`);
    if (tabBtn) tabBtn.click();
}

function getHousingLoanInputState() {
    return {
        housePrice: document.getElementById('house-price')?.value || '',
        ownFunds: document.getElementById('own-funds')?.value || '',
        annualIncome: document.getElementById('housing-annual-income')?.value || '',
        interestRate: document.getElementById('housing-interest-rate')?.value || '',
        loanPeriod: document.getElementById('housing-loan-period')?.value || '',
        repaymentType: document.getElementById('housing-repayment-type')?.value || 'equalPrincipalInterest',
        createdAt: Date.now(),
    };
}

function applyHousingLoanInputState(state) {
    if (!state || typeof state !== 'object') return;
    const housePriceEl = document.getElementById('house-price');
    const ownFundsEl = document.getElementById('own-funds');
    const annualIncomeEl = document.getElementById('housing-annual-income');
    const interestRateEl = document.getElementById('housing-interest-rate');
    const loanPeriodEl = document.getElementById('housing-loan-period');
    const repaymentTypeEl = document.getElementById('housing-repayment-type');
    if (housePriceEl) housePriceEl.value = state.housePrice ?? '';
    if (ownFundsEl) ownFundsEl.value = state.ownFunds ?? '';
    if (annualIncomeEl) annualIncomeEl.value = state.annualIncome ?? '';
    if (interestRateEl) interestRateEl.value = state.interestRate ?? '';
    if (loanPeriodEl) loanPeriodEl.value = state.loanPeriod ?? '';
    if (repaymentTypeEl) repaymentTypeEl.value = state.repaymentType ?? 'equalPrincipalInterest';
    const tabBtn = document.querySelector(`#housing-repayment-type-tabs .tab-button[data-value="${repaymentTypeEl?.value}"]`);
    if (tabBtn) tabBtn.click();
}

function renderLoanRecentHistory(storageKey, listId, emptyId, itemFormatter, itemClassPrefix) {
    const listEl = document.getElementById(listId);
    const emptyEl = document.getElementById(emptyId);
    const sectionId = listId.includes('financial') ? 'financial-loan-recent-section' : 'housing-loan-recent-section';
    const sectionEl = document.getElementById(sectionId);
    if (!listEl || !emptyEl) return;

    const items = getRecentCalculatorInputs(storageKey);
    listEl.innerHTML = '';
    if (sectionEl) sectionEl.style.display = 'block';

    if (!items.length) {
        emptyEl.style.display = 'block';
        return;
    }

    emptyEl.style.display = 'none';
    items.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'recent-item';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.gap = '8px';
        li.style.padding = '6px 0';
        const date = item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '';
        li.innerHTML = `
            <button type="button" class="btn btn-secondary ${itemClassPrefix}-load" data-index="${idx}" style="flex:1; text-align:left;">
                ${itemFormatter(item)}<br><small>${date}</small>
            </button>
            <button type="button" class="btn btn-secondary ${itemClassPrefix}-delete" data-index="${idx}" aria-label="기록 삭제">삭제</button>
        `;
        listEl.appendChild(li);
    });
}

function renderFinancialLoanRecentHistory() {
    renderLoanRecentHistory(
        FINANCIAL_LOAN_STORAGE_KEY,
        'financial-loan-recent-list',
        'financial-loan-recent-empty',
        (item) => `금융대출 · ${item.loanAmount || '-'}억 / ${item.interestRate || '-'}% / ${item.loanPeriod || '-'}년`,
        'financial-loan-recent'
    );
}

function renderHousingLoanRecentHistory() {
    renderLoanRecentHistory(
        HOUSING_LOAN_STORAGE_KEY,
        'housing-loan-recent-list',
        'housing-loan-recent-empty',
        (item) => `주택대출 · ${item.housePrice || '-'}억 / 자금 ${item.ownFunds || '-'}억 / 금리 ${item.interestRate || '-'}%`,
        'housing-loan-recent'
    );
}

function setupLoanRecentHistory() {
    const financialSection = document.getElementById('financial-loan-recent-section');
    const housingSection = document.getElementById('housing-loan-recent-section');
    renderFinancialLoanRecentHistory();
    renderHousingLoanRecentHistory();

    if (financialSection && !financialSection.dataset.bound) {
        financialSection.addEventListener('click', (e) => {
            const loadBtn = e.target.closest('.financial-loan-recent-load');
            if (loadBtn) {
                const idx = Number(loadBtn.dataset.index);
                const items = getRecentCalculatorInputs(FINANCIAL_LOAN_STORAGE_KEY);
                if (Number.isInteger(idx) && items[idx]) applyFinancialLoanInputState(items[idx]);
                return;
            }
            const delBtn = e.target.closest('.financial-loan-recent-delete');
            if (delBtn) {
                const idx = Number(delBtn.dataset.index);
                removeRecentCalculatorInput(FINANCIAL_LOAN_STORAGE_KEY, idx);
                renderFinancialLoanRecentHistory();
                return;
            }
            if (e.target.closest('#financial-loan-recent-clear')) {
                clearRecentCalculatorInputs(FINANCIAL_LOAN_STORAGE_KEY);
                renderFinancialLoanRecentHistory();
            }
        });
        financialSection.dataset.bound = 'true';
    }

    if (housingSection && !housingSection.dataset.bound) {
        housingSection.addEventListener('click', (e) => {
            const loadBtn = e.target.closest('.housing-loan-recent-load');
            if (loadBtn) {
                const idx = Number(loadBtn.dataset.index);
                const items = getRecentCalculatorInputs(HOUSING_LOAN_STORAGE_KEY);
                if (Number.isInteger(idx) && items[idx]) applyHousingLoanInputState(items[idx]);
                return;
            }
            const delBtn = e.target.closest('.housing-loan-recent-delete');
            if (delBtn) {
                const idx = Number(delBtn.dataset.index);
                removeRecentCalculatorInput(HOUSING_LOAN_STORAGE_KEY, idx);
                renderHousingLoanRecentHistory();
                return;
            }
            if (e.target.closest('#housing-loan-recent-clear')) {
                clearRecentCalculatorInputs(HOUSING_LOAN_STORAGE_KEY);
                renderHousingLoanRecentHistory();
            }
        });
        housingSection.dataset.bound = 'true';
    }
}

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

    const summary = calculateLoanSummary({
        principal,
        annualRatePercent: annualRate,
        years,
        repaymentType,
        scheduleSampled: true
    });
    if (!summary.ok) {
        console.error('calculateLoan: Failed to calculate summary', summary.error);
        return;
    }

    const { monthlyPayment, totalInterest, totalPayment, schedule } = summary;
    
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

    saveCalculatorInput(FINANCIAL_LOAN_STORAGE_KEY, getFinancialLoanInputState(), 5);
    renderFinancialLoanRecentHistory();
    
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
    
    const summary = calculateLoanSummary({
        principal: maxLoan,
        annualRatePercent: annualRate,
        years,
        repaymentType,
        scheduleSampled: true
    });
    if (!summary.ok) {
        console.error('calculateHousingLoan: Failed to calculate summary', summary.error);
        return;
    }

    const { monthlyPayment, totalInterest, schedule } = summary;
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

    saveCalculatorInput(HOUSING_LOAN_STORAGE_KEY, getHousingLoanInputState(), 5);
    renderHousingLoanRecentHistory();
    
    // Store chart data globally for resize
    window.housingLoanChartData = { schedule, principal: maxLoan };
    drawLoanChart('housing-loan-chart', schedule, maxLoan);
}

// Export to global scope
window.calculateLoan = calculateLoan;
window.calculateHousingLoan = calculateHousingLoan;
window.getRepaymentFormula = getRepaymentFormula;

document.addEventListener('DOMContentLoaded', function() {
    setupLoanRecentHistory();
    const copyBtn = document.getElementById('copy-loan-share');
    if (copyBtn && !copyBtn.dataset.bound) {
        copyBtn.addEventListener('click', copyLoanShareUrl);
        copyBtn.dataset.bound = 'true';
    }
});

console.log('✅ Loan Calculator 모듈 로드 완료');

