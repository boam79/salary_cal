# 🎯 개발 플랜 - 핵심 기능에 집중

## 📊 개요
- **총 개발 시간**: 약 15-18시간
- **예상 효과**: 트래픽 +300%, 체류 시간 +200%
- **목표 버전**: v5.0.0

---

## 🚀 Phase 1: 핵심 계산기 추가 (12시간)

### 📋 Step 1: 퇴직금 계산기 (6시간) 🥇 최우선

#### 구현 내용
```
파일 생성: js/calculators/retirement.js
HTML 추가: index.html
CSS 업데이트: styles.css
```

#### 입력 필드
- 입사일 (날짜 선택기)
- 퇴사일 또는 현재 날짜 체크박스
- 평균임금 (만원 단위)
- "계산하기" 버튼

#### 계산 로직
1. **근속년수 계산**
   - 입사일과 퇴사일 차이
   - 년/월/일 표시

2. **퇴직금 계산**
   ```javascript
   퇴직금 = 평균임금 × 30일 × 근속년수
   ```

3. **퇴직소득세 계산** (2025년 기준)
   | 퇴직금 구간 | 세율 | 누진공제 |
   |-----------|------|---------|
   | 1,200만원 이하 | 0% | - |
   | 1,200~4,600만원 | 15% | 108만원 |
   | 4,600~8,800만원 | 24% | 522만원 |
   | 8,800만원~1.5억 | 35% | 1,490만원 |
   | 1.5억~3억 | 38% | 1,940만원 |
   | 3억~5억 | 40% | 2,540만원 |
   | 5억~10억 | 42% | 3,540만원 |
   | 10억 초과 | 45% | 6,540만원 |

4. **실수령액 계산**
   - 실수령액 = 퇴직금 - 퇴직소득세

#### 출력 항목
- 근속년수
- 평균임금
- 퇴직금 총액
- 퇴직소득세
- 실수령액
- Canvas 그래프 (근속년수별 퇴직금 변화)
- 상세 계산 과정 (아코디언)

#### HTML 구조
```html
<section id="retirement-screen" class="screen calculator-screen">
    <div class="container">
        <div class="calculator-header">
            <h2>🏦 퇴직금 계산기</h2>
            <p class="description">입사일과 평균임금만 입력하면 퇴직금과 실수령액을 자동으로 계산합니다.</p>
        </div>
        
        <!-- 입력 폼 -->
        <form id="retirement-form" class="calculator-form">
            <div class="form-group">
                <label for="join-date">입사일</label>
                <input type="date" id="join-date" required>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="current-date-check"> 퇴사일을 현재 날짜로 설정
                </label>
            </div>
            
            <div class="form-group">
                <label for="retirement-date">퇴사일</label>
                <input type="date" id="retirement-date" required>
            </div>
            
            <div class="form-group">
                <label for="avg-salary">평균임금 (만원)</label>
                <input type="number" id="avg-salary" min="0" step="10" required>
                <small>최근 3개월 평균임금 기준</small>
            </div>
            
            <button type="submit" class="btn-calculate">계산하기</button>
        </form>
        
        <!-- 결과 표시 -->
        <div id="retirement-result" class="result-container" style="display: none;">
            <h3>계산 결과</h3>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">근속년수</span>
                    <span class="result-value" id="result-tenure">-</span>
                </div>
                <div class="result-item">
                    <span class="result-label">퇴직금 총액</span>
                    <span class="result-value highlight" id="result-total">-</span>
                </div>
                <div class="result-item">
                    <span class="result-label">퇴직소득세</span>
                    <span class="result-value" id="result-tax">-</span>
                </div>
                <div class="result-item">
                    <span class="result-label">실수령액</span>
                    <span class="result-value highlight" id="result-net">-</span>
                </div>
            </div>
            
            <!-- Canvas 그래프 -->
            <div class="chart-container">
                <canvas id="retirement-chart" width="800" height="400"></canvas>
            </div>
            
            <!-- 계산 과정 -->
            <div class="calculation-steps">
                <button class="toggle-steps" onclick="toggleSteps(this)">
                    ▼ 계산 과정 보기
                </button>
                <div class="steps-content" style="display: none;">
                    <!-- 상세 계산 과정 -->
                </div>
            </div>
        </div>
    </div>
</section>
```

#### 기대 효과
- ✅ **검색량**: 월 15,000+ ("퇴직금 계산기")
- ✅ **ROI**: +800%
- ✅ **사용자 만족도**: 높음

---

### 📋 Step 2: 적금/예금 계산기 (6시간) 🥈

#### 구현 내용
```
파일 생성: js/calculators/savings.js
HTML 추가: index.html
CSS 업데이트: styles.css
```

#### 입력 필드
- 계산 방식 선택 (단리/복리 탭)
- 원금 (만원)
- 이자율 (%)
- 기간 (개월)
- "계산하기" 버튼

#### 계산 로직

**단리 계산**
```javascript
이자 = 원금 × 이자율 × (기간/12)
원리금 = 원금 + 이자
```

**복리 계산**
```javascript
원리금 = 원금 × (1 + 이자율/12)^기간
이자 = 원리금 - 원금
```

**이자소득세 계산** (2025년 기준)
- 연간 2,000만원 이하: 14%
- 2,000만원 초과: 15.4%

**실수령액 계산**
- 실수령액 = 원리금 - 이자소득세

#### 출력 항목
- 원금
- 이자 총액
- 이자소득세
- 원리금 합계
- 실수령액
- Canvas 그래프 (월별 원리금 변화)
- 상세 계산 과정

#### HTML 구조
```html
<section id="savings-screen" class="screen calculator-screen">
    <div class="container">
        <div class="calculator-header">
            <h2>💰 적금/예금 계산기</h2>
            <p class="description">단리와 복리의 차이를 비교하고 이자와 실수령액을 계산합니다.</p>
        </div>
        
        <!-- 탭 메뉴 -->
        <div class="tabs">
            <button class="tab-btn active" data-tab="simple">단리</button>
            <button class="tab-btn" data-tab="compound">복리</button>
        </div>
        
        <!-- 단리 입력 폼 -->
        <form id="simple-interest-form" class="calculator-form">
            <!-- 입력 필드들 -->
        </form>
        
        <!-- 복리 입력 폼 -->
        <form id="compound-interest-form" class="calculator-form" style="display: none;">
            <!-- 입력 필드들 -->
        </form>
        
        <!-- 결과 표시 -->
        <div id="savings-result" class="result-container" style="display: none;">
            <!-- 결과 표시 -->
        </div>
    </div>
</section>
```

#### 기대 효과
- ✅ **검색량**: 월 10,000+ ("적금 이자 계산")
- ✅ **ROI**: +500%
- ✅ **사용자 만족도**: 높음

---

## 🎨 Phase 2: 비교 모드 추가 (6시간)

### 📋 Step 3: 비교 모드 구현

#### 구현 내용
```
파일 생성: js/utils/compareMode.js
CSS 업데이트: styles.css
```

#### 비교 가능한 계산기
- 연봉 계산기
- 퇴직금 계산기
- 적금 계산기
- 대출 계산기

#### 비교 모드 UI
```html
<div class="compare-mode-toggle">
    <label>
        <input type="checkbox" id="compare-mode"> 비교 모드
    </label>
</div>

<div class="compare-container" style="display: none;">
    <div class="compare-item">
        <h4>시나리오 1</h4>
        <div class="compare-input">
            <!-- 입력 필드 -->
        </div>
        <div class="compare-result">
            <!-- 결과 표시 -->
        </div>
    </div>
    
    <div class="vs-divider">VS</div>
    
    <div class="compare-item">
        <h4>시나리오 2</h4>
        <div class="compare-input">
            <!-- 입력 필드 -->
        </div>
        <div class="compare-result">
            <!-- 결과 표시 -->
        </div>
    </div>
    
    <div class="compare-summary">
        <h4>비교 결과</h4>
        <div class="diff-item">
            <span>차이</span>
            <span class="diff-value highlight">+500만원</span>
        </div>
    </div>
</div>
```

#### 기능
1. 비교 모드 토글 활성화
2. 입력 필드 2개 생성
3. 각각 계산 실행
4. 차이 자동 계산 및 표시
5. 그래프 병렬 표시

#### 기대 효과
- ✅ **체류 시간**: +50%
- ✅ **사용자 만족도**: 높음

---

## 📅 실행 일정

### Week 1: 핵심 계산기
```
Day 1-2: 퇴직금 계산기 구현 (6시간)
  - HTML/CSS 작성
  - 계산 로직 구현
  - Canvas 그래프 구현
  - 테스트

Day 3-4: 적금/예금 계산기 구현 (6시간)
  - HTML/CSS 작성
  - 탭 UI 구현
  - 단리/복리 계산 로직
  - Canvas 그래프 구현
  - 테스트

Day 5: 통합 테스트 및 버그 수정 (2시간)
  - 전체 기능 테스트
  - 버그 수정
  - CSS 최적화
```

### Week 2: 비교 모드
```
Day 1-2: 비교 모드 구현 (6시간)
  - 비교 모드 토글 구현
  - 2-Column 레이아웃
  - 차이 계산 로직
  - 테스트

Day 3: 최종 테스트 및 배포 (2시간)
  - 전체 테스트
  - README 업데이트
  - v5.0.0 배포
```

---

## 🎯 최종 목표

### 구현 기능 (총 4개)
1. ✅ 퇴직금 계산기
2. ✅ 적금/예금 계산기
3. ✅ 비교 모드
4. ✅ 기존 5개 계산기 유지

### 예상 효과
- 📈 **트래픽**: +300%
- 📈 **체류 시간**: +200%
- 📈 **재방문율**: +150%
- 📈 **검색 순위**: 상위 10위

---

## 🚀 시작 방법

1. **index.html 업데이트**
   - 퇴직금 계산기 섹션 추가
   - 적금 계산기 섹션 추가
   - 사이드바 메뉴 추가

2. **CSS 업데이트**
   - 계산기 스타일
   - 비교 모드 레이아웃

3. **JavaScript 구현**
   - retirement.js
   - savings.js
   - compareMode.js

4. **테스트 및 배포**

---

Made with ❤️ for better financial planning

