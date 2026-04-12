# 💰 금융 계산기

> 연봉, 세금, 부동산, 대출 등 다양한 금융 계산을 한 곳에서!  
> ES6 모듈 시스템 기반 현대적인 SPA

[![Version](https://img.shields.io/badge/version-4.8.0-blue.svg)](https://github.com/boam79/salary_cal/releases)
[![Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://salary-cal.vercel.app)

---

## ✨ 주요 기능

### 계산기 (10종)
- **월급/연봉**: 2025년 세율 기준 실수령액 계산
- **세금**: 상속세, 증여세 누진세율 계산
- **부가세**: 공급가액↔총액, 사업자 환급
- **부동산**: 중개수수료, 양도세, 보유세, DSR
- **취등록세**: 부동산 취득/등록세
- **대출**: 원리금균등, 원금균등, 만기일시상환 (그래프)
- **적금/예금**: 단리/복리, 이자소득세 반영
- **퇴직금**: 입퇴사일 기반 자동 계산
- **자동차 취득세**: 차종별 세율
- **로또번호**: 빈도 기반 10세트 생성

### 추가 기능
- 📰 **종합뉴스**: RSS 피드 자동 업데이트
- 📊 **그래프**: Canvas API 시각화
- 📱 **반응형**: 모바일 최적화

---

## 🚀 빠른 시작

```bash
git clone https://github.com/boam79/salary_cal.git
cd salary_cal
python3 -m http.server 8000
# http://localhost:8000
```

**[Live Demo](https://salary-cal.vercel.app)**

### 새 셸 (React)

- 시나리오 허브 및 라우팅: **`/app/`** (예: `https://salary-cal.vercel.app/app/`)
- 기존 계산기 UI는 점진 이관 전까지 **`/app/legacy.html`** 로 iframe 로드

```bash
npm install
npm run dev -w salary-cal-frontend-app
# http://127.0.0.1:5180/app/
```

자세한 내용은 `DOC/frontend-migration-v2.md` 참고.

---

## 📊 계산 기준 (2025년 11월)

### 소득세
| 과세표준 | 세율 |
|---------|------|
| 1,200만원 이하 | 6% |
| 1,200~4,600만원 | 15% (-108만) |
| 4,600~8,800만원 | 24% (-522만) |
| 8,800만원~1.5억 | 35% (-1,490만) |
| 1.5억~3억 | 38% (-1,940만) |
| 3억~5억 | 40% (-2,540만) |
| 5억~10억 | 42% (-3,540만) |
| 10억 초과 | 45% (-6,540만) |

### 근로소득공제
- 600만원 이하: 70%
- 600~1,500만원: 420만 + 초과분 × 40%
- 1,500~3,000만원: 780만 + 초과분 × 15%
- 3,000~5,000만원: 1,005만 + 초과분 × 8%
- 5,000~8,800만원: 1,165만 + 초과분 × 6%
- 8,800만원 초과: 1,393만 + 초과분 × 2%

### 4대보험
- 국민연금: 4.5% (상한 553만원)
- 건강보험: 3.545%
- 장기요양: 건강보험료 × 12.27%
- 고용보험: 0.9%

### 최저시급
- **2025년**: 10,030원

---

## 📝 최근 업데이트

### v4.8.0 (2026-04-12)
- ✅ **전면 개편 1단계**: npm workspaces + `packages/calc-core` (도메인 재수출 + Zod 공유 URL 스키마)
- ✅ **React + Vite** 새 셸: `/app/` 시나리오 허브 + 라우팅, 레거시 계산기는 `legacy.html` iframe으로 점진 이관
- ✅ **빌드**: `npm run build:app` → `public/app/` + 루트 `public/legacy.html` (전체 화면 링크용)
- ✅ **Vercel**: `/app/*` SPA rewrite, iframe/CSP 정합 (`frame-ancestors 'self'`, `frame-src 'self'`)
- ✅ **테스트**: `tests/schemas.test.js`, `npm run test:e2e:app` (React 셸 스모크)

### v4.7.1 (2026-04-12)
- ✅ **품질**: GitHub Actions CI (`npm test`, `npm run test:e2e`, 서버 `npm audit`)
- ✅ **품질**: 딥링크/공유 URL `qSchema=1` + 허용 키만 반영, 값 길이·총 쿼리 길이 제한
- ✅ **품질**: 대출 공유 상태 평탄화(금융/주택 필드 충돌 수정), 연봉 공유 링크 복사·URL 동기화
- ✅ **품질**: `config/rates.json` 로드 재시도 + 실패 시 하단 재시도 배너
- ✅ **품질**: `/version.json`으로 프론트 버전 노출
- ✅ **품질**: `DOC/rates-update-checklist.md` 세율 업데이트 체크리스트
- ✅ **접근성**: `aria-live` 계산 결과 안내, 설명 토글 `aria-expanded`
- ✅ **보안(XSS)**: `ErrorLogger.showErrorToUser` DOM API로 교체
- ✅ **보안**: Vercel 응답 헤더(CSP, HSTS, X-Frame-Options 등)
- ✅ **보안**: 로또 백엔드 레이트 리밋·JSON 크기 제한·응답 보안 헤더
- ✅ **보안**: 개발 의존성 `npm audit fix` (Vite 취약점)
- ✅ **운영**: 뉴스 상세 로그는 `?debug=1` 또는 `localStorage FC_DEBUG=1`일 때만

### v4.7.0 (2026-04-06)
- ✅ FEAT-005 설명/근거 UX 고도화
  - 연봉/세금/부동산 계산 결과에 기준일/버전 정보 노출
- ✅ FEAT-006 연봉 상세 모드(간편/상세) 추가
  - 상세 옵션: 부양가족 수, 비과세 월 수당
  - 간편 모드 기존 계산 흐름 유지
- ✅ FEAT-007 세금/부동산 규정 옵션 확장
  - 증여세 `비친족/타인` 옵션 추가 및 안전 폴백 처리
  - 보유세 `보유 주택 수` 옵션 추가 및 반영
- ✅ E2E 시나리오 보강 (상세 모드/증여세 옵션/보유세 옵션)

### v4.6.1 (2026-04-05)
- ✅ E2E(브라우저) 스모크 테스트 추가 (Playwright)
  - `npm run test:e2e`로 핵심 계산기(연봉/상속세/대출) 입력→계산→결과 렌더링까지 자동 검증

### v4.6.0 (2026-04-05)
- ✅ 품질 고도화: Vitest 테스트 러너 도입 (`npm test`)
- ✅ 도메인 로직 순수 함수 분리 + 회귀 테스트 추가
  - 월급(최저시급 경계값), 상속/증여(누진구간 경계값), 대출(3종 상환방식)
- ✅ 로또 백엔드 API contract 테스트 추가 (`/health`, `/lotto/stats`, `/lotto/generate`)
- ✅ 최저시급 SSOT 강화: `config/rates.json`의 `minimumWage.current`를 우선 참조

### v4.5.0 (2025-11-03)
- 🎲 로또 전체 데이터 수집 (1~1196회, 156KB)
- Render 무료 플랜 최적화
- 크론 타임아웃/재시도 개선
- 서버 웜업 로직 추가

### v4.4.1 (2025-11-03)
- 근로소득공제 2025년 기준 수정

### v4.4.0 (2025-10-30)
- 로또번호 생성기 추가
- Render 백엔드 연동

---

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **배포**: Vercel (프론트), Render (백엔드)
- **특징**: 외부 라이브러리 없음, 모듈화, SPA

---

## ✅ 테스트

```bash
# Unit / Contract tests (Vitest)
npm test

# E2E smoke tests (Playwright)
npm run test:e2e
```

> E2E는 내부적으로 `python3 -m http.server`로 정적 서버를 띄웁니다.

---

## 📄 라이선스

MIT License

---

**Last Updated**: 2026-04-12 | **Version**: 4.8.0

Made with ❤️ by [@boam79](https://github.com/boam79)
