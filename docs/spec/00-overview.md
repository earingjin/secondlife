# 세컨라이프 디자인 — 프로젝트 개요

> 이 문서 세트는 정적 진단 HTML을 Next.js 15로 이식하기 위한 구현 명세다.
> UI/UX의 최종 기준은 저장소 루트의 6개 진단 HTML이며, 문서와 HTML이 충돌하면 HTML을 우선한다.

## 1. 목표와 범위

다음 원본을 시각·카피·행동의 기준으로 삼아 Next.js 15 + Supabase 구조로 재구성한다.

- 기대수명: `expectancy-intro.html`, `expectancy-quiz.html`
- 생애설계: `lifedesign-intro.html`, `lifedesign-quiz.html`
- 여가 부캐: `persona-intro.html`, `persona-quiz.html`
- 랜딩 참고본: `docs/reference/second-life-design-v2.html`

색상, 레이아웃, 반응형 동작, 사용자에게 보이는 카피, 질문/선택지, 결과 구성과 기본 인터랙션을 임의로 개선하거나 세 진단을 한 디자인으로 통일하지 않는다. 공통화는 실제로 동일한 진행 제어·API 경계·표현 패턴에만 적용한다.

## 2. 확인된 사실과 기존 가정

### HTML에서 확인된 사실

- 모든 진단은 `Intro → Quiz → Result` 흐름을 가진다. Intro도 서비스 화면이다.
- 기대수명은 기본정보(성별, 출생연도)와 25문항을 사용하며 단순 합산 점수가 아니다.
- 생애설계는 30문항 각각에 만족도와 중요도 두 응답이 필요하다.
- 여가 부캐는 40문항을 Part 1/2로 나누고, 핵심 가치와 선호 감각환경의 5×5 조합으로 결과를 만든다.
- 각 Intro는 답변이 결과 계산에만 사용되고 별도로 저장되지 않는다고 안내한다.
- Quiz HTML은 결과, 인쇄/PDF 저장, 요약 미리보기, 공유 카드, 다른 진단 이동 UI를 포함한다.

### 폐기하거나 보류한 기존 가정

- `Question`, `Answer`, `DiagnosisResult` 하나로 세 진단을 표현할 수 있다는 가정은 폐기한다.
- 세 진단이 같은 `questions.ts + calculator.ts + config.ts` 클라이언트 모듈을 복제하면 된다는 가정은 폐기한다.
- `/diagnosis/[type]`가 곧바로 첫 질문을 보여준다는 가정은 폐기한다. 해당 URL은 Intro를 보여준다.
- 클라이언트가 계산한 `result`를 서버에 보내 저장한다는 API는 보안 요구와 맞지 않으므로 폐기한다.
- Supabase에 닉네임·원문 응답·결과를 항상 저장하고 관리자가 조회한다는 정책은 Intro 고지와 충돌하므로 확정 요구사항이 아니다.

## 3. 사용자 흐름과 URL

기본 흐름은 `랜딩 → 진단별 Intro → Quiz → Result`다.

| URL | 화면 | 비고 |
|---|---|---|
| `/` | 랜딩 | 공개 |
| `/diagnosis/life-expectancy` | 기대수명 Intro | 직접 접근 시에도 Intro부터 시작 |
| `/diagnosis/life-expectancy/quiz` | 기대수명 Quiz | 완료 후 Result 표시/이동 |
| `/diagnosis/life-design` | 생애설계 Intro | 직접 접근 시에도 Intro부터 시작 |
| `/diagnosis/life-design/quiz` | 생애설계 Quiz | 완료 후 Result 표시/이동 |
| `/diagnosis/leisure-alter-ego` | 여가 부캐 Intro | 직접 접근 시에도 Intro부터 시작 |
| `/diagnosis/leisure-alter-ego/quiz` | 여가 부캐 Quiz | 완료 후 Result 표시/이동 |
| `/result/[type]/[token]` | 저장된 결과 재조회/공유 | 저장 정책 확정 시에만 사용 |
| `/admin/**` | 관리자 기능 | 저장 정책 확정 전 구현 보류 |

Result를 Quiz 내부 상태로 표시할지 별도 비토큰 URL로 이동할지는 라우팅 구현 세부사항이다. 어느 방식을 택해도 HTML의 완료 직후 결과 화면과 뒤로가기/재시작 동작을 동일하게 재현해야 한다.

## 4. 기술 및 보안 원칙

| 레이어 | 방향 |
|---|---|
| 프레임워크 | Next.js 15 App Router + React 19 |
| 스타일 | HTML CSS를 CSS Modules/CSS 변수로 손실 없이 이식 |
| 진행 상태 | 진단별 discriminated union을 사용하는 Zustand store |
| 계산 | Route Handler 또는 명시적인 서버 전용 모듈에서 수행 |
| 저장/Auth | Supabase. 단, 저장 정책 결정 후 확정 |
| PDF | HTML과 같은 결과 데이터를 사용하되 구현은 정책 결정 후 진행 |

브라우저는 화면, 질문과 선택지를 표시하고 원시 응답을 서버에 보낸다. 서버는 검증 후 진단별 계산을 실행하고 계산된 결과만 반환한다. 다음 항목은 `server-only` 경계 안에 두며 Client Component가 import할 수 있는 배럴 파일에서도 재수출하지 않는다.

- 점수 가중치와 보정계수
- 기대수명 기준 데이터와 최종 산식
- factor 집계 및 순위/동점 규칙
- 유형 판정 조건과 5×5 결과 매핑
- 보호할 필요가 있는 결과 해석 매핑

파일 이름이 `calculator.ts`라는 이유만으로 서버 코드가 되지 않는다. `import 'server-only'`, 서버 전용 디렉터리, Route Handler/Server Action의 단방향 import로 번들 경계를 검증한다.

## 5. 권장 디렉터리 구조

```text
app/
  diagnosis/[type]/page.tsx          # Intro
  diagnosis/[type]/quiz/page.tsx     # Quiz
  api/diagnosis/evaluate/route.ts    # 검증 + 서버 계산
  result/[type]/[token]/page.tsx     # 저장 정책 확정 시
components/
  diagnosis/shared/                  # 실제 공통 진행/표현 컴포넌트만
features/diagnosis/
  expectancy/
    ui/
    model/                            # 공개 질문/응답 타입
    server/                           # 기준값, 계산, 판정(server-only)
  life-design/
    ui/
    model/
    server/
  persona/
    ui/
    model/
    server/
lib/
  store/
  types/
supabase/migrations/
```

현재 파일을 이 문서 구조에 맞추기 위한 대규모 이동은 각 진단 이식 시 필요한 범위에서만 한다.

## 6. [기획 결정 필요] 진단 응답 및 결과 저장 정책

Intro의 “결과 계산에만 사용되고 저장되지 않습니다” 문구와 기존 DB/API의 영구 저장 설계가 충돌한다. 문구나 저장 행위를 임의로 바꾸지 말고 아래를 함께 결정하기 전에는 Supabase 연동, 관리자 결과 조회, 토큰 공유를 확정하지 않는다.

| 항목 | 현재 HTML 고지 | 기존 스펙/마이그레이션 | 결정할 내용 |
|---|---|---|---|
| 원문 응답 | 저장하지 않는다고 안내 | `answers_json not null` | 저장 여부, 보존기간, 삭제 기준 |
| 계산 결과 | 저장하지 않는다고 읽힘 | `result_json not null` | 저장 여부와 재조회 목적 |
| 닉네임 | 입력 UI 없음 | `nickname not null` | 수집 필요성, 입력 시점, 필수 여부 |
| 관리자 조회 | 안내 없음 | 전체 결과 조회 | 조회 범위, 권한, 감사 로그 |
| PDF | 브라우저 인쇄 저장 제공 | 서버 저장 결과로 관리자 PDF | 사용자 로컬 PDF/관리자 PDF 구분과 필요 데이터 |
| 메타데이터 | 안내 없음 | IP, User-Agent 저장 | 개인정보 해당 여부, 고지, 보존기간 |
| 공유 | 이미지/링크 공유 UI | 토큰 기반 저장 결과 공유 | 링크가 결과를 포함하는지 랜딩만 공유하는지 |

결정 후 Intro 고지와 실제 처리, 개인정보 처리방침, DB nullability/RLS/API를 동시에 맞춘다. 현재 `supabase/migrations/0001_init.sql`은 적용 대상 확정본이 아니라 기존 가정의 초안이다.
