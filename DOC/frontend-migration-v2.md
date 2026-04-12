# 프론트 전면 개편 (v2) — 현재 구조

## 목표

- **React + Vite** 기반 새 셸(`/app/`)에서 시나리오·내비게이션을 제공
- 기존 바닐라 계산기는 **점진 이관**: 현재는 `legacy.html`(iframe)로 재사용
- 계산 로직은 **`@salary-cal/calc-core`** 워크스페이스 패키지로 한곳에서 import (현재는 `js/domain/*` 재수출 + Zod 스키마)

## 로컬 개발

```bash
npm install
npm run build:app   # public/app 에 정적 빌드 + legacy.html 복사
```

개발 서버만:

```bash
npm run dev -w salary-cal-frontend-app
# http://127.0.0.1:5180/app/
```

## 배포 (Vercel)

- **Build Command**: 기본값 `npm run build` (루트 `package.json`의 `build`가 `build:app` + `sync-static-to-public` 실행)
- `npm run build` 후 **`public/`** 아래에 다음이 생깁니다:
  - 루트 레거지 SPA: `index.html`, `css/`, `js/`, `config/` …
  - React 앱: `app/` (및 `legacy.html` 등)
- **Output Directory (Vercel)**: **`public`** 로 두면 루트 `/`와 `/app/` 모두 동작합니다. (프로젝트 루트를 Output으로 두면 `index.html`이 없어 404가 날 수 있음)
- 위 파일들은 `.gitignore`로 커밋 제외 — **배포 시 빌드로만 생성**
- SPA 라우팅: `vercel.json`의 `/app/:path* → /app/index.html` rewrite
- `legacy.html`은 `/app/` 아래에서 열리며, 자산 경로는 `/js`, `/css`, `/config` 루트 절대 경로를 사용 (iframe 대응)

## 다음 단계 (진짜 “전면” 완성)

1. 계산기별로 iframe 제거 → React 페이지 + **calc-core** 직접 호출
2. 폼/결과 UI를 컴포넌트화, `window.*` 의존 제거
3. E2E를 `/app/` 경로 중심으로 이전
