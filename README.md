# 💰 금융 계산기 웹사이트

> 연봉, 세금, 부동산, 대출 등 다양한 금융 계산을 한 곳에서!  
> ES6 모듈 시스템 기반 현대적인 SPA 금융 계산기

[![Version](https://img.shields.io/badge/version-4.4.0-blue.svg)](https://github.com/boam79/salary_cal/releases/tag/v4.4.0)
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
- [SEO 최적화](#-seo-최적화)
- [업데이트 내역](#-업데이트-내역)
- [향후 계획](#-향후-계획)
- [기여 방법](#-기여-방법)
- [라이선스](#-라이선스)

---

## 🎯 프로젝트 개요

**금융 계산기 웹사이트**는 일상에서 필요한 다양한 금융 계산을 쉽고 빠르게 할 수 있도록 도와주는 웹 애플리케이션입니다.

### 핵심 특징

- ✅ **6가지 주요 계산기** (연봉, 세금, 부동산, 취등록세, 대출, 부가세)
- ✅ **🗞️ 최신 종합뉴스** RSS 피드 연동, 5분마다 자동 업데이트 (카드형)
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

### 6️⃣ 부가세 계산기 (NEW!)
- 일반 계산: 공급가액 → 총액, 총액(부가세포함) → 공급가액
- 과세 유형: 표준과세(10%), 영세율/면세(0%)
- 사업자 환급: 매출세액 − 공제가능 매입세액 − 경감·공제세액 → 납부/환급 계산
- 상세 계산 과정 토글 제공

### 7️⃣ 종합뉴스 섹션 (UPDATED) 🗞️
- **RSS 피드 연동**: 연합뉴스, KBS, MBC, SBS, JTBC, 한겨레, 경향, 조선, 중앙, 동아, 한국일보 등
- **자동 업데이트**: 5분마다 최신 뉴스 자동 갱신 (자동 새로고침)
- **카드 UI**: 정사각형 썸네일 + 제목, 출처·날짜 표시, 클릭 시 원문 새 창
- **레이아웃**: 데스크톱 5열(정사각형), 태블릿 3~4열, 모바일 1~2열
- **순위 정책**: 신선도 + 출처 가중 + 중복 제거 + 소스 다양성(소스당 ≤5)

---

## 🎲 로또번호 생성기 (구현 완료) — 즉시 계산형 + 캐싱 + 용지 UI

### 백엔드(Render)
- 엔드포인트
  - `POST /lotto/sync`: 동행복권 최신 회차 수집(공식 JSON + HTML 크롤링 폴백, cheerio) → 전기간 이력 병합 → 통계 스냅샷 저장
  - `GET  /lotto/stats`: 전기간 통계 제공 `{ topCombos, numberFreq, updatedAt, meta }`
  - `GET  /lotto/generate`: 숫자 출현빈도(`numberFreq`) 가중 샘플링으로 6개 번호 생성, 과거 당첨 조합 제외, 10세트 보장 반환
    - 응답: `{ generated: number[][], count: 10, total, updatedAt, strategy }`
    - 가용 데이터 부족·웜업 지연 시 자동 보완: 가중치 실패 → 균등 무작위(과거 조합 제외)로 채움
    - 테스트/강제 균등 모드: `GET /lotto/generate?uniform=1`
  - `GET  /health`, `GET /`: 헬스체크/웜업용 (Render 기동 지연 완화)
- 데이터 파일
  - `server/data/lotto-history.json`: 회차별 당첨 번호 이력
  - `server/data/lotto-stats.json`: 통계 캐시(빈도·최상위 조합)
- CORS: `https://salary-cal.vercel.app` 명시 허용

### 크론(Cron) 설정
- Render Cron Job 스케줄: 매주 일요일 00:10 KST (UTC: 토요일 15:10)
- Command 예시
  - 보호키 사용: `curl -X POST -H "X-ADMIN-KEY: <ADMIN_KEY>" https://salary-cal.onrender.com/lotto/sync && curl -s https://salary-cal.onrender.com/lotto/stats > /dev/null`
  - 미사용: `curl -X POST https://salary-cal.onrender.com/lotto/sync && curl -s https://salary-cal.onrender.com/lotto/stats > /dev/null`

### 프런트(UI)
- 실제 로또 용지 형태 A~J(10세트) 슬롯 표시, 생성/초기화 버튼
- 생성 시 `/lotto/generate` 우선 호출(캐시버스터 `t=Date.now()`, `cache: 'no-store'`) → 실패 시 `/lotto/stats`/로컬 스냅샷 폴백
- 에러/진단: `window.ErrorLogger` 연동, 빈 데이터/예외 로깅
- 초기화: 새로고침 시 `localStorage` 자동 비움 → 항상 빈 용지로 시작
- 첫 진입 시 `/health`로 웜업 호출, 네트워크 상태에 따라 재시도(backoff)

### 알고리즘
- 가중 샘플링: 각 숫자 1~45의 출현 빈도를 가중치로 사용하여 6개 번호 추출
- 중복/제외: 하나의 세트 내 중복 금지, 과거 당첨 조합(`lotto-history.json`)과 일치하면 폐기 후 재생성
- 세트 수: 기본 10세트

### 사용 흐름도 (요약)
1. 초기 진입: 프런트가 `/health`로 웜업 → 빈 용지 렌더링(자동 초기화)
2. 생성 클릭: `/lotto/generate` 요청(캐시버스터, no-store)
   - 성공: `generated(10)` 수신 → A~J 렌더 → 메타에 `count/strategy` 표시
   - 실패: `/lotto/stats` → 로컬 스냅샷 폴백 안내
3. 필요 시 초기화 버튼으로 비우기(로컬 스토리지 제거)

### 트러블슈팅 체크리스트
- 502 또는 CORS: 잠시 후 재시도, `/health` 응답 확인(200)
- `count<10`: 백엔드 보완 로직 확인(로그: strategy, count), 최신 코드 배포 여부 확인
- 통계 비어있음: `/lotto/sync` 수동 실행 후 `/lotto/stats` 확인, Render Cron 설정 점검
- 프런트 캐시: 스크립트 쿼리버전/하드 리프레시(Ctrl+F5)

### 운영/장애 대응 가이드
- Render 무료 인스턴스는 비활성 시 기동 지연(50s~) 발생 가능 → 프런트에서 `/health` 웜업 + `/lotto/generate` 재시도 적용
- 502 또는 CORS 차단 시: 잠시 후 재시도되며, 백엔드는 보완 로직으로 항상 10세트 반환 보장
- `cheerio`는 ESM import 사용: `import * as cheerio from 'cheerio'`
- 통계 파일 손상/빈 값 시에도 `history` 기반 재계산 또는 균등 분포로 자동 보정

### 주의 및 고지
- 오락 목적의 기능이며, 당첨을 보장하지 않습니다.
- 공식 데이터 출처: 동행복권(웹 페이지/JSON)

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

## 🔍 SEO 최적화

### 📊 검색 엔진 최적화 전략

#### 1️⃣ **메타 태그 최적화**
- **Title**: "금융 계산기 | 연봉·세금·부동산·대출 실수령액 계산기"
- **Description**: 핵심 키워드 포함한 160자 이내 설명
- **Keywords**: 금융계산기, 연봉계산기, 실수령액, 세금계산, 부동산계산기, 대출계산기 등
- **Author**: boam79
- **Robots**: index, follow

#### 2️⃣ **소셜 미디어 최적화**
- **Open Graph**: Facebook, LinkedIn 공유 최적화
- **Twitter Cards**: Twitter 공유 최적화
- **이미지**: og-image.png (1200x630px 권장)

#### 3️⃣ **구조화된 데이터 (Schema.org)**
```json
{
  "@type": "WebApplication",
  "applicationCategory": "FinanceApplication",
  "featureList": [
    "연봉 실수령액 계산",
    "세금 계산 (상속세, 증여세)",
    "부동산 계산 (중개수수료, 양도소득세, 보유세, DSR)",
    "취등록세 계산",
    "대출 계산 (금융대출, 주택대출)"
  ]
}
```

#### 4️⃣ **기술적 SEO**
- **Canonical URL**: 중복 콘텐츠 방지
- **Sitemap**: `/sitemap.xml` - 검색 엔진 크롤링 가이드
- **Robots.txt**: `/robots.txt` - 크롤러 접근 제어
- **Favicon**: 다양한 크기 지원 (16x16, 32x32, 180x180)
- **Web App Manifest**: PWA 준비

#### 5️⃣ **성능 최적화**
- **Core Web Vitals** 준수
- **Lazy Loading**: 이미지 지연 로딩
- **Minification**: CSS/JS 압축
- **CDN**: Vercel 글로벌 CDN 활용
- **Caching**: 적절한 캐시 헤더 설정

### 🎯 **타겟 키워드**

#### Primary Keywords (주요 키워드)
- 금융계산기
- 연봉계산기
- 실수령액계산
- 세금계산기
- 부동산계산기
- 대출계산기

#### Long-tail Keywords (롱테일 키워드)
- 연봉 실수령액 계산기
- 월급 실수령액 계산
- 부동산 중개수수료 계산
- 대출 상환계획 계산
- DSR 계산기
- 취등록세 계산기

#### Local Keywords (지역 키워드)
- 한국 금융계산기
- 국내 세금계산기
- 한국 부동산계산기

### 📈 **SEO 성과 지표**

#### 목표 지표 (6개월)
- **검색 순위**: 주요 키워드 상위 10위 내
- **트래픽**: 월 10,000+ 방문자
- **체류 시간**: 평균 3분 이상
- **이탈률**: 60% 이하
- **Core Web Vitals**: 모든 지표 "Good" 등급

#### 측정 도구
- **Google Search Console**: 검색 성과 모니터링
- **Google Analytics**: 사용자 행동 분석
- **PageSpeed Insights**: 성능 측정
- **Lighthouse**: 종합 SEO 점수

### 🚀 **SEO 개선 계획**

#### Phase 1: 기본 SEO (완료 ✅)
- [x] 메타 태그 최적화
- [x] 구조화된 데이터 추가
- [x] Sitemap.xml 생성
- [x] Robots.txt 생성
- [x] 소셜 미디어 태그 추가
- [x] Google Search Console 인증 완료
- [x] Sitemap 제출 완료
- [x] URL 색인 요청 완료

#### Phase 2: 콘텐츠 SEO (진행 예정)
- [ ] 금융 가이드/팁 페이지 추가
- [ ] FAQ 섹션 확장
- [ ] 블로그/뉴스 섹션 추가
- [ ] 사용자 후기/리뷰 시스템

#### Phase 3: 고급 SEO (향후 계획)
- [ ] 다국어 지원 (영어)
- [ ] AMP 페이지 구현
- [ ] 서비스 워커 캐싱
- [ ] 실시간 세율 업데이트 API

### 📊 **SEO 체크리스트**

#### ✅ 완료된 항목
- [x] Title 태그 최적화 (60자 이내)
- [x] Meta Description 최적화 (160자 이내)
- [x] H1 태그 구조화
- [x] Alt 텍스트 추가
- [x] 내부 링크 구조화
- [x] 모바일 최적화
- [x] 페이지 속도 최적화
- [x] SSL 인증서 적용
- [x] 구조화된 데이터 마크업
- [x] Google Search Console 사이트 인증
- [x] Sitemap.xml 제출 및 처리
- [x] URL 색인 요청 및 처리

#### 🔄 진행 중인 항목
- [ ] 백링크 구축
- [ ] 소셜 시그널 강화
- [ ] 사용자 생성 콘텐츠
- [ ] 로컬 SEO 최적화

---

## 📝 업데이트 내역

### v4.4.0 (2025-10-30) - 🎲 로또번호 생성기 구현(백엔드+프런트)

#### ✨ 새로운 기능
- Render 백엔드 구축: `/lotto/sync`, `/lotto/stats`, `/lotto/generate`
- 동행복권 수집: 공식 JSON + HTML 크롤링(cheerio) 폴백, 최신회차 역순 증분 수집
- 통계 스냅샷: 조합 빈도, 숫자 빈도(numberFreq) 캐싱
- 번호 생성: 숫자 빈도 가중치 기반 샘플링, 과거 당첨 조합 제외, 10세트 반환
- Cron Job 가이드: 매주 일요일 00:10 KST 자동 동기화

#### 🔧 안정화/운영 개선(추가)
- `cheerio` ESM import 수정(`import * as cheerio`)
- `/lotto/generate` 보완 로직: 가중치 실패 시 균등 무작위(과거 조합 제외)로 10세트 보장, `strategy/count` 필드 제공
- 헬스체크 `/health`/`/` 추가 + 프런트 웜업·재시도(backoff)로 502/웜업 지연 완화
- 프런트: 새로고침 시 자동 초기화, 생성 요청 캐시 우회(`no-store`, 캐시버스터)

#### 📁 파일
- `server/index.js`, `server/package.json`, `server/cronSync.js`
- `js/lotto/lotto.js`

---

### v4.3.2 (2025-10-30) - 🧾 부가세 계산기 추가

#### ✨ 새로운 기능
- 별도 화면 `부가세 계산기` 추가 (사이드바 네비게이션 포함)
- 계산 방향 지원: 공급가액 → 총액, 총액(부가세 포함) → 공급가액
- 과세 유형: 표준과세(10%), 영세율(0%), 면세(0%)
- 계산 과정 단계별 설명 표시
- 세율은 `config/rates.json`의 `vat` 섹션에서 로드 (최신 기준)
 - 사업자 환급 탭 추가: 매출세액·공제가능 매입세액·경감/공제세액 입력 → 납부/환급 자동 산출

#### 📁 파일
- `index.html` - 부가세 화면/네비 추가, 스크립트 로드
- `js/calculators/vat.js` - 신규 모듈(+ 환급 탭/로직)
- `config/rates.json` - `vat` 섹션 추가, `lastUpdated` 2025-10-30로 갱신

---

### v4.3.1 (2025-10-30) - 종합뉴스 UI/로직 업데이트 🗞️

#### ✨ 변경사항
- 메인 태그라인 수정: "실시간 주식정보 · 금융계산기 · 경제뉴스" → "금융계산기 · 종합뉴스"
- 홈 섹션 명칭 변경: "최신 경제 뉴스" → "최신 종합뉴스"
- 뉴스 카드: 정사각형 썸네일, 5열 그리드, 30개 표시
- 랭킹 로직: 신선도(2h 지수감쇠) + 출처 가중 + 중복 제거 + 소스 다양성 상한(≤5)
- 기본 카테고리 표기: 빈 카테고리 기사 → "종합"으로 표기

#### 📁 파일
- `index.html` - 타이틀/섹션 문구 변경, 스크립트 캐시 무효화
- `css/styles.css` - 뉴스 카드 정사각형/5열 그리드/섹션 중앙 정렬
- `api/news.js` - top=30 기본값, 랭킹/다양성 보정, 기본 카테고리 수정
- `js/main.js` - 뉴스 매니저 재연동 및 캐시 버전 업데이트

---

### v4.3.0 (2025-10-30) - 적금/예금 고도화 · 자동차 취득세 계산기 🚗

#### ✨ 새로운 기능
1. **적금/예금 계산기 고도화**
   - 월 적립식(말기불) 추가: 월 납입액·이자율·개월 입력 → 미래가치 계산
   - 이자소득세 15.4% 반영, 세후 실수령액 표시
   - 계산 과정 상세 표시(수식/단계), 월별 원리금 그래프
   - 탭 전환·입력 검증·접근성(A11y) 개선

2. **자동차 취득세 계산기**
   - 차량 유형별 세율 적용(승용/영업용/이륜/하이브리드/전기)
   - 취득세 + 지방교육세(취득세의 30%) 산출, 합계 및 계산 과정 표시
   - 세율은 `config/rates.json`의 `vehicleAcquisition`을 참조하여 관리

#### 🛠 변경사항
- 푸터: `config/rates.json`의 `lastUpdated`를 자동 표기
- 안내 문구 정리(자동 반영 문구 제거)

#### 📁 파일
- `index.html` - 화면/네비게이션/스크립트 참조 추가
- `js/calculators/savings.js` - 적금/예금 계산기 고도화
- `js/calculators/carAcquisition.js` - 자동차 취득세 계산기 (신규)
- `config/rates.json` - `vehicleAcquisition` 세율 섹션 추가

### v4.2.0 (2025-10-30) - UI 개선 및 주식지수 제거 🎨

#### ✨ 새로운 기능
1. **메인 타이틀 변경**
   - "💰 금융 계산기" → "📰 종합 생활 정보지"
   - 태그라인: "실시간 주식정보 · 금융계산기 · 경제뉴스"

2. **로고 클릭 시 전체 새로고침**
   - 메인 타이틀 클릭 시 `window.location.reload()` 실행
   - 페이지 전체 리로드로 최신 데이터 반영

#### 🔧 변경사항
- **주식 지수 섹션 제거**
  - 사이드바에서 코스피/코스닥 지수 표시 제거
  - `stockIndices` 모듈 제거
  - API 파일 유지 (향후 재활용 가능)

#### 📊 영향 범위
- 파일 변경: `index.html`, `js/main.js`
- 제거된 요소: 주식 지수 HTML, stockIndices import 및 초기화

### v4.1.0 (2025-10-30) - 경제 뉴스 섹션 추가 📰

#### ✨ 새로운 기능
**홈 화면에 최신 경제 뉴스 섹션 추가**

1. **뉴스 카드 UI**
   - 홈 화면 계산기 하단에 뉴스 섹션 추가
   - 카드 형태로 제목, 설명, 출처, 날짜, 카테고리 표시
   - 썸네일 이미지 지원 (있는 경우)
   - 호버 시 상승 애니메이션 효과
   - 클릭 시 새 창에서 원문 열기

2. **RSS 피드 연동**
   - 연합뉴스, 뉴시스, 매일경제, 머니투데이 RSS 피드 통합
   - Vercel Serverless Function으로 CORS 문제 해결
   - 정규식 기반 XML 파싱
   - 여러 소스에서 최신 12개 뉴스 수집

3. **자동 업데이트**
   - 5분마다 자동으로 뉴스 갱신
   - 타이머 기반 실시간 업데이트
   - API 실패 시 더미 데이터 fallback

4. **반응형 디자인**
   - 데스크톱: 3열 그리드
   - 태블릿: 2열 그리드
   - 모바일: 1열 세로 레이아웃

5. **로딩 및 에러 처리**
   - 로딩 스피너 표시
   - 에러 메시지 안내
   - 상태 전환 안정성

#### 📊 SEO 효과
- 사용자 체류 시간 증가
- 정기적 콘텐츠 업데이트
- 내부 링크 강화
- 검색 엔진 크롤링 빈도 증가

#### 🗂️ 파일 변경사항
- `index.html` - 뉴스 섹션 HTML 추가
- `css/styles.css` - 뉴스 카드 스타일 추가
- `js/news/newsManager.js` - 뉴스 관리 모듈 생성 (신규)
- `js/main.js` - 뉴스 매니저 초기화
- `api/news.js` - RSS 피드 API 생성 (신규)

### v4.0.3 (2025-10-29) - Critical Bug Fix 🐛

#### 🐛 버그 수정
**심각도: CRITICAL** - 4개 계산기 모듈에서 70+ 개의 함수 호출 오류 수정

1. **문제 상황**
   - `formatCurrency()`, `getValueWithUnit()`, `validateInput()` 함수 호출 시 `window.` 접두사 누락
   - 유틸리티 함수가 IIFE 패턴으로 window 객체에 export되어 있음에도 불구하고 직접 호출
   - ReferenceError 발생으로 계산기 기능 완전 마비

2. **수정된 파일 (4개)**
   - `js/calculators/realEstate.js`: 25개 함수 호출 수정
     - calculateBrokerageFee() - 중개수수료 계산
     - calculateCapitalGains() - 양도소득세 계산
     - calculatePropertyTax() - 보유세 계산
   - `js/calculators/acquisition.js`: 13개 함수 호출 수정
     - calculateAcquisitionTax() - 취득세 계산
   - `js/calculators/salary.js`: 30+ 개 함수 호출 수정
     - calculateSalary() - 시급 입력 모드 및 결과 표시
   - `js/calculators/loan.js`: 20+ 개 함수 호출 수정
     - calculateLoan() - 대출 계산 결과 표시
     - calculateHousingLoan() - 주택대출 계산 결과 표시

3. **수정 내용**
   ```javascript
   // ❌ 수정 전 (ReferenceError 발생)
   formatCurrency(totalFee)
   getValueWithUnit('property-price', 100000000)
   validateInput(document.getElementById('hours').value, '시간')

   // ✅ 수정 후 (정상 동작)
   window.formatCurrency(totalFee)
   window.getValueWithUnit('property-price', 100000000)
   window.validateInput(document.getElementById('hours').value, '시간')
   ```

4. **복구된 기능**
   - ✅ 중개수수료 계산
   - ✅ 양도소득세 계산
   - ✅ 보유세 계산
   - ✅ 취득세 계산
   - ✅ 급여 계산 (시급 모드)
   - ✅ 대출 계산 (결과 표시)

5. **근본 원인**
   - `js/utils/formatter.js`와 `js/utils/validation.js`가 IIFE 패턴으로 함수를 `window` 객체에 export
   - 다른 모듈에서 이 함수들을 호출할 때 `window.` 접두사 필수
   - 일부 파일에서는 올바르게 `window.`를 사용했으나, 일관성 없는 패턴 사용

#### 📊 통계
- **수정된 함수 호출**: 70+ 개
- **영향받은 파일**: 4개
- **코드 변경**: 89줄 (삽입), 89줄 (삭제)
- **테스트 상태**: ✅ 모든 계산기 정상 동작 확인

#### 🎯 영향도
- **심각도**: 🔴 CRITICAL (사용자 경험 완전 손상)
- **영향 범위**: 8개 계산 함수 중 6개 영향
- **데이터 손실**: 없음
- **보안 영향**: 없음

### v4.0.2 (2025-10-18) - Google Search Console 연동 완료 ✅

#### 🔍 Google Search Console 연동
1. **사이트 인증 완료**
   - HTML 파일 인증 방식 사용
   - google635228f3e17c5761.html 파일 생성 및 배포
   - 도메인 소유권 확인 완료

2. **Sitemap 제출 완료**
   - sitemap.xml 제출 및 처리 완료
   - 6개 페이지 크롤링 가이드 제공
   - 검색 엔진 인덱싱 최적화

3. **URL 색인 요청 완료**
   - 메인 페이지 색인 생성 요청
   - 검색 결과 노출 준비 완료
   - 실시간 검색 성과 모니터링 시작

#### 📊 SEO 성과 모니터링 시작
- Google Search Console 데이터 수집 시작
- 검색 순위 및 트래픽 추적 가능
- 키워드 성과 분석 준비 완료

### v4.0.1 (2025-10-18) - SEO 최적화 및 검색 엔진 개선 ✅

#### 🔍 SEO 최적화
1. **메타 태그 완전 개편**
   - Title 태그 최적화: "금융 계산기 | 연봉·세금·부동산·대출 실수령액 계산기"
   - Meta Description 확장: 핵심 키워드 포함한 상세 설명
   - Keywords 메타 태그 추가: 주요 검색 키워드 집합

2. **소셜 미디어 최적화**
   - Open Graph 태그 추가 (Facebook, LinkedIn)
   - Twitter Cards 설정
   - 소셜 공유 이미지 설정

3. **구조화된 데이터 (Schema.org)**
   - WebApplication 스키마 추가
   - 기능 목록 및 카테고리 정의
   - 검색 엔진 이해도 향상

4. **기술적 SEO**
   - Sitemap.xml 생성 (6개 페이지)
   - Robots.txt 생성 (크롤러 가이드)
   - Canonical URL 설정
   - Favicon 다중 크기 지원

#### 📊 SEO 성과 목표
- 주요 키워드 상위 10위 내 진입
- 월 10,000+ 방문자 달성
- 평균 체류 시간 3분 이상
- Core Web Vitals "Good" 등급

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

### Phase 1: 핵심 계산기 추가 (v4.1.0) - 2025년 Q4

#### 새로운 계산기
- [ ] **퇴직금 계산기** (우선순위 🥇)
  - 입사일/퇴사일 기반 자동 계산
  - 퇴직소득세 자동 계산
  - 실수령액 표시
  - 개발 시간: 2-3시간
  - ROI: +500%

- [ ] **복리/적금 계산기** (우선순위 🥈)
  - 단리/복리 선택
  - 월 적립액 입력
  - Canvas 그래프 시각화
  - 목표 금액 역산 기능
  - 개발 시간: 2-3시간
  - ROI: +500%

- [ ] **주식 투자 수익률 계산기** (우선순위 🥉)
  - 매수/매도 손익 계산
  - 수수료/거래세 자동 계산
  - 손익분기점 표시
  - 개발 시간: 3시간
  - ROI: +300%

#### 부가 기능 (핵심 우선순위)
- [ ] **💡 금융 가이드/팁** (최우선 ⭐⭐⭐⭐⭐)
  - 각 계산기별 활용 팁 제공
  - 절세 방법, 최적화 전략
  - SEO 대폭 강화
  - 개발 시간: 5시간 (콘텐츠 작성)
  - ROI: +800%

- [ ] **🔗 URL 공유 기능** (우선순위 ⭐⭐⭐⭐⭐)
  - 계산 결과 URL 인코딩
  - 링크 복사로 간편 공유
  - 바이럴 효과
  - 개발 시간: 2시간
  - ROI: +500%

- [ ] **⚖️ 시뮬레이션 비교** (우선순위 ⭐⭐⭐⭐⭐)
  - 여러 시나리오 동시 비교
  - 2-Column 비교 레이아웃
  - 차이 자동 계산
  - 개발 시간: 6시간
  - ROI: +600%

### Phase 2: UX 고도화 (v4.2.0) - 2026년 Q1

#### 결과 활용 기능
- [ ] **PDF 다운로드**
  - 계산 결과 PDF 저장
  - 계산 과정 포함
  - 그래프 포함
  - 개발 시간: 4시간
  - ROI: +400%

- [ ] **손익분기점 자동 계산**
  - "목표 달성하려면?" 역산 기능
  - 월급 400만원 받으려면 연봉은?
  - DSR 40% 이하로 하려면 대출액은?
  - 개발 시간: 4시간
  - ROI: +400%

- [ ] **다크 모드**
  - 밝은/어두운 테마 전환
  - 사용자 설정 저장
  - 개발 시간: 5시간
  - ROI: +150%

#### 사용자 편의 기능
- [ ] **계산 이력** (localStorage)
  - 최근 계산 5개 저장
  - "최근 계산" 탭
  - 개발 시간: 3시간
  - ROI: +300%

- [ ] **이미지로 저장**
  - 계산 결과 이미지 캡처
  - 카카오톡/SNS 공유 용이
  - 개발 시간: 3시간
  - ROI: +300%

- [ ] **FAQ (자주 묻는 질문)**
  - 각 계산기별 FAQ 섹션
  - SEO 강화
  - 개발 시간: 3시간
  - ROI: +500%

### Phase 3: 추가 계산기 (v4.3.0) - 2026년 Q2
- [ ] **전세자금 대출 계산기**
- [ ] **자동차 구매 비용 계산기**
- [ ] **건강보험 환급금 계산기**
- [ ] **주택청약 점수 계산기**

### Phase 4: 고급 기능 (v5.0.0) - 2026년 Q3-Q4
- [ ] **연말정산 계산기** (복잡도 높음)
- [ ] **FIRE 계산기** (조기 은퇴)
- [ ] **국민연금 예상 수령액**
- [ ] PWA 변환 (오프라인 지원)

### Phase 5: API 연동 (v6.0.0) - 2027년
- [ ] 실시간 세율 업데이트 API
- [ ] 부동산 시세 연동
- [ ] 증시 정보 (실시간) ⚠️ 신중 검토 필요

---

## 📊 개발 우선순위 매트릭스

| 기능 | 개발 시간 | ROI | 난이도 | 우선순위 |
|------|----------|-----|--------|---------|
| 금융 가이드/팁 | 5시간 | +800% | ⭐ | 🥇 최우선 |
| URL 공유 | 2시간 | +500% | ⭐⭐ | 🥇 최우선 |
| 시뮬레이션 비교 | 6시간 | +600% | ⭐⭐⭐⭐ | 🥇 최우선 |
| 퇴직금 계산기 | 3시간 | +500% | ⭐⭐ | 🥈 높음 |
| 복리 계산기 | 3시간 | +500% | ⭐⭐ | 🥈 높음 |
| PDF 다운로드 | 4시간 | +400% | ⭐⭐⭐ | 🥉 중간 |
| 손익분기점 계산 | 4시간 | +400% | ⭐⭐⭐ | 🥉 중간 |

---

## 🎯 즉시 실행 계획 (3일)

### Day 1 (5시간)
✅ 금융 가이드/팁 콘텐츠 작성
- 퇴직금 절세 방법
- 대출 이자 절감 전략
- DSR 관리 팁
- 연봉 협상 가이드

### Day 2 (2시간)
✅ URL 공유 기능 구현
- URL 파라미터 인코딩
- 공유 버튼 UI
- 클립보드 복사

### Day 3 (6시간)
✅ 시뮬레이션 비교 UI
- 비교 모드 토글
- 2-Column 레이아웃
- 차이 계산 로직

**총 투자: 13시간**  
**예상 효과: 트래픽 +500%, 체류 시간 +400%**

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
| v4.4.0 | 2025-10-30 | 🎲 로또번호 생성기(백엔드+프런트) 구현, 생성 무작위성·초기화 개선 | ✅ 완료 |
| v4.3.2 | 2025-10-30 | 🧾 부가세 계산기 추가, 세율 설정 갱신 | ✅ 완료 |
| v4.3.1 | 2025-10-30 | 🗞️ 종합뉴스(카드·5열·30개·랭킹) 업데이트 | ✅ 완료 |
| v4.3.0 | 2025-10-30 | 💰 적금/예금 고도화, 🚗 자동차 취득세 계산기 | ✅ 완료 |
| v4.2.0 | 2025-10-30 | 🎨 메인 타이틀 변경, 로고 새로고침, 주식지수 제거 | ✅ 완료 |
| v4.1.0 | 2025-10-30 | 📰 경제 뉴스 섹션 추가, RSS 피드 연동 | ✅ 완료 |
| v4.0.3 | 2025-10-29 | 🐛 Critical Bug Fix - window 접두사 70+ 개 수정 | ✅ 완료 |
| v4.0.2 | 2025-10-18 | Google Search Console 연동 완료 | ✅ 완료 |
| v4.0.1 | 2025-10-18 | SEO 최적화, 메타태그, 구조화된 데이터 | ✅ 완료 |
| v4.0.0 | 2025-10-18 | 코드 리팩토링, 광고 레이아웃, 로고 클릭 | ✅ 완료 |
| v3.0.0 | 2025-10-15 | 세율 업데이트 (장기요양 12.27%) | ✅ 완료 |
| v2.0.1 | 2025-10-15 | UI 최적화, 부동산 계산기 확장 | ✅ 완료 |
| v1.0.0 | 2025-10-15 | 초기 릴리스 (5개 계산기) | ✅ 완료 |

---

**Last Updated**: 2025-10-30
**Version**: 4.4.0
**Status**: ✅ Production Ready

---

Made with ❤️ by [boam79](https://github.com/boam79)
