# API 스펙

모든 엔드포인트는 Next.js Route Handler(`app/api/**/route.ts`)로 구현. 응답은 JSON, 에러는 `{ error: { code, message } }` 형식으로 통일.

---

## POST /api/diagnosis/submit

진단 완료 후 결과 저장, 조회 토큰 발급.

**Request Body**
```json
{
  "nickname": "별빛여행자",
  "diagnosisType": "life-expectancy",
  "answers": [{ "questionId": "q1", "value": 3 }],
  "result": { "score": 87, "interpretation": "...", "detail": {} }
}
```

**검증 규칙**
- `nickname`: 2~20자, 한글/영문/숫자만, 욕설·특수문자 필터링 (간단한 blocklist)
- `diagnosisType`: `life-expectancy | life-design | leisure-alter-ego` 중 하나 아니면 400
- `answers`: 배열, 최소 문항 수 충족 여부 검증
- Rate limit: 동일 IP 기준 1분당 10회 (Supabase Edge Function 또는 미들웨어에서 처리)

**Response 201**
```json
{
  "token": "3f9a1c2e-...",
  "shareUrl": "/result/life-expectancy/3f9a1c2e-..."
}
```

**서버 처리**
1. 입력 검증 (Zod 스키마)
2. `diagnosis_results`에 INSERT (service role key 사용, 서버에서만)
3. `request_logs`에 IP/User-Agent 기록
4. 토큰 반환

---

## GET /api/result/[token]

결과 재조회 (공유 링크용). 인증 불필요, 토큰만 알면 조회 가능 — **단, 토큰은 UUID라 추측 불가능하므로 사실상 비공개**.

**Response 200**
```json
{
  "nickname": "별빛여행자",
  "diagnosisType": "life-expectancy",
  "result": { "score": 87, "interpretation": "...", "detail": {} },
  "createdAt": "2026-09-18T10:00:00Z"
}
```

**Response 404** — 토큰이 존재하지 않을 때 (오타/삭제된 결과)

---

## GET /api/admin/results

관리자 대시보드 목록 조회. **admin 세션 필수** (Supabase Auth 쿠키 검증).

**Query Params**
- `nickname` (부분 일치 검색)
- `type` (`life-expectancy` 등)
- `from`, `to` (ISO 날짜)
- `page`, `pageSize` (기본 20)

**Response 200**
```json
{
  "items": [
    {
      "id": "uuid",
      "nickname": "별빛여행자",
      "diagnosisType": "life-expectancy",
      "createdAt": "2026-09-18T10:00:00Z"
    }
  ],
  "total": 132,
  "page": 1,
  "pageSize": 20
}
```

---

## GET /api/admin/[resultId]/pdf

PDF 생성 및 다운로드. **admin 세션 필수**.

**처리 흐름**
1. 세션의 admin role 검증
2. `diagnosis_results`에서 `resultId`로 조회
3. `@react-pdf/renderer`로 결과 데이터를 PDF 리포트 템플릿에 주입, 렌더링
4. `admin_audit_logs`에 `{ adminId, resultId, action: 'pdf_download', timestamp }` 기록
5. `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="{nickname}_{type}_{date}.pdf"`로 스트리밍 응답

---

## POST /api/admin/login

Supabase Auth의 `signInWithPassword`를 감싸는 얇은 래퍼 (또는 클라이언트에서 Supabase Auth SDK 직접 사용도 가능 — 에이전트 재량).

---

## 공통 에러 코드

| code | 상황 |
|---|---|
| `INVALID_INPUT` | 검증 실패 |
| `RATE_LIMITED` | 요청 과다 |
| `NOT_FOUND` | 토큰/결과 없음 |
| `UNAUTHORIZED` | 관리자 세션 없음 |
| `FORBIDDEN` | admin role 아님 |
