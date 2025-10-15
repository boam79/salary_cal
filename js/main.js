// ===================================
// SPA Navigation & Event Management
// ===================================

// Global State
let currentScreen = 'home-screen';
let taxRates = null;

// 에러 로그 시스템
const ErrorLogger = {
    log: function(error, context = '') {
        const timestamp = new Date().toISOString();
        const errorInfo = {
            timestamp,
            error: error.message || error,
            stack: error.stack,
            context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.group('🚨 에러 발생');
        console.error('시간:', timestamp);
        console.error('에러:', errorInfo.error);
        console.error('컨텍스트:', context);
        console.error('스택:', errorInfo.stack);
        console.groupEnd();
        
        // 로컬 스토리지에 에러 저장 (최근 10개만)
        this.saveError(errorInfo);
        
        return errorInfo;
    },
    
    saveError: function(errorInfo) {
        try {
            let errors = JSON.parse(localStorage.getItem('calculatorErrors') || '[]');
            errors.unshift(errorInfo);
            errors = errors.slice(0, 10); // 최근 10개만 저장
            localStorage.setItem('calculatorErrors', JSON.stringify(errors));
        } catch (e) {
            console.warn('에러 저장 실패:', e);
        }
    },
    
    getErrors: function() {
        try {
            return JSON.parse(localStorage.getItem('calculatorErrors') || '[]');
        } catch (e) {
            console.warn('에러 조회 실패:', e);
            return [];
        }
    },
    
    clearErrors: function() {
        localStorage.removeItem('calculatorErrors');
        console.log('✅ 에러 로그가 삭제되었습니다.');
    },
    
    showErrors: function() {
        const errors = this.getErrors();
        if (errors.length === 0) {
            console.log('📝 저장된 에러가 없습니다.');
            return;
        }
        
        console.group('📋 저장된 에러 목록');
        errors.forEach((error, index) => {
            console.group(`에러 ${index + 1} (${new Date(error.timestamp).toLocaleString()})`);
            console.error('메시지:', error.error);
            console.error('컨텍스트:', error.context);
            console.error('URL:', error.url);
            if (error.stack) console.error('스택:', error.stack);
            console.groupEnd();
        });
        console.groupEnd();
    },
    
    showErrorToUser: function(message, details = '') {
        // 사용자에게 친화적인 에러 메시지 표시
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                ${details ? `<span class="error-details">${details}</span>` : ''}
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
};

// 전역에서 에러 로그에 접근할 수 있도록 설정
window.ErrorLogger = ErrorLogger;

// 디버그 명령어 추가
window.showErrors = () => ErrorLogger.showErrors();
window.clearErrors = () => ErrorLogger.clearErrors();

// 최저시급 데이터 (년도별)
const minimumWageData = {
    2024: 9860,
    2025: 10030, // 2025년 최저시급 (고용노동부 확정)
    2026: 11200, // 2026년 예상 최저시급
    // 필요시 추가 년도 데이터 입력
};

// 2025년 기준 최저시급 반환
function getCurrentMinimumWage() {
    return minimumWageData[2025]; // 2025년 최저시급
}

// 최저시급 설정
function setupMinimumWage() {
    const currentMinimumWage = getCurrentMinimumWage();
    
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
}

// ===================================
// Global Error Handlers
// ===================================
window.addEventListener('error', function(event) {
    const error = new Error(event.message);
    error.stack = event.error?.stack || 'No stack trace available';
    ErrorLogger.log(error, `Global error at ${event.filename}:${event.lineno}:${event.colno}`);
});

window.addEventListener('unhandledrejection', function(event) {
    const error = new Error(`Unhandled Promise Rejection: ${event.reason}`);
    ErrorLogger.log(error, 'Unhandled Promise Rejection');
});

// ===================================
// Initialize App
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('💰 금융 계산기 앱 시작');
    
    // Load tax rates
    await loadTaxRates();
    
    // Setup event listeners
    setupNavigationListeners();
    setupDropdownListeners();
    setupTabListeners();
    setupExplanationToggles();
    setupCalculatorListeners();
    setupNumberFormatting();
    
    // Show home screen
    showScreen('home-screen');
    
    // 최저시급 설정
    setupMinimumWage();
    
    console.log('✅ 초기화 완료');
});

// ===================================
// Load Tax Rates from config/rates.json
// ===================================
async function loadTaxRates() {
    try {
        const response = await fetch('config/rates.json');
        taxRates = await response.json();
        console.log('✅ 세율 데이터 로드 완료', taxRates);
        
        // Update last update date in footer
        const lastUpdateEl = document.getElementById('last-update');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = taxRates.lastUpdated;
        }
    } catch (error) {
        console.error('❌ 세율 데이터 로드 실패:', error);
        alert('세율 데이터를 불러오는 데 실패했습니다. 페이지를 새로고침해주세요.');
    }
}

// ===================================
// Navigation Functions
// ===================================
function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenId;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 모든 계산기 초기화
function resetAllCalculators() {
    console.log('🔄 모든 계산기 초기화 시작');
    
    // 모든 input 필드 초기화
    const allInputs = document.querySelectorAll('input[type="number"], input[type="text"]');
    allInputs.forEach(input => {
        input.value = '';
    });
    
    // 모든 select 필드 초기화
    const allSelects = document.querySelectorAll('select');
    allSelects.forEach(select => {
        select.selectedIndex = 0;
    });
    
    // 라디오 버튼 초기화 (월급/연봉 계산기)
    const salaryTypeRadios = document.querySelectorAll('input[name="salary-type"]');
    salaryTypeRadios.forEach(radio => {
        if (radio.value === 'annual') {
            radio.checked = true;
        } else {
            radio.checked = false;
        }
    });
    
    // 월급/연봉 그룹 표시 초기화
    const annualGroup = document.getElementById('annual-salary-group');
    const monthlyGroup = document.getElementById('monthly-salary-group');
    if (annualGroup) annualGroup.style.display = 'block';
    if (monthlyGroup) monthlyGroup.style.display = 'none';
    
    // 모든 결과 섹션 숨기기
    const allResultSections = document.querySelectorAll('.result-section');
    allResultSections.forEach(section => {
        section.style.display = 'none';
        section.innerHTML = '';
    });
    
    // 차트 섹션 숨기기
    const chartSections = document.querySelectorAll('[id$="-chart-section"]');
    chartSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // 설명 섹션 접기
    const explanationContents = document.querySelectorAll('.explanation-content');
    explanationContents.forEach(content => {
        content.classList.remove('show');
        content.innerHTML = '';
    });
    
    const explanationToggles = document.querySelectorAll('.explanation-toggle');
    explanationToggles.forEach(toggle => {
        toggle.classList.remove('active');
        toggle.textContent = '▼ 계산 과정 보기';
    });
    
    // 탭 초기화 (첫 번째 탭으로)
    const allTabContainers = document.querySelectorAll('.screen');
    allTabContainers.forEach(container => {
        const tabBtns = container.querySelectorAll('.tab-btn');
        const tabContents = container.querySelectorAll('.tab-content');
        
        if (tabBtns.length > 0) {
            tabBtns.forEach((btn, index) => {
                if (index === 0) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        if (tabContents.length > 0) {
            tabContents.forEach((content, index) => {
                if (index === 0) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        }
    });
    
    console.log('✅ 모든 계산기 초기화 완료');
}

function setupNavigationListeners() {
    // Logo click to home
    const logo = document.getElementById('logo-home');
    if (logo) {
        logo.addEventListener('click', () => {
            resetAllCalculators();
            showScreen('home-screen');
        });
    }
    
    // Calculator cards (without dropdown)
    const calculatorCards = document.querySelectorAll('.calculator-card');
    calculatorCards.forEach(card => {
        if (!card.classList.contains('has-dropdown')) {
            card.addEventListener('click', () => {
                const calculator = card.dataset.calculator;
                showScreen(`${calculator}-screen`);
            });
        }
    });
    
    // Back buttons
    const backButtons = document.querySelectorAll('.back-button');
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            showScreen('home-screen');
        });
    });
}

// ===================================
// Dropdown Menu (주택 대출 및 금융대출)
// ===================================
function setupDropdownListeners() {
    const loanCard = document.querySelector('.calculator-card.has-dropdown');
    const dropdownMenu = loanCard?.querySelector('.dropdown-menu');
    const dropdownItems = dropdownMenu?.querySelectorAll('.dropdown-item');
    
    if (!loanCard || !dropdownMenu) return;
    
    // Toggle dropdown on card click
    loanCard.addEventListener('click', (e) => {
        // Don't trigger if clicking on dropdown item
        if (e.target.classList.contains('dropdown-item')) return;
        
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    // Navigate to sub-calculator on item click
    dropdownItems?.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const subCalculator = item.dataset.sub;
            dropdownMenu.classList.remove('show');
            showScreen(`${subCalculator}-screen`);
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!loanCard.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
}

// ===================================
// Tab Navigation (세금 계산기)
// ===================================
function setupTabListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            const parentScreen = button.closest('.screen');
            
            // Update tab buttons
            parentScreen.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // Update tab content
            parentScreen.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            parentScreen.querySelector(`#${tabName}-tab`).classList.add('active');
        });
    });
}

// ===================================
// Explanation Accordion Toggle
// ===================================
function setupExplanationToggles() {
    const toggleButtons = document.querySelectorAll('.explanation-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            
            button.classList.toggle('active');
            content.classList.toggle('show');
            
            // Update button text
            if (content.classList.contains('show')) {
                button.textContent = '▲ 계산 과정 숨기기';
            } else {
                button.textContent = '▼ 계산 과정 보기';
            }
        });
    });
}

// ===================================
// Calculator Event Listeners
// ===================================
function setupCalculatorListeners() {
    // 1. 월급 및 연봉 계산기
    const calculateSalaryBtn = document.getElementById('calculate-salary');
    const resetSalaryBtn = document.getElementById('reset-salary');
    
    if (calculateSalaryBtn) {
        calculateSalaryBtn.addEventListener('click', calculateSalary);
    }
    if (resetSalaryBtn) {
        resetSalaryBtn.addEventListener('click', () => {
            document.getElementById('annual-salary').value = '';
            document.getElementById('work-hours').value = '';
            document.getElementById('hourly-wage').value = '';
            document.getElementById('salary-result').style.display = 'none';
        });
    }
    
    // 월급/연봉 선택 라디오 버튼 토글
    const salaryTypeRadios = document.querySelectorAll('input[name="salary-type"]');
    salaryTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const annualGroup = document.getElementById('annual-salary-group');
            const monthlyGroup = document.getElementById('monthly-salary-group');
            
            if (e.target.value === 'annual') {
                annualGroup.style.display = 'block';
                monthlyGroup.style.display = 'none';
            } else {
                annualGroup.style.display = 'none';
                monthlyGroup.style.display = 'block';
            }
        });
    });
    
    // 2. 세금 계산기 - 상속세
    const calculateInheritanceBtn = document.getElementById('calculate-inheritance');
    const resetInheritanceBtn = document.getElementById('reset-inheritance');
    
    if (calculateInheritanceBtn) {
        calculateInheritanceBtn.addEventListener('click', calculateInheritanceTax);
    }
    if (resetInheritanceBtn) {
        resetInheritanceBtn.addEventListener('click', () => {
            document.getElementById('inheritance-amount').value = '';
            document.getElementById('inheritance-result').style.display = 'none';
        });
    }
    
    // 3. 세금 계산기 - 증여세
    const calculateGiftBtn = document.getElementById('calculate-gift');
    const resetGiftBtn = document.getElementById('reset-gift');
    
    if (calculateGiftBtn) {
        calculateGiftBtn.addEventListener('click', calculateGiftTax);
    }
    if (resetGiftBtn) {
        resetGiftBtn.addEventListener('click', () => {
            document.getElementById('gift-amount').value = '';
            document.getElementById('gift-result').style.display = 'none';
        });
    }
    
    // 4. 부동산 계산기 - 중개수수료
    const calculateBrokerageFeeBtn = document.getElementById('calculate-brokerage-fee');
    const resetBrokerageFeeBtn = document.getElementById('reset-brokerage-fee');
    
    if (calculateBrokerageFeeBtn) {
        calculateBrokerageFeeBtn.addEventListener('click', calculateBrokerageFee);
    }
    if (resetBrokerageFeeBtn) {
        resetBrokerageFeeBtn.addEventListener('click', () => {
            document.getElementById('property-price').value = '';
            document.getElementById('brokerage-fee-result').style.display = 'none';
        });
    }
    
    // 부동산 계산기 - 양도소득세
    const calculateCapitalGainsBtn = document.getElementById('calculate-capital-gains');
    const resetCapitalGainsBtn = document.getElementById('reset-capital-gains');
    
    if (calculateCapitalGainsBtn) {
        calculateCapitalGainsBtn.addEventListener('click', calculateCapitalGains);
    }
    if (resetCapitalGainsBtn) {
        resetCapitalGainsBtn.addEventListener('click', () => {
            document.getElementById('acquisition-price').value = '';
            document.getElementById('transfer-price').value = '';
            document.getElementById('holding-period').value = '';
            document.getElementById('capital-gains-result').style.display = 'none';
        });
    }
    
    // 부동산 계산기 - 보유세
    const calculatePropertyTaxBtn = document.getElementById('calculate-property-tax');
    const resetPropertyTaxBtn = document.getElementById('reset-property-tax');
    
    if (calculatePropertyTaxBtn) {
        calculatePropertyTaxBtn.addEventListener('click', calculatePropertyTax);
    }
    if (resetPropertyTaxBtn) {
        resetPropertyTaxBtn.addEventListener('click', () => {
            document.getElementById('property-value').value = '';
            document.getElementById('property-type').selectedIndex = 0;
            document.getElementById('property-tax-result').style.display = 'none';
        });
    }
    
    // 부동산 계산기 - DSR
    const calculateDSRBtn = document.getElementById('calculate-dsr');
    const resetDSRBtn = document.getElementById('reset-dsr');
    
    if (calculateDSRBtn) {
        calculateDSRBtn.addEventListener('click', calculateDSR);
    }
    if (resetDSRBtn) {
        resetDSRBtn.addEventListener('click', () => {
            document.getElementById('annual-income').value = '';
            document.getElementById('loan-amount').value = '';
            document.getElementById('interest-rate').value = '';
            document.getElementById('dsr-result').style.display = 'none';
        });
    }
    
    // 5. 취등록세 계산기
    const calculateAcquisitionBtn = document.getElementById('calculate-acquisition');
    const resetAcquisitionBtn = document.getElementById('reset-acquisition');
    
    if (calculateAcquisitionBtn) {
        calculateAcquisitionBtn.addEventListener('click', calculateAcquisitionTax);
    }
    if (resetAcquisitionBtn) {
        resetAcquisitionBtn.addEventListener('click', () => {
            document.getElementById('acquisition-price').value = '';
            document.getElementById('acquisition-result').style.display = 'none';
        });
    }
    
    // 6. 금융대출 계산기
    const calculateLoanBtn = document.getElementById('calculate-loan');
    const resetLoanBtn = document.getElementById('reset-loan');
    
    if (calculateLoanBtn) {
        calculateLoanBtn.addEventListener('click', calculateLoan);
    }
    if (resetLoanBtn) {
        resetLoanBtn.addEventListener('click', () => {
            document.getElementById('loan-amount').value = '';
            document.getElementById('interest-rate').value = '';
            document.getElementById('loan-period').value = '';
            document.getElementById('loan-result').style.display = 'none';
            document.getElementById('loan-chart-section').style.display = 'none';
        });
    }
    
    // 7. 주택대출 계산기
    const calculateHousingLoanBtn = document.getElementById('calculate-housing-loan');
    const resetHousingLoanBtn = document.getElementById('reset-housing-loan');
    
    if (calculateHousingLoanBtn) {
        calculateHousingLoanBtn.addEventListener('click', calculateHousingLoan);
    }
    if (resetHousingLoanBtn) {
        resetHousingLoanBtn.addEventListener('click', () => {
            document.getElementById('house-price').value = '';
            document.getElementById('own-funds').value = '';
            document.getElementById('annual-income').value = '';
            document.getElementById('housing-interest-rate').value = '';
            document.getElementById('housing-loan-period').value = '';
            document.getElementById('housing-loan-result').style.display = 'none';
            document.getElementById('housing-loan-chart-section').style.display = 'none';
        });
    }
    
    // 엔터키로 계산하기 기능 추가
    setupEnterKeyListeners();
}

// ===================================
// 엔터키 계산 기능
// ===================================
function setupEnterKeyListeners() {
    // 모든 입력 필드에 엔터키 이벤트 추가
    const allInputs = document.querySelectorAll('input[type="number"], input[type="text"]');
    
    allInputs.forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                
                // 현재 화면의 계산 버튼 찾기
                const screen = input.closest('.screen');
                if (screen) {
                    const calculateBtn = screen.querySelector('.btn-primary');
                    if (calculateBtn) {
                        console.log('엔터키 눌림 - 계산 시작:', calculateBtn.id);
                        calculateBtn.click();
                    }
                }
            }
        });
    });
}

// ===================================
// Utility Functions
// ===================================

// Format number as Korean currency
function formatCurrency(num) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'decimal',
        maximumFractionDigits: 0
    }).format(Math.round(num)) + '원';
}

// Format number with commas
function formatNumber(num) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'decimal',
        maximumFractionDigits: 2
    }).format(num);
}

// Validate input
function validateInput(value, name) {
    // 빈 값 체크
    if (!value || value.trim() === '') {
        alert(`${name}을(를) 입력해주세요.`);
        return null;
    }
    
    const num = parseFloat(value);
    
    // 숫자 검증
    if (isNaN(num)) {
        alert(`${name}은(는) 숫자여야 합니다.`);
        return null;
    }
    
    // 음수 검증
    if (num < 0) {
        alert(`${name}은(는) 0보다 커야 합니다.`);
        return null;
    }
    
    // 최소값 검증 (너무 작은 값 방지)
    if (num < 0.01) {
        alert(`${name}은(는) 너무 작습니다. 최소 0.01 이상 입력해주세요.`);
        return null;
    }
    
    return num;
}

// ===================================
// Number Input Formatting (단위 변환 및 엔터키)
// ===================================
function setupNumberFormatting() {
    // 모든 input과 select에 엔터키 이벤트 추가
    const allInputs = document.querySelectorAll('input, select');
    
    allInputs.forEach(input => {
        // Allow Enter key to trigger calculation
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const screen = e.target.closest('.screen.calculator-screen');
                if (screen) {
                    const calculateBtn = screen.querySelector('.btn-primary');
                    if (calculateBtn) {
                        console.log('엔터키 눌림 - 계산 시작');
                        calculateBtn.click();
                    }
                }
            }
        });
    });
}

// Export functions for use in calculators.js
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.validateInput = validateInput;
window.taxRates = () => taxRates;

