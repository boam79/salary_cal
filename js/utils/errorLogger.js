/**
 * ===================================
 * Error Logger System
 * ===================================
 * 에러 로깅, 저장, 조회 및 사용자 알림 기능
 */

(function () {
    'use strict';

    const ErrorLogger = {
        /**
         * @param {Error|string} error
         * @param {string|object} contextOrExtra - 컨텍스트 문자열 또는 추가 필드 객체
         */
        log: function (error, contextOrExtra = '') {
            const timestamp = new Date().toISOString();
            let message = '';
            let stack = '';
            let context = '';
            let extra = {};

            if (error instanceof Error) {
                message = error.message;
                stack = error.stack || '';
                if (typeof contextOrExtra === 'string') {
                    context = contextOrExtra;
                } else if (contextOrExtra && typeof contextOrExtra === 'object') {
                    extra = contextOrExtra;
                }
            } else if (typeof error === 'string') {
                message = error;
                if (typeof contextOrExtra === 'string') {
                    context = contextOrExtra;
                } else if (contextOrExtra && typeof contextOrExtra === 'object') {
                    extra = contextOrExtra;
                }
            } else {
                message = String(error);
                if (typeof contextOrExtra === 'string') context = contextOrExtra;
                else if (contextOrExtra && typeof contextOrExtra === 'object') extra = contextOrExtra;
            }

            const screenId =
                extra.screenId ||
                (typeof document !== 'undefined' && document.querySelector('.screen.active')?.id) ||
                '';

            const errorInfo = {
                timestamp,
                error: message,
                stack,
                context,
                clientSessionId: typeof window !== 'undefined' ? window.__CLIENT_SESSION_ID : '',
                screenId,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                url: typeof window !== 'undefined' ? window.location.href : '',
                ...extra,
            };

            console.group('🚨 에러 발생');
            console.error('시간:', timestamp);
            console.error('에러:', errorInfo.error);
            console.error('컨텍스트:', context || '(없음)');
            console.error('화면:', screenId || '(알 수 없음)');
            if (errorInfo.clientSessionId) console.error('세션:', errorInfo.clientSessionId);
            console.error('스택:', errorInfo.stack);
            console.groupEnd();

            this.saveError(errorInfo);
            return errorInfo;
        },

        saveError: function (errorInfo) {
            try {
                let errors = JSON.parse(localStorage.getItem('calculatorErrors') || '[]');
                errors.unshift(errorInfo);
                errors = errors.slice(0, 10);
                localStorage.setItem('calculatorErrors', JSON.stringify(errors));
            } catch (e) {
                console.warn('에러 저장 실패:', e);
            }
        },

        getErrors: function () {
            try {
                return JSON.parse(localStorage.getItem('calculatorErrors') || '[]');
            } catch (e) {
                console.warn('에러 조회 실패:', e);
                return [];
            }
        },

        clearErrors: function () {
            localStorage.removeItem('calculatorErrors');
            console.log('✅ 에러 로그가 삭제되었습니다.');
        },

        showErrors: function () {
            const errors = this.getErrors();
            if (errors.length === 0) {
                console.log('📝 저장된 에러가 없습니다.');
                return;
            }

            console.group('📋 저장된 에러 목록');
            errors.forEach((err, index) => {
                console.group(`에러 ${index + 1} (${new Date(err.timestamp).toLocaleString()})`);
                console.error('메시지:', err.error);
                console.error('컨텍스트:', err.context);
                console.error('URL:', err.url);
                if (err.stack) console.error('스택:', err.stack);
                console.groupEnd();
            });
            console.groupEnd();
        },

        showErrorToUser: function (message, details = '') {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-notification';
            errorDiv.setAttribute('role', 'alert');

            const content = document.createElement('div');
            content.className = 'error-content';

            const icon = document.createElement('span');
            icon.className = 'error-icon';
            icon.textContent = '⚠️';

            const msgEl = document.createElement('span');
            msgEl.className = 'error-message';
            msgEl.textContent = message;

            const close = document.createElement('button');
            close.type = 'button';
            close.className = 'error-close';
            close.textContent = '×';
            close.addEventListener('click', () => errorDiv.remove());

            content.appendChild(icon);
            content.appendChild(msgEl);
            if (details) {
                const det = document.createElement('span');
                det.className = 'error-details';
                det.textContent = details;
                content.appendChild(det);
            }
            content.appendChild(close);
            errorDiv.appendChild(content);

            document.body.appendChild(errorDiv);

            setTimeout(() => {
                if (errorDiv.parentElement) errorDiv.remove();
            }, 5000);
        },
    };

    window.ErrorLogger = ErrorLogger;
    window.showErrors = () => ErrorLogger.showErrors();
    window.clearErrors = () => ErrorLogger.clearErrors();

    console.log('✅ ErrorLogger 모듈 로드 완료');
})();
