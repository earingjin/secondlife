# 컴포넌트 및 진단 모델 스펙

## 1. 원본 보존 규칙

6개 진단 HTML의 DOM 구조, CSS, 모바일 미디어쿼리, 카피, 문항, 선택지, 자동 진행(선택 후 약 320ms), 이전/다음 제어, 진행률, 결과/공유/인쇄 구성을 기준으로 이식한다. 공통 컴포넌트가 원본 차이를 가리거나 새로운 UI를 만들면 공통화를 하지 않는다.

`ProgressBar`, Intro 카드, 질문 카드, 결과 카드도 “새 디자인”이 아니라 각 HTML의 실제 마크업과 스타일 변형을 보존하는 얇은 컴포넌트여야 한다.

## 2. 공통 경계

공통으로 둘 수 있는 것은 다음뿐이다.

- 진단 slug 검증과 `DiagnosisType`
- Intro/Quiz/Result 단계 식별
- 현재 문항 인덱스, 이전/다음, 완료 여부 같은 진행 인터페이스
- 서버 평가 요청의 envelope와 공통 오류 형식
- 접근성/키보드 동작을 해치지 않는 범위의 순수 UI primitive

질문/답변/결과 본문은 진단별 타입으로 유지한다. `QuestionnaireFrame<Question, Answer>` 같은 제네릭 껍데기는 가능하지만 `Question[]`, `{ questionId, value }[]`, `{ score, detail }`로 강제하지 않는다.

## 3. 타입 모델

아래는 구현 기준 예시다. 필드명은 조정할 수 있지만 동일한 불변식을 타입으로 보장해야 한다.

```ts
export type DiagnosisType =
  | 'life-expectancy'
  | 'life-design'
  | 'leisure-alter-ego';
export type DiagnosisPhase = 'intro' | 'quiz' | 'result';
export type Scale02 = 0 | 2 | 4 | 6 | 8 | 10;
export type Likert5 = 1 | 2 | 3 | 4 | 5;

export interface ExpectancyAnswers {
  type: 'life-expectancy';
  profile: { gender: 'male' | 'female'; birthYear: number };
  responses: Record<string, string>; // option id만 전송; delta/k는 서버에서 해석
}
export interface LifeDesignAnswer {
  questionId: string;
  satisfaction: Scale02;
  importance: Scale02;
}
export interface LifeDesignAnswers {
  type: 'life-design';
  responses: LifeDesignAnswer[];
}
export interface PersonaAnswer { questionId: string; value: Likert5 }
export interface PersonaAnswers {
  type: 'leisure-alter-ego';
  responses: PersonaAnswer[];
}
export type DiagnosisAnswers =
  | ExpectancyAnswers | LifeDesignAnswers | PersonaAnswers;
```

기대수명 선택지는 클라이언트가 가감점이나 `k`를 전송하지 않고 안정적인 option id를 전송한다. 서버가 해당 id를 원본 문항 정의의 보호된 값으로 변환한다.

```ts
export interface ExpectancyResult {
  type: 'life-expectancy';
  expectedAge: number;
  nationalAverage: number;
  difference: number;
  comparison: 'below' | 'at-or-above';
}
export type LifeDesignDomain =
  | 'career' | 'finance' | 'health' | 'rel' | 'leisure' | 'family';
export interface LifeDesignDomainResult {
  domain: LifeDesignDomain;
  satisfactionScore: number;      // 0..50
  satisfactionAverage: number;    // 0..10
  importanceAverage: number;      // 0..10
  gap: number;
}
export interface LifeDesignResult {
  type: 'life-design';
  totalSatisfaction: number;       // 0..300
  domains: LifeDesignDomainResult[];
  priorityDomains: LifeDesignDomain[];
  strongestDomain: LifeDesignDomain;
}
export type PersonaValue =
  | 'freedom' | 'variety' | 'connection' | 'achievement' | 'contribution';
export type PersonaSense = 'V' | 'A' | 'K' | 'OG' | 'Ad';
export interface PersonaFactorResult<K extends string> {
  factor: K;
  rawScore: number;                // 4..20
  normalizedScore: number;         // 0..100
}
export interface PersonaResult {
  type: 'leisure-alter-ego';
  values: PersonaFactorResult<PersonaValue>[];
  senses: PersonaFactorResult<PersonaSense>[];
  primaryValue: PersonaValue;
  secondaryValue: PersonaValue;
  primarySense: PersonaSense;
  secondarySense: PersonaSense;
  personaKey: `${PersonaValue}:${PersonaSense}`;
  personaName: string;
  activities: string[];
}
export type DiagnosisResult = ExpectancyResult | LifeDesignResult | PersonaResult;
```

현재 `lib/types/diagnosis.ts`, `lib/types/supabase.ts`, `lib/store/diagnosisStore.ts`의 단일 `Answer.value`/`DiagnosisResult.score` 구조는 이 모델을 표현하지 못한다. 이번 문서 작업에서는 코드를 바꾸지 않으며 파일럿 구현 첫 단계에서 마이그레이션한다.

## 4. 기대수명 진단

### 입력과 문항

- 기본정보: 성별 `male | female`, 출생연도 1930~2015
- 1~13, 17~22: Likert. 기본 delta는 `매우 그렇다 0.4`, `그렇다 0.2`, `보통 0`, `아니다 -0.2`, `전혀 아니다 -0.4`.
- 10번 복부둘레 문항만 weight 1.5를 곱해 `0.6, 0.3, 0, -0.3, -0.6`을 사용한다.
- 14번 흡연: 현재 흡연 -2.5 / 5년 이상 금연 0 / 평생 비흡연 +0.8.
- 15번 음주: 고위험 음주 -1.5 / 절주·비음주 +0.4.
- 16번 정기검진: 제때 수검 +0.8 / 미수검·미룸 -0.8.
- 23번 가족력: 있음 `k=0.9`, 없음 `1.0`.
- 24번 중증질환: 있음 `k=0.8`, 없음 `1.0`.
- 25번 만성질환: 2개 이상 `0.8`, 1개 `0.9`, 없음 `1.0`.

질문과 선택지의 표시 문구는 `expectancy-quiz.html`의 `QUESTIONS`, `K_QUESTIONS`를 그대로 사용한다.

### 기준값과 계산식

HTML은 현재연도를 상수 2026으로 사용한다.

```text
age = 2026 - birthYear
bracket = [40, 50, 60, 70, 80] 중 age와 절대차가 가장 작은 값
base = LIFE_TABLE[gender][bracket]
deltaSum = 1~22번 delta 합계
k = 23~25번 k 중 최솟값
expectedAge = base + deltaSum × k
표시값 = expectedAge를 소수점 첫째 자리로 반올림한 문자열
```

| 성별 | 40 | 50 | 60 | 70 | 80 |
|---|---:|---:|---:|---:|---:|
| 남성 | 81.0 | 81.5 | 83.4 | 85.5 | 88.5 |
| 여성 | 86.5 | 87.0 | 88.0 | 89.5 | 91.0 |

정확히 중간인 연령(45, 55, 65, 75)은 배열 순회에서 먼저 만난 낮은 bracket을 택한다. 40세 미만은 40, 80세 초과는 80으로 사실상 고정된다. 결과는 한국인 평균 83.7세와 비교하며 남성 80.8세, 여성 86.6세를 함께 표시한다. `expectedAge < 83.7`이면 below, 아니면 above UI를 사용한다.

보호 대상인 표, delta, weight, k, 비교/해석 규칙은 서버 전용이다. Quiz의 실시간 “현재 나의 예상 수명” 표시는 보호 원칙과 충돌하므로 **원본 UX를 유지하는 서버 preview 평가 API**로 제공하고, debounce/rate limit을 적용한다. 계산식을 클라이언트에 복제하지 않는다.

## 5. 생애설계 진단

- 30문항, 6영역, 영역당 연속된 5문항: career 1~5, finance 6~10, health 11~15, rel 16~20, leisure 21~25, family 26~30.
- 각 문항은 만족도와 중요도를 각각 `0, 2, 4, 6, 8, 10` 중 하나로 응답한다. 둘 다 선택해야 다음 문항으로 진행한다.
- 영역 만족도 점수 `satScore = 만족도 5개 합` (0~50).
- 영역 만족도 평균 `satAvg = satScore / 5`.
- 영역 중요도 평균 `impAvg = 중요도 5개 합 / 5`.
- 전체 만족도 `totalSat = 6개 satScore 합` (0~300).
- 미충족 gap `gap = impAvg - satAvg`.
- 우선순위는 gap 내림차순 상위 2개 중 `gap > 0.3`인 영역이다. 없으면 “전반적으로 균형” 결과를 표시한다.
- 가장 잘 채워진 영역은 `satScore` 최댓값이다.
- 동점은 HTML의 안정 정렬 및 원래 영역 순서를 따른다: `career → finance → health → rel → leisure → family`.
- 막대는 `satScore / 50`, 중요도 별표 위치는 `impAvg / 10` 비율이다. 레이더 표시 순서는 `finance → health → rel → family → leisure → career`다.

결과는 전체 만족도, 영역별 만족도/중요도, gap, 우선순위 최대 2개, strongest 영역, 원본 action tip을 표현한다.

## 6. 여가 부캐 진단

- 40문항, 모두 5점 척도: 매우 그렇다 5 / 그런 편이다 4 / 보통 3 / 그렇지 않은 편 2 / 전혀 그렇지 않다 1.
- Part 1(1~20): freedom 1~4, variety 5~8, connection 9~12, achievement 13~16, contribution 17~20.
- Part 2(21~40): V 21~24, A 25~28, K 29~32, OG 33~36, Ad 37~40.
- 현재 40개 문항은 모두 `reverse:false`다. 향후 reverse 문항을 임의로 추가하지 않는다.
- factor raw score는 해당 4문항 합(4~20).
- 환산점수는 `round((raw - 4) / 16 × 100)`이다.
- 각 Part에서 raw score 내림차순으로 1·2순위를 고른다.
- 동점은 원본 factor 순서를 우선한다. Part 1은 `freedom → variety → connection → achievement → contribution`, Part 2는 `V → A → K → OG → Ad`.
- 최종 유형은 `primaryValue × primarySense`의 25개 조합으로 `PERSONA_TABLE`의 유형명과 활동 목록을 선택한다.
- 결과에는 1·2순위 가치/감각, 10개 factor 점수, 조합 유형, 설명/특성/활동, 5×5 매트릭스를 포함한다.

질문, factor 설명, 25개 유형명과 추천 활동, 결과 피드백 카피는 `persona-quiz.html`을 그대로 옮긴다. factor-to-question 매핑, 순위 규칙, 조합표는 서버 전용이다.

## 7. 상태관리

store는 진단별 slice 또는 discriminated union을 사용한다. 공통 필드는 `type`, `phase`, `currentIndex`, `status`, `result` 정도로 제한하고 answers는 `DiagnosisAnswers`로 보관한다.

localStorage 기반 이어하기는 사용자의 기기에 원문 응답을 저장하는 행위다. Intro의 “저장되지 않습니다”와 의미가 충돌할 수 있으므로 저장 정책 결정 전에는 기본 요구사항으로 확정하지 않는다. 채택 시 기기 로컬 저장임을 고지하고 TTL·삭제 시점을 정한다.

## 8. 구현 순서

1. 저장 정책 기획 결정 및 고지 문구 정합성 확보
2. 진단별 타입과 서버 평가 contract 정의
3. 기대수명 서버 calculator/검증 테스트 작성
4. 기대수명 Intro → Quiz → Result UI 파일럿 이식
5. HTML과 데스크톱/모바일 시각·행동 회귀 비교
6. 나머지 두 진단을 각각의 모델로 이식
7. 저장/공유/관리자/PDF는 확정 정책에 맞춰 구현
