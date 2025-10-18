/**
 * ===================================
 * Error Logger System
 * ===================================
 * 에러 로깅, 저장, 조회 및 사용자 알림 기능
 */

(function() {
    'use strict';
    
    // ErrorLogger 객체 정의
    const ErrorLogger = {
    /**
     * 에러를 로그에 기록
     * @param {Error|string} error - 에러 객체 또는 메시지
     * @param {string} context - 에러 발생 컨텍스트
     * @returns {Object} 에러 정보 객체
     */
    log: function(error, context = '') {
        const timestamp = new Date().toISOString();
        const errorInfo = {
            timestamp,
            error: error.message || error,
            stack: error.stack,
            context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.group('🚨 에러 발생');
        console.error('시간:', timestamp);
        console.error('에러:', errorInfo.error);
        console.error('컨텍스트:', context);
        console.error('스택:', errorInfo.stack);
        console.groupEnd();
        
        // 로컬 스토리지에 에러 저장 (최근 10개만)
        this.saveError(errorInfo);
        
        return errorInfo;
    },
    
    /**
     * 에러를 로컬 스토리지에 저장
     * @param {Object} errorInfo - 에러 정보 객체
     */
    saveError: function(errorInfo) {
        try {
            let errors = JSON.parse(localStorage.getItem('calculatorErrors') || '[]');
            errors.unshift(errorInfo);
            errors = errors.slice(0, 10); // 최근 10개만 저장
            localStorage.setItem('calculatorErrors', JSON.stringify(errors));
        } catch (e) {
            console.warn('에러 저장 실패:', e);
        }
    },
    
    /**
     * 저장된 에러 목록 조회
     * @returns {Array} 저장된 에러 목록
     */
    getErrors: function() {
        try {
            return JSON.parse(localStorage.getItem('calculatorErrors') || '[]');
        } catch (e) {
            console.warn('에러 조회 실패:', e);
            return [];
        }
    },
    
    /**
     * 저장된 모든 에러 삭제
     */
    clearErrors: function() {
        localStorage.removeItem('calculatorErrors');
        console.log('✅ 에러 로그가 삭제되었습니다.');
    },
    
    /**
     * 저장된 에러를 콘솔에 표시
     */
    showErrors: function() {
        const errors = this.getErrors();
        if (errors.length === 0) {
            console.log('📝 저장된 에러가 없습니다.');
            return;
        }
        
        console.group('📋 저장된 에러 목록');
        errors.forEach((error, index) => {
            console.group(`에러 ${index + 1} (${new Date(error.timestamp).toLocaleString()})`);
            console.error('메시지:', error.error);
            console.error('컨텍스트:', error.context);
            console.error('URL:', error.url);
            if (error.stack) console.error('스택:', error.stack);
            console.groupEnd();
        });
        console.groupEnd();
    },
    
    /**
     * 사용자에게 친화적인 에러 메시지 표시
     * @param {string} message - 에러 메시지
     * @param {string} details - 상세 내용 (선택)
     */
    showErrorToUser: function(message, details = '') {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                ${details ? `<span class="error-details">${details}</span>` : ''}
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
    };

    // 전역에서 접근 가능하도록 설정
    window.ErrorLogger = ErrorLogger;

    // 디버그 명령어 추가
    window.showErrors = () => ErrorLogger.showErrors();
    window.clearErrors = () => ErrorLogger.clearErrors();

    console.log('✅ ErrorLogger 모듈 로드 완료');
    
})(); // IIFE 종료

