# 테스트 전략

"빠르고 정확하게" 구현하기 위한 최소 침습 테스트 전략. 전부 다 짜지 말고 아래 우선순위대로.

## 우선순위 1 — 반드시 필요 (회귀 방지)

| 대상 | 방법 | 이유 |
|---|---|---|
| `calculator.ts` (3개 진단 스코어링 로직) | Jest 단위 테스트, 대표 입력값 5~10개 케이스 | 점수 계산 오류는 사용자에게 바로 노출되는 치명적 버그 |
| `validateDiagnosisType` | 단위 테스트 | 잘못된 URL(`/diagnosis/foo`)이 404로 정확히 처리되는지 |
| `/api/diagnosis/submit` 검증 로직 | 단위 테스트 (Zod 스키마) | 악성/빈 입력 방어 |
| RLS 정책 | Supabase 로컬 환경에서 SQL로 직접 검증 (anon이 select 못 하는지, admin은 되는지) | 보안 핵심 |

## 우선순위 2 — 권장

| 대상 | 방법 |
|---|---|
| `diagnosisStore` (Zustand) | 단위 테스트 — reset 시 다른 타입 상태와 격리되는지 |
| `/api/result/[token]` | 통합 테스트 — 존재/미존재 토큰 |
| 관리자 인증 가드 | 통합 테스트 — 비로그인/non-admin 접근 차단 |

## 우선순위 3 — 여유 있으면

| 대상 | 방법 |
|---|---|
| 3개 진단 E2E 플로우 (질문 응답 → 결과 → 공유) | Playwright |
| 랜딩 → 진단 진입 → 완료까지 | Playwright |
| PDF 다운로드 | 수동 QA (자동화 비용 대비 효용 낮음) |

## 디자인 회귀 확인 (자동화 아님, 필수 수동 절차)

"디자인은 그대로 유지" 원칙 검증용:
1. 원본 `second-life-design-v2.html`을 브라우저에서 스크린샷
2. 이식된 Next.js 페이지를 동일 뷰포트에서 스크린샷
3. 육안 비교 (또는 `pixelmatch` 같은 간단한 diff 도구로 자동 비교)
4. 랜딩 + 3개 진단 진입 화면 최소 4개 페이지에 대해 수행

## 도구

- 단위/통합: Jest + React Testing Library
- E2E: Playwright (우선순위 3, 여유 있을 때만)
- CI: GitHub Actions에서 PR마다 우선순위 1 테스트만 필수로 실행
