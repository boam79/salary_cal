/**
 * 통계 관리 모듈
 * 계산기 사용 통계를 수집하고 표시하는 기능 담당
 */

class StatisticsManager {
    constructor() {
        this.storageKey = 'calculator_statistics';
        this.popupShownKey = 'stats_popup_shown';
        this.statistics = this.loadStatistics();
    }
    
    /**
     * 통계 데이터 로드
     */
    loadStatistics() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : this.getInitialStatistics();
        } catch (error) {
            console.error('통계 데이터 로드 실패:', error);
            return this.getInitialStatistics();
        }
    }
    
    /**
     * 초기 통계 데이터 구조
     */
    getInitialStatistics() {
        return {
            calculators: {
                'salary-screen': { count: 0, name: '월급/연봉', icon: '💼' },
                'tax-screen': { count: 0, name: '세금', icon: '📋' },
                'vat-screen': { count: 0, name: '부가세', icon: '🧾' },
                'real-estate-screen': { count: 0, name: '부동산', icon: '🏢' },
                'acquisition-tax-screen': { count: 0, name: '취등록세', icon: '🏛️' },
                'loan-screen': { count: 0, name: '대출', icon: '🏦' },
                'retirement-screen': { count: 0, name: '퇴직금', icon: '🎯' },
                'savings-screen': { count: 0, name: '적금/예금', icon: '💰' },
                'car-acq-screen': { count: 0, name: '자동차 취등록세', icon: '🚗' },
                'lotto-screen': { count: 0, name: '로또 생성기', icon: '🎲' }
            },
            totalCalculations: 0,
            lastUpdated: new Date().toISOString()
        };
    }
    
    /**
     * 통계 데이터 저장
     */
    saveStatistics() {
        try {
            this.statistics.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(this.statistics));
        } catch (error) {
            console.error('통계 데이터 저장 실패:', error);
        }
    }
    
    /**
     * 계산기 사용 기록
     */
    recordCalculatorUsage(screenId) {
        if (this.statistics.calculators[screenId]) {
            this.statistics.calculators[screenId].count++;
            this.statistics.totalCalculations++;
            this.saveStatistics();
            console.log(`📊 통계 기록: ${screenId} (총 ${this.statistics.totalCalculations}회)`);
        }
    }
    
    /**
     * 인기 계산기 순위 (상위 5개)
     */
    getTopCalculators(limit = 5) {
        const calculators = Object.entries(this.statistics.calculators)
            .map(([id, data]) => ({
                id,
                ...data
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
        
        return calculators;
    }
    
    /**
     * 팝업 표시 여부 확인 (오늘 날짜 기준)
     */
    shouldShowPopup() {
        try {
            const stored = localStorage.getItem(this.popupShownKey);
            if (!stored) {
                return true; // 저장된 값이 없으면 표시
            }
            
            const data = JSON.parse(stored);
            const today = new Date().toDateString(); // 오늘 날짜 문자열
            
            // 저장된 날짜와 오늘 날짜가 다르면 표시
            if (data.date !== today) {
                return true;
            }
            
            // 오늘 이미 표시했고 "오늘은 그만"을 선택했다면 표시 안 함
            return !data.dontShowToday;
        } catch (error) {
            console.error('팝업 표시 여부 확인 실패:', error);
            return true; // 에러 시 표시
        }
    }
    
    /**
     * 팝업 표시 완료 기록 (일반 닫기)
     */
    markPopupShown() {
        const today = new Date().toDateString();
        localStorage.setItem(this.popupShownKey, JSON.stringify({
            date: today,
            dontShowToday: false
        }));
    }
    
    /**
     * 오늘 하루 팝업 표시 안 함
     */
    markDontShowToday() {
        const today = new Date().toDateString();
        localStorage.setItem(this.popupShownKey, JSON.stringify({
            date: today,
            dontShowToday: true
        }));
    }
    
    /**
     * 통계 초기화
     */
    resetStatistics() {
        this.statistics = this.getInitialStatistics();
        this.saveStatistics();
    }
    
    /**
     * 전체 통계 가져오기
     */
    getAllStatistics() {
        return {
            ...this.statistics,
            topCalculators: this.getTopCalculators(10)
        };
    }
}

// 싱글톤 인스턴스 생성
const statisticsManager = new StatisticsManager();

export default statisticsManager;

