/**
 * 주식 지수 API 모듈
 * 코스피, 코스닥, 나스닥 데이터 가져오기
 */

class StockIndices {
    constructor() {
        this.updateInterval = 60 * 1000; // 1분마다 업데이트
        this.updateTimer = null;
    }
    
    // 초기화
    async init() {
        console.log('📈 주식 지수 매니저 초기화 중...');
        await this.updateIndices();
        this.startAutoUpdate();
        console.log('✅ 주식 지수 매니저 초기화 완료');
    }
    
    // 지수 데이터 업데이트
    async updateIndices() {
        try {
            // 실제 API는 주식 시장 API를 사용해야 합니다.
            // 현재는 더미 데이터 사용
            const indices = this.getDummyIndices();
            
            this.renderIndices(indices);
            
        } catch (error) {
            console.error('❌ 주식 지수 업데이트 실패:', error);
            if (window.ErrorLogger) {
                window.ErrorLogger.log(error, '주식 지수 업데이트 실패');
            }
        }
    }
    
    // 더미 데이터 (실제 API 연동 시 교체 필요)
    getDummyIndices() {
        return {
            kospi: {
                value: '2,850.23',
                change: '+12.34',
                changeRate: '+0.43%',
                direction: 'up'
            },
            kosdaq: {
                value: '875.67',
                change: '-8.92',
                changeRate: '-1.01%',
                direction: 'down'
            },
            nasdaq: {
                value: '15,863.45',
                change: '+123.45',
                changeRate: '+0.78%',
                direction: 'up'
            }
        };
    }
    
    // 화면에 렌더링
    renderIndices(indices) {
        // 코스피
        const kospiValue = document.getElementById('kospi-value');
        const kospiChange = document.getElementById('kospi-change');
        if (kospiValue) kospiValue.textContent = indices.kospi.value;
        if (kospiChange) {
            kospiChange.textContent = `${indices.kospi.change} (${indices.kospi.changeRate})`;
            kospiChange.className = `stock-change ${indices.kospi.direction}`;
        }
        
        // 코스닥
        const kosdaqValue = document.getElementById('kosdaq-value');
        const kosdaqChange = document.getElementById('kosdaq-change');
        if (kosdaqValue) kosdaqValue.textContent = indices.kosdaq.value;
        if (kosdaqChange) {
            kosdaqChange.textContent = `${indices.kosdaq.change} (${indices.kosdaq.changeRate})`;
            kosdaqChange.className = `stock-change ${indices.kosdaq.direction}`;
        }
        
        // 나스닥
        const nasdaqValue = document.getElementById('nasdaq-value');
        const nasdaqChange = document.getElementById('nasdaq-change');
        if (nasdaqValue) nasdaqValue.textContent = indices.nasdaq.value;
        if (nasdaqChange) {
            nasdaqChange.textContent = `${indices.nasdaq.change} (${indices.nasdaq.changeRate})`;
            nasdaqChange.className = `stock-change ${indices.nasdaq.direction}`;
        }
        
        // 업데이트 시간
        const updateTime = document.getElementById('stock-update-time');
        if (updateTime) {
            const now = new Date();
            updateTime.textContent = `최근 업데이트: ${now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
        }
    }
    
    // 자동 업데이트 시작
    startAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        
        this.updateTimer = setInterval(() => {
            console.log('🔄 주식 지수 자동 업데이트 중...');
            this.updateIndices();
        }, this.updateInterval);
        
        console.log(`⏰ 주식 지수 자동 업데이트 설정 완료 (${this.updateInterval / 1000}초 간격)`);
    }
    
    // 자동 업데이트 중지
    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
    
    // 정리
    cleanup() {
        this.stopAutoUpdate();
        console.log('🧹 주식 지수 매니저 정리 완료');
    }
}

// 싱글톤 인스턴스 생성
const stockIndices = new StockIndices();

export default stockIndices;

