# second-life-design (Phase 1 스캐폴드)

`node_modules`는 포함되어 있지 않습니다. 로컬(VS Code)에서 아래 순서로 실행하세요.

```bash
npm install
cp .env.local.example .env.local   # Supabase 값 채워넣기
npm run dev
```

`http://localhost:3000`에서 라우팅 배선을 확인할 수 있습니다:
- `/` — 진단 3개로 가는 링크 (임시 UI)
- `/diagnosis/life-expectancy`, `/diagnosis/life-design`, `/diagnosis/leisure-alter-ego` — 각각 접근 가능
- `/diagnosis/존재하지-않는-슬러그` — 404로 처리되는지 확인
- `/result/life-expectancy/아무토큰` — 임시 스텁 렌더링

## 지금까지 된 것 (Phase 1)

- Next.js 15 + TypeScript 프로젝트 골격
- 3개 진단의 URL 라우팅 구조 및 슬러그 검증 (`lib/constants/diagnosis-config.ts`)
- 원본 디자인 토큰(색상/폰트 변수) 그대로 추출 (`styles/theme.css`)
- 진단/Supabase 타입 정의 (`lib/types/`)
- Zustand 상태 스토어 뼈대, localStorage 진행상태 저장 (`lib/store/diagnosisStore.ts`)
- Supabase DB 마이그레이션 SQL (`supabase/migrations/0001_init.sql`) — 아직 실제 프로젝트에 적용 전

## 아직 안 된 것 (다음 단계)

- 랜딩/진단 실제 UI 이식 (지금은 임시 텍스트만 렌더링됨 — **디자인 미반영 상태**)
- 질문지 진행 흐름, 결과 계산 로직
- Supabase 연동 API (`/api/diagnosis/submit`, `/api/result/[token]`)
- 관리자 페이지, PDF 생성

자세한 내용과 구현 순서는 `CLAUDE.md`와 `docs/spec/` 문서를 참고하세요.
VS Code에서 Claude Code나 Codex로 이어서 작업할 때 이 두 가지를 먼저 읽게 하면 됩니다.

## 프로젝트 구조

```
app/                  # 라우트 (App Router)
components/ui/        # 비어있음 — 다음 단계에서 채울 디자인 시스템 컴포넌트
components/landing/   # 비어있음 — 다음 단계에서 채울 랜딩 섹션
lib/types/            # 타입 정의
lib/constants/        # 진단 설정(단일 소스)
lib/store/            # Zustand 스토어
styles/theme.css      # 원본에서 추출한 디자인 토큰
supabase/migrations/  # DB 스키마
docs/spec/            # 상세 기술 스펙 (구현 에이전트용)
docs/reference/       # 원본 정적 HTML (디자인 이식 시 원본 소스)
```
