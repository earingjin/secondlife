# 세컨라이프 디자인 — 구현 스펙 패키지

VS Code에서 Claude Code / Codex로 실제 구현할 때 참조할 문서 세트입니다.

## 파일 구성

1. `00-overview.md` — 프로젝트 목표, 확정 요구사항, 기술 스택, URL 맵, 디렉터리 구조
2. `01-component-spec.md` — 컴포넌트별 props/state/책임, 구현 순서
3. `02-api-spec.md` — API 엔드포인트 요청/응답 스펙
4. `supabase/migrations/0001_init.sql` — DB 스키마, RLS 정책
5. `03-testing-strategy.md` — 테스트 우선순위와 범위

## 사용 방법 (Claude Code / Codex 핸드오프)

1. 이 폴더를 새 Next.js 프로젝트의 `docs/spec/` 아래에 그대로 넣습니다.
2. 원본 `second-life-design-v2.html` 파일도 프로젝트 루트(예: `docs/reference/`)에 함께 둡니다 —
   구현 에이전트가 실제 마크업/CSS/카피를 그대로 옮길 때 원본 소스가 필요합니다.
3. Claude Code에서는 프로젝트 루트에 `CLAUDE.md`를 만들어 아래처럼 안내해두면 매번 다시 설명할 필요가 없습니다:

   ```markdown
   # CLAUDE.md
   이 프로젝트를 작업할 때는 반드시 docs/spec/00-overview.md 부터
   01, 02, 03 순서로 읽고 그 스펙을 따를 것.
   디자인/마크업/카피는 docs/reference/second-life-design-v2.html을 그대로 이식하고
   임의로 변경하지 말 것. 구현 순서는 01-component-spec.md 8절을 따를 것.
   ```

4. Codex를 쓸 경우에도 동일하게 첫 프롬프트에서 `docs/spec/00-overview.md`부터 읽게 지시하세요.
5. 구현 순서는 `01-component-spec.md` 8절(타입 → UI → 랜딩 → 상태관리 → 진단 shared →
   진단 1개 파일럿 → 라우팅 → Supabase 연동 → 관리자) 그대로 따르는 것을 권장합니다 —
   초반에 디자인 회귀가 없는지 확인하고 넘어가야 뒤에서 되돌아가는 일이 없습니다.

## 구현 중 재확인이 필요한 지점

- `admin_app_meta_data`에 `user_role: admin`을 부여하는 방법은 Supabase 프로젝트의
  Custom Access Token Hook 설정에 따라 달라질 수 있습니다 (`0001_init.sql` 하단 주석 참고).
- PDF 템플릿의 실제 레이아웃(로고, 색상 등)은 별도 디자인 확정이 필요합니다 — 이 스펙에는
  데이터 구조와 생성 파이프라인만 정의되어 있고 PDF 자체의 비주얼 디자인은 포함되어 있지 않습니다.
- Rate limiting 구현 방식(미들웨어 vs Supabase Edge Function vs Vercel의 자체 기능)은
  실제 배포 환경(Vercel plan)에 따라 에이전트가 선택하도록 열어두었습니다.
