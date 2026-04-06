/**
 * ===================================
 * Tax Calculator (상속세/증여세)
 * ===================================
 * 상속세 및 증여세 계산기
 */

import AppState from '../core/appState.js';
import { calculateInheritanceTaxDomain, calculateGiftTaxDomain } from '../domain/tax.js';
import {
    getRecentCalculatorInputs,
    saveCalculatorInput,
    removeRecentCalculatorInput,
    clearRecentCalculatorInputs,
} from '../core/storage.js';
import {
    getShareStateFromUrl,
    updateShareUrl,
    setupShareCopyButtons,
    copyTextToClipboard,
} from '../core/deepLink.js';

const TAX_STORAGE_KEY = 'tax';

function getTaxInputState(kind) {
    if (kind === 'gift') {
        return {
            kind,
            amount: document.getElementById('gift-amount')?.value || '',
            relation: document.getElementById('gift-relation')?.value || 'spouse',
            createdAt: Date.now(),
        };
    }
    return {
        kind: 'inheritance',
        amount: document.getElementById('inheritance-amount')?.value || '',
        createdAt: Date.now(),
    };
}

function getTaxShareState() {
    const inheritanceTabActive = document.getElementById('inheritance-tab')?.classList.contains('active');
    const tab = inheritanceTabActive ? 'inheritance' : 'gift';
    return {
        tab,
        inheritanceAmount: document.getElementById('inheritance-amount')?.value || '',
        giftAmount: document.getElementById('gift-amount')?.value || '',
        giftRelation: document.getElementById('gift-relation')?.value || 'spouse',
        inheritanceHeirType: document.getElementById('inheritance-heir-type')?.value || 'general',
    };
}

function applyTaxInputState(state) {
    if (!state || typeof state !== 'object') return;
    if (state.kind === 'gift') {
        const giftTabBtn = document.querySelector('#tax-screen .tab-btn[data-tab="gift"]');
        if (giftTabBtn) giftTabBtn.click();
        const amountEl = document.getElementById('gift-amount');
        const relationEl = document.getElementById('gift-relation');
        if (amountEl) amountEl.value = state.amount ?? '';
        if (relationEl) relationEl.value = state.relation ?? 'spouse';
        return;
    }

    const inheritanceTabBtn = document.querySelector('#tax-screen .tab-btn[data-tab="inheritance"]');
    if (inheritanceTabBtn) inheritanceTabBtn.click();
    const amountEl = document.getElementById('inheritance-amount');
    if (amountEl) amountEl.value = state.amount ?? '';
}

function applyTaxShareState(state) {
    if (!state || typeof state !== 'object') return;
    const tab = state.tab === 'gift' ? 'gift' : 'inheritance';
    const tabBtn = document.querySelector(`#tax-screen .tab-btn[data-tab="${tab}"]`);
    if (tabBtn) tabBtn.click();

    const inheritanceAmountEl = document.getElementById('inheritance-amount');
    const giftAmountEl = document.getElementById('gift-amount');
    const giftRelationEl = document.getElementById('gift-relation');

    if (inheritanceAmountEl && typeof state.inheritanceAmount === 'string') {
        inheritanceAmountEl.value = state.inheritanceAmount;
    }
    if (giftAmountEl && typeof state.giftAmount === 'string') {
        giftAmountEl.value = state.giftAmount;
    }
    if (giftRelationEl && typeof state.giftRelation === 'string') {
        giftRelationEl.value = state.giftRelation;
    }
    const heirTypeEl = document.getElementById('inheritance-heir-type');
    if (heirTypeEl && typeof state.inheritanceHeirType === 'string') {
        heirTypeEl.value = state.inheritanceHeirType;
    }
}

function renderTaxRecentHistory() {
    const listEl = document.getElementById('tax-recent-list');
    const emptyEl = document.getElementById('tax-recent-empty');
    const sectionEl = document.getElementById('tax-recent-section');
    if (!listEl || !emptyEl) return;

    const items = getRecentCalculatorInputs(TAX_STORAGE_KEY);
    listEl.innerHTML = '';
    if (sectionEl) sectionEl.style.display = 'block';

    if (!items.length) {
        emptyEl.style.display = 'block';
        return;
    }
    emptyEl.style.display = 'none';

    items.forEach((item, idx) => {
        const row = document.createElement('tr');
        const kindLabel = item.kind === 'gift' ? '증여세' : '상속세';
        const inputLabel = item.kind === 'gift'
            ? `${item.amount || '-'}억원 / ${item.relation || 'spouse'}`
            : `${item.amount || '-'}억원`;
        const date = item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '';

        row.innerHTML = `
            <td>${kindLabel}</td>
            <td>${inputLabel}</td>
            <td>${date}</td>
            <td>
                <button type="button" class="btn btn-secondary tax-recent-load" data-index="${idx}">불러오기</button>
                <button type="button" class="btn btn-secondary tax-recent-delete" data-index="${idx}">삭제</button>
            </td>
        `;
        listEl.appendChild(row);
    });
}

function setupTaxRecentHistory() {
    const sectionEl = document.getElementById('tax-recent-section');
    if (!sectionEl) return;

    renderTaxRecentHistory();

    if (!sectionEl.dataset.bound) {
        sectionEl.addEventListener('click', (e) => {
            const loadBtn = e.target.closest('.tax-recent-load');
            if (loadBtn) {
                const idx = Number(loadBtn.dataset.index);
                const items = getRecentCalculatorInputs(TAX_STORAGE_KEY);
                if (Number.isInteger(idx) && items[idx]) {
                    applyTaxInputState(items[idx]);
                }
                return;
            }

            const deleteBtn = e.target.closest('.tax-recent-delete');
            if (deleteBtn) {
                const idx = Number(deleteBtn.dataset.index);
                removeRecentCalculatorInput(TAX_STORAGE_KEY, idx);
                renderTaxRecentHistory();
                return;
            }

            if (e.target.closest('#tax-clear-recent')) {
                clearRecentCalculatorInputs(TAX_STORAGE_KEY);
                renderTaxRecentHistory();
            }
        });
        sectionEl.dataset.bound = 'true';
    }
}

function setupTaxShareFeature() {
    setupShareCopyButtons({
        '.copy-share-url[data-share-target="tax"]': () => getTaxShareState(),
    });

    const copyBtn = document.getElementById('copy-tax-summary');
    if (copyBtn && !copyBtn.dataset.bound) {
        copyBtn.addEventListener('click', copyTaxSummary);
        copyBtn.dataset.bound = 'true';
    }
}

function buildTaxSummaryText({ kind, amount, deduction, taxBase, tax, relationLabel }) {
    if (kind === 'gift') {
        return [
            '[세금 계산 요약]',
            `유형: 증여세 (${relationLabel || '관계 미지정'})`,
            `증여 재산가액: ${window.formatCurrency(amount)}`,
            `공제액: ${window.formatCurrency(deduction)}`,
            `과세표준: ${window.formatCurrency(taxBase)}`,
            `예상 증여세: ${window.formatCurrency(tax)}`,
        ].join('\n');
    }
    return [
        '[세금 계산 요약]',
        '유형: 상속세',
        `상속 재산가액: ${window.formatCurrency(amount)}`,
        `공제액: ${window.formatCurrency(deduction)}`,
        `과세표준: ${window.formatCurrency(taxBase)}`,
        `예상 상속세: ${window.formatCurrency(tax)}`,
    ].join('\n');
}

function renderTaxBasisInfo() {
    const el = document.getElementById('tax-basis-info');
    if (!el) return;
    el.textContent = '기준일: 2026-04-05 · 버전: v4.7.x · 규정: 상속/증여세 단순화 모델';
}

async function copyTaxSummary() {
    const summaryEl = document.getElementById('tax-summary-text');
    const btn = document.getElementById('share-tax-summary');
    if (!summaryEl || !btn) return;
    const text = summaryEl.textContent || '';
    if (!text.trim()) return;
    const original = btn.textContent;
    const ok = await copyTextToClipboard(text);
    btn.textContent = ok ? '복사됨!' : '복사 실패';
    setTimeout(() => {
        btn.textContent = original;
    }, 1200);
}

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
    const heirType = document.getElementById('inheritance-heir-type')?.value || 'general';
    
    const rates = AppState.getTaxRates();
    if (!rates) {
        console.error('calculateInheritanceTax: Tax rates not loaded');
        return;
    }
    
    const domain = calculateInheritanceTaxDomain({
        amount,
        inheritanceTax: rates.inheritanceTax
    });
    if (!domain.ok) {
        console.error('calculateInheritanceTax: domain error', domain.error);
        alert('상속세 계산 중 오류가 발생했습니다. 입력값을 확인해주세요.');
        return;
    }
    const { deduction, taxBase, tax } = domain;
    const heirMultiplierMap = {
        general: 1,
        spousePrimary: 0.85,
        minorIncluded: 0.95,
    };
    const multiplier = heirMultiplierMap[heirType] ?? 1;
    const adjustedTax = Math.max(0, tax * multiplier);
    
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
                <span class="result-value">${window.formatCurrency(adjustedTax)}</span>
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
            상속세액: <strong>${window.formatCurrency(adjustedTax)}</strong>
        </div>
    `;

    const summaryTextEl = document.getElementById('tax-summary-text');
    if (summaryTextEl) {
        summaryTextEl.textContent = buildTaxSummaryText({
            kind: 'inheritance',
            amount,
            deduction,
            taxBase,
            tax: adjustedTax,
        });
    }
    renderTaxBasisInfo();
    
    resultSection.style.display = 'block';
    saveCalculatorInput(TAX_STORAGE_KEY, getTaxInputState('inheritance'), 5);
    renderTaxRecentHistory();
    updateShareUrl('tax-screen', getTaxShareState());
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
    
    const normalizedRelation = rates.giftTax?.deductions?.[relation] != null ? relation : 'otherRelative';
    const domain = calculateGiftTaxDomain({
        amount,
        relation: normalizedRelation,
        giftTax: rates.giftTax
    });
    if (!domain.ok) {
        console.error('calculateGiftTax: domain error', domain.error);
        alert('증여세 계산 중 오류가 발생했습니다. 입력값/관계를 확인해주세요.');
        return;
    }
    const { deduction, taxBase, tax } = domain;
    
    const relationNames = {
        spouse: '배우자',
        linealDescendant: '직계존비속(성인)',
        linealDescendantMinor: '직계존비속(미성년자)',
        otherRelative: '기타 친족',
        nonRelative: '비친족/타인'
    };
    const adjustedTax = tax;
    
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
                <span class="result-value">${window.formatCurrency(adjustedTax)}</span>
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
            증여자 관계: ${relationNames[relation] || relationNames[normalizedRelation]}<br>
            공제액: ${window.formatCurrency(deduction)} (10년간)
        </div>
        <div class="explanation-step">
            <strong>2단계: 과세표준 계산</strong><br>
            증여재산 ${window.formatCurrency(amount)} - 공제액 ${window.formatCurrency(deduction)} = ${window.formatCurrency(taxBase)}
        </div>
        <div class="explanation-step">
            <strong>3단계: 증여세 계산</strong><br>
            과세표준 ${window.formatCurrency(taxBase)}에 누진세율 적용<br>
            증여세액: <strong>${window.formatCurrency(adjustedTax)}</strong>
        </div>
    `;

    const summaryTextEl = document.getElementById('tax-summary-text');
    if (summaryTextEl) {
        summaryTextEl.textContent = buildTaxSummaryText({
            kind: 'gift',
            amount,
            deduction,
            taxBase,
            tax: adjustedTax,
            relationLabel: relationNames[relation] || relationNames[normalizedRelation],
        });
    }
    renderTaxBasisInfo();
    
    resultSection.style.display = 'block';
    saveCalculatorInput(TAX_STORAGE_KEY, getTaxInputState('gift'), 5);
    renderTaxRecentHistory();
    updateShareUrl('tax-screen', getTaxShareState());
}

// Export to global scope
window.calculateInheritanceTax = calculateInheritanceTax;
window.calculateGiftTax = calculateGiftTax;

document.addEventListener('DOMContentLoaded', function() {
    setupTaxRecentHistory();
    setupTaxShareFeature();

    const share = getShareStateFromUrl('tax-screen');
    if (share) {
        applyTaxShareState(share);
    }
});

console.log('✅ Tax Calculator 모듈 로드 완료');

