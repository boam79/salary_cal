// ===================================
// Calculator Logic Functions
// ===================================

// ===================================
// Helper: 단위 적용하여 값 가져오기
// ===================================
function getValueWithUnit(inputId, defaultUnit = 10000) {
    const inputElement = document.getElementById(inputId);
    const value = inputElement.value;
    
    // 빈 값 체크
    if (!value || value.trim() === '') {
        const label = inputElement.labels[0]?.textContent || '입력값';
        alert(`${label}을(를) 입력해주세요.`);
        return null;
    }
    
    const num = parseFloat(value);
    
    // 숫자 검증
    if (isNaN(num)) {
        const label = inputElement.labels[0]?.textContent || '입력값';
        alert(`${label}은(는) 숫자여야 합니다.`);
        return null;
    }
    
    // 음수 검증
    if (num < 0) {
        const label = inputElement.labels[0]?.textContent || '입력값';
        alert(`${label}은(는) 0보다 커야 합니다.`);
        return null;
    }
    
    // 최소값 검증 (너무 작은 값 방지) - 단위에 따라 조정
    const minValue = defaultUnit >= 100000000 ? 0.1 : 0.01; // 억원 단위는 0.1, 만원 단위는 0.01
    if (num < minValue) {
        const label = inputElement.labels[0]?.textContent || '입력값';
        alert(`${label}은(는) 너무 작습니다. 최소 ${minValue} 이상 입력해주세요.`);
        return null;
    }
    
    return num * defaultUnit;
}

function validateInputLocal(value, name) {
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
    
    // 최소값 검증 (너무 작은 값 방지) - 퍼센트 값은 제외
    if (name.includes('이자율') || name.includes('세율') || name.includes('%')) {
        // 퍼센트 값은 최소값 검증 제외
    } else if (num < 0.01) {
        alert(`${name}은(는) 너무 작습니다. 최소 0.01 이상 입력해주세요.`);
        return null;
    }
    
    return num;
}

// ===================================
// 1. 연봉 실수령액 계산기
// ===================================
function calculateSalary() {
    // 현재 화면이 salary-screen인지 확인
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'salary-screen') {
        console.error('calculateSalary: Not on salary screen, current screen:', currentScreen?.id);
        return;
    }
    
    const rates = window.taxRates ? window.taxRates() : null;
    if (!rates) {
        alert('세율 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    
    // 계산 유형 확인
    const salaryType = document.querySelector('input[name="salary-type"]:checked').value;
    let annualSalary, monthlySalary;
    
    if (salaryType === 'annual') {
        // 연봉 계산
        annualSalary = getValueWithUnit('annual-salary', 10000); // 만원 단위
        if (annualSalary === null) return;
        monthlySalary = annualSalary / 12;
    } else {
        // 월급 계산 (최저시급 기준)
        const workHours = validateInputLocal(document.getElementById('work-hours').value, '주간 근무시간');
        if (workHours === null) return;
        
        const hourlyWage = validateInputLocal(document.getElementById('hourly-wage').value, '시급');
        if (hourlyWage === null) return;
        
        // 2025년 최저시급 확인
        const minimumWage = 10030;
        if (hourlyWage < minimumWage) {
            alert(`시급은 최저시급 ${minimumWage.toLocaleString()}원 이상이어야 합니다.`);
            return;
        }
        
        // 주휴수당 포함 주급 계산
        const weeklySalary = workHours * hourlyWage; // 주급
        const weeklyHolidayPay = (workHours * hourlyWage) * 0.125; // 주휴수당 (주급의 12.5%)
        const totalWeeklySalary = weeklySalary + weeklyHolidayPay;
        
        // 월급 계산 (주 4.33주 기준)
        monthlySalary = totalWeeklySalary * 4.33;
        annualSalary = monthlySalary * 12;
    }
    
    // 1. 국민연금 (4.5%, 상한액: 553만원)
    const pensionBase = Math.min(monthlySalary, rates.insurance.pension.maxMonthlyIncome);
    const pension = pensionBase * rates.insurance.pension.rate;
    
    // 2. 건강보험 (3.545%)
    const health = monthlySalary * rates.insurance.health.rate;
    
    // 3. 장기요양보험 (건강보험료의 12.81%)
    const longTermCare = health * rates.insurance.longTermCare.rateOfHealth;
    
    // 4. 고용보험 (0.9%)
    const employment = monthlySalary * rates.insurance.employment.rate;
    
    // 5. 소득세 계산
    const yearlyIncome = annualSalary;
    
    // 근로소득공제 (간소화)
    let incomeDeduction = 0;
    if (yearlyIncome <= 5000000) {
        incomeDeduction = yearlyIncome * 0.7;
    } else if (yearlyIncome <= 15000000) {
        incomeDeduction = 3500000 + (yearlyIncome - 5000000) * 0.4;
    } else if (yearlyIncome <= 45000000) {
        incomeDeduction = 7500000 + (yearlyIncome - 15000000) * 0.15;
    } else if (yearlyIncome <= 100000000) {
        incomeDeduction = 12000000 + (yearlyIncome - 45000000) * 0.05;
    } else {
        incomeDeduction = 14750000 + (yearlyIncome - 100000000) * 0.02;
    }
    
    // 과세표준
    const taxBase = Math.max(0, yearlyIncome - incomeDeduction);
    
    // 소득세 계산 (누진공제 적용)
    let incomeTax = 0;
    const brackets = rates.incomeTax.brackets;
    for (let i = 0; i < brackets.length; i++) {
        if (taxBase <= brackets[i].max) {
            incomeTax = taxBase * brackets[i].rate - brackets[i].deduction;
            break;
        }
    }
    
    const monthlyIncomeTax = incomeTax / 12;
    
    // 6. 지방소득세 (소득세의 10%)
    const localTax = monthlyIncomeTax * rates.incomeTax.localTaxRate;
    
    // 총 공제액
    const totalDeduction = pension + health + longTermCare + employment + monthlyIncomeTax + localTax;
    
    // 실수령액
    const monthlyNet = monthlySalary - totalDeduction;
    const annualNet = monthlyNet * 12;
    
    // 결과 표시
    const monthlyNetElement = document.getElementById('monthly-net');
    const annualNetElement = document.getElementById('annual-net');
    if (!monthlyNetElement || !annualNetElement) {
        console.error('calculateSalary: Required elements not found');
        return; // 요소가 없으면 함수 종료
    }
    monthlyNetElement.textContent = formatCurrency(monthlyNet);
    annualNetElement.textContent = formatCurrency(annualNet);
    
    // 공제 내역 테이블
    const deductionTable = document.getElementById('deduction-table');
    deductionTable.innerHTML = `
        <tr>
            <td>월 급여</td>
            <td>${formatCurrency(monthlySalary)}</td>
        </tr>
        <tr>
            <td>국민연금 (4.5%)</td>
            <td>${formatCurrency(pension)}</td>
        </tr>
        <tr>
            <td>건강보험 (3.545%)</td>
            <td>${formatCurrency(health)}</td>
        </tr>
        <tr>
            <td>장기요양보험 (건강보험의 12.81%)</td>
            <td>${formatCurrency(longTermCare)}</td>
        </tr>
        <tr>
            <td>고용보험 (0.9%)</td>
            <td>${formatCurrency(employment)}</td>
        </tr>
        <tr>
            <td>소득세</td>
            <td>${formatCurrency(monthlyIncomeTax)}</td>
        </tr>
        <tr>
            <td>지방소득세 (소득세의 10%)</td>
            <td>${formatCurrency(localTax)}</td>
        </tr>
        <tr style="font-weight: 700; background-color: var(--color-surface);">
            <td>총 공제액</td>
            <td>${formatCurrency(totalDeduction)}</td>
        </tr>
    `;
    
    // 계산 과정 설명
    const explanation = document.getElementById('salary-explanation');
    let explanationHTML = '';
    
    if (salaryType === 'monthly') {
        const workHours = document.getElementById('work-hours').value;
        const hourlyWage = document.getElementById('hourly-wage').value;
        const weeklySalary = workHours * hourlyWage;
        const weeklyHolidayPay = weeklySalary * 0.125;
        
        explanationHTML = `
            <div class="explanation-step">
                <strong>1단계: 월급 계산</strong><br>
                • 주급: ${workHours}시간 × ${formatCurrency(hourlyWage)} = ${formatCurrency(weeklySalary)}<br>
                • 주휴수당: ${formatCurrency(weeklySalary)} × 12.5% = ${formatCurrency(weeklyHolidayPay)}<br>
                • 월급: (${formatCurrency(weeklySalary)} + ${formatCurrency(weeklyHolidayPay)}) × 4.33주 = ${formatCurrency(monthlySalary)}
            </div>
            <div class="explanation-step">
                <strong>2단계: 근로소득공제</strong><br>
                연봉 ${formatCurrency(yearlyIncome)} → 근로소득공제 ${formatCurrency(incomeDeduction)} → 
                과세표준 ${formatCurrency(taxBase)}
            </div>
            <div class="explanation-step">
                <strong>3단계: 소득세 계산</strong><br>
                과세표준 ${formatCurrency(taxBase)}에 대해 누진세율 적용<br>
                연 소득세: ${formatCurrency(incomeTax)} (월 ${formatCurrency(monthlyIncomeTax)})
            </div>
            <div class="explanation-step">
                <strong>4단계: 4대보험 계산</strong><br>
                • 국민연금: ${formatCurrency(monthlySalary)} × 4.5% = ${formatCurrency(pension)}<br>
                • 건강보험: ${formatCurrency(monthlySalary)} × 3.545% = ${formatCurrency(health)}<br>
                • 장기요양: ${formatCurrency(health)} × 12.81% = ${formatCurrency(longTermCare)}<br>
                • 고용보험: ${formatCurrency(monthlySalary)} × 0.9% = ${formatCurrency(employment)}
            </div>
            <div class="explanation-step">
                <strong>5단계: 실수령액 계산</strong><br>
                월 급여 ${formatCurrency(monthlySalary)} - 총 공제 ${formatCurrency(totalDeduction)} = 
                <strong style="color: var(--color-primary);">${formatCurrency(monthlyNet)}</strong>
            </div>
        `;
    } else {
        explanationHTML = `
            <div class="explanation-step">
                <strong>1단계: 근로소득공제</strong><br>
                연봉 ${formatCurrency(yearlyIncome)} → 근로소득공제 ${formatCurrency(incomeDeduction)} → 
                과세표준 ${formatCurrency(taxBase)}
            </div>
            <div class="explanation-step">
                <strong>2단계: 소득세 계산</strong><br>
                과세표준 ${formatCurrency(taxBase)}에 대해 누진세율 적용<br>
                연 소득세: ${formatCurrency(incomeTax)} (월 ${formatCurrency(monthlyIncomeTax)})
            </div>
            <div class="explanation-step">
                <strong>3단계: 4대보험 계산</strong><br>
                • 국민연금: ${formatCurrency(monthlySalary)} × 4.5% = ${formatCurrency(pension)}<br>
                • 건강보험: ${formatCurrency(monthlySalary)} × 3.545% = ${formatCurrency(health)}<br>
                • 장기요양: ${formatCurrency(health)} × 12.81% = ${formatCurrency(longTermCare)}<br>
                • 고용보험: ${formatCurrency(monthlySalary)} × 0.9% = ${formatCurrency(employment)}
            </div>
            <div class="explanation-step">
                <strong>4단계: 실수령액 계산</strong><br>
                월 급여 ${formatCurrency(monthlySalary)} - 총 공제 ${formatCurrency(totalDeduction)} = 
                <strong style="color: var(--color-primary);">${formatCurrency(monthlyNet)}</strong>
            </div>
        `;
    }
    
    explanation.innerHTML = explanationHTML;
    
    document.getElementById('salary-result').style.display = 'block';
}

// ===================================
// 2-1. 상속세 계산기
// ===================================
function calculateInheritanceTax() {
    // 현재 화면이 tax-screen인지 확인
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'tax-screen') {
        console.error('calculateInheritanceTax: Not on tax screen, current screen:', currentScreen?.id);
        return;
    }
    
    const amount = getValueWithUnit('inheritance-amount', 100000000); // 억원 단위
    
    if (amount === null) return;
    
    const rates = window.taxRates ? window.taxRates() : null;
    if (!rates) return;
    
    // 일괄공제 5억원 (간소화)
    const deduction = 500000000;
    const taxBase = Math.max(0, amount - deduction);
    
    // 상속세 계산
    let tax = 0;
    const brackets = rates.inheritanceTax.brackets;
    for (let i = 0; i < brackets.length; i++) {
        if (taxBase <= brackets[i].max) {
            tax = taxBase * brackets[i].rate - brackets[i].deduction;
            break;
        }
    }
    
    // 결과 표시 - 2-column 레이아웃
    const resultSection = document.getElementById('inheritance-result');
    const summaryElement = document.getElementById('inheritance-summary');
    const explanationElement = document.getElementById('inheritance-explanation');
    
    if (!resultSection || !summaryElement || !explanationElement) {
        const error = new Error('Required DOM elements not found for inheritance tax calculator');
        console.error('calculateInheritanceTax: Required elements not found', error);
        return; // 요소가 없으면 함수 종료
    }
    
    // 결과 요약 (왼쪽)
    summaryElement.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">상속세액</span>
                <span class="result-value">${formatCurrency(tax)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">과세표준</span>
                <span class="result-value">${formatCurrency(taxBase)}</span>
            </div>
        </div>
    `;
    
    // 계산 과정 (오른쪽)
    explanationElement.innerHTML = `
        <div class="explanation-step">
            <strong>1단계: 과세표준 계산</strong><br>
            상속재산 ${formatCurrency(amount)} - 일괄공제 ${formatCurrency(deduction)} = ${formatCurrency(taxBase)}
        </div>
        <div class="explanation-step">
            <strong>2단계: 상속세 계산</strong><br>
            과세표준 ${formatCurrency(taxBase)}에 누진세율 적용<br>
            상속세액: <strong>${formatCurrency(tax)}</strong>
        </div>
    `;
    
    resultSection.style.display = 'block';
}

// ===================================
// 2-2. 증여세 계산기
// ===================================
function calculateGiftTax() {
    // 현재 화면이 tax-screen인지 확인
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'tax-screen') {
        console.error('calculateGiftTax: Not on tax screen, current screen:', currentScreen?.id);
        return;
    }
    
    const amount = getValueWithUnit('gift-amount', 100000000); // 억원 단위
    
    if (amount === null) return;
    
    const relation = document.getElementById('gift-relation').value;
    const rates = window.taxRates ? window.taxRates() : null;
    if (!rates) return;
    
    // 공제액
    const deduction = rates.giftTax.deductions[relation];
    const taxBase = Math.max(0, amount - deduction);
    
    // 증여세 계산
    let tax = 0;
    const brackets = rates.giftTax.brackets;
    for (let i = 0; i < brackets.length; i++) {
        if (taxBase <= brackets[i].max) {
            tax = taxBase * brackets[i].rate - brackets[i].deduction;
            break;
        }
    }
    
    const relationNames = {
        spouse: '배우자',
        linealDescendant: '직계존비속(성인)',
        linealDescendantMinor: '직계존비속(미성년자)',
        otherRelative: '기타 친족'
    };
    
    // 결과 표시 - 2-column 레이아웃
    const resultSection = document.getElementById('gift-result');
    const summaryElement = document.getElementById('gift-summary');
    const explanationElement = document.getElementById('gift-explanation');
    
    if (!resultSection || !summaryElement || !explanationElement) {
        const error = new Error('Required DOM elements not found for gift tax calculator');
        console.error('calculateGiftTax: Required elements not found', error);
        // ErrorLogger가 사용 가능한 경우에만 사용
        if (typeof ErrorLogger !== 'undefined') {
            ErrorLogger.log(error, 'calculateGiftTax function');
            ErrorLogger.showErrorToUser(
                '증여세 계산 결과를 표시할 수 없습니다.',
                '페이지를 새로고침 후 다시 시도해주세요.'
            );
        }
        return; // 요소가 없으면 함수 종료
    }
    
    // 결과 요약 (왼쪽)
    summaryElement.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">증여세액</span>
                <span class="result-value">${formatCurrency(tax)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">과세표준</span>
                <span class="result-value">${formatCurrency(taxBase)}</span>
            </div>
        </div>
    `;
    
    // 계산 과정 (오른쪽)
    explanationElement.innerHTML = `
        <div class="explanation-step">
            <strong>1단계: 공제액 적용</strong><br>
            증여자 관계: ${relationNames[relation]}<br>
            공제액: ${formatCurrency(deduction)} (10년간)
        </div>
        <div class="explanation-step">
            <strong>2단계: 과세표준 계산</strong><br>
            증여재산 ${formatCurrency(amount)} - 공제액 ${formatCurrency(deduction)} = ${formatCurrency(taxBase)}
        </div>
        <div class="explanation-step">
            <strong>3단계: 증여세 계산</strong><br>
            과세표준 ${formatCurrency(taxBase)}에 누진세율 적용<br>
            증여세액: <strong>${formatCurrency(tax)}</strong>
        </div>
    `;
    
    resultSection.style.display = 'block';
}

// ===================================
// 3. 부동산 계산기
// ===================================
function calculateRealEstate() {
    const purchasePrice = getValueWithUnit('purchase-price', 100000000); // 억원 단위
    const salePrice = getValueWithUnit('sale-price', 100000000); // 억원 단위
    const holdingPeriod = validateInputLocal(
        document.getElementById('holding-period').value,
        '보유기간'
    );
    
    if (purchasePrice === null || salePrice === null || holdingPeriod === null) return;
    
    const rentalIncome = getValueWithUnit('rental-income', 10000) || 0; // 만원 단위
    
    // 매매차익
    const capitalGain = salePrice - purchasePrice;
    
    // 총 수익
    const totalProfit = capitalGain + rentalIncome;
    
    // 수익률
    const returnRate = (totalProfit / purchasePrice) * 100;
    
    // 연평균 수익률
    const annualReturnRate = holdingPeriod > 0 ? returnRate / holdingPeriod : 0;
    
    // 결과 표시
    const resultSection = document.getElementById('real-estate-result');
    resultSection.innerHTML = `
        <h3 class="result-title">계산 결과</h3>
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">총 수익</span>
                <span class="result-value">${formatCurrency(totalProfit)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">수익률</span>
                <span class="result-value">${formatNumber(returnRate)}%</span>
            </div>
            <div class="result-item">
                <span class="result-label">연평균 수익률</span>
                <span class="result-value">${formatNumber(annualReturnRate)}%</span>
            </div>
        </div>
        <div class="explanation-section">
            <button class="explanation-toggle">▼ 계산 과정 보기</button>
            <div class="explanation-content">
                <div class="explanation-step">
                    <strong>1단계: 매매차익 계산</strong><br>
                    매도가 ${formatCurrency(salePrice)} - 매입가 ${formatCurrency(purchasePrice)} = ${formatCurrency(capitalGain)}
                </div>
                <div class="explanation-step">
                    <strong>2단계: 총 수익 계산</strong><br>
                    매매차익 ${formatCurrency(capitalGain)} + 임대수익 ${formatCurrency(rentalIncome)} = 
                    <strong>${formatCurrency(totalProfit)}</strong>
                </div>
                <div class="explanation-step">
                    <strong>3단계: 수익률 계산</strong><br>
                    (총 수익 ${formatCurrency(totalProfit)} ÷ 매입가 ${formatCurrency(purchasePrice)}) × 100 = 
                    <strong>${formatNumber(returnRate)}%</strong>
                </div>
                <div class="explanation-step">
                    <strong>4단계: 연평균 수익률</strong><br>
                    수익률 ${formatNumber(returnRate)}% ÷ 보유기간 ${holdingPeriod}년 = 
                    <strong>${formatNumber(annualReturnRate)}%</strong>
                </div>
            </div>
        </div>
    `;
    
    resultSection.style.display = 'block';
    setupExplanationToggles();
}

// ===================================
// 4. 취등록세 계산기
// ===================================
function calculateAcquisitionTax() {
    // 현재 화면이 acquisition-tax-screen인지 확인
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'acquisition-tax-screen') {
        console.error('calculateAcquisitionTax: Not on acquisition-tax screen, current screen:', currentScreen?.id);
        return;
    }
    
    const price = getValueWithUnit('acquisition-price', 100000000); // 억원 단위
    
    if (price === null) return;
    
    const propertyType = document.getElementById('property-type').value;
    const rates = window.taxRates ? window.taxRates() : null;
    if (!rates) return;
    
    let acquisitionRate = 0;
    let typeName = '';
    
    switch (propertyType) {
        case 'house-first':
            acquisitionRate = rates.acquisitionTax.house.first;
            typeName = '주택 (1주택)';
            break;
        case 'house-second':
            acquisitionRate = rates.acquisitionTax.house.second;
            typeName = '주택 (2주택)';
            break;
        case 'house-third':
            acquisitionRate = rates.acquisitionTax.house.third;
            typeName = '주택 (3주택 이상)';
            break;
        case 'land':
            acquisitionRate = rates.acquisitionTax.land;
            typeName = '토지';
            break;
        case 'farmland':
            acquisitionRate = rates.acquisitionTax.farmland;
            typeName = '농지';
            break;
    }
    
    // 취득세
    const acquisitionTax = price * acquisitionRate;
    
    // 등록면허세 (2%)
    const registrationTax = price * rates.acquisitionTax.registrationTax;
    
    // 지방교육세 (0.4%)
    const localEducationTax = price * rates.acquisitionTax.localEducationTax;
    
    // 총 세금
    const totalTax = acquisitionTax + registrationTax + localEducationTax;
    
    // 결과 표시
    const resultSection = document.getElementById('acquisition-result');
    if (!resultSection) {
        console.error('calculateAcquisitionTax: acquisition-result element not found');
        return; // 요소가 없으면 함수 종료
    }
    resultSection.innerHTML = `
        <h3 class="result-title">계산 결과</h3>
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">총 세금</span>
                <span class="result-value">${formatCurrency(totalTax)}</span>
            </div>
        </div>
        <div class="result-details">
            <h4>세금 상세 내역</h4>
            <div class="table-wrapper">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>항목</th>
                            <th>세율</th>
                            <th>금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>취득세</td>
                            <td>${(acquisitionRate * 100)}%</td>
                            <td>${formatCurrency(acquisitionTax)}</td>
                        </tr>
                        <tr>
                            <td>등록면허세</td>
                            <td>2%</td>
                            <td>${formatCurrency(registrationTax)}</td>
                        </tr>
                        <tr>
                            <td>지방교육세</td>
                            <td>0.4%</td>
                            <td>${formatCurrency(localEducationTax)}</td>
                        </tr>
                        <tr style="font-weight: 700; background-color: var(--color-surface);">
                            <td>합계</td>
                            <td></td>
                            <td>${formatCurrency(totalTax)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="explanation-section">
            <button class="explanation-toggle">▼ 계산 과정 보기</button>
            <div class="explanation-content">
                <div class="explanation-step">
                    <strong>1단계: 부동산 유형 확인</strong><br>
                    유형: ${typeName}<br>
                    취득가액: ${formatCurrency(price)}
                </div>
                <div class="explanation-step">
                    <strong>2단계: 각 세금 계산</strong><br>
                    • 취득세: ${formatCurrency(price)} × ${(acquisitionRate * 100)}% = ${formatCurrency(acquisitionTax)}<br>
                    • 등록면허세: ${formatCurrency(price)} × 2% = ${formatCurrency(registrationTax)}<br>
                    • 지방교육세: ${formatCurrency(price)} × 0.4% = ${formatCurrency(localEducationTax)}
                </div>
                <div class="explanation-step">
                    <strong>3단계: 총 세금</strong><br>
                    ${formatCurrency(acquisitionTax)} + ${formatCurrency(registrationTax)} + ${formatCurrency(localEducationTax)} = 
                    <strong>${formatCurrency(totalTax)}</strong>
                </div>
            </div>
        </div>
    `;
    
    resultSection.style.display = 'block';
    setupExplanationToggles();
}

// ===================================
// 5. 금융대출 계산기
// ===================================
function calculateLoan() {
    // 현재 화면이 financial-loan-screen인지 확인
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'financial-loan-screen') {
        console.error('calculateLoan: Not on financial-loan screen, current screen:', currentScreen?.id);
        return;
    }
    
    const principal = getValueWithUnit('loan-amount', 100000000); // 억원 단위
    const annualRateValue = document.getElementById('interest-rate').value;
    if (!annualRateValue || annualRateValue.trim() === '') {
        alert('연이자율을(를) 입력해주세요.');
        return;
    }
    
    const annualRate = parseFloat(annualRateValue);
    if (isNaN(annualRate)) {
        alert('연이자율은(는) 숫자여야 합니다.');
        return;
    }
    
    if (annualRate < 0) {
        alert('연이자율은(는) 0보다 커야 합니다.');
        return;
    }
    const yearsValue = document.getElementById('loan-period').value;
    if (!yearsValue || yearsValue.trim() === '') {
        alert('대출기간을(를) 입력해주세요.');
        return;
    }
    
    const years = parseFloat(yearsValue);
    if (isNaN(years)) {
        alert('대출기간은(는) 숫자여야 합니다.');
        return;
    }
    
    if (years <= 0) {
        alert('대출기간은(는) 0보다 커야 합니다.');
        return;
    }
    
    if (principal === null) return;
    
    const repaymentType = document.getElementById('repayment-type').value;
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    
    let monthlyPayment = 0;
    let totalInterest = 0;
    let schedule = [];
    
    // 상환방식별 계산
    if (repaymentType === 'equalPrincipalInterest') {
        // 원리금균등상환
        monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                         (Math.pow(1 + monthlyRate, months) - 1);
        
        let balance = principal;
        for (let i = 1; i <= months; i++) {
            const interest = balance * monthlyRate;
            const principalPayment = monthlyPayment - interest;
            balance -= principalPayment;
            
            totalInterest += interest;
            
            if (i <= 12 || i % 12 === 0 || i === months) {
                schedule.push({
                    month: i,
                    principal: principalPayment,
                    interest: interest,
                    payment: monthlyPayment,
                    balance: Math.max(0, balance)
                });
            }
        }
        
    } else if (repaymentType === 'equalPrincipal') {
        // 원금균등상환
        const principalPayment = principal / months;
        let balance = principal;
        
        for (let i = 1; i <= months; i++) {
            const interest = balance * monthlyRate;
            const payment = principalPayment + interest;
            balance -= principalPayment;
            
            totalInterest += interest;
            
            if (i <= 12 || i % 12 === 0 || i === months) {
                schedule.push({
                    month: i,
                    principal: principalPayment,
                    interest: interest,
                    payment: payment,
                    balance: Math.max(0, balance)
                });
            }
        }
        
        monthlyPayment = principalPayment + (principal * monthlyRate);
        
    } else if (repaymentType === 'maturity') {
        // 만기일시상환
        monthlyPayment = principal * monthlyRate;
        totalInterest = monthlyPayment * months;
        
        for (let i = 1; i <= months; i++) {
            if (i <= 12 || i % 12 === 0 || i === months) {
                schedule.push({
                    month: i,
                    principal: i === months ? principal : 0,
                    interest: monthlyPayment,
                    payment: i === months ? principal + monthlyPayment : monthlyPayment,
                    balance: i === months ? 0 : principal
                });
            }
        }
    }
    
    const totalPayment = principal + totalInterest;
    
    const repaymentTypeNames = {
        'equalPrincipalInterest': '원리금균등상환',
        'equalPrincipal': '원금균등상환',
        'maturity': '만기일시상환'
    };
    
    // 결과 표시 - 2-column 레이아웃
    const resultSection = document.getElementById('loan-result');
    const summaryElement = document.getElementById('loan-summary');
    const explanationElement = document.getElementById('loan-explanation');
    
    if (!resultSection || !summaryElement || !explanationElement) {
        const error = new Error('Required DOM elements not found for loan calculator');
        console.error('calculateLoan: Required elements not found', error);
        // ErrorLogger가 사용 가능한 경우에만 사용
        if (typeof ErrorLogger !== 'undefined') {
            ErrorLogger.log(error, 'calculateLoan function');
            ErrorLogger.showErrorToUser(
                '계산 결과를 표시할 수 없습니다.',
                '페이지를 새로고침 후 다시 시도해주세요.'
            );
        }
        return; // 요소가 없으면 함수 종료
    }
    
    // 결과 요약 (왼쪽)
    summaryElement.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">월 상환액</span>
                <span class="result-value">${formatCurrency(monthlyPayment)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">총 이자</span>
                <span class="result-value">${formatCurrency(totalInterest)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">총 상환액</span>
                <span class="result-value">${formatCurrency(totalPayment)}</span>
            </div>
        </div>
        <div class="result-details">
            <h4>상환 스케줄 (주요 월차)</h4>
            <div class="table-wrapper">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>월차</th>
                            <th>원금</th>
                            <th>이자</th>
                            <th>월 상환액</th>
                            <th>잔액</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${schedule.map(s => `
                            <tr>
                                <td>${s.month}개월</td>
                                <td>${formatCurrency(s.principal)}</td>
                                <td>${formatCurrency(s.interest)}</td>
                                <td>${formatCurrency(s.payment)}</td>
                                <td>${formatCurrency(s.balance)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // 계산 과정 (오른쪽)
    explanationElement.innerHTML = `
        <div class="explanation-step">
            <strong>상환방식</strong><br>
            ${repaymentTypeNames[repaymentType]}
        </div>
        <div class="explanation-step">
            <strong>계산 공식</strong><br>
            ${getRepaymentFormula(repaymentType)}
        </div>
        <div class="explanation-step">
            <strong>계산 결과</strong><br>
            • 대출원금: ${formatCurrency(principal)}<br>
            • 연이자율: ${annualRate}% (월 ${formatNumber(monthlyRate * 100)}%)<br>
            • 대출기간: ${years}년 (${months}개월)<br>
            • 월 상환액: <strong>${formatCurrency(monthlyPayment)}</strong><br>
            • 총 이자: <strong>${formatCurrency(totalInterest)}</strong>
        </div>
    `;
    
    resultSection.style.display = 'block';
    
    // 그래프 그리기
    document.getElementById('loan-chart-section').style.display = 'block';
    drawLoanChart('loan-chart', schedule, principal);
}

// ===================================
// 6. 주택대출 계산기
// ===================================
function calculateHousingLoan() {
    // 현재 화면이 housing-loan-screen인지 확인
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'housing-loan-screen') {
        console.error('calculateHousingLoan: Not on housing-loan screen, current screen:', currentScreen?.id);
        return;
    }
    
    const housePrice = getValueWithUnit('house-price', 100000000); // 억원 단위
    const ownFunds = getValueWithUnit('own-funds', 100000000); // 억원 단위
    const annualIncome = getValueWithUnit('housing-annual-income', 10000); // 만원 단위
    const annualRate = validateInputLocal(
        document.getElementById('housing-interest-rate').value,
        '연이자율'
    );
    const years = validateInputLocal(
        document.getElementById('housing-loan-period').value,
        '대출기간'
    );
    
    if (housePrice === null || ownFunds === null || annualIncome === null || 
        annualRate === null || years === null) return;
    
    const rates = window.taxRates ? window.taxRates() : null;
    if (!rates) return;
    
    // LTV 계산 (주택가격의 70%)
    const ltvRate = rates.loanInterest.housing.ltv.max;
    const maxLoanByLTV = housePrice * ltvRate;
    
    // DTI 계산 (연소득의 60% / 12개월)
    const dtiRate = rates.loanInterest.housing.dti.max;
    const maxMonthlyPaymentByDTI = (annualIncome * dtiRate) / 12;
    
    // 실제 필요 대출액
    const requiredLoan = housePrice - ownFunds;
    
    // 최종 대출가능액 (LTV, DTI 중 작은 값)
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    
    // DTI 기반 최대 대출액 역산
    const maxLoanByDTI = maxMonthlyPaymentByDTI * (Math.pow(1 + monthlyRate, months) - 1) / 
                         (monthlyRate * Math.pow(1 + monthlyRate, months));
    
    const maxLoan = Math.min(maxLoanByLTV, maxLoanByDTI, requiredLoan);
    
    // 월 상환액 계산 (원리금균등상환)
    const monthlyPayment = maxLoan * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                          (Math.pow(1 + monthlyRate, months) - 1);
    
    // 총 이자
    let totalInterest = 0;
    let balance = maxLoan;
    let schedule = [];
    
    for (let i = 1; i <= months; i++) {
        const interest = balance * monthlyRate;
        const principalPayment = monthlyPayment - interest;
        balance -= principalPayment;
        totalInterest += interest;
        
        if (i <= 12 || i % 12 === 0 || i === months) {
            schedule.push({
                month: i,
                principal: principalPayment,
                interest: interest,
                payment: monthlyPayment,
                balance: Math.max(0, balance)
            });
        }
    }
    
    const totalPayment = maxLoan + totalInterest;
    
    // 결과 표시 - 2-column 레이아웃
    const resultSection = document.getElementById('housing-loan-result');
    const summaryElement = document.getElementById('housing-loan-summary');
    const explanationElement = document.getElementById('housing-loan-explanation');
    
    if (!resultSection || !summaryElement || !explanationElement) {
        console.error('calculateHousingLoan: Required elements not found', {
            resultSection: !!resultSection,
            summaryElement: !!summaryElement,
            explanationElement: !!explanationElement
        });
        return; // 요소가 없으면 함수 종료
    }
    
    // 결과 요약 (왼쪽)
    summaryElement.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">대출가능액</span>
                <span class="result-value">${formatCurrency(maxLoan)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">월 상환액</span>
                <span class="result-value">${formatCurrency(monthlyPayment)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">총 이자</span>
                <span class="result-value">${formatCurrency(totalInterest)}</span>
            </div>
        </div>
        <div class="result-details">
            <h4>대출 한도 분석</h4>
            <div class="table-wrapper">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>구분</th>
                            <th>한도</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>LTV 기준 (주택가격의 ${ltvRate * 100}%)</td>
                            <td>${formatCurrency(maxLoanByLTV)}</td>
                        </tr>
                        <tr>
                            <td>DTI 기준 (연소득의 ${dtiRate * 100}%)</td>
                            <td>${formatCurrency(maxLoanByDTI)}</td>
                        </tr>
                        <tr>
                            <td>필요 대출액</td>
                            <td>${formatCurrency(requiredLoan)}</td>
                        </tr>
                        <tr style="font-weight: 700; background-color: var(--color-surface);">
                            <td>최종 대출가능액</td>
                            <td>${formatCurrency(maxLoan)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="result-details mt-md">
            <h4>상환 스케줄 (주요 월차)</h4>
            <div class="table-wrapper">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>월차</th>
                            <th>원금</th>
                            <th>이자</th>
                            <th>월 상환액</th>
                            <th>잔액</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${schedule.map(s => `
                            <tr>
                                <td>${s.month}개월</td>
                                <td>${formatCurrency(s.principal)}</td>
                                <td>${formatCurrency(s.interest)}</td>
                                <td>${formatCurrency(s.payment)}</td>
                                <td>${formatCurrency(s.balance)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // 계산 과정 (오른쪽)
    explanationElement.innerHTML = `
        <div class="explanation-step">
            <strong>1단계: LTV 한도 계산</strong><br>
            주택가격 ${formatCurrency(housePrice)} × ${ltvRate * 100}% = ${formatCurrency(maxLoanByLTV)}
        </div>
        <div class="explanation-step">
            <strong>2단계: DTI 한도 계산</strong><br>
            연소득 ${formatCurrency(annualIncome)} × ${dtiRate * 100}% = 연간 상환가능액 ${formatCurrency(annualIncome * dtiRate)}<br>
            월 상환가능액: ${formatCurrency(maxMonthlyPaymentByDTI)}<br>
            이를 기반으로 최대 대출액: ${formatCurrency(maxLoanByDTI)}
        </div>
        <div class="explanation-step">
            <strong>3단계: 최종 대출액 결정</strong><br>
            LTV, DTI, 필요금액 중 가장 작은 값<br>
            최종 대출가능액: <strong>${formatCurrency(maxLoan)}</strong>
        </div>
        <div class="explanation-step">
            <strong>4단계: 상환 계산</strong><br>
            • 대출금액: ${formatCurrency(maxLoan)}<br>
            • 월 상환액: <strong>${formatCurrency(monthlyPayment)}</strong><br>
            • 총 이자: <strong>${formatCurrency(totalInterest)}</strong><br>
            • 총 상환액: ${formatCurrency(totalPayment)}
        </div>
    `;
    
    resultSection.style.display = 'block';
    
    // 그래프 그리기
    document.getElementById('housing-loan-chart-section').style.display = 'block';
    drawLoanChart('housing-loan-chart', schedule, maxLoan);
}

// ===================================
// Utility Functions for Loan Calculations
// ===================================
function getRepaymentFormula(type) {
    switch (type) {
        case 'equalPrincipalInterest':
            return `월 상환액 = P × r × (1+r)^n / ((1+r)^n - 1)<br>
                    P: 대출원금, r: 월이자율, n: 총 상환개월 수`;
        case 'equalPrincipal':
            return `월 원금 = P / n<br>
                    월 이자 = 잔여원금 × r<br>
                    월 상환액 = 월 원금 + 월 이자`;
        case 'maturity':
            return `월 이자 = P × r<br>
                    만기 상환액 = P + (총 이자)`;
        default:
            return '';
    }
}

// ===================================
// 8. 부동산 계산기 - 중개수수료
// ===================================
function calculateBrokerageFee() {
    // 현재 화면이 real-estate-screen인지 확인
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'real-estate-screen') {
        console.error('calculateBrokerageFee: Not on real-estate screen, current screen:', currentScreen?.id);
        return;
    }
    
    const propertyPrice = getValueWithUnit('property-price', 100000000); // 억원 단위
    
    if (propertyPrice === null) return;
    
    // 중개수수료율 계산 (주택 기준)
    let feeRate = 0;
    if (propertyPrice < 50000000) {
        feeRate = 0.006; // 0.6%
    } else if (propertyPrice < 200000000) {
        feeRate = 0.005; // 0.5%
    } else if (propertyPrice < 600000000) {
        feeRate = 0.004; // 0.4%
    } else if (propertyPrice < 900000000) {
        feeRate = 0.005; // 0.5%
    } else {
        feeRate = 0.009; // 0.9% (상한)
    }
    
    const totalFee = propertyPrice * feeRate;
    const buyerFee = totalFee / 2;
    const sellerFee = totalFee / 2;
    
    // 결과 표시
    const resultSummary = document.getElementById('brokerage-fee-summary');
    if (!resultSummary) {
        console.error('calculateBrokerageFee: brokerage-fee-summary element not found');
        return; // 요소가 없으면 함수 종료
    }
    resultSummary.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">총 중개수수료</span>
                <span class="result-value">${window.formatCurrency(totalFee)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">매수자 부담</span>
                <span class="result-value">${window.formatCurrency(buyerFee)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">매도자 부담</span>
                <span class="result-value">${window.formatCurrency(sellerFee)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">적용 수수료율</span>
                <span class="result-value">${(feeRate * 100).toFixed(2)}%</span>
            </div>
        </div>
    `;
    
    const explanation = document.getElementById('brokerage-fee-explanation');
    explanation.innerHTML = `
        <div class="explanation-step">
            <strong>1단계: 중개수수료율 확인</strong><br>
            부동산 가격 ${window.formatCurrency(propertyPrice)}에 따른 중개수수료율: ${(feeRate * 100).toFixed(1)}%
        </div>
        <div class="explanation-step">
            <strong>2단계: 중개수수료 계산</strong><br>
            총 중개수수료: ${window.formatCurrency(propertyPrice)} × ${(feeRate * 100).toFixed(1)}% = ${window.formatCurrency(totalFee)}
        </div>
        <div class="explanation-step">
            <strong>3단계: 매수자/매도자 부담액</strong><br>
            매수자 부담: ${window.formatCurrency(totalFee)} ÷ 2 = ${window.formatCurrency(buyerFee)}<br>
            매도자 부담: ${window.formatCurrency(totalFee)} ÷ 2 = ${window.formatCurrency(sellerFee)}
        </div>
    `;
    
    document.getElementById('brokerage-fee-result').style.display = 'block';
}

// ===================================
// 9. 부동산 계산기 - 양도소득세
// ===================================
function calculateCapitalGains() {
    // 현재 화면이 real-estate-screen인지 확인
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'real-estate-screen') {
        console.error('calculateCapitalGains: Not on real-estate screen, current screen:', currentScreen?.id);
        return;
    }
    
    const acquisitionPrice = getValueWithUnit('capital-gains-acquisition-price', 100000000); // 억원
    const transferPrice = getValueWithUnit('transfer-price', 100000000); // 억원
    const holdingPeriod = validateInputLocal(
        document.getElementById('capital-gains-holding-period').value,
        '보유기간'
    );
    
    if (acquisitionPrice === null || transferPrice === null || holdingPeriod === null) return;
    
    const capitalGain = transferPrice - acquisitionPrice;
    
    if (capitalGain <= 0) {
        alert('양도차익이 없습니다. (양도가액이 취득가액보다 작거나 같음)');
        return;
    }
    
    // 장기보유특별공제 (보유기간에 따라)
    let deductionRate = 0;
    if (holdingPeriod >= 3 && holdingPeriod < 4) deductionRate = 0.24;
    else if (holdingPeriod >= 4 && holdingPeriod < 5) deductionRate = 0.32;
    else if (holdingPeriod >= 5 && holdingPeriod < 6) deductionRate = 0.40;
    else if (holdingPeriod >= 6 && holdingPeriod < 7) deductionRate = 0.48;
    else if (holdingPeriod >= 7 && holdingPeriod < 8) deductionRate = 0.56;
    else if (holdingPeriod >= 8 && holdingPeriod < 9) deductionRate = 0.64;
    else if (holdingPeriod >= 9 && holdingPeriod < 10) deductionRate = 0.72;
    else if (holdingPeriod >= 10) deductionRate = 0.80;
    
    const deduction = capitalGain * deductionRate;
    const taxableGain = capitalGain - deduction;
    
    // 양도소득세율 (기본세율 적용, 1세대 1주택 가정)
    let taxRate = 0;
    if (taxableGain <= 12000000) taxRate = 0.06;
    else if (taxableGain <= 46000000) taxRate = 0.15;
    else if (taxableGain <= 88000000) taxRate = 0.24;
    else if (taxableGain <= 150000000) taxRate = 0.35;
    else if (taxableGain <= 300000000) taxRate = 0.38;
    else if (taxableGain <= 500000000) taxRate = 0.40;
    else taxRate = 0.42;
    
    const tax = taxableGain * taxRate;
    
    // 결과 표시 - 2-column 레이아웃
    const resultSection = document.getElementById('capital-gains-result');
    const summaryElement = document.getElementById('capital-gains-summary');
    const explanationElement = document.getElementById('capital-gains-explanation');
    
    if (!resultSection || !summaryElement || !explanationElement) {
        console.error('calculateCapitalGains: Required elements not found');
        return; // 요소가 없으면 함수 종료
    }
    
    // 결과 요약 (왼쪽)
    summaryElement.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">양도소득세</span>
                <span class="result-value">${window.formatCurrency(tax)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">양도차익</span>
                <span class="result-value">${window.formatCurrency(capitalGain)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">장기보유특별공제</span>
                <span class="result-value">${window.formatCurrency(deduction)} (${(deductionRate * 100).toFixed(0)}%)</span>
            </div>
            <div class="result-item">
                <span class="result-label">과세표준</span>
                <span class="result-value">${window.formatCurrency(taxableGain)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">적용 세율</span>
                <span class="result-value">${(taxRate * 100).toFixed(0)}%</span>
            </div>
        </div>
    `;
    
    // 계산 과정 (오른쪽)
    explanationElement.innerHTML = `
        <div class="explanation-step">
            <strong>1단계: 양도차익 계산</strong><br>
            양도가액 ${window.formatCurrency(transferPrice)} - 취득가액 ${window.formatCurrency(acquisitionPrice)} = ${window.formatCurrency(capitalGain)}
        </div>
        <div class="explanation-step">
            <strong>2단계: 장기보유특별공제</strong><br>
            보유기간: ${holdingPeriod}년<br>
            공제율: ${(deductionRate * 100).toFixed(0)}%<br>
            공제액: ${window.formatCurrency(deduction)}
        </div>
        <div class="explanation-step">
            <strong>3단계: 과세표준 계산</strong><br>
            양도차익 ${window.formatCurrency(capitalGain)} - 장기보유특별공제 ${window.formatCurrency(deduction)} = ${window.formatCurrency(taxableGain)}
        </div>
        <div class="explanation-step">
            <strong>4단계: 양도소득세 계산</strong><br>
            과세표준 ${window.formatCurrency(taxableGain)} × ${(taxRate * 100).toFixed(0)}% = <strong>${window.formatCurrency(tax)}</strong>
        </div>
    `;
    
    resultSection.style.display = 'block';
}

// ===================================
// 10. 부동산 계산기 - 보유세
// ===================================
function calculatePropertyTax() {
    // 현재 화면이 real-estate-screen인지 확인
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'real-estate-screen') {
        console.error('calculatePropertyTax: Not on real-estate screen, current screen:', currentScreen?.id);
        return;
    }
    
    const propertyValue = getValueWithUnit('property-value', 100000000); // 억원
    const propertyType = document.getElementById('property-tax-type').value;
    
    if (propertyValue === null) return;
    
    // 재산세율 (주택 기준)
    let propertyTaxRate = 0;
    if (propertyValue <= 60000000) {
        propertyTaxRate = 0.001;
    } else if (propertyValue <= 150000000) {
        propertyTaxRate = 0.0015;
    } else if (propertyValue <= 300000000) {
        propertyTaxRate = 0.0025;
    } else {
        propertyTaxRate = 0.004;
    }
    
    const propertyTax = propertyValue * propertyTaxRate;
    
    // 종합부동산세 (6억 초과 시)
    let comprehensiveTax = 0;
    if (propertyValue > 600000000) {
        const taxableAmount = propertyValue - 600000000;
        if (taxableAmount <= 300000000) {
            comprehensiveTax = taxableAmount * 0.006;
        } else if (taxableAmount <= 600000000) {
            comprehensiveTax = 300000000 * 0.006 + (taxableAmount - 300000000) * 0.008;
        } else if (taxableAmount <= 1200000000) {
            comprehensiveTax = 300000000 * 0.006 + 300000000 * 0.008 + (taxableAmount - 600000000) * 0.012;
        } else {
            comprehensiveTax = 300000000 * 0.006 + 300000000 * 0.008 + 600000000 * 0.012 + (taxableAmount - 1200000000) * 0.016;
        }
    }
    
    const totalTax = propertyTax + comprehensiveTax;
    
    // 결과 표시 - 2-column 레이아웃
    const resultSection = document.getElementById('property-tax-result');
    const summaryElement = document.getElementById('property-tax-summary');
    const explanationElement = document.getElementById('property-tax-explanation');
    
    if (!resultSection || !summaryElement || !explanationElement) {
        console.error('calculatePropertyTax: Required elements not found');
        return; // 요소가 없으면 함수 종료
    }
    
    // 결과 요약 (왼쪽)
    summaryElement.innerHTML = `
        <div class="result-summary">
            <div class="result-item highlight">
                <span class="result-label">연간 보유세 총액</span>
                <span class="result-value">${window.formatCurrency(totalTax)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">재산세</span>
                <span class="result-value">${window.formatCurrency(propertyTax)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">종합부동산세</span>
                <span class="result-value">${window.formatCurrency(comprehensiveTax)}</span>
            </div>
            <div class="result-item">
                <span class="result-label">적용 재산세율</span>
                <span class="result-value">${(propertyTaxRate * 100).toFixed(2)}%</span>
            </div>
        </div>
    `;
    
    // 계산 과정 (오른쪽)
    explanationElement.innerHTML = `
        <div class="explanation-step">
            <strong>1단계: 재산세 계산</strong><br>
            부동산 가치: ${window.formatCurrency(propertyValue)}<br>
            적용 세율: ${(propertyTaxRate * 100).toFixed(2)}%<br>
            재산세: ${window.formatCurrency(propertyTax)}
        </div>
        <div class="explanation-step">
            <strong>2단계: 종합부동산세 계산</strong><br>
            ${propertyValue > 600000000 ? 
                `과세표준: ${window.formatCurrency(propertyValue - 600000000)} (6억 초과분)<br>
                종합부동산세: ${window.formatCurrency(comprehensiveTax)}` : 
                '6억 이하로 종합부동산세 면제'}
        </div>
        <div class="explanation-step">
            <strong>3단계: 총 보유세</strong><br>
            재산세 ${window.formatCurrency(propertyTax)} + 종합부동산세 ${window.formatCurrency(comprehensiveTax)} = <strong>${window.formatCurrency(totalTax)}</strong>
        </div>
    `;
    
    resultSection.style.display = 'block';
}

// ===================================
// 11. 부동산 계산기 - DSR
// ===================================
function calculateDSR() {
    // 현재 화면이 real-estate-screen인지 확인
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen || currentScreen.id !== 'real-estate-screen') {
        console.error('calculateDSR: Not on real-estate screen, current screen:', currentScreen?.id);
        return;
    }
    
    const annualIncome = getValueWithUnit('annual-income', 10000); // 만원
    const loanAmount = getValueWithUnit('dsr-loan-amount', 100000000); // 억원
    const interestRate = validateInputLocal(
        document.getElementById('dsr-interest-rate').value,
        '연이자율'
    );
    
    if (annualIncome === null || loanAmount === null || interestRate === null) return;
    
    if (interestRate > 30) {
        alert('연이자율은 30% 이하여야 합니다.');
        return;
    }
    
    // 월 이자율
    const monthlyRate = interestRate / 100 / 12;
    
    // 대출기간 30년 가정
    const loanPeriod = 30 * 12; // 360개월
    
    // 원리금균등상환 기준 월 상환액
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanPeriod)) / 
                          (Math.pow(1 + monthlyRate, loanPeriod) - 1);
    
    const annualPayment = monthlyPayment * 12;
    
    // DSR = 연간 원리금 상환액 / 연소득
    const dsrRatio = (annualPayment / annualIncome) * 100;
    
    // 결과 표시
    const resultSection = document.getElementById('dsr-result');
    if (!resultSection) {
        console.error('calculateDSR: dsr-result element not found');
        return; // 요소가 없으면 함수 종료
    }
    resultSection.innerHTML = `
        <h3 class="result-title">DSR 계산 결과</h3>
        <div class="result-item highlight">
            <span class="result-label">DSR 비율</span>
            <span class="result-value" id="dsr-ratio">${dsrRatio.toFixed(2)}%</span>
        </div>
        <div class="result-item">
            <span class="result-label">월 상환액</span>
            <span class="result-value" id="monthly-payment">${window.formatCurrency(monthlyPayment)}</span>
        </div>
        <div class="result-item">
            <span class="result-label">연간 상환액</span>
            <span class="result-value" id="annual-payment">${window.formatCurrency(annualPayment)}</span>
        </div>
        <div class="result-item">
            <span class="result-label">DSR 평가</span>
            <span class="result-value">${dsrRatio <= 40 ? '✅ 적정 범위' : '⚠️ 높은 부담'}</span>
        </div>
        <div class="result-item">
            <span class="result-label">참고</span>
            <span class="result-value" style="font-size: 13px;">대출기간 30년 기준, 일반적으로 DSR 40% 이하 권장</span>
        </div>
    `;
    resultSection.style.display = 'block';
}

// ===================================
// Export functions to window
// ===================================
window.calculateSalary = calculateSalary;
window.calculateInheritanceTax = calculateInheritanceTax;
window.calculateGiftTax = calculateGiftTax;
window.calculateRealEstate = calculateRealEstate;
window.calculateAcquisitionTax = calculateAcquisitionTax;
window.calculateLoan = calculateLoan;
window.calculateHousingLoan = calculateHousingLoan;
window.calculateBrokerageFee = calculateBrokerageFee;
window.calculateCapitalGains = calculateCapitalGains;
window.calculatePropertyTax = calculatePropertyTax;
window.calculateDSR = calculateDSR;

