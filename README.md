# 💰 금융 계산기 웹사이트

> 연봉, 세금, 부동산, 대출 등 다양한 금융 계산을 한 곳에서!  
> ES6 모듈 시스템 기반 현대적인 SPA 금융 계산기

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/boam79/salary_cal/releases/tag/v4.0.0)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://salary-cal.vercel.app)

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [v4.0.0 주요 변경사항](#-v400-주요-변경사항)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [설치 및 실행](#-설치-및-실행)
- [사용 방법](#-사용-방법)
- [디자인 시스템](#-디자인-시스템)
- [계산 로직 및 세율](#-계산-로직-및-세율)
- [업데이트 내역](#-업데이트-내역)
- [향후 계획](#-향후-계획)
- [기여 방법](#-기여-방법)
- [라이선스](#-라이선스)

---

## 🎯 프로젝트 개요

**금융 계산기 웹사이트**는 일상에서 필요한 다양한 금융 계산을 쉽고 빠르게 할 수 있도록 도와주는 웹 애플리케이션입니다.

### 핵심 특징

- ✅ **5가지 주요 계산기** (연봉, 세금, 부동산, 취등록세, 대출)
- ✅ **ES6 모듈 시스템** 현대적인 코드 구조
- ✅ **중앙화된 상태 관리** AppState 패턴
- ✅ **SPA 네비게이션** 빠른 화면 전환
- ✅ **계산 과정 설명** 상세한 단계별 설명 제공
- ✅ **반응형 3-Column 레이아웃** 광고 공간 포함
- ✅ **모던 UI/UX** 부드러운 애니메이션
- ✅ **그래프 시각화** Canvas API 기반
- ✅ **순수 JavaScript** 외부 라이브러리 없이 가볍고 빠름

---

## 🚀 주요 기능

### 1️⃣ 월급 및 연봉 계산기
- **입력**: 
  - 연봉 계산: 연봉 (만원 단위)
  - 월급 계산: 주간 근무시간, 시급 (2025년 최저시급 10,030원)
- **출력**: 월/연 실수령액, 공제 내역
- **계산 항목**:
  - 소득세 (2025년 누진세율)
  - 지방소득세 (소득세의 10%)
  - 4대보험 (국민연금, 건강보험, 장기요양보험, 고용보험)
- **특징**: UI 전환 로직 (연봉/월급), 상세 계산 과정 설명

### 2️⃣ 세금 계산기
#### 상속세 계산
- 누진세율 구간별 계산
- 상세 계산 과정 표시

#### 증여세 계산
- 관계별 공제액 자동 적용
- 단계별 계산 설명

### 3️⃣ 부동산 계산기
#### 중개수수료 계산
- 부동산 가격별 차등 수수료율
- 매수자/매도자 부담액 구분

#### 양도소득세 계산
- 장기보유특별공제 포함
- 과세표준 계산 과정

#### 보유세 계산 (NEW!)
- 재산세 + 종합부동산세
- 상세 계산 과정 설명 추가

#### DSR 계산 (NEW!)
- 3가지 상환방식 지원
- 상세 계산 과정 설명 추가
- DSR 평가 (40% 기준)

### 4️⃣ 취등록세 계산기
- 부동산 유형별 세율 적용
- 취득세 + 등록면허세 + 지방교육세
- 상세 계산 과정 표시

### 5️⃣ 대출 계산기 (탭 메뉴)

#### 🏦 금융대출
- 3가지 상환방식 (원리금균등, 원금균등, 만기일시)
- 탭 기반 상환방식 선택
- Canvas 그래프 시각화
- 상세 상환 스케줄

#### 🏠 주택대출
- LTV/DTI 자동 계산
- 최대 대출가능액 산출
- Canvas 그래프 시각화
- 상세 상환 스케줄

---

## ⭐ v4.0.0 주요 변경사항

### 🏗️ **대규모 코드 리팩토링**

#### **ES6 모듈 시스템 도입**
```
js/
├── core/                    # 핵심 모듈
│   ├── appState.js         # 중앙 상태 관리
│   ├── navigationManager.js # SPA 네비게이션
│   └── eventManager.js     # 이벤트 위임 관리
├── calculators/            # 계산기 모듈
│   ├── salary.js
│   ├── tax.js
│   ├── realEstate.js
│   ├── acquisition.js
│   └── loan.js
├── utils/                  # 유틸리티 모듈
│   ├── errorLogger.js
│   ├── formatter.js
│   └── validation.js
└── backup/
    └── calculators.js.backup # 구버전 백업
```

#### **주요 개선 사항**
- ✨ **로고 클릭 → 홈 이동**: 상단 금융계산기 로고 클릭 시 홈 화면 이동
- 🎨 **광고 공간 레이아웃**: 좌우 200px 광고 공간 (Google AdSense 준비)
- 📱 **반응형 3-Column**: 좌측 광고 - 메인 - 우측 광고
- 🔧 **AppState 패턴**: 중앙화된 상태 관리 (Singleton)
- 🚀 **NavigationManager**: SPA 화면 전환 관리
- ⚡ **EventManager**: 이벤트 위임 최적화
- 📖 **계산 과정 개선**: 모든 계산기에 상세 설명 추가
- 🎭 **부드러운 애니메이션**: max-height 기반 토글
- 🎯 **UI 전환 로직**: 월급/연봉 라디오 버튼 기반

#### **통계**
- **17개 파일 변경**
- **+3,196 라인 추가**
- **-809 라인 삭제**
- **순 증가: +2,387 라인**

---

## 🛠 기술 스택

### Frontend
- **HTML5** - 시맨틱 마크업
- **CSS3** - Flexbox, Grid, 반응형 디자인
- **Vanilla JavaScript (ES6+)** - 모듈 시스템, 클래스

### 아키텍처
- **ES6 Modules** - Import/Export
- **Singleton Pattern** - AppState, NavigationManager
- **Event Delegation** - 효율적인 이벤트 관리
- **State Management** - 중앙화된 상태 관리

### 시각화
- **Canvas API** - 그래프 렌더링 (외부 라이브러리 없음)

### 개발 도구
- **Git & GitHub** - 버전 관리
- **VSCode** - 코드 에디터
- **Vercel** - 자동 배포

---

## 📁 프로젝트 구조

```
salary_cal/
├── index.html                  # 메인 HTML (SPA 구조)
├── css/
│   └── styles.css             # 통합 스타일시트
├── js/
│   ├── main.js                # 애플리케이션 초기화
│   ├── chart.js               # Canvas 그래프 렌더링
│   ├── core/                  # 핵심 모듈
│   │   ├── appState.js        # 중앙 상태 관리
│   │   ├── navigationManager.js # SPA 네비게이션
│   │   └── eventManager.js    # 이벤트 위임
│   ├── calculators/           # 계산기 모듈
│   │   ├── salary.js          # 월급/연봉
│   │   ├── tax.js             # 상속세/증여세
│   │   ├── realEstate.js      # 부동산 (중개수수료, 양도세, 보유세, DSR)
│   │   ├── acquisition.js     # 취등록세
│   │   └── loan.js            # 금융대출/주택대출
│   ├── utils/                 # 유틸리티
│   │   ├── errorLogger.js     # 에러 로깅
│   │   ├── formatter.js       # 숫자 포맷팅
│   │   └── validation.js      # 입력 검증
│   └── backup/
│       └── calculators.js.backup # 구버전 백업
├── config/
│   └── rates.json             # 세율/이자율 설정
├── .cursor/
│   └── scratchpad.md          # 프로젝트 계획
└── README.md                  # 이 파일
```

---

## 💻 설치 및 실행

### 방법 1: GitHub에서 직접 실행 (권장)
```bash
# 저장소 클론
git clone https://github.com/boam79/salary_cal.git
cd salary_cal

# 브라우저에서 index.html 열기
# (더블클릭 또는 Live Server 사용)
```

### 방법 2: 로컬 서버 사용
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# 브라우저에서 http://localhost:8000 접속
```

### 방법 3: Live Demo
[https://salary-cal.vercel.app](https://salary-cal.vercel.app)

### 요구사항
- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge 최신 버전)
- JavaScript 활성화 필수
- ES6 모듈 지원 필수

---

## 📖 사용 방법

### 1. 홈 화면
- 5개의 계산기 카드 중 하나를 클릭
- 또는 상단 로고 클릭으로 홈 화면 이동

### 2. 계산기 화면
- 필요한 정보 입력
- "계산하기" 버튼 클릭
- 결과 확인

### 3. 계산 과정 보기
- 결과 하단의 "▼ 계산 과정 보기" 클릭
- 단계별 상세 계산 과정 확인
- "▲ 계산 과정 숨기기"로 토글

### 4. 그래프 보기 (대출 계산기)
- 금융대출 또는 주택대출 계산 후
- 상환 스케줄 그래프 자동 표시
- 원금(검은색)/이자(회색) 구분

### 5. 홈으로 돌아가기
- 상단 "💰 금융 계산기" 로고 클릭

---

## 🎨 디자인 시스템

### 색상 팔레트
```css
--color-primary: #000000;          /* 검정 */
--color-secondary: #333333;        /* 진한 회색 */
--color-background: #FFFFFF;       /* 흰색 */
--color-surface: #F5F5F5;          /* 연한 회색 */
--color-border: #E0E0E0;           /* 중간 회색 */
--color-text: #212121;             /* 거의 검정 */
--color-text-secondary: #757575;   /* 중간 회색 */
```

### 레이아웃
- **최대 너비**: 1400px (데스크톱)
- **광고 공간**: 좌우 200px (1200px 이하: 150px)
- **메인 컨텐츠**: flex: 1

### 반응형 브레이크포인트
- **모바일**: ~ 768px (세로 레이아웃, 광고 상하)
- **태블릿**: 768px ~ 1200px (광고 150px)
- **데스크톱**: 1200px ~ (광고 200px)

### 애니메이션
- **페이지 전환**: fade-in/out (0.3s)
- **카드 호버**: scale(1.02) + shadow (0.2s)
- **계산 과정 토글**: max-height (0.3s)
- **로고 클릭**: scale(1.05/0.95) (0.3s)

---

## 📊 계산 로직 및 세율

### 월급 및 연봉 실수령액 (2025년 기준)

#### 소득세 (누진세율)
| 과세표준 | 세율 | 누진공제 |
|---------|------|----------|
| 1,200만원 이하 | 6% | - |
| 1,200~4,600만원 | 15% | 108만원 |
| 4,600~8,800만원 | 24% | 522만원 |
| 8,800만원~1.5억 | 35% | 1,490만원 |
| 1.5억~3억 | 38% | 1,940만원 |
| 3억~5억 | 40% | 2,540만원 |
| 5억~10억 | 42% | 3,540만원 |
| 10억 초과 | 45% | 6,540만원 |

#### 4대보험 (2025년 10월 기준)
- **국민연금**: 4.5% (상한액: 553만원)
- **건강보험**: 3.545%
- **장기요양보험**: 건강보험료의 12.27%
- **고용보험**: 0.9%

#### 최저시급
- **2025년**: 10,030원

### 대출 상환 공식

#### 원리금균등상환
```
월 상환액 = P × r × (1+r)^n / ((1+r)^n - 1)
P: 대출원금, r: 월 이자율, n: 총 상환개월 수
```

#### 원금균등상환
```
월 원금 = P / n
월 이자 = 잔여원금 × r
월 상환액 = 월 원금 + 월 이자
```

#### 만기일시상환
```
월 이자 = P × r
만기 상환액 = P + (P × r × n)
```

---

## 📝 업데이트 내역

### v4.0.0 (2025-10-18) - Major UI/UX Improvements & Code Refactoring ✅

#### ✨ 새로운 기능
1. **로고 클릭 → 홈 이동**
   - 상단 "💰 금융 계산기" 로고 클릭 시 홈 화면 이동
   - 부드러운 scale 애니메이션

2. **광고 공간 레이아웃**
   - 좌우 200px 광고 공간 (Google AdSense 준비)
   - 반응형: 1200px 이하 150px, 768px 이하 상하 배치

3. **모든 계산기 설명 개선**
   - 부동산 보유세 상세 설명 추가
   - 부동산 DSR 상세 설명 추가
   - 부드러운 max-height 애니메이션

4. **월급/연봉 UI 전환**
   - 라디오 버튼으로 UI 전환
   - 초기화 기능 추가

#### 🏗️ 아키텍처 개선
1. **ES6 모듈 시스템**
   - `calculators.js` → 개별 모듈로 분리
   - `core/`, `utils/` 디렉토리 구조

2. **중앙 상태 관리**
   - `AppState`: Singleton 패턴
   - `taxRates` 접근 통일

3. **네비게이션 관리**
   - `NavigationManager`: SPA 화면 전환
   - 화면 등록/전환 최적화

4. **이벤트 관리**
   - `EventManager`: 이벤트 위임
   - 동적 요소 처리 최적화

#### 🐛 버그 수정
- `scrollHeight` 측정 로직 개선
- `data-calculator` → `data-screen` 통일
- `drawLoanChart` 전역 노출
- `taxRates` 접근 방식 통일

#### 📊 통계
- **17개 파일 변경**
- **+3,196 / -809 라인**
- **순 증가: +2,387 라인**

### v3.0.0 (2025-10-15) - 세율 업데이트 ✅
- 장기요양보험료율 12.27% 적용
- 2025년 10월 기준 세율 반영

### v2.0.1 (2025-10-15) - UI 최적화 ✅
- 전체 화면 활용 레이아웃
- 부동산 계산기 확장 (DSR, 보유세)
- 2-Column 결과 레이아웃

### v1.0.0 (2025-10-15) - 초기 릴리스 ✅
- 기본 5개 계산기
- Canvas 그래프

---

## 🚀 향후 계획

### Phase 1: 기능 추가 (v4.1.0)
- [ ] 퇴직금 계산기
- [ ] 연말정산 계산기
- [ ] 결과 PDF/이미지 저장

### Phase 2: UX 개선 (v4.2.0)
- [ ] 다크 모드
- [ ] 계산 이력 관리
- [ ] 입력 자동완성

### Phase 3: PWA (v5.0.0)
- [ ] 오프라인 지원
- [ ] 홈 화면 추가
- [ ] 푸시 알림

### Phase 4: API 연동 (v6.0.0)
- [ ] 실시간 세율 업데이트
- [ ] 부동산 시세 연동
- [ ] 관리자 페이지

---

## 🤝 기여 방법

### 버그 리포트
[GitHub Issues](https://github.com/boam79/salary_cal/issues)

### 기능 제안
[GitHub Discussions](https://github.com/boam79/salary_cal/discussions)

### Pull Request
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 참조

---

## 📞 문의

- **GitHub**: [@boam79](https://github.com/boam79)
- **Issues**: [GitHub Issues](https://github.com/boam79/salary_cal/issues)
- **Live Demo**: [salary-cal.vercel.app](https://salary-cal.vercel.app)

---

## 🙏 감사의 말

- 국세청 세율 정보
- 한국은행 경제통계시스템
- 금융감독원 금융상품 정보
- Claude (Anthropic AI) - Code Review & Refactoring

---

## 📅 버전 히스토리

| 버전 | 날짜 | 주요 변경사항 | 상태 |
|------|------|--------------|------|
| v4.0.0 | 2025-10-18 | 코드 리팩토링, 광고 레이아웃, 로고 클릭 | ✅ 완료 |
| v3.0.0 | 2025-10-15 | 세율 업데이트 (장기요양 12.27%) | ✅ 완료 |
| v2.0.1 | 2025-10-15 | UI 최적화, 부동산 계산기 확장 | ✅ 완료 |
| v1.0.0 | 2025-10-15 | 초기 릴리스 (5개 계산기) | ✅ 완료 |

---

**Last Updated**: 2025-10-18  
**Version**: 4.0.0  
**Status**: ✅ Production Ready

---

Made with ❤️ by [boam79](https://github.com/boam79)
