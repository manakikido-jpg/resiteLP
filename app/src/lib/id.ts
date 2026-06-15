/** ローカル生成ID（Supabase未接続時のみ使用。接続時はDBの uuid を採用） */
export function uid(prefix = "c"): string {
  return (
    prefix +
    "_" +
    Math.random().toString(36).slice(2, 9) +
    Date.now().toString(36).slice(-4)
  );
}
