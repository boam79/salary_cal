/**
 * ===================================
 * Number Formatting Utilities
 * ===================================
 * 숫자를 다양한 형식으로 포맷팅하는 유틸리티 함수들
 */

(function() {
    'use strict';
    
    /**
     * 숫자를 한국 통화 형식으로 포맷 (원)
     * @param {number} num - 포맷할 숫자
     * @returns {string} 포맷된 통화 문자열 (예: "1,234,567원")
     * @example
     * formatCurrency(1234567) // "1,234,567원"
     */
    function formatCurrency(num) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'decimal',
        maximumFractionDigits: 0
    }).format(Math.round(num)) + '원';
}

/**
 * 숫자를 천 단위 구분 기호로 포맷
 * @param {number} num - 포맷할 숫자
 * @returns {string} 포맷된 숫자 문자열 (예: "1,234.56")
 * @example
 * formatNumber(1234.567) // "1,234.57"
 */
function formatNumber(num) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'decimal',
        maximumFractionDigits: 2
    }).format(num);
}

/**
 * 차트 레이블용 값 포맷 (억, 천만, 만 단위 표시)
 * @param {number} value - 포맷할 숫자
 * @returns {string} 포맷된 문자열 (예: "1.2억", "500만")
 * @example
 * formatChartValue(120000000) // "1.2억"
 * formatChartValue(5000000) // "500만"
 */
function formatChartValue(value) {
    if (value >= 100000000) {
        return (value / 100000000).toFixed(1) + '억';
    } else if (value >= 10000000) {
        return Math.round(value / 10000000) + '천만';
    } else if (value >= 10000) {
        return Math.round(value / 10000) + '만';
    } else {
        return value.toString();
    }
}

/**
 * 퍼센트 형식으로 포맷
 * @param {number} num - 0-100 사이의 숫자
 * @param {number} decimals - 소수점 자리수 (기본값: 2)
 * @returns {string} 포맷된 퍼센트 문자열 (예: "12.34%")
 * @example
 * formatPercent(12.345) // "12.35%"
 * formatPercent(12.345, 1) // "12.3%"
 */
function formatPercent(num, decimals = 2) {
    return num.toFixed(decimals) + '%';
}

/**
 * 금액을 억/만원 단위로 읽기 쉽게 포맷
 * @param {number} amount - 포맷할 금액
 * @returns {string} 포맷된 금액 문자열 (예: "1억 2,000만원")
 * @example
 * formatAmountReadable(120000000) // "1억 2,000만원"
 * formatAmountReadable(50000000) // "5,000만원"
 */
function formatAmountReadable(amount) {
    const 억 = Math.floor(amount / 100000000);
    const 만 = Math.floor((amount % 100000000) / 10000);
    
    if (억 > 0 && 만 > 0) {
        return `${억}억 ${formatNumber(만)}만원`;
    } else if (억 > 0) {
        return `${억}억원`;
    } else if (만 > 0) {
        return `${formatNumber(만)}만원`;
    } else {
        return formatCurrency(amount);
    }
}

    // Export to global scope
    window.formatCurrency = formatCurrency;
    window.formatNumber = formatNumber;
    window.formatChartValue = formatChartValue;
    window.formatPercent = formatPercent;
    window.formatAmountReadable = formatAmountReadable;

    console.log('✅ Formatter 모듈 로드 완료');
    
})(); // IIFE 종료

