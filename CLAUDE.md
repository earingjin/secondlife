# CLAUDE.md

이 프로젝트를 작업할 때는 반드시 `docs/spec/00-overview.md`부터 `01`, `02`, `03` 순서로
읽고 그 스펙을 따를 것.

디자인/마크업/카피는 `docs/reference/second-life-design-v2.html`을 그대로 이식하고
임의로 변경하지 말 것. 색상·폰트·간격 값은 `styles/theme.css`에 이미 원본에서 추출해뒀으니
새로 만들지 말고 그대로 참조할 것.

구현 순서는 `docs/spec/01-component-spec.md` 8절을 따를 것. 현재 진행 상태:

- [x] 1. 타입 정의 (`lib/types/diagnosis.ts`, `lib/types/supabase.ts`)
- [x] 라우팅 구조 + 슬러그 검증 (`app/diagnosis/[type]/page.tsx`, `lib/constants/diagnosis-config.ts`)
- [x] 디자인 토큰 (`styles/theme.css`, `app/globals.css`)
- [x] Zustand 스토어 뼈대 (`lib/store/diagnosisStore.ts`) — `submit()`은 아직 스텁
- [ ] 2. `components/ui/*` — 원본 CSS에서 Button/Card/Badge/ProgressBar/EmojiIcon 추출
- [ ] 3. `components/landing/*` — 랜딩 실제 마크업 이식 (지금 `app/page.tsx`는 임시 스텁)
- [ ] 5. `components/diagnosis/shared/*`
- [ ] 6. `components/diagnosis/life-expectancy/*` (파일럿, 이후 나머지 2개 복제)
- [ ] 8. Supabase 연동 (`supabase/migrations/0001_init.sql` 이미 작성됨 — 프로젝트에 적용 필요)
- [ ] 9. `components/admin/*`, `app/admin/*`

각 TODO는 관련 파일 상단 주석에도 표시되어 있으니 파일을 열어보면 무엇을 채워야 하는지 바로 알 수 있다.

작업 중 스펙과 다르게 구현해야 할 이유가 생기면(예: 특정 Next.js 15 API 제약) 임의로 넘어가지 말고
`docs/spec/` 문서를 함께 갱신할 것.
