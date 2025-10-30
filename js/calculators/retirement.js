/**
 * 퇴직금 계산기 모듈
 * 퇴직금, 퇴직소득세, 실수령액 계산
 */

class RetirementCalculator {
    constructor() {
        this.init();
    }

    init() {
        console.log('🏦 퇴직금 계산기 초기화');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 현재 날짜 체크박스
        const currentDateCheck = document.getElementById('current-date-check');
        const retirementDateInput = document.getElementById('retirement-date');
        
        if (currentDateCheck) {
            currentDateCheck.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // 현재 날짜로 설정
                    const today = new Date();
                    const dateStr = today.toISOString().split('T')[0];
                    retirementDateInput.value = dateStr;
                    retirementDateInput.disabled = true;
                } else {
                    retirementDateInput.disabled = false;
                }
            });
        }

        // 폼 제출
        const form = document.getElementById('retirement-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculate();
            });
        }

        // 초기화 버튼
        const resetBtn = document.getElementById('reset-retirement');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.reset();
            });
        }
    }

    calculate() {
        try {
            const joinDate = document.getElementById('join-date').value;
            const retirementDate = document.getElementById('retirement-date').value;
            const avgSalary = parseFloat(document.getElementById('avg-salary').value);

            // 입력 검증
            if (!joinDate || !retirementDate || !avgSalary) {
                alert('모든 항목을 입력해주세요.');
                return;
            }

            if (avgSalary <= 0) {
                alert('평균임금은 0보다 커야 합니다.');
                return;
            }

            // 날짜 검증
            if (new Date(retirementDate) < new Date(joinDate)) {
                alert('퇴사일은 입사일 이후여야 합니다.');
                return;
            }

            // 근속년수 계산
            const tenureYears = this.calculateTenure(joinDate, retirementDate);
            
            // 퇴직금 계산
            const retirementPay = this.calculateRetirementPay(avgSalary, tenureYears);
            
            // 퇴직소득세 계산
            const retirementTax = this.calculateRetirementTax(retirementPay);
            
            // 실수령액 계산
            const netPay = retirementPay - retirementTax;

            // 결과 표시
            this.displayResults(tenureYears, retirementPay, retirementTax, netPay, avgSalary);

            // 그래프 그리기
            this.drawChart(avgSalary, retirementPay);

            // 계산 과정 표시
            this.displayCalculationSteps(joinDate, retirementDate, tenureYears, avgSalary, retirementPay, retirementTax, netPay);

        } catch (error) {
            console.error('퇴직금 계산 오류:', error);
            alert('계산 중 오류가 발생했습니다.');
            if (window.ErrorLogger) {
                window.ErrorLogger.log(error, '퇴직금 계산 오류');
            }
        }
    }

    calculateTenure(joinDate, retirementDate) {
        const join = new Date(joinDate);
        const retirement = new Date(retirementDate);
        
        const diffTime = retirement - join;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        // 년 단위로 변환
        const years = diffDays / 365.25;
        
        return years;
    }

    calculateRetirementPay(avgSalary, tenureYears) {
        // 평균임금(만원)을 원 단위로 변환
        const avgSalaryWon = avgSalary * 10000;
        
        // 퇴직금 = 평균임금 × 30일 × 근속년수
        const retirementPay = avgSalaryWon * 30 * tenureYears;
        
        return retirementPay;
    }

    calculateRetirementTax(retirementPay) {
        // 퇴직소득세 계산 (2025년 기준)
        const taxRates = [
            { min: 0, max: 12000000, rate: 0, deduction: 0 },
            { min: 12000000, max: 46000000, rate: 0.15, deduction: 1080000 },
            { min: 46000000, max: 88000000, rate: 0.24, deduction: 5220000 },
            { min: 88000000, max: 150000000, rate: 0.35, deduction: 14900000 },
            { min: 150000000, max: 300000000, rate: 0.38, deduction: 19400000 },
            { min: 300000000, max: 500000000, rate: 0.40, deduction: 25400000 },
            { min: 500000000, max: 1000000000, rate: 0.42, deduction: 35400000 },
            { min: 1000000000, max: Infinity, rate: 0.45, deduction: 65400000 }
        ];

        // 해당 세율 구간 찾기
        for (const bracket of taxRates) {
            if (retirementPay > bracket.min && retirementPay <= bracket.max) {
                return Math.max(0, retirementPay * bracket.rate - bracket.deduction);
            }
        }

        return 0;
    }

    displayResults(tenureYears, retirementPay, retirementTax, netPay, avgSalary) {
        document.getElementById('result-tenure').textContent = 
            `${Math.floor(tenureYears)}년 ${Math.floor((tenureYears - Math.floor(tenureYears)) * 12)}개월`;
        document.getElementById('result-total').textContent = 
            window.formatCurrency(retirementPay);
        document.getElementById('result-tax').textContent = 
            window.formatCurrency(retirementTax);
        document.getElementById('result-net').textContent = 
            window.formatCurrency(netPay);

        // 결과 섹션 표시
        const resultSection = document.getElementById('retirement-result');
        if (resultSection) {
            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    drawChart(avgSalary, totalRetirementPay) {
        const canvas = document.getElementById('retirement-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // 캔버스 초기화
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 차트 데이터: 0년부터 현재까지
        const maxYears = 30;
        const data = [];
        const avgSalaryWon = avgSalary * 10000;

        for (let year = 0; year <= maxYears; year++) {
            const retirementPay = avgSalaryWon * 30 * year;
            data.push({ year, retirementPay });
        }

        // 그래프 영역
        const padding = 60;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const maxValue = Math.max(...data.map(d => d.retirementPay));
        const scaleY = chartHeight / maxValue;

        // 격자선 그리기
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 10; i++) {
            const y = padding + (chartHeight / 10) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            // Y축 라벨
            const value = Math.floor(maxValue - (maxValue / 10) * i);
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(window.formatCurrency(value), padding - 10, y + 4);
        }

        // X축 라벨
        for (let i = 0; i <= 6; i++) {
            const x = padding + (chartWidth / 6) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();

            const year = Math.floor((maxYears / 6) * i);
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(year + '년', x, height - padding + 20);
        }

        // 그래프 선 그리기
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let i = 0; i < data.length; i++) {
            const x = padding + (chartWidth / maxYears) * data[i].year;
            const y = height - padding - data[i].retirementPay * scaleY;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // 현재 값 강조
        const currentYear = Math.floor(data[data.length - 1].year);
        const currentRetirementPay = avgSalary * 30 * currentYear;
        const currentX = padding + (chartWidth / maxYears) * currentYear;
        const currentY = height - padding - currentRetirementPay * scaleY;

        ctx.fillStyle = '#007bff';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fill();

        // 제목
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('근속년수별 퇴직금 변화', width / 2, 25);

        // 범례
        ctx.fillStyle = '#007bff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('퇴직금', width - padding, 25);
    }

    displayCalculationSteps(joinDate, retirementDate, tenureYears, avgSalary, retirementPay, retirementTax, netPay) {
        const stepsContainer = document.getElementById('retirement-steps');
        if (!stepsContainer) return;

        const avgSalaryWon = avgSalary * 10000;
        const years = Math.floor(tenureYears);
        const months = Math.floor((tenureYears - years) * 12);

        stepsContainer.innerHTML = `
            <div class="step-item">
                <h4>1. 근속년수 계산</h4>
                <p>입사일: ${joinDate}</p>
                <p>퇴사일: ${retirementDate}</p>
                <p><strong>근속년수 = ${years}년 ${months}개월</strong></p>
            </div>
            
            <div class="step-item">
                <h4>2. 퇴직금 계산</h4>
                <p>평균임금: ${window.formatCurrency(avgSalaryWon)}</p>
                <p>계산식: 평균임금 × 30일 × 근속년수</p>
                <p>계산: ${window.formatCurrency(avgSalaryWon)} × 30 × ${years.toFixed(2)}</p>
                <p><strong>퇴직금 = ${window.formatCurrency(retirementPay)}</strong></p>
            </div>
            
            <div class="step-item">
                <h4>3. 퇴직소득세 계산</h4>
                <p>퇴직금 구간: ${this.getTaxBracket(retirementPay)}</p>
                <p><strong>퇴직소득세 = ${window.formatCurrency(retirementTax)}</strong></p>
            </div>
            
            <div class="step-item">
                <h4>4. 실수령액 계산</h4>
                <p>계산식: 퇴직금 - 퇴직소득세</p>
                <p>계산: ${window.formatCurrency(retirementPay)} - ${window.formatCurrency(retirementTax)}</p>
                <p><strong>실수령액 = ${window.formatCurrency(netPay)}</strong></p>
            </div>
        `;
    }

    getTaxBracket(retirementPay) {
        if (retirementPay <= 12000000) return '1,200만원 이하 (세율: 0%)';
        if (retirementPay <= 46000000) return '1,200만원 ~ 4,600만원 (세율: 15%)';
        if (retirementPay <= 88000000) return '4,600만원 ~ 8,800만원 (세율: 24%)';
        if (retirementPay <= 150000000) return '8,800만원 ~ 1.5억 (세율: 35%)';
        if (retirementPay <= 300000000) return '1.5억 ~ 3억 (세율: 38%)';
        if (retirementPay <= 500000000) return '3억 ~ 5억 (세율: 40%)';
        if (retirementPay <= 1000000000) return '5억 ~ 10억 (세율: 42%)';
        return '10억 초과 (세율: 45%)';
    }

    reset() {
        document.getElementById('join-date').value = '';
        document.getElementById('retirement-date').value = '';
        document.getElementById('avg-salary').value = '';
        document.getElementById('current-date-check').checked = false;
        document.getElementById('retirement-date').disabled = false;
        
        const resultSection = document.getElementById('retirement-result');
        if (resultSection) {
            resultSection.style.display = 'none';
        }

        // 그래프 초기화
        const canvas = document.getElementById('retirement-chart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}

// 전역 함수: 계산 과정 토글
function toggleCalculationSteps(button, calculatorType) {
    const stepsContent = document.getElementById(`${calculatorType}-steps`);
    if (!stepsContent) return;

    if (stepsContent.style.display === 'none') {
        stepsContent.style.display = 'block';
        button.textContent = '▲ 계산 과정 숨기기';
    } else {
        stepsContent.style.display = 'none';
        button.textContent = '▼ 계산 과정 보기';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new RetirementCalculator();
});

export default RetirementCalculator;

