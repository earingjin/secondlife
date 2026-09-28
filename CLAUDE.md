# CLAUDE.md

이 프로젝트를 작업할 때는 반드시 `docs/spec/00-overview.md`부터 `01`, `02`, `03` 순서로
읽고 그 스펙을 따를 것.

랜딩의 디자인/마크업/카피는 `docs/reference/second-life-design-v2.html`을 기준으로 하고,
진단 화면은 저장소 루트의 `expectancy-*`, `lifedesign-*`, `persona-*` 6개 HTML을
UI/UX Source of Truth로 사용해 임의로 변경하지 말 것. 색상·폰트·간격 값도 해당 원본에서 옮길 것.

구현 순서는 `docs/spec/01-component-spec.md` 8절을 따를 것. 현재 진행 상태:

- [ ] 1. 진단별 타입 재정의 (`lib/types/diagnosis.ts`, `lib/types/supabase.ts`) — 현재 단일 Answer/Result 타입은 폐기 예정
- [x] 라우팅 구조 + 슬러그 검증 (`app/diagnosis/[type]/page.tsx`, `lib/constants/diagnosis-config.ts`)
- [x] 디자인 토큰 (`styles/theme.css`, `app/globals.css`)
- [ ] Zustand 스토어 재설계 (`lib/store/diagnosisStore.ts`) — 현재 단일 Answer 구조와 localStorage 정책 재검토 필요
- [ ] 2. `components/ui/*` — 원본 CSS에서 Button/Card/Badge/ProgressBar/EmojiIcon 추출
- [ ] 3. `components/landing/*` — 랜딩 실제 마크업 이식 (지금 `app/page.tsx`는 임시 스텁)
- [ ] 5. `components/diagnosis/shared/*`
- [ ] 6. 기대수명 진단 파일럿 (이후 진단별 고유 모델로 각각 구현; 단순 복제 금지)
- [ ] 8. Supabase 연동 — 저장 정책 기획 결정 전 보류, `0001_init.sql`은 미확정 초안
- [ ] 9. `components/admin/*`, `app/admin/*`

각 TODO는 관련 파일 상단 주석에도 표시되어 있으니 파일을 열어보면 무엇을 채워야 하는지 바로 알 수 있다.

작업 중 스펙과 다르게 구현해야 할 이유가 생기면(예: 특정 Next.js 15 API 제약) 임의로 넘어가지 말고
`docs/spec/` 문서를 함께 갱신할 것.
