/**
 * ===================================
 * Input Validation Utilities (Browser wrapper)
 * ===================================
 * - 순수 로직은 `js/domain/validation.js`에 위치
 * - 이 파일은 기존 전역(window.*) API 및 alert/DOM 연동을 유지
 */

import {
  validateInputRaw,
  validateEmail,
  validatePhone,
  getMinValueForUnit,
} from '../domain/validation.js';

function alertOrConsole(message) {
  // 테스트/비브라우저 환경에서도 안전하게 동작하도록 가드
  if (typeof alert === 'function') alert(message);
  else console.warn(message);
}

function validateInput(value, name, options = {}) {
  const r = validateInputRaw(value, options);
  if (!r.ok) {
    // 기존 UX(알림) 유지
    const label = name || '입력값';
    switch (r.error) {
      case 'empty':
        alertOrConsole(`${label}을(를) 입력해주세요.`);
        break;
      case 'nan':
        alertOrConsole(`${label}은(는) 숫자여야 합니다.`);
        break;
      case 'negative':
        alertOrConsole(`${label}은(는) 0보다 커야 합니다.`);
        break;
      case 'zero_not_allowed':
        alertOrConsole(`${label}은(는) 0이 될 수 없습니다.`);
        break;
      case 'below_min':
        alertOrConsole(`${label}은(는) 최소 ${options?.min ?? 0.01} 이상이어야 합니다.`);
        break;
      case 'above_max':
        alertOrConsole(`${label}은(는) 최대 ${options?.max ?? Infinity} 이하여야 합니다.`);
        break;
      default:
        alertOrConsole(`${label} 입력값이 올바르지 않습니다.`);
        break;
    }
    return null;
  }
  return r.value;
}

function getValueWithUnit(inputId, defaultUnit = 10000) {
  const inputElement = document.getElementById(inputId);
  if (!inputElement) {
    console.error(`getValueWithUnit: Element with id '${inputId}' not found`);
    return null;
  }

  const value = inputElement.value;
  const label = inputElement.labels && inputElement.labels[0] ? inputElement.labels[0].textContent : '입력값';

  const minValue = getMinValueForUnit(defaultUnit);
  const validated = validateInput(value, label, {
    min: minValue,
    allowZero: false,
    isPercent: false,
  });
  if (validated === null) return null;
  return validated * defaultUnit;
}

function getValidatedValue(inputId, name, options = {}) {
  const inputElement = document.getElementById(inputId);
  if (!inputElement) {
    console.error(`getValidatedValue: Element with id '${inputId}' not found`);
    return null;
  }
  return validateInput(inputElement.value, name, options);
}

function validateMultiple(validations) {
  const result = {};
  for (const validation of validations) {
    const { id, name, unit, options = {} } = validation;
    let value;
    if (unit) value = getValueWithUnit(id, unit);
    else value = getValidatedValue(id, name, options);
    if (value === null) return null;
    result[id] = value;
  }
  return result;
}

// Export to global scope (기존 호환 유지)
window.validateInput = validateInput;
window.getValueWithUnit = getValueWithUnit;
window.getValidatedValue = getValidatedValue;
window.validateMultiple = validateMultiple;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;

console.log('✅ Validation 모듈 로드 완료');

