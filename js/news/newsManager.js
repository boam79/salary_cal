/**
 * 뉴스 관리 모듈
 * 경제 뉴스를 가져오고 표시하는 기능 담당
 */

class NewsManager {
    constructor() {
        this.debug =
            typeof window !== 'undefined' &&
            (window.localStorage?.getItem('FC_DEBUG') === '1' ||
                new URLSearchParams(window.location.search).get('debug') === '1');
        this.newsData = [];
        this.filteredNews = [];
        this.currentCategory = 'all';
        this.lastUpdate = null;
        this.updateInterval = 5 * 60 * 1000; // 5분마다 업데이트
        this.updateTimer = null;
        
        // 카테고리 매핑 (뉴스 제목/설명 기반 필터링)
        this.categoryKeywords = {
            'economy': ['경제', '금융', '시장', '기업', '경기', '성장', '투자', '경영'],
            'real-estate': ['부동산', '아파트', '매매', '전세', '임대', '집값', '주택', '토지'],
            'tax': ['세금', '세율', '과세', '공제', '환급', '연말정산', '정책', '법안'],
            'stock': ['주식', '증권', '코스피', '코스닥', '시세', '수익', '투자', '배당'],
            'general': ['경제', '시장', '국제', '글로벌', '산업', '무역']
        };
    }
    
    // 초기화
    async init() {
        if (this.debug) console.log('📰 뉴스 매니저 초기화 중...');
        
        // 필터 탭 이벤트 리스너 설정
        this.setupFilterTabs();
        
        // 초기 뉴스 로드
        await this.loadNews();
        
        // 자동 업데이트 타이머 시작
        this.startAutoUpdate();
        
        if (this.debug) console.log('✅ 뉴스 매니저 초기화 완료');
    }
    
    // 필터 탭 이벤트 리스너 설정
    setupFilterTabs() {
        const filterTabs = document.querySelectorAll('.news-filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                if (category) {
                    this.filterByCategory(category);
                    
                    // 활성 탭 업데이트
                    filterTabs.forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });
        });
    }
    
    // 카테고리별 필터링
    filterByCategory(category) {
        this.currentCategory = category;
        
        if (category === 'all') {
            this.filteredNews = [...this.newsData];
        } else {
            const keywords = this.categoryKeywords[category] || [];
            this.filteredNews = this.newsData.filter(news => {
                const title = (news.title || '').toLowerCase();
                const description = (news.description || '').toLowerCase();
                const categoryLower = (news.category || '').toLowerCase();
                
                return keywords.some(keyword => 
                    title.includes(keyword.toLowerCase()) ||
                    description.includes(keyword.toLowerCase()) ||
                    categoryLower.includes(keyword.toLowerCase())
                );
            });
        }
        
        this.renderFilteredNews();
        if (this.debug) console.log(`🔍 카테고리 필터: ${category} (${this.filteredNews.length}개)`);
    }
    
    // 필터된 뉴스 렌더링
    renderFilteredNews() {
        const newsGrid = document.getElementById('news-grid');
        const newsLoading = document.getElementById('news-loading');
        const newsError = document.getElementById('news-error');
        
        if (!newsGrid) return;
        
        // 로딩 및 에러 숨기기
        if (newsLoading) newsLoading.style.display = 'none';
        if (newsError) newsError.style.display = 'none';
        
        // 뉴스 카드 생성
        newsGrid.innerHTML = '';
        
        if (this.filteredNews.length === 0) {
            newsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--color-text-secondary);">선택한 카테고리의 뉴스가 없습니다.</p>';
            newsGrid.style.display = 'grid';
            return;
        }
        
        const firstBatchCount = Math.min(8, this.filteredNews.length);
        const firstFragment = document.createDocumentFragment();
        for (let i = 0; i < firstBatchCount; i++) {
            firstFragment.appendChild(this.createNewsCard(this.filteredNews[i]));
        }
        newsGrid.appendChild(firstFragment);
        newsGrid.style.display = 'grid';
        
        // 나머지 렌더링
        const renderRest = () => {
            if (firstBatchCount >= this.filteredNews.length) return;
            const restFragment = document.createDocumentFragment();
            for (let i = firstBatchCount; i < this.filteredNews.length; i++) {
                restFragment.appendChild(this.createNewsCard(this.filteredNews[i]));
            }
            newsGrid.appendChild(restFragment);
        };
        
        if (window.requestIdleCallback) {
            window.requestIdleCallback(renderRest, { timeout: 500 });
        } else {
            setTimeout(renderRest, 0);
        }
    }
    
    // 뉴스 로드
    async loadNews() {
        try {
            // 로딩 상태 표시
            this.showLoading();
            
            // 뉴스 데이터 가져오기
            // 임시로 더미 데이터 사용 (나중에 API로 교체)
            const news = await this.fetchNews();
            
            // 뉴스를 랜덤하게 섞어서 매번 다른 순서로 표시
            this.newsData = this.shuffleArray([...news]);
            this.filteredNews = [...this.newsData];
            this.lastUpdate = new Date();
            
            // 현재 필터에 맞게 뉴스 표시
            if (this.currentCategory === 'all') {
                this.renderNews();
            } else {
                this.filterByCategory(this.currentCategory);
            }
            
            if (this.debug) console.log(`✅ 뉴스 로드 완료: ${news.length}개`);
            
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
                if (this.debug) {
                    console.log(`📰 뉴스 수신: ${data.count}개`);
                    console.log('📰 뉴스 데이터 샘플:', data.news[0]);
                }
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
            if (this.debug) console.log('⚠️ 더미 데이터 사용');
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
    
    // 배열 섞기 (Fisher-Yates 알고리즘)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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
        
        // 뉴스 카드 생성 (빠른 초기 렌더 + 점진적 렌더)
        newsGrid.innerHTML = '';
        
        // 1) 첫 배치 즉시 렌더 (초기 체감 속도 개선)
        const firstBatchCount = Math.min(8, this.newsData.length);
        const firstFragment = document.createDocumentFragment();
        for (let i = 0; i < firstBatchCount; i++) {
            firstFragment.appendChild(this.createNewsCard(this.newsData[i]));
        }
        newsGrid.appendChild(firstFragment);
        newsGrid.style.display = 'grid';

        // 2) 나머지 배치는 브라우저 여유 시간/다음 틱에 렌더
        const renderRest = () => {
            if (firstBatchCount >= this.newsData.length) return;
            const restFragment = document.createDocumentFragment();
            for (let i = firstBatchCount; i < this.newsData.length; i++) {
                restFragment.appendChild(this.createNewsCard(this.newsData[i]));
            }
            newsGrid.appendChild(restFragment);
        };
        
        if (window.requestIdleCallback) {
            window.requestIdleCallback(renderRest, { timeout: 500 });
        } else {
            setTimeout(renderRest, 0);
        }
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
        
        // 관련 계산기 매핑
        const relatedCalculator = this.getRelatedCalculator(news);
        
        // 이미지가 있으면 썸네일 추가
        const imageHtml = this.hasImage(news) 
            ? `<div class="news-card-image">
                <img src="${news.image}" alt="${news.title || '뉴스 이미지'}" loading="lazy" onerror="this.style.display='none'">
               </div>`
            : '';
        
        // title이 없으면 에러 로깅
        if (!news.title) {
            console.error('⚠️ 제목이 없는 뉴스:', news);
            if (window.ErrorLogger) {
                window.ErrorLogger.log(new Error('제목 없음'), `뉴스 제목 누락: ${JSON.stringify(news)}`);
            }
        }
        
        const title = news.title || '제목 없음';
        const source = news.source || 'Unknown';
        const category = news.category || '기타';
        const date = this.formatDate(news.date);
        
        // 관련 계산기 추천 배지
        const relatedBadge = relatedCalculator 
            ? `<div class="news-card-related" data-screen="${relatedCalculator.screen}">
                <span class="news-card-related-icon">${relatedCalculator.icon}</span>
                <span class="news-card-related-text">관련 계산기</span>
            </div>`
            : '';
        
        card.innerHTML = `
            <div class="news-card-header">
                <span class="news-card-source">${source}</span>
                <span class="news-card-date">${date}</span>
            </div>
            ${imageHtml}
            <h3 class="news-card-title">${title}</h3>
            <div class="news-card-footer">
                <span class="news-card-tag">${categoryMap[category] || '📰'} ${category}</span>
                <span class="news-card-link">전체보기 →</span>
            </div>
            ${relatedBadge}
        `;
        
        // 관련 계산기 클릭 이벤트 (뉴스 링크와 분리)
        if (relatedCalculator) {
            const relatedEl = card.querySelector('.news-card-related');
            if (relatedEl) {
                relatedEl.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.navigationManager) {
                        window.navigationManager.navigateTo(relatedCalculator.screen);
                    }
                });
            }
        }
        
        return card;
    }
    
    // 뉴스와 관련된 계산기 찾기
    getRelatedCalculator(news) {
        const title = (news.title || '').toLowerCase();
        const description = (news.description || '').toLowerCase();
        const category = (news.category || '').toLowerCase();
        const allText = `${title} ${description} ${category}`;
        
        // 키워드 매핑
        const keywordMap = {
            'salary-screen': ['연봉', '월급', '급여', '소득', '실수령액', '공제', '4대보험', '최저시급'],
            'tax-screen': ['세금', '세율', '상속세', '증여세', '과세', '공제', '연말정산'],
            'real-estate-screen': ['부동산', '아파트', '주택', '매매', '전세', '양도소득세', '중개수수료', '보유세', '집값'],
            'loan-screen': ['대출', '금리', '이자', '상환', '주택대출', 'dsr', 'ltv', 'dti'],
            'retirement-screen': ['퇴직금', '퇴사', '근속'],
            'savings-screen': ['적금', '예금', '이자', '저축', '복리'],
            'vat-screen': ['부가세', 'vat', '세액', '환급'],
            'acquisition-tax-screen': ['취등록세', '취득세', '등록세']
        };
        
        // 가장 많이 매칭되는 계산기 찾기
        let bestMatch = null;
        let bestScore = 0;
        
        for (const [screen, keywords] of Object.entries(keywordMap)) {
            const score = keywords.filter(keyword => 
                allText.includes(keyword.toLowerCase())
            ).length;
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = screen;
            }
        }
        
        if (bestMatch && bestScore > 0) {
            const calculatorNames = {
                'salary-screen': { name: '월급/연봉', icon: '💼' },
                'tax-screen': { name: '세금', icon: '📋' },
                'real-estate-screen': { name: '부동산', icon: '🏢' },
                'loan-screen': { name: '대출', icon: '🏦' },
                'retirement-screen': { name: '퇴직금', icon: '🎯' },
                'savings-screen': { name: '적금/예금', icon: '💰' },
                'vat-screen': { name: '부가세', icon: '🧾' },
                'acquisition-tax-screen': { name: '취등록세', icon: '🏛️' }
            };
            
            return {
                screen: bestMatch,
                ...calculatorNames[bestMatch]
            };
        }
        
        return null;
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
            if (this.debug) console.log('🔄 뉴스 자동 업데이트 중...');
            this.loadNews();
        }, this.updateInterval);
        
        if (this.debug) console.log(`⏰ 뉴스 자동 업데이트 설정 완료 (${this.updateInterval / 1000}초 간격)`);
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
        if (this.debug) console.log('🧹 뉴스 매니저 정리 완료');
    }
}

// 싱글톤 인스턴스 생성
const newsManager = new NewsManager();

export default newsManager;

