-- =========================================================
-- 可能性ラボ｜候補者プロファイル — 初期スキーマ
-- 3テーブル: candidates / appointments / form_config
-- 認証済みユーザは全件CRUD（チーム共有）。匿名はブロック。
-- =========================================================

-- updated_at 自動更新トリガ関数
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- candidates ----------
create table if not exists candidates (
  id                uuid primary key default gen_random_uuid(),
  reservation_token text unique default encode(gen_random_bytes(16), 'hex'),
  name              text not null default '',
  phone             text not null default '',
  exp               text not null default 'なし',
  age               text not null default '',
  job               text not null default '',
  loc               text not null default '',
  seg               text not null default 'career' check (seg in ('career', 'newgrad')),
  stage             text not null default '無料体験予約'
                      check (stage in ('無料体験予約', '体験完了', 'コーチング中', '完了', '見送り')),
  src               text not null default '',
  date              date,
  coach             text not null default '',
  i1                jsonb not null default '{}'::jsonb,
  i2                jsonb not null default '{}'::jsonb,
  test              jsonb not null default '{}'::jsonb,
  asmt              jsonb not null default '{}'::jsonb,
  place             jsonb not null default '{}'::jsonb,
  coaching          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_candidates_updated on candidates;
create trigger trg_candidates_updated before update on candidates
  for each row execute function set_updated_at();

-- ---------- appointments ----------
create table if not exists appointments (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  name         text not null default '',
  type         text not null default 'first' check (type in ('first', 'second')),
  coach        text not null default '',
  at           timestamptz not null,
  status       text not null default '予定' check (status in ('予定', '完了', 'キャンセル')),
  source       text not null default 'manual' check (source in ('form', 'manual')),
  memo         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_appointments_candidate on appointments(candidate_id);
create index if not exists idx_appointments_at on appointments(at);

drop trigger if exists trg_appointments_updated on appointments;
create trigger trg_appointments_updated before update on appointments
  for each row execute function set_updated_at();

-- ---------- form_config（単一行 id=1） ----------
create table if not exists form_config (
  id         int primary key default 1 check (id = 1),
  fields     jsonb not null,
  slots      jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_form_config_updated on form_config;
create trigger trg_form_config_updated before update on form_config
  for each row execute function set_updated_at();

-- =========================================================
-- RLS — 認証済みユーザは全件CRUD（社内チーム共有）
-- 外部フォーム受信(form-webhook)は service_role で RLS をバイパス
-- =========================================================
alter table candidates  enable row level security;
alter table appointments enable row level security;
alter table form_config  enable row level security;

create policy "authenticated full access" on candidates
  for all to authenticated using (true) with check (true);
create policy "authenticated full access" on appointments
  for all to authenticated using (true) with check (true);
create policy "authenticated full access" on form_config
  for all to authenticated using (true) with check (true);
