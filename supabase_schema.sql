-- Supabase SQL Editor에서 실행하세요

-- 1. guests 테이블 생성
create table public.guests (
  id uuid not null default gen_random_uuid (),
  envelope_number integer null,
  name text not null,
  amount integer not null default 0,
  meal_tickets integer not null default 0,
  message text null,
  timestamp timestamp with time zone not null default now(),
  constraint guests_pkey primary key (id)
);

-- 2. RLS(Row Level Security) 설정 (모든 접근 허용)
-- 실제 배포 시에는 더 엄격한 정책을 권장하지만, 현재 요구사항(팀원 공용)에 맞춰 개방합니다.
alter table public.guests enable row level security;

create policy "Enable read access for all users" on public.guests
  for select using (true);

create policy "Enable insert access for all users" on public.guests
  for insert with check (true);

create policy "Enable update access for all users" on public.guests
  for update using (true);

create policy "Enable delete access for all users" on public.guests
  for delete using (true);

-- 3. 실시간 구독 활성화
alter publication supabase_realtime add table public.guests;
