-- =========================================================
-- 0004: マイページ内容の管理（コーチ個別メッセージ / セクション表示制御 / お知らせ）
--   - candidates に mypage_message, mypage_layout を追加
--   - announcements テーブル（全員共通 candidate_id null ＋ 候補者個別）
--   - mypage_get を拡張（allowlist に mypageMessage/mypageLayout 追加）
--   - mypage_announcements(p_token) RPC を新設（token スコープ）
--   既存 0001〜0003 は変更しない。
-- =========================================================

-- ---------- (a) candidates に列追加 ----------
alter table candidates
  add column if not exists mypage_message text not null default '',
  add column if not exists mypage_layout jsonb not null default '{}'::jsonb;

-- ---------- (b) announcements テーブル ----------
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid null references candidates(id) on delete cascade,  -- null = 全員配信
  kind text not null default 'news' check (kind in ('news','service','campaign')),
  tag text not null default '',
  tone text not null default '',
  title text not null default '',
  lead text not null default '',
  body text not null default '',
  cta text not null default '',
  pinned boolean not null default false,
  active boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_announcements_candidate on announcements(candidate_id);
create index if not exists idx_announcements_active_pub on announcements(active, published_at desc);

drop trigger if exists trg_announcements_updated on announcements;
create trigger trg_announcements_updated
  before update on announcements
  for each row execute function set_updated_at();

-- RLS：内部（authenticated）はフルCRUD。anon は直接読めない（RPC経由のみ）。
alter table announcements enable row level security;
drop policy if exists "authenticated full access" on announcements;
create policy "authenticated full access" on announcements
  for all to authenticated using (true) with check (true);

-- ---------- (c) mypage_get を拡張（mypageMessage / mypageLayout を追加）----------
create or replace function mypage_get(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c candidates%rowtype;
  appts jsonb;
begin
  if p_token is null or length(p_token) < 8 then
    return null;
  end if;
  select * into c from candidates where reservation_token = p_token;
  if not found then
    return null;
  end if;
  select coalesce(jsonb_agg(to_jsonb(a) order by a.at), '[]'::jsonb)
    into appts
    from appointments a
    where a.candidate_id = c.id and a.status <> 'キャンセル';
  return jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'seg', c.seg,
    'job', c.job,
    'coach', c.coach,
    'stage', c.stage,
    'date', c.date,
    'test', c.test,
    'coaching', c.coaching,
    'appointments', appts,
    'mypageMessage', c.mypage_message,
    'mypageLayout', c.mypage_layout
  );
end;
$$;

-- ---------- (d) お知らせ取得：本人(token)向け（全員共通 ＋ 個別）----------
create or replace function mypage_announcements(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c candidates%rowtype;
  items jsonb;
begin
  if p_token is null or length(p_token) < 8 then
    return '[]'::jsonb;
  end if;
  select * into c from candidates where reservation_token = p_token;
  if not found then
    return '[]'::jsonb;
  end if;
  select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', n.id, 'kind', n.kind, 'tag', n.tag, 'tone', n.tone,
          'date', to_char(n.published_at, 'MM/DD'),
          'title', n.title, 'pinned', n.pinned, 'lead', n.lead,
          'body', n.body, 'cta', nullif(n.cta, '')
        )
        order by n.pinned desc, n.published_at desc
      ), '[]'::jsonb)
    into items
    from announcements n
    where n.active = true
      and (n.candidate_id is null or n.candidate_id = c.id);
  return items;
end;
$$;

-- ---------- 公開範囲 ----------
revoke all on function mypage_get(text) from public;
revoke all on function mypage_announcements(text) from public;
grant execute on function mypage_get(text) to anon, authenticated;
grant execute on function mypage_announcements(text) to anon, authenticated;
