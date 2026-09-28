# 컴포넌트 스펙

구현 에이전트는 각 컴포넌트를 아래 props/state/책임 범위에 맞춰 작성한다.
디자인(JSX 마크업, className)은 원본 HTML에서 그대로 옮기고, 여기서는 "구조/데이터 흐름"만 규정한다.

## 1. 공통 UI (`components/ui/`)

원본 HTML의 반복 패턴(`diag-card`, `diag-btn`, `feat-card`, `how-step` 등)에서 뽑아낸 순수 표현 컴포넌트.
비즈니스 로직 없음, 스타일/마크업만 담당.

| 컴포넌트 | Props | 비고 |
|---|---|---|
| `Button` | `variant: 'primary'\|'secondary'`, `href?`, `onClick?`, `children` | 원본의 `diag-btn`, `diag-btn-secondary` 통합 |
| `Card` | `variant: 'diagnosis'\|'feature'`, `children` | 원본의 `diag-card`, `feat-card` 통합 |
| `Badge` | `children` | 원본의 `diag-badge` |
| `ProgressBar` | `current: number`, `total: number` | 진단 진행률 표시 (신규 — 원본엔 없을 수 있음, 진단 페이지에서 필요) |
| `EmojiIcon` | `emoji: string`, `size?` | 원본의 `diag-emoji` |

## 2. 랜딩 (`components/landing/`)

원본 마크업을 섹션 단위로만 분리. 로직 없음.

- `Hero.tsx` — 히어로 영역 (`hero`, `hero-inner`, `hero-illust`, `blob` 등). 이미지 src는 `public/hero-illustration.png`로 교체.
- `DiagnosisCards.tsx` — 3개 진단 카드. 각 카드의 `href`를 아티팩트 외부 링크 대신 `/diagnosis/[type]`으로 교체 (**유일한 실제 기능 변경점**).
- `HowItWorks.tsx` — `how` 섹션 그대로.
- `Footer.tsx` — `footer-legal`, `footer-bottom` 그대로.

## 3. 진단 공통 (`components/diagnosis/shared/`)

| 컴포넌트 | Props | State | 책임 |
|---|---|---|---|
| `QuestionnaireFrame` | `type: DiagnosisType`, `questions: Question[]` | 없음 (상태는 store에서) | 질문 1개씩 렌더링, 다음/이전 버튼, `ProgressBar` 표시 |
| `QuestionCard` | `question: Question`, `selectedValue?`, `onAnswer: (value) => void` | 없음 | 단일 질문 UI |
| `ResultCard` | `type: DiagnosisType`, `result: DiagnosisResult` | 없음 | 점수/해석 표시, `ShareButtons` 포함 |
| `ShareButtons` | `shareUrl: string`, `title: string` | 없음 | 카카오톡/링크복사/이미지저장 등 |
| `RestartPrompt` | `onRestart: () => void`, `onResume: () => void` | 없음 | localStorage에 이전 답변 있을 때 "이어하기/처음부터" 선택 모달 |

## 4. 진단별 모듈 (`components/diagnosis/{life-expectancy,life-design,leisure-alter-ego}/`)

3개 진단 모두 동일한 파일 구성을 갖는다. 새 진단 타입 추가 시 이 3개 파일만 작성하면 되도록 설계.

```
questions.ts    # Question[] — 원본 HTML/기획서에 있던 문항 그대로
calculator.ts   # (answers: Answer[]) => DiagnosisResult
config.ts       # { type, label, slug, ogImage, resultInterpretations }
```

```typescript
// lib/types/diagnosis.ts
export type DiagnosisType = 'life-expectancy' | 'life-design' | 'leisure-alter-ego';

export interface Question {
  id: string;
  text: string;
  options: { label: string; value: number }[];
}

export interface Answer {
  questionId: string;
  value: number;
}

export interface DiagnosisResult {
  type: DiagnosisType;
  score: number;
  interpretation: string;
  detail?: Record<string, unknown>; // 진단별 부가 데이터 (예: 여가부캐 유형 이름)
}

export interface DiagnosisConfig {
  type: DiagnosisType;
  label: string;        // "기대수명 진단"
  slug: string;         // "life-expectancy"
  ogImage: string;
}
```

## 5. 동적 라우트 페이지 (`app/diagnosis/[type]/page.tsx`)

```typescript
// 의사코드 — 실제 구현 시 참고
export default function DiagnosisPage({ params }: { params: { type: string } }) {
  const config = getDiagnosisConfig(params.type); // null이면 notFound()
  if (!config) notFound();

  return (
    <DiagnosisRuntime config={config} />
    // DiagnosisRuntime 내부에서 store.reset(config.type) 후 QuestionnaireFrame 렌더링
    // 완료 시 submitDiagnosis() 호출 → 토큰 받아서 /result/[type]/[token]로 라우팅
  );
}
```

**핵심 규칙:** `params.type`이 3개 슬러그 중 하나가 아니면 반드시 `notFound()`로 404 처리 (임의 경로 접근 방지).

## 6. 상태관리 (`lib/store/diagnosisStore.ts`)

```typescript
interface DiagnosisState {
  type: DiagnosisType | null;
  currentIndex: number;
  answers: Answer[];
  result: DiagnosisResult | null;

  reset: (type: DiagnosisType) => void;      // localStorage[`diagnosis_${type}`]도 초기화
  answer: (a: Answer) => void;                // 진행 중 localStorage에 자동 저장 (이어하기용)
  restoreIfExists: (type: DiagnosisType) => Answer[] | null;
  submit: () => Promise<{ token: string; shareUrl: string }>;
}
```

- localStorage 키는 반드시 진단 타입을 포함(`diagnosis_life-expectancy` 등)해 3개 진단이 서로 섞이지 않게 한다.
- `submit()`은 `POST /api/diagnosis/submit`을 호출하고 성공 시 store를 리셋한다.

## 7. 관리자 (`components/admin/`)

| 컴포넌트 | 책임 |
|---|---|
| `AdminAuthGuard` | Supabase Auth 세션 체크, 없으면 `/admin/login`으로 리다이렉트, `role !== 'admin'`이면 접근 거부 |
| `ResultsTable` | 목록 렌더링, 페이지네이션 |
| `FilterBar` | 닉네임 검색 / 진단 타입 / 날짜 범위 필터 (쿼리스트링과 동기화) |
| `PdfDownloadButton` | `/admin/[resultId]/pdf` 호출, 로딩 상태 표시 |

## 8. 구현 순서 (에이전트 작업 순서 권장)

1. `lib/types/diagnosis.ts`, `lib/types/supabase.ts` — 타입 먼저
2. `components/ui/*` — 원본 CSS에서 추출
3. `components/landing/*` — 랜딩 이식 (기존 정적 HTML과 픽셀 단위 비교)
4. `lib/store/diagnosisStore.ts`
5. `components/diagnosis/shared/*`
6. `components/diagnosis/life-expectancy/*` (파일럿, 나머지 2개는 복제)
7. `app/diagnosis/[type]/page.tsx`, `app/result/[type]/[token]/page.tsx`
8. Supabase 연동 (`02-api-spec.md`, `supabase/migrations/0001_init.sql` 참조)
9. `components/admin/*`, `app/admin/*`
