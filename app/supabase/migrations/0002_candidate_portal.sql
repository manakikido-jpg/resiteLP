-- =========================================================
-- 候補者マイページ（token アクセス）
-- 匿名(anon)は token を引数にした安全なRPC経由でのみ自分のデータに触れる。
-- テーブル直アクセスは RLS で禁止のまま（0001 の authenticated ポリシーのみ）。
-- =========================================================

-- 予約フォーム設定（空き枠表示用・非機密）は匿名読み取りを許可
drop policy if exists "anon read form_config" on form_config;
create policy "anon read form_config" on form_config
  for select to anon using (true);

-- 本人データ取得：reservation_token で1名分だけ返す
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
    'appointments', appts
  );
end;
$$;

-- 予約作成：本人(token)の予定を1件作る
create or replace function mypage_book(p_token text, p_at timestamptz, p_type text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c candidates%rowtype;
  a appointments%rowtype;
begin
  select * into c from candidates where reservation_token = p_token;
  if not found then
    raise exception 'invalid token';
  end if;
  insert into appointments (candidate_id, name, type, coach, at, status, source)
  values (
    c.id, c.name,
    case when p_type in ('first', 'second') then p_type else 'first' end,
    c.coach, p_at, '予定', 'form'
  )
  returning * into a;
  return to_jsonb(a);
end;
$$;

-- 公開範囲：匿名/認証済みは RPC のみ実行可（テーブルは触れない）
revoke all on function mypage_get(text) from public;
revoke all on function mypage_book(text, timestamptz, text) from public;
grant execute on function mypage_get(text) to anon, authenticated;
grant execute on function mypage_book(text, timestamptz, text) to anon, authenticated;
