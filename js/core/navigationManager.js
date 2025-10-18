/**
 * 네비게이션 관리 모듈
 * SPA 화면 전환 및 라우팅 담당
 */

import AppState from './appState.js';

class NavigationManager {
    constructor() {
        this.screens = new Map();
        this.init();
    }
    
    init() {
        this.registerScreens();
        this.setupEventListeners();
    }
    
    // 화면 등록
    registerScreens() {
        const screenElements = document.querySelectorAll('.screen');
        screenElements.forEach(screen => {
            this.screens.set(screen.id, screen);
            console.log(`📱 화면 등록: ${screen.id}`);
        });
        console.log(`📱 등록된 화면: ${this.screens.size}개`);
        console.log(`📋 등록된 화면 목록: ${Array.from(this.screens.keys()).join(', ')}`);
    }
    
    // 화면 전환
    navigateTo(screenId) {
        console.log(`🔄 화면 전환 시도: ${screenId}`);
        
        if (!this.screens.has(screenId)) {
            console.error(`❌ 존재하지 않는 화면: ${screenId}`);
            console.log(`📋 사용 가능한 화면: ${Array.from(this.screens.keys()).join(', ')}`);
            return false;
        }
        
        // 현재 화면 숨기기
        this.hideAllScreens();
        
        // 대상 화면 표시
        const targetScreen = this.screens.get(screenId);
        targetScreen.classList.add('active');
        
        // 상태 업데이트
        AppState.setScreen(screenId);
        
        // 스크롤 맨 위로
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // 화면별 초기화 작업
        this.initializeScreen(screenId);
        
        console.log(`✅ 화면 전환 완료: ${screenId}`);
        return true;
    }
    
    // 모든 화면 숨기기
    hideAllScreens() {
        this.screens.forEach(screen => {
            screen.classList.remove('active');
        });
    }
    
    // 화면별 초기화 작업
    initializeScreen(screenId) {
        switch (screenId) {
            case 'loan-screen':
            case 'real-estate-screen':
                // 상환방식 탭 메뉴 이벤트 리스너 재설정
                setTimeout(() => {
                    if (window.setupRepaymentTabListeners) {
                        window.setupRepaymentTabListeners();
                    }
                }, 50);
                break;
            default:
                break;
        }
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 홈으로 버튼들
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('back-button')) {
                e.preventDefault();
                this.navigateTo('home-screen');
            }
        });
        
        // 계산기 카드 클릭
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.calculator-card');
            if (card && card.dataset.screen) {
                e.preventDefault();
                console.log(`🎯 계산기 카드 클릭: ${card.dataset.screen}`);
                this.navigateTo(card.dataset.screen);
            }
        });
        
        console.log('🎯 네비게이션 이벤트 리스너 설정 완료');
    }
    
    // 현재 화면 정보 반환
    getCurrentScreen() {
        return AppState.getScreen();
    }
    
    // 사용 가능한 화면 목록 반환
    getAvailableScreens() {
        return Array.from(this.screens.keys());
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
const navigationManager = new NavigationManager();
export default navigationManager;
