# 세율·상수 업데이트 체크리스트 (`config/rates.json`)

배포 전에 아래를 순서대로 확인합니다.

## 1. 변경 범위 확인

- [ ] `lastUpdated` 날짜를 실제 반영일로 수정했는가?
- [ ] `version` 문자열을 올렸는가? (앱 UI·`/version.json`과 일치 권장)
- [ ] 소득세 구간(`incomeTax.brackets`)이 국세청/내부 기준과 맞는가?
- [ ] 근로소득공제 구간이 코드(`salary.js` 등)와 **동일**한가? (불일치 시 회귀)

## 2. 최저시급·4대보험

- [ ] `minimumWage.current` 갱신
- [ ] 국민연금 상한·요율(`insurance.pension`) 확인
- [ ] 건강보험·장기요양·고용보험 요율 확인

## 3. 상속·증여

- [ ] `inheritanceTax.basicDeduction`, `brackets` 확인
- [ ] `giftTax.deductions` 관계별 공제 확인 (UI `select` 값과 키 일치)

## 4. 검증

- [ ] 루트에서 `npm test` 통과
- [ ] `npm run test:e2e -- --workers=1 --retries=0` 통과
- [ ] 브라우저에서 연봉·세금·대출 각 1회 수동 스모크

## 5. 문서·릴리즈

- [ ] `README.md` 최근 업데이트 섹션에 버전 노트 추가
- [ ] 필요 시 PR 본문에 변경 요약 기록
