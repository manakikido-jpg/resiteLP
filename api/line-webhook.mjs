/* .mjs にしているのは、ルートの package.json に "type":"module" が無く、
   .js だとCommonJSとして解釈されて import/export が壊れるため */
/* =========================================================
   LINE Webhook — 日報の送信先IDを取得するための窓口

   グループに送るには groupId が必要だが、LINEはこれをAPIで一覧できない。
   Webhookでイベントを受け取ったときにしか分からないため、ここで拾って
   そのトークルームに返信する。

   IDが分かったら LINE Developers 側で Webhook をオフに戻してよい。
   （日報の送信自体にはWebhookは不要）

   トークンは環境変数から読む。リポジトリには置かない。
   ========================================================= */

export default async function handler(req, res) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  // LINE Developers の「検証」ボタンや、ブラウザからのGETに応える。
  // トークンが読めているかも返す（値そのものは出さない）。
  // ここが「なし」だと、ボットはグループに入っても黙ったままになる。
  if (req.method !== "POST") {
    res.status(200).json({
      ok: true,
      token: token ? "あり" : "なし",
      hint: token ? "設定OK" : "Vercelの環境変数 LINE_CHANNEL_ACCESS_TOKEN を設定して再デプロイしてください",
    });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const events = (body && body.events) || [];

  for (const ev of events) {
    const src = ev.source || {};
    const id = src.groupId || src.roomId || src.userId || "";
    const kind = src.groupId ? "グループ" : src.roomId ? "複数人トーク" : "個人トーク";
    if (!ev.replyToken || !token || !id) continue;

    const text =
      `📋 送信先ID（${kind}）\n\n${id}\n\n` +
      `このIDをClaudeに伝えてください。\n設定が終わったらWebhookはオフに戻せます。`;

    try {
      await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          replyToken: ev.replyToken,
          messages: [{ type: "text", text }],
        }),
      });
    } catch (e) {
      console.error("reply failed", e);
    }
  }

  // LINEは200以外を返すと再送してくるので、必ず200で返す
  res.status(200).json({ ok: true, received: events.length });
}
