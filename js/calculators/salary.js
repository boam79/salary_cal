/**
 * ===================================
 * Salary Calculator
 * ===================================
 * 연봉 및 월급 실수령액 계산기
 */

import AppState from '../core/appState.js';
import { computeMonthlyFromHourlyWage } from '../domain/salary.js';
import {
    getRecentCalculatorInputs,
    saveCalculatorInput,
    removeRecentCalculatorInput,
    clearRecentCalculatorInputs,
} from '../core/storage.js';
import { updateShareButtons, setupSummaryCopyButtons } from '../core/deepLink.js';

const SALARY_STORAGE_KEY = 'salary';

function getSalaryInputState() {
    const salaryTypeEl = document.querySelector('input[name="salary-type"]:checked');
    const salaryType = salaryTypeEl ? salaryTypeEl.value : 'annual';
    return {
        salaryType,
        annualSalary: document.getElementById('annual-salary')?.value || '',
        workHours: document.getElementById('work-hours')?.value || '',
        hourlyWage: document.getElementById('hourly-wage')?.value || '',
        createdAt: Date.now(),
    };
}

function applySalaryInputState(state) {
    if (!state || typeof state !== 'object') return;
    const salaryType = state.salaryType === 'monthly' ? 'monthly' : 'annual';
    const radio = document.querySelector(`input[name="salary-type"][value="${salaryType}"]`);
    if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
    }

    const annualEl = document.getElementById('annual-salary');
    const workEl = document.getElementById('work-hours');
    const hourlyEl = document.getElementById('hourly-wage');
    if (annualEl) annualEl.value = state.annualSalary ?? '';
    if (workEl) workEl.value = state.workHours ?? '';
    if (hourlyEl) hourlyEl.value = state.hourlyWage ?? String(AppState.getCurrentMinimumWage());
}

function renderSalaryRecentHistory() {
    const listEl = document.getElementById('salary-recent-list');
    const emptyEl = document.getElementById('salary-recent-empty');
    if (!listEl || !emptyEl) return;

    const items = getRecentCalculatorInputs(SALARY_STORAGE_KEY);
    listEl.innerHTML = '';

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
        const typeLabel = item.salaryType === 'monthly' ? '월급' : '연봉';
        const valueLabel = item.salaryType === 'monthly'
            ? `주 ${item.workHours || '-'}h / 시급 ${item.hourlyWage || '-'}`
            : `연봉 ${item.annualSalary || '-'}`;
        const date = item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '';
        li.innerHTML = `
            <button type="button" class="btn btn-secondary salary-recent-load" data-index="${idx}" style="flex:1; text-align:left;">
                ${typeLabel} · ${valueLabel}<br><small>${date}</small>
            </button>
            <button type="button" class="btn btn-secondary salary-recent-delete" data-index="${idx}" aria-label="기록 삭제">삭제</button>
        `;
        listEl.appendChild(li);
    });
}

function setupSalaryRecentHistory() {
    const sectionEl = document.getElementById('salary-recent-section');
    if (!sectionEl) return;

    renderSalaryRecentHistory();

    if (!sectionEl.dataset.bound) {
        sectionEl.addEventListener('click', (e) => {
            const loadBtn = e.target.closest('.salary-recent-load');
            if (loadBtn) {
                const idx = Number(loadBtn.dataset.index);
                const items = getRecentCalculatorInputs(SALARY_STORAGE_KEY);
                if (Number.isInteger(idx) && items[idx]) {
                    applySalaryInputState(items[idx]);
                }
                return;
            }

            const delBtn = e.target.closest('.salary-recent-delete');
            if (delBtn) {
                const idx = Number(delBtn.dataset.index);
                removeRecentCalculatorInput(SALARY_STORAGE_KEY, idx);
                renderSalaryRecentHistory();
                return;
            }

            if (e.target.closest('#salary-recent-clear')) {
                clearRecentCalculatorInputs(SALARY_STORAGE_KEY);
                renderSalaryRecentHistory();
            }
        });
        sectionEl.dataset.bound = 'true';
    }
}

function buildSalarySummaryText({ salaryType, monthlyNet, annualNet, totalDeduction }) {
    const typeLabel = salaryType === 'monthly' ? '월급(시급 기반)' : '연봉';
    return [
        `[월급/연봉 계산 요약]`,
        `- 계산 유형: ${typeLabel}`,
        `- 월 실수령액: ${window.formatCurrency(monthlyNet)}`,
        `- 연 실수령액: ${window.formatCurrency(annualNet)}`,
        `- 월 총 공제액: ${window.formatCurrency(totalDeduction)}`,
    ].join('\n');
}

/**
 * 연봉/월급 실수령액 계산
 * 소득세, 지방소득세, 4대보험 공제 후 실수령액 계산
 */
function calculateSalary() {
    // 현재 화면이 salary-screen인지 확인
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'salary-screen') {
        console.error('calculateSalary: Not on salary screen, current screen:', currentScreen?.id);
        return;
    }
    
    const rates = AppState.getTaxRates();
    if (!rates) {
        console.error('calculateSalary: Tax rates not loaded');
        alert('세율 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    
    // 계산 유형 확인
    const salaryType = document.querySelector('input[name="salary-type"]:checked').value;
    let annualSalary, monthlySalary;
    
    if (salaryType === 'annual') {
        // 연봉 계산
        annualSalary = window.getValueWithUnit('annual-salary', 10000); // 만원 단위
        if (annualSalary === null) return;
        monthlySalary = annualSalary / 12;
    } else {
        // 월급 계산 (최저시급 기준)
        const workHours = window.validateInput(document.getElementById('work-hours').value, '주간 근무시간');
        if (workHours === null) return;

        const hourlyWage = window.validateInput(document.getElementById('hourly-wage').value, '시급');
        if (hourlyWage === null) return;
        
        // 최저시급 확인 (AppState 단일 출처)
        const minimumWage = AppState.getCurrentMinimumWage();
        const monthlyComputation = computeMonthlyFromHourlyWage({
            workHoursPerWeek: workHours,
            hourlyWage,
            minimumWage,
        });
        if (!monthlyComputation.ok) {
            alert(monthlyComputation.errorMessage);
            return;
        }
        monthlySalary = monthlyComputation.monthlySalary;
        annualSalary = monthlySalary * 12;
    }
    
    // 1. 국민연금 (4.5%, 상한액: 553만원)
    const pensionBase = Math.min(monthlySalary, rates.insurance.pension.maxMonthlyIncome);
    const pension = pensionBase * rates.insurance.pension.rate;
    
    // 2. 건강보험 (3.545%)
    const health = monthlySalary * rates.insurance.health.rate;
    
    // 3. 장기요양보험 (건강보험료의 12.27%)
    const longTermCare = health * rates.insurance.longTermCare.rateOfHealth;
    
    // 4. 고용보험 (0.9%)
    const employment = monthlySalary * rates.insurance.employment.rate;
    
    // 5. 소득세 계산
    const yearlyIncome = annualSalary;
    
    // 근로소득공제 (2025년 기준)
    let incomeDeduction = 0;
    if (yearlyIncome <= 6000000) {
        incomeDeduction = yearlyIncome * 0.7;
    } else if (yearlyIncome <= 15000000) {
        incomeDeduction = 4200000 + (yearlyIncome - 6000000) * 0.4;
    } else if (yearlyIncome <= 30000000) {
        incomeDeduction = 7800000 + (yearlyIncome - 15000000) * 0.15;
    } else if (yearlyIncome <= 50000000) {
        incomeDeduction = 10050000 + (yearlyIncome - 30000000) * 0.08;
    } else if (yearlyIncome <= 88000000) {
        incomeDeduction = 11650000 + (yearlyIncome - 50000000) * 0.06;
    } else {
        incomeDeduction = 13930000 + (yearlyIncome - 88000000) * 0.02;
    }
    
    // 과세표준
    const taxBase = Math.max(0, yearlyIncome - incomeDeduction);
    
    // 소득세 계산 (누진공제 적용)
    let incomeTax = 0;
    const brackets = rates.incomeTax.brackets;
    for (let i = 0; i < brackets.length; i++) {
        if (taxBase <= brackets[i].max) {
            incomeTax = taxBase * brackets[i].rate - brackets[i].deduction;
            break;
        }
    }
    
    const monthlyIncomeTax = incomeTax / 12;
    
    // 6. 지방소득세 (소득세의 10%)
    const localTax = monthlyIncomeTax * rates.incomeTax.localTaxRate;
    
    // 총 공제액
    const totalDeduction = pension + health + longTermCare + employment + monthlyIncomeTax + localTax;
    
    // 실수령액
    const monthlyNet = monthlySalary - totalDeduction;
    const annualNet = monthlyNet * 12;
    
    // 결과 표시
    const monthlyNetElement = document.getElementById('monthly-net');
    const annualNetElement = document.getElementById('annual-net');
    if (!monthlyNetElement || !annualNetElement) {
        console.error('calculateSalary: Required elements not found');
        return;
    }
    monthlyNetElement.textContent = window.formatCurrency(monthlyNet);
    annualNetElement.textContent = window.formatCurrency(annualNet);
    
    // 공제 내역 테이블
    const deductionTable = document.getElementById('deduction-table');
    deductionTable.innerHTML = `
        <tr>
            <td>월 급여</td>
            <td>${window.formatCurrency(monthlySalary)}</td>
        </tr>
        <tr>
            <td>국민연금 (4.5%)</td>
            <td>${window.formatCurrency(pension)}</td>
        </tr>
        <tr>
            <td>건강보험 (3.545%)</td>
            <td>${window.formatCurrency(health)}</td>
        </tr>
        <tr>
            <td>장기요양보험 (건강보험의 12.27%)</td>
            <td>${window.formatCurrency(longTermCare)}</td>
        </tr>
        <tr>
            <td>고용보험 (0.9%)</td>
            <td>${window.formatCurrency(employment)}</td>
        </tr>
        <tr>
            <td>소득세</td>
            <td>${window.formatCurrency(monthlyIncomeTax)}</td>
        </tr>
        <tr>
            <td>지방소득세 (소득세의 10%)</td>
            <td>${window.formatCurrency(localTax)}</td>
        </tr>
        <tr style="font-weight: 700; background-color: var(--color-surface);">
            <td>총 공제액</td>
            <td>${window.formatCurrency(totalDeduction)}</td>
        </tr>
    `;
    
    // 계산 과정 설명
    const explanation = document.getElementById('salary-explanation');
    let explanationHTML = '';
    
    if (salaryType === 'monthly') {
        const workHours = document.getElementById('work-hours').value;
        const hourlyWage = document.getElementById('hourly-wage').value;
        const weeklySalary = workHours * hourlyWage;
        const weeklyHolidayPay = weeklySalary * 0.125;
        
        explanationHTML = `
            <div class="explanation-step">
                <strong>1단계: 월급 계산</strong><br>
                • 주급: ${workHours}시간 × ${window.formatCurrency(hourlyWage)} = ${window.formatCurrency(weeklySalary)}<br>
                • 주휴수당: ${window.formatCurrency(weeklySalary)} × 12.5% = ${window.formatCurrency(weeklyHolidayPay)}<br>
                • 월급: (${window.formatCurrency(weeklySalary)} + ${window.formatCurrency(weeklyHolidayPay)}) × 4.33주 = ${window.formatCurrency(monthlySalary)}
            </div>
            <div class="explanation-step">
                <strong>2단계: 근로소득공제</strong><br>
                연봉 ${window.formatCurrency(yearlyIncome)} → 근로소득공제 ${window.formatCurrency(incomeDeduction)} →
                과세표준 ${window.formatCurrency(taxBase)}
            </div>
            <div class="explanation-step">
                <strong>3단계: 소득세 계산</strong><br>
                과세표준 ${window.formatCurrency(taxBase)}에 대해 누진세율 적용<br>
                연 소득세: ${window.formatCurrency(incomeTax)} (월 ${window.formatCurrency(monthlyIncomeTax)})
            </div>
            <div class="explanation-step">
                <strong>4단계: 4대보험 계산</strong><br>
                • 국민연금: ${window.formatCurrency(monthlySalary)} × 4.5% = ${window.formatCurrency(pension)}<br>
                • 건강보험: ${window.formatCurrency(monthlySalary)} × 3.545% = ${window.formatCurrency(health)}<br>
                • 장기요양: ${window.formatCurrency(health)} × 12.27% = ${window.formatCurrency(longTermCare)}<br>
                • 고용보험: ${window.formatCurrency(monthlySalary)} × 0.9% = ${window.formatCurrency(employment)}
            </div>
            <div class="explanation-step">
                <strong>5단계: 실수령액 계산</strong><br>
                월 급여 ${window.formatCurrency(monthlySalary)} - 총 공제 ${window.formatCurrency(totalDeduction)} =
                <strong style="color: var(--color-primary);">${window.formatCurrency(monthlyNet)}</strong>
            </div>
        `;
    } else {
        explanationHTML = `
            <div class="explanation-step">
                <strong>1단계: 근로소득공제</strong><br>
                연봉 ${window.formatCurrency(yearlyIncome)} → 근로소득공제 ${window.formatCurrency(incomeDeduction)} →
                과세표준 ${window.formatCurrency(taxBase)}
            </div>
            <div class="explanation-step">
                <strong>2단계: 소득세 계산</strong><br>
                과세표준 ${window.formatCurrency(taxBase)}에 대해 누진세율 적용<br>
                연 소득세: ${window.formatCurrency(incomeTax)} (월 ${window.formatCurrency(monthlyIncomeTax)})
            </div>
            <div class="explanation-step">
                <strong>3단계: 4대보험 계산</strong><br>
                • 국민연금: ${window.formatCurrency(monthlySalary)} × 4.5% = ${window.formatCurrency(pension)}<br>
                • 건강보험: ${window.formatCurrency(monthlySalary)} × 3.545% = ${window.formatCurrency(health)}<br>
                • 장기요양: ${window.formatCurrency(health)} × 12.27% = ${window.formatCurrency(longTermCare)}<br>
                • 고용보험: ${window.formatCurrency(monthlySalary)} × 0.9% = ${window.formatCurrency(employment)}
            </div>
            <div class="explanation-step">
                <strong>4단계: 실수령액 계산</strong><br>
                월 급여 ${window.formatCurrency(monthlySalary)} - 총 공제 ${window.formatCurrency(totalDeduction)} =
                <strong style="color: var(--color-primary);">${window.formatCurrency(monthlyNet)}</strong>
            </div>
        `;
    }
    
    explanation.innerHTML = explanationHTML;
    
    document.getElementById('salary-result').style.display = 'block';
    updateShareButtons();
    const salarySummaryText = buildSalarySummaryText({
        salaryType,
        monthlyNet,
        annualNet,
        totalDeduction,
    });
    const salarySummaryTextEl = document.getElementById('salary-summary-text');
    if (salarySummaryTextEl) salarySummaryTextEl.textContent = salarySummaryText;
    setupSummaryCopyButtons({
        '#copy-salary-summary': () => salarySummaryText,
    });

    // 최근 입력 저장
    saveCalculatorInput(SALARY_STORAGE_KEY, getSalaryInputState(), 5);
    renderSalaryRecentHistory();
}

/**
 * 월급/연봉 계산기 초기화
 */
function resetSalaryCalculator() {
    // 입력 필드 초기화
    document.getElementById('annual-salary').value = '';
    document.getElementById('work-hours').value = '';
    document.getElementById('hourly-wage').value = String(AppState.getCurrentMinimumWage());
    
    // 라디오 버튼을 연봉 계산으로 초기화
    document.querySelector('input[name="salary-type"][value="annual"]').checked = true;
    
    // UI를 연봉 계산으로 전환
    document.getElementById('annual-salary-group').style.display = 'block';
    document.getElementById('monthly-salary-group').style.display = 'none';
    
    // 결과 섹션 숨기기
    document.getElementById('salary-result').style.display = 'none';
    
    console.log('🔄 월급/연봉 계산기 초기화 완료');
}

// Export to global scope
window.calculateSalary = calculateSalary;
window.resetSalaryCalculator = resetSalaryCalculator;

// 월급/연봉 UI 전환 로직
function setupSalaryTypeToggle() {
    const salaryTypeRadios = document.querySelectorAll('input[name="salary-type"]');
    const annualGroup = document.getElementById('annual-salary-group');
    const monthlyGroup = document.getElementById('monthly-salary-group');
    
    salaryTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'annual') {
                annualGroup.style.display = 'block';
                monthlyGroup.style.display = 'none';
                console.log('📊 연봉 계산 UI로 전환');
            } else if (this.value === 'monthly') {
                annualGroup.style.display = 'none';
                monthlyGroup.style.display = 'block';
                console.log('💰 월급 계산 UI로 전환');
            }
        });
    });
}

// 페이지 로드 시 UI 전환 로직 초기화
document.addEventListener('DOMContentLoaded', function() {
    setupSalaryTypeToggle();
    setupSalaryRecentHistory();
});

// 전역 함수로 노출
window.setupSalaryTypeToggle = setupSalaryTypeToggle;

console.log('✅ Salary Calculator 모듈 로드 완료');

