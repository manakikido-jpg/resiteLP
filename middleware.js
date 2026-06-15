/* =========================================================
   Vercel Edge Middleware — Basic 認証（リンク＋ID/パスワードを知る人だけ閲覧可）
   - Vercel の環境変数 BASIC_AUTH_USER / BASIC_AUTH_PASS を設定すると有効化。
   - 未設定なら素通り（誤ロックアウト防止）。
   - 全ページに適用（_vercel 内部と favicon は除外）。
   ========================================================= */
export const config = {
  matcher: ["/((?!_vercel|favicon\\.ico).*)"],
};

export default function middleware(request) {
  const USER = process.env.BASIC_AUTH_USER;
  const PASS = process.env.BASIC_AUTH_PASS;

  // 認証情報が未設定なら制限しない
  if (!USER || !PASS) return;

  const header = request.headers.get("authorization") || "";
  if (header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const idx = decoded.indexOf(":");
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (u === USER && p === PASS) return; // 認証成功 → 通過
    } catch {
      /* デコード失敗 → 下の401へ */
    }
  }

  return new Response("認証が必要です。", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="kanousei-labo", charset="UTF-8"',
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
