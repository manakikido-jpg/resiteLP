/* =========================================================
   Vercel 統合ビルド
   - app/（Vite）をビルド → dist/ の土台に
   - 静的サイト（mypage / type-test / intern / mid-career）を dist/ 配下へコピー
   出力: dist/  （Vercel の outputDirectory）
   ========================================================= */
import { execSync } from "node:child_process";
import { cpSync, rmSync, existsSync } from "node:fs";

function run(cmd, cwd) {
  console.log(`\n$ ${cmd}  (cwd: ${cwd || "."})`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

// 1) Vite アプリ（プロファイル管理 + 予約ページ）をビルド
//    npm install ではなく npm ci を使う。package-lock.json のとおりに入れるので
//    ビルドのたびに依存が変わらず、実測でも速い（5.4秒 → 3.5秒）。
//    ci は node_modules を作り直すため、Vercel 側のキャッシュ有無に左右されない。
run("npm ci --no-audit --no-fund", "app");
run("npm run build", "app");

// 2) 出力ディレクトリを app のビルド結果で初期化
rmSync("dist", { recursive: true, force: true });
cpSync("app/dist", "dist", { recursive: true });

// 3) 静的サイトをサブパスへ配置
const STATIC_SITES = ["mypage", "type-test", "intern", "mid-career"];
for (const site of STATIC_SITES) {
  if (existsSync(site)) {
    cpSync(site, `dist/${site}`, { recursive: true });
    console.log(`copied ${site}/ -> dist/${site}/`);
  } else {
    console.log(`skip (not found): ${site}/`);
  }
}

console.log("\n✓ build-vercel: dist/ assembled");
