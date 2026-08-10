-- =========================================================
-- 0005: 空き枠の可視化と、二重予約のサーバ側強制
--
-- 【背景】
-- 公開予約ページは既存予定を読んで満枠を伏せる作りだったが、匿名(anon)には
-- appointments の SELECT 権が無いため常に0件が返り、**全枠が「空き」に見えていた**。
-- さらに book_trial / mypage_book は定員を一切見ずに insert していたため、
-- 同じ枠に何件でも予約が入る状態だった。
--
-- 【方針】
-- 1. anon に appointments を直接読ませない（氏名・電話が露出する）。
--    枠ごとの「件数」だけを返す slot_counts() を用意する。
-- 2. 表示側のチェックは競合に勝てないので、可否の判断はRPC内で強制する。
--    枠単位の advisory lock で同時実行も直列化する。
--
-- 既存 0001〜0004 は変更しない（0004 未適用でもこの移行は単独で適用できる）。
-- =========================================================

-- ---------- (a) 枠ごとの予約件数（個人情報を含まない） ----------
-- 戻り値: { "2026-08-11T10:00": 2, "2026-08-11T11:00": 1, ... }
-- キーは JST の "YYYY-MM-DDTHH:MI"。クライアントの枠キーと同じ形式にしている。
create or replace function slot_counts(p_from date, p_to date)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  items jsonb;
begin
  if p_from is null or p_to is null or p_to < p_from then
    return '{}'::jsonb;
  end if;
  -- 全期間を引かせない（予約ページの rangeDays は既定30日）
  if (p_to - p_from) > 120 then
    raise exception 'range too wide';
  end if;

  select coalesce(jsonb_object_agg(k, c), '{}'::jsonb)
    into items
    from (
      select to_char(a.at at time zone 'Asia/Tokyo', 'YYYY-MM-DD"T"HH24:MI') as k,
             count(*) as c
        from appointments a
       where a.status <> 'キャンセル'
         and a.at >= (p_from::timestamp at time zone 'Asia/Tokyo')
         and a.at <  ((p_to + 1)::timestamp at time zone 'Asia/Tokyo')
       group by 1
    ) t;
  return items;
end;
$$;

-- ---------- (b) 定員チェックの共通関数 ----------
-- form_config.slots.capacity を正とする。満枠なら 'slot_full' で失敗させる。
-- 同時に同じ枠へ来た2件が両方通らないよう、枠単位の advisory lock を取る。
create or replace function assert_slot_bookable(p_at timestamptz)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cap   int;
  v_taken int;
begin
  if p_at is null then
    raise exception 'slot_invalid';
  end if;
  if p_at <= now() then
    raise exception 'slot_past';
  end if;

  -- 同一枠の予約を直列化（トランザクション終了で自動解放）
  perform pg_advisory_xact_lock(hashtextextended(p_at::text, 0));

  select coalesce((slots->>'capacity')::int, 1) into v_cap
    from form_config where id = 1;
  v_cap := coalesce(v_cap, 1);

  select count(*) into v_taken
    from appointments
   where status <> 'キャンセル' and at = p_at;

  if v_taken >= v_cap then
    raise exception 'slot_full';
  end if;
end;
$$;

-- ---------- (c) 公開予約：定員チェックを追加 ----------
create or replace function book_trial(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c    candidates%rowtype;
  a    appointments%rowtype;
  v_at timestamptz;
begin
  begin
    v_at := (p->>'scheduledAt')::timestamptz;
  exception when others then
    raise exception 'slot_invalid';
  end;

  perform assert_slot_bookable(v_at);

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
    c.coach, v_at, '予定', 'form'
  )
  returning * into a;

  return jsonb_build_object(
    'candidateId', c.id,
    'reservationToken', c.reservation_token,
    'appointmentId', a.id
  );
end;
$$;

-- ---------- (d) マイページからの予約：同じチェックを通す ----------
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

  perform assert_slot_bookable(p_at);

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

-- ---------- 公開範囲 ----------
-- assert_slot_bookable は内部用。anon には触らせない。
revoke all on function assert_slot_bookable(timestamptz) from public;
revoke all on function slot_counts(date, date) from public;
grant execute on function slot_counts(date, date) to anon, authenticated;
