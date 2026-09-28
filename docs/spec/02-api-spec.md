# API 스펙

## 1. 원칙

모든 진단 계산은 Next.js Route Handler 또는 동등한 서버 경계에서 수행한다. 클라이언트는 진단 타입과 원시 응답만 보내며 계산된 점수, 유형, 해석을 신뢰 입력으로 보내지 않는다. 서버는 진단별 스키마로 문항 수, question id, option id/척도, 중복·누락, 기본정보 범위를 검증한다.

계산 모듈은 `server-only`이며 Client Component에서 직접 또는 공용 barrel을 통해 import할 수 없어야 한다.

## 2. POST `/api/diagnosis/evaluate`

저장과 분리된 필수 평가 endpoint다. 저장 정책과 무관하게 사용할 수 있다.

### 요청

진단별 discriminated union이다.

```json
{
  "diagnosisType": "life-design",
  "answers": [
    { "questionId": "1", "satisfaction": 8, "importance": 10 }
  ]
}
```

기대수명은 `profile: { gender, birthYear }`와 25개 `{ questionId, optionId }`, 생애설계는 30개 만족도/중요도 쌍, 여가 부캐는 40개 1~5 응답을 보낸다. 기대수명 요청에 delta, weight, k 또는 기준수명을 받지 않는다.

### 응답 200

`DiagnosisResult` union 중 요청 타입과 일치하는 결과를 반환한다. UI에 필요한 결과 콘텐츠는 포함하되 보호 대상 계산 규칙 전체를 반환하지 않는다.

```json
{
  "result": {
    "type": "life-design",
    "totalSatisfaction": 214,
    "domains": [],
    "priorityDomains": ["health", "finance"],
    "strongestDomain": "rel"
  }
}
```

### 서버 처리

1. body 크기 제한과 JSON 파싱
2. `diagnosisType`별 Zod schema 선택
3. 정확한 문항 집합, 응답 개수, 값 범위 및 중복 검증
4. 타입별 서버 calculator 실행
5. 해당 타입의 result schema로 출력 재검증
6. 결과 반환

사용자가 같은 유효 입력을 반복하면 같은 결과를 받아야 한다.

## 3. POST `/api/diagnosis/preview`

기대수명 HTML의 문항별 실시간 예상 수명 표시를 유지하기 위한 endpoint다. 부분 응답을 허용하되 profile은 필수이며 제출된 option id만 서버가 해석한다. 응답은 `{ expectedAge: number }`처럼 최소화한다.

- debounce하고 이전 요청을 취소한다.
- evaluate보다 엄격한 IP/session rate limit을 적용한다.
- 서버 cache에 사용자 원문 응답을 영구 저장하지 않는다.
- preview와 최종 evaluate가 같은 calculator primitive를 사용해 값이 어긋나지 않게 한다.

## 4. 오류 형식

```json
{ "error": { "code": "INVALID_INPUT", "message": "..." } }
```

| code | HTTP | 상황 |
|---|---:|---|
| `INVALID_INPUT` | 400 | 타입, 문항 집합, 응답 값 또는 기본정보 오류 |
| `INCOMPLETE_ANSWERS` | 422 | 최종 평가의 누락 응답 |
| `RATE_LIMITED` | 429 | 평가/미리보기 호출 과다 |
| `NOT_FOUND` | 404 | 저장 결과 토큰 없음(저장 기능 채택 시) |
| `UNAUTHORIZED` | 401 | 관리자 세션 없음 |
| `FORBIDDEN` | 403 | 관리자 권한 없음 |
| `INTERNAL_ERROR` | 500 | 계산/서버 오류. 내부 규칙은 메시지에 노출하지 않음 |

## 5. [기획 결정 필요] 저장 API

기존 `POST /api/diagnosis/submit`은 nickname, answers, client result를 받아 모두 저장하도록 되어 있으나 현재 상태로 구현하지 않는다. 저장 정책이 확정되면 다음 중 결정된 데이터만 받는 별도 endpoint로 설계한다.

- 원문 응답 저장 여부 및 보존기간
- 서버가 계산한 결과 저장 여부
- 닉네임 입력/필수 여부
- access token 결과 공유 여부
- IP/User-Agent 수집·보존·고지

저장을 채택하더라도 client result는 받지 않고 서버가 evaluate한 결과를 저장한다. 평가와 저장을 한 트랜잭션/요청으로 합칠지는 정책 확정 후 정한다.

다음 endpoint도 저장 정책에 종속되어 구현 보류다.

- `GET /api/result/[token]`
- `GET /api/admin/results`
- `GET /api/admin/[resultId]/pdf`
- 관리자 audit log 기록

## 6. 현재 Supabase 초안 검토

`supabase/migrations/0001_init.sql`과 `lib/types/supabase.ts`는 아래를 전제한다.

- nickname 필수
- answers/result 영구 JSON 저장
- IP/User-Agent 저장
- 관리자 전체 조회
- 토큰 결과 재조회

이는 HTML 고지와 충돌하므로 migration을 아직 확정/적용하지 않는다. 정책 결정 후 nullable/컬럼 삭제, 보존기간·삭제 작업, RLS, 관리자 범위, 감사 로그를 함께 재설계하고 생성 타입을 갱신한다. 또한 기존 API 문서가 언급한 `request_logs` 테이블은 migration에 존재하지 않았으므로 별도 결정 없이 전제하지 않는다.
