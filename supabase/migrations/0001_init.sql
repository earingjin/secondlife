-- 세컨라이프 디자인 서비스 — 초기 스키마
-- Supabase CLI로 적용: supabase migration up (또는 MCP의 apply_migration 사용)

-- =========================================
-- 1. diagnosis_results: 진단 결과 저장
-- =========================================
create table if not exists diagnosis_results (
  id uuid primary key default gen_random_uuid(),

  -- 사용자 식별 (PII 없음)
  nickname varchar(20) not null,
  access_token uuid unique not null default gen_random_uuid(),

  -- 진단 정보
  diagnosis_type varchar(30) not null
    check (diagnosis_type in ('life-expectancy', 'life-design', 'leisure-alter-ego')),
  answers_json jsonb not null,
  result_json jsonb not null,

  -- 요청 메타 (감사·부정사용 방지 용도, PII 아님)
  ip_address inet,
  user_agent text,

  created_at timestamptz not null default now()
);

create index if not exists idx_diagnosis_results_token on diagnosis_results (access_token);
create index if not exists idx_diagnosis_results_type on diagnosis_results (diagnosis_type);
create index if not exists idx_diagnosis_results_created on diagnosis_results (created_at desc);
create index if not exists idx_diagnosis_results_nickname on diagnosis_results (nickname);

alter table diagnosis_results enable row level security;

-- 익명 사용자: 결과 생성(INSERT)만 가능
create policy "anon_insert_diagnosis_result"
  on diagnosis_results
  for insert
  to anon
  with check (true);

-- 익명 사용자: SELECT는 애플리케이션 서버(GET /api/result/[token])에서
-- service role key로만 수행하고, 클라이언트에는 anon select 정책을 부여하지 않는다.
-- (토큰 기반 조회는 반드시 서버를 경유하도록 강제해 토큰 무차별 대입을 방지)

-- admin: 전체 조회 가능
create policy "admin_select_all_results"
  on diagnosis_results
  for select
  to authenticated
  using ((auth.jwt() ->> 'user_role') = 'admin');

-- admin: 삭제/수정 필요 시(오탈자 정정 등)
create policy "admin_update_results"
  on diagnosis_results
  for update
  to authenticated
  using ((auth.jwt() ->> 'user_role') = 'admin');

-- =========================================
-- 2. admin_audit_logs: 관리자 조회/다운로드 이력
-- =========================================
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id),
  result_id uuid references diagnosis_results(id) on delete set null,
  action varchar(30) not null check (action in ('view', 'pdf_download', 'export')),
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_admin on admin_audit_logs (admin_id);
create index if not exists idx_audit_logs_result on admin_audit_logs (result_id);

alter table admin_audit_logs enable row level security;

create policy "admin_insert_audit_log"
  on admin_audit_logs
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'user_role') = 'admin');

create policy "admin_select_audit_log"
  on admin_audit_logs
  for select
  to authenticated
  using ((auth.jwt() ->> 'user_role') = 'admin');

-- =========================================
-- 3. admin 역할 부여 방법 (참고용 — 실행은 Supabase 대시보드에서)
-- =========================================
-- Supabase Auth 사용자에게 커스텀 클레임(user_role = 'admin')을 부여하려면
-- Auth Hook(Custom Access Token Hook) 또는 raw_app_meta_data를 사용한다.
-- 예:
-- update auth.users
-- set raw_app_meta_data = raw_app_meta_data || '{"user_role": "admin"}'::jsonb
-- where email = 'admin@jmcareer.co.kr';
--
-- 이후 JWT의 auth.jwt() ->> 'user_role' 로 참조 가능하도록
-- Custom Access Token Hook을 Supabase 대시보드(Authentication > Hooks)에서 설정해야 함.
