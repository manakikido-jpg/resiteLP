-- =========================================================
-- 公開・予約ページ（無料体験予約）用RPC
-- 匿名(anon)が候補者＋予定を作成し、本人のマイページ用 reservation_token を受け取る。
-- テーブル直書きは RLS で禁止のまま（このRPCは security definer）。
-- =========================================================
create or replace function book_trial(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c candidates%rowtype;
  a appointments%rowtype;
begin
  insert into candidates (name, phone, exp, age, job, loc, seg, stage, src, date, coach, test)
  values (
    coalesce(p->>'name', ''),
    coalesce(p->>'phone', ''),
    coalesce(p->>'exp', 'なし'),
    coalesce(p->>'age', ''),
    coalesce(p->>'job', ''),
    coalesce(p->>'loc', ''),
    coalesce(nullif(p->>'seg', ''), 'career'),
    '無料体験予約',
    coalesce(nullif(p->>'src', ''), '予約フォーム'),
    nullif(p->>'date', '')::date,
    coalesce(p->>'coach', ''),
    coalesce(p->'test', '{}'::jsonb)
  )
  returning * into c;

  insert into appointments (candidate_id, name, type, coach, at, status, source)
  values (
    c.id, c.name,
    case when p->>'interviewType' in ('first', 'second') then p->>'interviewType' else 'first' end,
    c.coach,
    (p->>'scheduledAt')::timestamptz,
    '予定', 'form'
  )
  returning * into a;

  return jsonb_build_object(
    'candidateId', c.id,
    'reservationToken', c.reservation_token,
    'appointmentId', a.id
  );
end;
$$;

revoke all on function book_trial(jsonb) from public;
grant execute on function book_trial(jsonb) to anon, authenticated;
