/**
 * 통계 대시보드 팝업 관리 모듈
 */

import statisticsManager from './statisticsManager.js';
import navigationManager from '../core/navigationManager.js';

class StatsPopup {
    constructor() {
        this.popup = null;
        this.init();
    }
    
    init() {
        this.popup = document.getElementById('stats-popup');
        if (!this.popup) {
            console.error('통계 팝업 요소를 찾을 수 없습니다.');
            return;
        }
        
        this.setupEventListeners();
        
        // 초기 진입 시 팝업 표시 여부 확인
        if (statisticsManager.shouldShowPopup()) {
            setTimeout(() => {
                this.show();
            }, 500); // 페이지 로드 후 0.5초 뒤 표시
        }
    }
    
    setupEventListeners() {
        // 닫기 버튼
        const closeBtn = document.getElementById('stats-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
        
        // 백드롭 클릭 시 닫기
        const backdrop = this.popup?.querySelector('.stats-popup-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.hide());
        }
        
        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });
    }
    
    show() {
        if (!this.popup) return;
        
        this.render();
        this.popup.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 스크롤 방지
        statisticsManager.markPopupShown();
    }
    
    hide() {
        if (!this.popup) return;
        
        this.popup.style.display = 'none';
        document.body.style.overflow = ''; // 스크롤 복원
    }
    
    isVisible() {
        return this.popup && this.popup.style.display === 'flex';
    }
    
    render() {
        const stats = statisticsManager.getAllStatistics();
        const topCalculators = stats.topCalculators;
        
        // 총 사용 횟수 표시
        const totalEl = document.getElementById('stats-total');
        if (totalEl) {
            totalEl.textContent = stats.totalCalculations.toLocaleString();
        }
        
        // 계산기 개수 표시
        const countEl = document.getElementById('stats-calculators-count');
        if (countEl) {
            countEl.textContent = Object.keys(stats.calculators).length;
        }
        
        // 인기 계산기 리스트 렌더링
        const listEl = document.getElementById('stats-list');
        if (listEl) {
            if (topCalculators.length === 0 || stats.totalCalculations === 0) {
                listEl.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--spacing-lg);">아직 사용 기록이 없습니다.<br>계산기를 사용해보세요!</p>';
            } else {
                listEl.innerHTML = topCalculators.map((calc, index) => {
                    const percentage = stats.totalCalculations > 0 
                        ? Math.round((calc.count / stats.totalCalculations) * 100) 
                        : 0;
                    
                    return `
                        <div class="stats-item" data-screen="${calc.id}">
                            <div class="stats-item-left">
                                <span class="stats-item-icon">${calc.icon}</span>
                                <span class="stats-item-name">
                                    ${index + 1}. ${calc.name}
                                </span>
                            </div>
                            <div class="stats-item-right">
                                <span class="stats-item-count">${calc.count}</span>
                                <span style="font-size: 12px; color: var(--color-text-secondary); margin-left: 8px;">
                                    (${percentage}%)
                                </span>
                            </div>
                        </div>
                    `;
                }).join('');
                
                // 계산기 클릭 시 해당 계산기로 이동
                listEl.querySelectorAll('.stats-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const screenId = item.dataset.screen;
                        if (screenId) {
                            this.hide();
                            navigationManager.navigateTo(screenId);
                        }
                    });
                });
            }
        }
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
const statsPopup = new StatsPopup();
export default statsPopup;

