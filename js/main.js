/**
 * 메인 애플리케이션 모듈
 * 애플리케이션 초기화 및 전역 설정 담당
 */

import AppState from './core/appState.js';
import navigationManager from './core/navigationManager.js';
import eventManager from './core/eventManager.js';
import newsManager from './news/newsManager.js';

class FinancialCalculatorApp {
    constructor() {
        this.isInitialized = false;
    }
    
    // 애플리케이션 초기화
    async init() {
        if (this.isInitialized) {
            console.warn('⚠️ 애플리케이션이 이미 초기화되었습니다.');
            return;
        }
        
        console.log('💰 금융 계산기 앱 시작');
        
        try {
            AppState.setLoading(true);
            
            // 세율 데이터 로드
            await this.loadTaxRates();
            
            // 최저시급 설정
            this.setupMinimumWage();
            
            // 전역 에러 핸들러 설정
            this.setupGlobalErrorHandlers();
            
            // 뉴스 매니저 초기화
            await newsManager.init();
            
            // 애플리케이션 완전 초기화 완료
            this.isInitialized = true;
            AppState.setLoading(false);
            
            console.log('✅ 금융 계산기 앱 초기화 완료');
            
        } catch (error) {
            console.error('❌ 애플리케이션 초기화 실패:', error);
            AppState.setLoading(false);
        }
    }
    
    // 세율 데이터 로드
    async loadTaxRates() {
        try {
            const response = await fetch('config/rates.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const rates = await response.json();
            AppState.setTaxRates(rates);
            return rates;
        } catch (error) {
            console.error('❌ 세율 데이터 로드 실패:', error);
            throw error;
        }
    }
    
    // 최저시급 설정
    setupMinimumWage() {
        const currentMinimumWage = AppState.getCurrentMinimumWage();
        
        // HTML에서 최저시급 표시 업데이트
        const minimumWageSpan = document.getElementById('current-minimum-wage');
        if (minimumWageSpan) {
            minimumWageSpan.textContent = currentMinimumWage.toLocaleString();
        }
        
        // 시급 입력 필드 설정
        const hourlyWageInput = document.getElementById('hourly-wage');
        if (hourlyWageInput) {
            hourlyWageInput.min = currentMinimumWage;
            hourlyWageInput.value = currentMinimumWage;
            hourlyWageInput.placeholder = `예: ${currentMinimumWage} (원)`;
        }
        
        console.log(`💰 최저시급 설정 완료: ${currentMinimumWage}원`);
    }
    
    // 전역 에러 핸들러 설정
    setupGlobalErrorHandlers() {
        // JavaScript 에러 핸들러
        window.addEventListener('error', (event) => {
            console.error('🚨 JavaScript 에러:', event.error);
            if (window.ErrorLogger && window.ErrorLogger.log) {
                window.ErrorLogger.log('JavaScript Error', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error?.stack
                });
            }
        });
        
        // Promise rejection 핸들러
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🚨 Promise Rejection:', event.reason);
            if (window.ErrorLogger && window.ErrorLogger.log) {
                window.ErrorLogger.log('Promise Rejection', {
                    reason: event.reason?.toString(),
                    promise: event.promise
                });
            }
        });
        
        console.log('🛡️ 전역 에러 핸들러 설정 완료');
    }
    
    // 애플리케이션 상태 반환
    getState() {
        return {
            isInitialized: this.isInitialized,
            currentScreen: AppState.getScreen(),
            isLoading: AppState.isLoading,
            taxRates: AppState.getTaxRates()
        };
    }
    
    // 애플리케이션 정리
    cleanup() {
        eventManager.cleanup();
        newsManager.cleanup();
        AppState.reset();
        this.isInitialized = false;
        console.log('🧹 애플리케이션 정리 완료');
    }
}

// 애플리케이션 인스턴스 생성
const app = new FinancialCalculatorApp();

// DOM 로드 완료 시 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// 전역 접근을 위한 window 객체에 할당
window.FinancialCalculatorApp = app;

// 모듈 내보내기
export default app;