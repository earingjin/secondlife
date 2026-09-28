# 세컨라이프 디자인 — 구현 스펙 패키지

VS Code에서 Claude Code / Codex로 실제 구현할 때 참조할 문서 세트입니다.

## 파일 구성

1. `00-overview.md` — HTML 기준, 사용자 흐름, 서버 계산 원칙, 저장 정책 결정사항
2. `01-component-spec.md` — 진단별 answer/result 타입과 실제 계산 규칙
3. `02-api-spec.md` — 서버 평가 API와 보안 경계, 저장 API 보류사항
4. `03-testing-strategy.md` — 진단별 계산·UI·보안 회귀 테스트
5. `supabase/migrations/0001_init.sql` — 저장 정책 결정 전까지 적용하지 않는 기존 초안

## 사용 방법 (Claude Code / Codex 핸드오프)

1. 이 폴더를 새 Next.js 프로젝트의 `docs/spec/` 아래에 그대로 넣습니다.
2. 랜딩은 `docs/reference/second-life-design-v2.html`, 진단은 저장소 루트의 6개 Intro/Quiz HTML을 함께 둡니다.
   진단 HTML이 각 진단의 UI/UX와 계산 동작의 최종 기준입니다.
3. Claude Code에서는 프로젝트 루트에 `CLAUDE.md`를 만들어 아래처럼 안내해두면 매번 다시 설명할 필요가 없습니다:

   ```markdown
   # CLAUDE.md
   이 프로젝트를 작업할 때는 반드시 docs/spec/00-overview.md 부터
   01, 02, 03 순서로 읽고 그 스펙을 따를 것.
   랜딩은 docs/reference/second-life-design-v2.html, 진단은 루트의 6개 진단 HTML을
   그대로 이식하고 임의로 변경하지 말 것. 구현 순서는 01-component-spec.md 8절을 따를 것.
   ```

4. Codex를 쓸 경우에도 동일하게 첫 프롬프트에서 `docs/spec/00-overview.md`부터 읽게 지시하세요.
5. 구현 순서는 `01-component-spec.md` 8절을 따릅니다. 먼저 저장 정책과 타입/API 경계를 확정하고,
   기대수명을 파일럿으로 이식한 뒤 시각·계산 회귀를 확인합니다.

## 구현 중 재확인이 필요한 지점

- 원문 응답, 계산 결과, 닉네임, 요청 메타데이터의 저장 여부와 관리자 조회 범위를 먼저 결정해야 합니다.
- 저장 정책 결정 전에는 `0001_init.sql`, 관리자 조회, 토큰 결과 공유, 서버 PDF를 구현하지 않습니다.
- 사용자 PDF는 현재 HTML의 브라우저 인쇄 동작을 기준으로 하며, 관리자 PDF는 별도 정책 결정 대상입니다.
- Rate limiting 구현 방식(미들웨어 vs Supabase Edge Function vs Vercel의 자체 기능)은
  실제 배포 환경(Vercel plan)에 따라 에이전트가 선택하도록 열어두었습니다.
