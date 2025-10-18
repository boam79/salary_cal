/**
 * 애플리케이션 상태 관리 모듈
 * 전역 상태를 중앙 집중식으로 관리
 */

// 애플리케이션 상태 객체
const AppState = {
    currentScreen: 'home-screen',
    taxRates: null,
    isLoading: false,
    
    // 최저시급 데이터 (년도별)
    minimumWageData: {
        2024: 9860,
        2025: 10030, // 2025년 최저시급 (고용노동부 확정)
        2026: 11200, // 2026년 예상 최저시급
    },
    
    // 상태 변경 메서드들
    setScreen(screenId) {
        this.currentScreen = screenId;
        console.log(`🔄 화면 전환: ${screenId}`);
    },
    
    getScreen() {
        return this.currentScreen;
    },
    
    setTaxRates(rates) {
        this.taxRates = rates;
        console.log('📊 세율 데이터 로드 완료');
    },
    
    getTaxRates() {
        return this.taxRates;
    },
    
    setLoading(loading) {
        this.isLoading = loading;
        if (loading) {
            console.log('⏳ 로딩 시작');
        } else {
            console.log('✅ 로딩 완료');
        }
    },
    
    getCurrentMinimumWage() {
        return this.minimumWageData[2025]; // 2025년 최저시급
    },
    
    // 상태 초기화
    reset() {
        this.currentScreen = 'home-screen';
        this.taxRates = null;
        this.isLoading = false;
        console.log('🔄 애플리케이션 상태 초기화');
    }
};

// 싱글톤 패턴으로 내보내기
export default AppState;
