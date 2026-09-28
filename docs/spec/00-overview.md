# 세컨라이프 디자인 — 프로젝트 개요

> 이 문서 세트는 VS Code(Claude Code / Codex)로 실제 구현할 때 참조할 스펙입니다.
> 구현 에이전트는 `01-component-spec.md`, `02-api-spec.md`, `supabase/migrations/0001_init.sql`,
> `03-testing-strategy.md` 순서로 읽고 작업하면 됩니다.

## 1. 목표

기존 정적 프로토타입(`second-life-design-v2.html`, 랜딩 + 3개 진단이 한 파일/별도 아티팩트로 분산)을
**Next.js 15 + Supabase** 기반 실서비스로 전환한다.

**중요한 제약: 디자인/UI/카피는 100% 현행 유지.** 바뀌는 것은 내부 구조(컴포넌트 분리, 상태관리,
데이터 저장, 라우팅, 관리자 기능)뿐이며 사용자가 화면에서 체감하는 변화는 없어야 한다.

## 2. 확정 요구사항 (합의 완료)

1. 관리자가 사용자 진단 결과를 PDF로 출력 가능해야 함 → **Supabase 저장 방식** 채택 (구글 드라이브 방식 기각)
2. 관리자는 사용자를 닉네임으로 구분하되 실제 PII(이메일/전화/생년월일 등)는 저장하지 않음
3. 기대수명 / 생애설계 / 여가·부캐 3개 진단이 각각 **독립 URL로 직접 접근 가능**해야 함
   (랜딩페이지 경유 없이 링크 공유·북마크·SNS 유입 지원)
4. 유지보수·보안·향후 디자인 변경이 쉬워야 함 → 리팩토링 후 이식하기로 합의
5. 현재 시각적 디자인은 그대로 유지 (내부 구조만 개선)

## 3. 기술 스택

| 레이어 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 15 (App Router) | jmcounseling과 동일 스택, 팀 러닝커브 없음 |
| UI | React 19 | |
| 스타일 | 기존 CSS를 CSS Modules + CSS 변수로 그대로 이식 | Tailwind로 새로 짜지 않음 — 디자인 유지 원칙 때문에 기존 CSS 최대한 재사용 |
| 상태관리 | Zustand | 진단 타입별 상태 격리 |
| 백엔드 | Next.js Route Handlers + Supabase | |
| DB/Auth/Storage | Supabase (PostgreSQL) | |
| PDF 생성 | `@react-pdf/renderer` | Headless Chrome보다 서버리스 환경에서 가볍고 배포 용이 |
| 배포 | Vercel + Supabase | |
| 모니터링 | Sentry (에러), Vercel Analytics (트래픽) | |

## 4. URL 맵

| URL | 설명 | 인증 |
|---|---|---|
| `/` | 랜딩페이지 (현행 유지) | 공개 |
| `/diagnosis/life-expectancy` | 기대수명 진단 (직접 진입 가능) | 공개 |
| `/diagnosis/life-design` | 생애설계 진단 (직접 진입 가능) | 공개 |
| `/diagnosis/leisure-alter-ego` | 여가·부캐 진단 (직접 진입 가능) | 공개 |
| `/result/[type]/[token]` | 결과 재조회/공유 | 토큰 검증 |
| `/admin/login` | 관리자 로그인 | 공개 |
| `/admin/dashboard` | 결과 목록/검색/필터 | admin role |
| `/admin/[resultId]` | 결과 상세 | admin role |
| `/admin/[resultId]/pdf` | PDF 다운로드 | admin role |

## 5. 디렉터리 구조 (최상위)

```
app/
  page.tsx                      # 랜딩 (현행 HTML/CSS 이식)
  diagnosis/[type]/page.tsx     # 3개 진단 공용 동적 라우트
  result/[type]/[token]/page.tsx
  admin/...
  api/
    diagnosis/submit/route.ts
    result/[token]/route.ts
    admin/audit-log/route.ts
    admin/[resultId]/pdf/route.ts
components/
  ui/                # 기존 디자인에서 뽑아낸 원자 컴포넌트 (Button, Card, Badge, ProgressBar...)
  landing/           # Hero, DiagnosisCards, HowItWorks — 현행 마크업 그대로 이식
  diagnosis/
    shared/          # QuestionnaireFrame, ResultCard, ShareButtons
    life-expectancy/ # questions.ts, calculator.ts, config.ts
    life-design/
    leisure-alter-ego/
  admin/
lib/
  supabase/          # client.ts, server.ts, queries.ts
  store/             # diagnosisStore.ts (Zustand)
  types/             # diagnosis.ts, supabase.ts, api.ts
  utils/             # token-generator.ts, pdf-generator.ts, validation.ts
styles/
  theme.css          # 기존 색상/폰트/간격을 변수로 추출
supabase/
  migrations/0001_init.sql
```

## 6. 마이그레이션 원칙 (디자인 보존)

- `second-life-design-v2.html`의 `<style>` 블록을 그대로 `styles/theme.css` + 컴포넌트별 CSS Module로 분해한다.
  클래스명(`hero`, `diag-card`, `feat-icon` 등)은 최대한 유지해 시각적 diff가 없도록 한다.
- 인라인 SVG/이미지는 `public/` 아래 정적 파일로 추출한다 (현재 1개의 매우 큰 base64 이미지가 히어로에 있음 — 반드시 별도 이미지 파일로 분리해 페이지 용량을 줄인다. 이 부분이 유일하게 "보이지 않는 곳에서" 성능이 개선되는 지점).
- 진단 3개의 질문/문구/결과 해석 텍스트는 원본 그대로 옮기고, 로직만 `calculator.ts`로 분리한다.
