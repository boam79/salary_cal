/**
 * 이벤트 관리 모듈
 * 이벤트 리스너 중앙 관리 및 최적화
 */

class EventManager {
    constructor() {
        this.listeners = new Map();
        this.delegatedEvents = new Map();
        this.init();
    }
    
    init() {
        this.setupDelegatedEvents();
        document.querySelectorAll('.explanation-toggle').forEach((t) => {
            if (!t.hasAttribute('aria-expanded')) {
                t.setAttribute('aria-expanded', 'false');
            }
        });
        console.log('🎯 이벤트 매니저 초기화 완료');
    }
    
    // 이벤트 위임 설정
    setupDelegatedEvents() {
        // 상환방식 탭 메뉴 이벤트 위임
        this.addDelegatedEvent('click', '.tab-button', (e) => {
            if (e.target.closest('.tab-menu[id*="repayment-type-tabs"]')) {
                this.handleRepaymentTabClick(e);
            }
        });
        
        // 일반 탭 버튼 이벤트 위임
        this.addDelegatedEvent('click', '.tab-btn', (e) => {
            this.handleTabClick(e);
        });
        
        // 계산 버튼 이벤트 위임
        this.addDelegatedEvent('click', '[id^="calculate-"]', (e) => {
            this.handleCalculateClick(e);
        });
        
        // 초기화 버튼 이벤트 위임
        this.addDelegatedEvent('click', '[id^="reset-"]', (e) => {
            this.handleResetClick(e);
        });
        
        // 설명 토글 이벤트 위임
        this.addDelegatedEvent('click', '.explanation-toggle', (e) => {
            this.handleExplanationToggle(e);
        });
        
        // 로고 클릭 이벤트 위임
        this.addDelegatedEvent('click', '.logo.clickable', (e) => {
            this.handleLogoClick(e);
        });
        
        // 사이드바 네비게이션 아이템 클릭 이벤트 위임
        this.addDelegatedEvent('click', '.nav-item', (e) => {
            this.handleNavItemClick(e);
        });
        
        // 햄버거 버튼 클릭 이벤트 위임
        this.addDelegatedEvent('click', '.hamburger-btn', (e) => {
            this.handleHamburgerClick(e);
        });
        
        // 드로어 백드롭 클릭 이벤트 위임
        this.addDelegatedEvent('click', '.drawer-backdrop', (e) => {
            this.handleDrawerClose(e);
        });
        
        // 후원 버튼 클릭 이벤트 위임
        this.addDelegatedEvent('click', '.sidebar-donation-btn', (e) => {
            this.handleDonationClick(e);
        });
        
        // QR 모달 닫기 이벤트 위임
        this.addDelegatedEvent('click', '.qr-modal-close, .qr-modal-backdrop', (e) => {
            if (e.target.classList.contains('qr-modal-close') || e.target.classList.contains('qr-modal-backdrop')) {
                this.handleQRModalClose(e);
            }
        });
    }
    
    // 이벤트 위임 추가
    addDelegatedEvent(eventType, selector, handler) {
        if (!this.delegatedEvents.has(eventType)) {
            this.delegatedEvents.set(eventType, []);
        }
        
        this.delegatedEvents.get(eventType).push({ selector, handler });
        
        // 실제 이벤트 리스너 등록 (한 번만)
        if (!this.listeners.has(eventType)) {
            document.addEventListener(eventType, (e) => {
                const handlers = this.delegatedEvents.get(eventType);
                handlers.forEach(({ selector, handler }) => {
                    if (e.target.matches(selector) || e.target.closest(selector)) {
                        handler(e);
                    }
                });
            });
            this.listeners.set(eventType, true);
        }
    }
    
    // 상환방식 탭 클릭 처리
    handleRepaymentTabClick(event) {
        console.log('🎯 상환방식 탭 클릭 이벤트 발생!');
        
        const button = event.target;
        const tabMenu = button.closest('.tab-menu');
        const tabButtons = tabMenu.querySelectorAll('.tab-button');
        const hiddenInput = document.getElementById(tabMenu.id.replace('-tabs', ''));
        const descriptionElement = document.getElementById(tabMenu.id.replace('-tabs', '-description'));
        
        console.log(`📋 클릭된 버튼: ${button.dataset.value}`);
        console.log(`📋 탭 메뉴 ID: ${tabMenu.id}`);
        
        // 상환방식별 설명 텍스트
        const descriptions = {
            'equalPrincipalInterest': '📊 매월 동일한 금액을 상환하는 방식입니다.',
            'equalPrincipal': '📈 매월 동일한 원금에 이자를 더해 상환하는 방식입니다.',
            'maturity': '💰 만기일에 원금과 이자를 한 번에 상환하는 방식입니다.'
        };
        
        // 모든 탭 버튼에서 active 클래스 제거
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // 클릭된 버튼에 active 클래스 추가
        button.classList.add('active');
        
        // hidden input 값 업데이트
        if (hiddenInput) {
            hiddenInput.value = button.dataset.value;
            console.log(`✅ Hidden Input 값 업데이트: ${hiddenInput.value}`);
        }
        
        // 설명 업데이트
        if (descriptionElement) {
            const description = descriptions[button.dataset.value] || descriptions['equalPrincipalInterest'];
            const smallElement = descriptionElement.querySelector('small');
            if (smallElement) {
                smallElement.textContent = description;
                console.log(`✅ 설명 텍스트 업데이트: ${description}`);
            }
        }
        
        console.log(`🎯 상환방식 변경 완료: ${button.dataset.value}`);
        
        // 상환방식 변경 시 자동 재계산
        this.triggerAutoCalculation(tabMenu);
    }
    
    // 일반 탭 클릭 처리
    handleTabClick(event) {
        const tabName = event.target.dataset.tab;
        const parentScreen = event.target.closest('.screen');
        
        if (!tabName || !parentScreen) return;
        
        // Update tab buttons
        parentScreen.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Update tab content
        parentScreen.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        parentScreen.querySelector(`#${tabName}-tab`).classList.add('active');
        
        console.log(`🔄 탭 전환: ${tabName}`);
    }
    
    updateCalculationAnnouncement() {
        const el = document.getElementById('calc-announce');
        if (!el) return;
        const screen = document.querySelector('.screen.active');
        const title = screen?.querySelector('.screen-title')?.textContent?.trim() || '계산';
        el.textContent = `${title} 결과가 갱신되었습니다.`;
    }

    // 계산 버튼 클릭 처리
    handleCalculateClick(event) {
        const btn = event.target.closest('button');
        const buttonId = btn?.id || event.target.id;
        console.log(`🧮 계산 버튼 클릭: ${buttonId}`);
        
        // 계산 함수 매핑
        const calculatorMap = {
            'calculate-salary': 'calculateSalary',
            'calculate-inheritance': 'calculateInheritanceTax',
            'calculate-gift': 'calculateGiftTax',
            'calculate-acquisition': 'calculateAcquisitionTax',
            'calculate-brokerage-fee': 'calculateBrokerageFee',
            'calculate-capital-gains': 'calculateCapitalGains',
            'calculate-property-tax': 'calculatePropertyTax',
            'calculate-dsr': 'calculateDSR',
            'calculate-loan': 'calculateLoan',
            'calculate-housing-loan': 'calculateHousingLoan'
        };
        
        const calculatorFunction = calculatorMap[buttonId];
        console.log(`🔍 찾은 함수: ${calculatorFunction}`);
        console.log(`🔍 함수 존재 여부: ${!!window[calculatorFunction]}`);
        
        if (calculatorFunction && window[calculatorFunction]) {
            console.log(`✅ 함수 실행: ${calculatorFunction}`);
            window[calculatorFunction]();
            this.updateCalculationAnnouncement();
        } else {
            console.warn(`⚠️ 계산 함수를 찾을 수 없음: ${calculatorFunction}`);
            console.log(`📋 사용 가능한 함수들: ${Object.keys(window).filter(key => key.startsWith('calculate')).join(', ')}`);
        }
    }
    
    // 초기화 버튼 클릭 처리
    handleResetClick(event) {
        const buttonId = event.target.id;
        console.log(`🔄 초기화 버튼 클릭: ${buttonId}`);
        
        // 해당 화면의 모든 입력 필드 초기화
        const screen = event.target.closest('.screen');
        if (screen) {
            const inputs = screen.querySelectorAll('input[type="number"], input[type="text"]');
            inputs.forEach(input => {
                input.value = '';
            });
            
            // 결과 섹션 숨기기
            const resultSections = screen.querySelectorAll('.result-section');
            resultSections.forEach(section => {
                section.style.display = 'none';
            });
            
            console.log(`✅ ${screen.id} 화면 초기화 완료`);
        }
    }
    
    // 로고 클릭 처리
    handleLogoClick(event) {
        event.preventDefault();
        console.log('🔄 로고 클릭: 전체 화면 새로고침');
        
        // 전체 화면 새로고침
        window.location.reload();
    }
    
    // 사이드바 네비게이션 아이템 클릭 처리
    handleNavItemClick(event) {
        // 이벤트 타겟 찾기
        let navItem = event.target.closest('.nav-item');
        if (!navItem) {
            console.error('❌ nav-item 요소를 찾을 수 없음:', event.target);
            return;
        }
        
        const targetScreen = navItem.getAttribute('data-screen');
        
        if (!targetScreen) {
            console.warn('⚠️ target screen이 지정되지 않음');
            return;
        }
        
        console.log(`🔗 네비게이션 클릭: ${targetScreen}로 이동`);
        
        // 활성화 상태 변경 (동일 화면 링크가 홈/사이드 등 여러 곳에 있을 수 있음)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll(`.nav-item[data-screen="${targetScreen}"]`).forEach(item => {
            item.classList.add('active');
        });
        
        // 모바일에서 드로어 닫기
        if (window.innerWidth <= 768) {
            document.body.classList.remove('drawer-open');
            const backdrop = document.querySelector('.drawer-backdrop');
            if (backdrop) backdrop.setAttribute('aria-hidden', 'true');
        }
        
        // 화면 이동
        if (window.navigationManager) {
            const result = window.navigationManager.navigateTo(targetScreen);
            if (!result) {
                console.error('❌ 화면 이동 실패');
                // 에러 로깅
                if (window.ErrorLogger) {
                    window.ErrorLogger.log(new Error('화면 이동 실패'), `targetScreen: ${targetScreen}`);
                }
            }
        } else {
            console.error('❌ navigationManager를 찾을 수 없음');
        }
    }
    
    // 설명 토글 처리
    handleExplanationToggle(event) {
        const toggle = event.target;
        const explanation = toggle.nextElementSibling;
        
        if (explanation && explanation.classList.contains('explanation-content')) {
            const isHidden = explanation.style.maxHeight === '0px' || explanation.style.maxHeight === '';
            
            if (isHidden) {
                // 임시로 max-height를 제거하여 실제 높이 측정
                explanation.style.maxHeight = 'none';
                const actualHeight = explanation.scrollHeight;
                explanation.style.maxHeight = '0px';
                
                // 애니메이션을 위해 실제 높이로 설정
                setTimeout(() => {
                    explanation.style.maxHeight = actualHeight + 'px';
                }, 10);
                
                toggle.textContent = '▲ 계산 과정 숨기기';
                toggle.classList.add('active');
                toggle.setAttribute('aria-expanded', 'true');
            } else {
                explanation.style.maxHeight = '0px';
                toggle.textContent = '▼ 계산 과정 보기';
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
            
            console.log(`📖 계산 과정 ${isHidden ? '표시' : '숨김'}`);
        }
    }
    
    // 햄버거 버튼 클릭 처리
    handleHamburgerClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const body = document.body;
        const isOpen = body.classList.contains('drawer-open');
        
        if (isOpen) {
            body.classList.remove('drawer-open');
            const backdrop = document.querySelector('.drawer-backdrop');
            if (backdrop) backdrop.setAttribute('aria-hidden', 'true');
            console.log('📱 드로어 닫기');
        } else {
            body.classList.add('drawer-open');
            const backdrop = document.querySelector('.drawer-backdrop');
            if (backdrop) backdrop.setAttribute('aria-hidden', 'false');
            console.log('📱 드로어 열기');
        }
    }
    
    // 드로어 닫기 (백드롭 클릭 또는 네비게이션 아이템 클릭 시)
    handleDrawerClose(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const body = document.body;
        body.classList.remove('drawer-open');
        const backdrop = document.querySelector('.drawer-backdrop');
        if (backdrop) backdrop.setAttribute('aria-hidden', 'true');
        console.log('📱 드로어 닫기 (백드롭 클릭)');
    }
    
    // 후원 버튼 클릭 처리
    handleDonationClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const button = event.target.closest('.sidebar-donation-btn');
        if (!button) return;
        
        const kakaopayUrl = button.dataset.kakaopayUrl;
        const tossUrl = button.dataset.tossUrl;
        const url = kakaopayUrl || tossUrl;
        
        if (!url) return;
        
        // 모바일 환경 체크
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        
        if (isMobile) {
            // 모바일: 직접 링크로 이동
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            // 데스크탑: QR 코드 모달 표시
            this.showQRModal(url);
        }
        
        // 모바일에서 드로어 닫기
        if (window.innerWidth <= 768) {
            const body = document.body;
            body.classList.remove('drawer-open');
        }
    }
    
    // QR 모달 표시
    showQRModal(url) {
        const modal = document.getElementById('qr-modal');
        const qrImage = document.getElementById('qr-code-image');
        
        if (!modal || !qrImage) return;
        
        // QR 코드 이미지 생성 (온라인 API 사용)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
        qrImage.src = qrCodeUrl;
        
        // 모달 표시
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        console.log('💝 QR 코드 모달 표시');
    }
    
    // QR 모달 닫기
    handleQRModalClose(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const modal = document.getElementById('qr-modal');
        if (!modal) return;
        
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        console.log('💝 QR 코드 모달 닫기');
    }
    
    // 자동 재계산 트리거
    triggerAutoCalculation(tabMenu) {
        const tabMenuId = tabMenu.id;
        
        // 금융대출 탭의 상환방식인 경우
        if (tabMenuId === 'repayment-type-tabs') {
            const financialLoanTab = document.getElementById('financial-loan-tab');
            if (financialLoanTab && financialLoanTab.classList.contains('active')) {
                const loanAmount = document.getElementById('loan-amount').value;
                const interestRate = document.getElementById('interest-rate').value;
                const loanPeriod = document.getElementById('loan-period').value;
                
                if (loanAmount && interestRate && loanPeriod) {
                    console.log('💰 금융대출 자동 재계산 시작');
                    setTimeout(() => {
                        if (window.calculateLoan) {
                            window.calculateLoan();
                        }
                    }, 100);
                }
            }
        }
        
        // 주택대출 탭의 상환방식인 경우
        if (tabMenuId === 'housing-repayment-type-tabs') {
            const housingLoanTab = document.getElementById('housing-loan-tab');
            if (housingLoanTab && housingLoanTab.classList.contains('active')) {
                const housePrice = document.getElementById('house-price').value;
                const ownFunds = document.getElementById('own-funds').value;
                const annualIncome = document.getElementById('housing-annual-income').value;
                const interestRate = document.getElementById('housing-interest-rate').value;
                const loanPeriod = document.getElementById('housing-loan-period').value;
                
                if (housePrice && ownFunds && annualIncome && interestRate && loanPeriod) {
                    console.log('🏠 주택대출 자동 재계산 시작');
                    setTimeout(() => {
                        if (window.calculateHousingLoan) {
                            window.calculateHousingLoan();
                        }
                    }, 100);
                }
            }
        }
        
        // 부동산 계산기 DSR 탭의 상환방식인 경우
        if (tabMenuId === 'dsr-repayment-type-tabs') {
            const dsrTab = document.getElementById('dsr-tab');
            if (dsrTab && dsrTab.classList.contains('active')) {
                const annualIncome = document.getElementById('annual-income').value;
                const loanAmount = document.getElementById('dsr-loan-amount').value;
                const interestRate = document.getElementById('dsr-interest-rate').value;
                
                if (annualIncome && loanAmount && interestRate) {
                    console.log('🏘️ DSR 자동 재계산 시작');
                    setTimeout(() => {
                        if (window.calculateDSR) {
                            window.calculateDSR();
                        }
                    }, 100);
                }
            }
        }
    }
    
    // 이벤트 리스너 정리
    cleanup() {
        this.listeners.clear();
        this.delegatedEvents.clear();
        console.log('🧹 이벤트 매니저 정리 완료');
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
const eventManager = new EventManager();
export default eventManager;
