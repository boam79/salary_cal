/**
 * 뉴스 관리 모듈
 * 경제 뉴스를 가져오고 표시하는 기능 담당
 */

class NewsManager {
    constructor() {
        this.newsData = [];
        this.lastUpdate = null;
        this.updateInterval = 5 * 60 * 1000; // 5분마다 업데이트
        this.updateTimer = null;
    }
    
    // 초기화
    async init() {
        console.log('📰 뉴스 매니저 초기화 중...');
        
        // 초기 뉴스 로드
        await this.loadNews();
        
        // 자동 업데이트 타이머 시작
        this.startAutoUpdate();
        
        console.log('✅ 뉴스 매니저 초기화 완료');
    }
    
    // 뉴스 로드
    async loadNews() {
        try {
            // 로딩 상태 표시
            this.showLoading();
            
            // 뉴스 데이터 가져오기
            // 임시로 더미 데이터 사용 (나중에 API로 교체)
            const news = await this.fetchNews();
            
            this.newsData = news;
            this.lastUpdate = new Date();
            
            // 뉴스 화면에 표시
            this.renderNews();
            
            console.log(`✅ 뉴스 로드 완료: ${news.length}개`);
            
        } catch (error) {
            console.error('❌ 뉴스 로드 실패:', error);
            this.showError();
        }
    }
    
    // 뉴스 가져오기 (API 연동)
    async fetchNews() {
        try {
            // Vercel Serverless Function을 통해 RSS 피드 가져오기
            const response = await fetch('/api/news');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.news) {
                console.log(`📰 뉴스 수신: ${data.count}개`);
                console.log('📰 뉴스 데이터 샘플:', data.news[0]);
                return data.news;
            } else {
                throw new Error('뉴스 데이터 형식 오류');
            }
            
        } catch (error) {
            // 에러 로깅
            if (window.ErrorLogger) {
                window.ErrorLogger.log(error, '뉴스 API 호출 실패');
            } else {
                console.error('❌ API에서 뉴스 가져오기 실패:', error);
            }
            
            // API 실패 시 더미 데이터 반환
            console.log('⚠️ 더미 데이터 사용');
            return this.getDummyNews();
        }
    }
    
    // 더미 데이터 (API 실패 시 사용)
    getDummyNews() {
        const dummyNews = [
            {
                id: 1,
                title: '2025년 최저시급 10,030원 확정, 작년 대비 2.0% 인상',
                description: '정부가 2025년 최저시급을 10,030원으로 확정했습니다. 이는 작년 대비 200원(2.0%) 인상된 금액입니다.',
                source: '한국일보',
                date: '2025-01-15',
                category: '경제',
                link: 'https://example.com/news1'
            },
            {
                id: 2,
                title: '부동산 시장 안정세, 서울 아파트 가격 평균 유지',
                description: '최근 부동산 시장이 안정세를 보이고 있으며, 서울 아파트 평균 매매가격은 전월 대비 동일한 수준을 유지했습니다.',
                source: '매일경제',
                date: '2025-01-14',
                category: '부동산',
                link: 'https://example.com/news2'
            },
            {
                id: 3,
                title: '은행권 주택담보대출 금리 하락, 평균 4.2% 수준',
                description: '주요 은행들의 주택담보대출 금리가 하락 추세를 보이며, 평균 대출금리가 4.2%대를 기록했습니다.',
                source: '조선일보',
                date: '2025-01-13',
                category: '금융',
                link: 'https://example.com/news3'
            },
            {
                id: 4,
                title: '2024년 연말정산 환급금, 평균 150만원 기록',
                description: '2024년 연말정산 결과, 근로자 1인당 평균 환급금이 150만원을 기록하며 전년 대비 소폭 증가했습니다.',
                source: '중앙일보',
                date: '2025-01-12',
                category: '세금',
                link: 'https://example.com/news4'
            },
            {
                id: 5,
                title: '국민연금 재정 건전성 개선 방안 마련 시급',
                description: '국민연금 고갈 시점을 앞당기기 위해 재정 건전성 개선을 위한 다양한 방안이 논의되고 있습니다.',
                source: '동아일보',
                date: '2025-01-11',
                category: '연금',
                link: 'https://example.com/news5'
            },
            {
                id: 6,
                title: 'DSR 규제 강화, 주택대출 심사 기준 엄격해질 전망',
                description: '금융당局이 DSR(총 부채 원리금 상환 비율) 규제를 강화하면서 주택대출 심사 기준이 더욱 엄격해질 것으로 보입니다.',
                source: '경향신문',
                date: '2025-01-10',
                category: '부동산',
                link: 'https://example.com/news6'
            }
        ];
        
        return dummyNews;
    }
    
    // 이미지가 있는 경우 썸네일 표시
    hasImage(news) {
        return news.image && news.image.trim() !== '';
    }
    
    // 뉴스 화면에 렌더링
    renderNews() {
        const newsGrid = document.getElementById('news-grid');
        const newsLoading = document.getElementById('news-loading');
        const newsError = document.getElementById('news-error');
        
        if (!newsGrid) return;
        
        // 로딩 및 에러 숨기기
        if (newsLoading) newsLoading.style.display = 'none';
        if (newsError) newsError.style.display = 'none';
        
        // 뉴스 카드 생성
        newsGrid.innerHTML = '';
        
        this.newsData.forEach(news => {
            const card = this.createNewsCard(news);
            newsGrid.appendChild(card);
        });
        
        // 뉴스 그리드 표시
        newsGrid.style.display = 'grid';
    }
    
    // 뉴스 카드 생성
    createNewsCard(news) {
        // 링크 태그로 전체 카드를 감싸기
        const card = document.createElement('a');
        card.className = 'news-card';
        card.href = news.link || '#';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        
        const categoryMap = {
            '경제': '💼',
            '부동산': '🏢',
            '금융': '🏦',
            '세금': '📋',
            '연금': '👴',
            '정책': '📜',
            '증권': '📈',
            'AI': '🤖',
            '반도체': '🔌',
            'IT': '💻'
        };
        
        // 이미지가 있으면 썸네일 추가
        const imageHtml = this.hasImage(news) 
            ? `<div class="news-card-image">
                <img src="${news.image}" alt="${news.title || '뉴스 이미지'}" loading="lazy" onerror="this.style.display='none'">
               </div>`
            : '';
        
        // 디버깅: 실제 렌더링 데이터 확인
        console.log('Rendering news card:', {
            title: news.title,
            source: news.source,
            link: news.link
        });
        
        card.innerHTML = `
            <div class="news-card-header">
                <span class="news-card-source">${news.source || 'Unknown'}</span>
                <span class="news-card-date">${this.formatDate(news.date)}</span>
            </div>
            ${imageHtml}
            <h3 class="news-card-title">${news.title || '제목 없음'}</h3>
            <div class="news-card-footer">
                <span class="news-card-tag">${categoryMap[news.category] || '📰'} ${news.category || '기타'}</span>
                <span class="news-card-link">전체보기 →</span>
            </div>
        `;
        
        return card;
    }
    
    // 날짜 포맷팅
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = today - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return '오늘';
        if (diffDays === 1) return '어제';
        if (diffDays < 7) return `${diffDays}일 전`;
        
        return date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    // 로딩 상태 표시
    showLoading() {
        const newsLoading = document.getElementById('news-loading');
        const newsGrid = document.getElementById('news-grid');
        const newsError = document.getElementById('news-error');
        
        if (newsLoading) newsLoading.style.display = 'block';
        if (newsGrid) newsGrid.style.display = 'none';
        if (newsError) newsError.style.display = 'none';
    }
    
    // 에러 상태 표시
    showError() {
        const newsLoading = document.getElementById('news-loading');
        const newsGrid = document.getElementById('news-grid');
        const newsError = document.getElementById('news-error');
        
        if (newsLoading) newsLoading.style.display = 'none';
        if (newsGrid) newsGrid.style.display = 'none';
        if (newsError) newsError.style.display = 'block';
    }
    
    // 자동 업데이트 시작
    startAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        
        this.updateTimer = setInterval(() => {
            console.log('🔄 뉴스 자동 업데이트 중...');
            this.loadNews();
        }, this.updateInterval);
        
        console.log(`⏰ 뉴스 자동 업데이트 설정 완료 (${this.updateInterval / 1000}초 간격)`);
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
        this.newsData = [];
        console.log('🧹 뉴스 매니저 정리 완료');
    }
}

// 싱글톤 인스턴스 생성
const newsManager = new NewsManager();

export default newsManager;

