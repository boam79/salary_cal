/**
 * ===================================
 * Input Validation Utilities
 * ===================================
 * 사용자 입력 검증 및 단위 변환 유틸리티 함수들
 */

(function() {
    'use strict';
    
    /**
     * 입력 값을 검증하고 숫자로 변환
     * @param {string|number} value - 검증할 값
     * @param {string} name - 필드 이름 (에러 메시지용)
     * @param {Object} options - 검증 옵션
     * @param {number} options.min - 최소값 (선택)
     * @param {number} options.max - 최대값 (선택)
     * @param {boolean} options.allowZero - 0 허용 여부 (기본값: false)
 * @param {boolean} options.isPercent - 퍼센트 값 여부 (기본값: false)
 * @returns {number|null} 검증된 숫자 또는 null (실패 시)
 * @example
 * validateInput("1000", "금액") // 1000
 * validateInput("", "금액") // null + alert
 * validateInput("-100", "금액") // null + alert
 */
function validateInput(value, name, options = {}) {
    const {
        min = 0.01,
        max = Infinity,
        allowZero = false,
        isPercent = false
    } = options;
    
    // 빈 값 체크
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        alert(`${name}을(를) 입력해주세요.`);
        return null;
    }
    
    const num = parseFloat(value);
    
    // 숫자 검증
    if (isNaN(num)) {
        alert(`${name}은(는) 숫자여야 합니다.`);
        return null;
    }
    
    // 음수 검증
    if (num < 0) {
        alert(`${name}은(는) 0보다 커야 합니다.`);
        return null;
    }
    
    // 0 검증
    if (!allowZero && num === 0) {
        alert(`${name}은(는) 0이 될 수 없습니다.`);
        return null;
    }
    
    // 최소값 검증 (퍼센트 값은 제외)
    if (!isPercent && num > 0 && num < min) {
        alert(`${name}은(는) 최소 ${min} 이상이어야 합니다.`);
        return null;
    }
    
    // 최대값 검증
    if (num > max) {
        alert(`${name}은(는) 최대 ${max} 이하여야 합니다.`);
        return null;
    }
    
    return num;
}

/**
 * 입력 값에 단위를 적용하여 숫자로 변환
 * @param {string} inputId - 입력 필드 ID
 * @param {number} defaultUnit - 기본 단위 (10000=만원, 100000000=억원)
 * @returns {number|null} 변환된 값 또는 null (실패 시)
 * @example
 * getValueWithUnit('annual-salary', 10000) // 입력: 5000 → 50000000 (5000만원)
 * getValueWithUnit('house-price', 100000000) // 입력: 5 → 500000000 (5억원)
 */
function getValueWithUnit(inputId, defaultUnit = 10000) {
    const inputElement = document.getElementById(inputId);
    if (!inputElement) {
        console.error(`getValueWithUnit: Element with id '${inputId}' not found`);
        return null;
    }
    
    const value = inputElement.value;
    const label = inputElement.labels && inputElement.labels[0] 
        ? inputElement.labels[0].textContent 
        : '입력값';
    
    // 최소값 설정 (단위에 따라 조정)
    const minValue = defaultUnit >= 100000000 ? 0.1 : 0.01;
    
    const validated = validateInput(value, label, {
        min: minValue,
        allowZero: false,
        isPercent: false
    });
    
    if (validated === null) return null;
    
    return validated * defaultUnit;
}

/**
 * 입력 필드 값을 가져오고 검증 (단위 변환 없이)
 * @param {string} inputId - 입력 필드 ID
 * @param {string} name - 필드 이름 (에러 메시지용)
 * @param {Object} options - 검증 옵션
 * @returns {number|null} 검증된 값 또는 null
 * @example
 * getValidatedValue('interest-rate', '이자율', { max: 30, isPercent: true })
 */
function getValidatedValue(inputId, name, options = {}) {
    const inputElement = document.getElementById(inputId);
    if (!inputElement) {
        console.error(`getValidatedValue: Element with id '${inputId}' not found`);
        return null;
    }
    
    return validateInput(inputElement.value, name, options);
}

/**
 * 여러 입력 값을 한번에 검증
 * @param {Array<Object>} validations - 검증 설정 배열
 * @returns {Object|null} 검증된 값들의 객체 또는 null (하나라도 실패 시)
 * @example
 * validateMultiple([
 *   { id: 'loan-amount', name: '대출금액', unit: 100000000 },
 *   { id: 'interest-rate', name: '이자율', options: { max: 30 } }
 * ])
 */
function validateMultiple(validations) {
    const result = {};
    
    for (const validation of validations) {
        const { id, name, unit, options = {} } = validation;
        
        let value;
        if (unit) {
            value = getValueWithUnit(id, unit);
        } else {
            value = getValidatedValue(id, name, options);
        }
        
        if (value === null) {
            return null; // 하나라도 실패하면 null 반환
        }
        
        result[id] = value;
    }
    
    return result;
}

/**
 * 이메일 형식 검증
 * @param {string} email - 검증할 이메일
 * @returns {boolean} 유효 여부
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 전화번호 형식 검증 (한국)
 * @param {string} phone - 검증할 전화번호
 * @returns {boolean} 유효 여부
 */
function validatePhone(phone) {
    const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
    return phoneRegex.test(phone);
    }

    // Export to global scope
    window.validateInput = validateInput;
    window.getValueWithUnit = getValueWithUnit;
    window.getValidatedValue = getValidatedValue;
    window.validateMultiple = validateMultiple;
    window.validateEmail = validateEmail;
    window.validatePhone = validatePhone;

    console.log('✅ Validation 모듈 로드 완료');
    
})(); // IIFE 종료

