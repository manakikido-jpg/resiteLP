/* =========================================================
   Vercel 統合ビルド
   出力: dist/（Vercel の outputDirectory）

   公開されるURLの構成:
     /               home/          入口の選択画面
     /mid-career/    mid-career/    中途LP
     /intern/        intern/        インターンLP
     /type-test/     type-test/     職業タイプ診断
     /booking.html   app/（Vite）   面談予約（公開）
     /mypage/        mypage/        候補者マイページ
     /admin/         app/（Vite）   管理ログイン（社内）

   ブランドのドメイン直下に社内のログイン画面が出るのを避けるため、
   Vite の index.html（管理アプリ）は /admin/ へ移し、
   ルートには home/index.html（選択画面）を置く。
   Vite の base は "/" のままなので、生成される asset の参照は
   "/assets/..." という絶対パス。HTMLの置き場所を変えても壊れない。
   ========================================================= */
import { execSync } from "node:child_process";
import { cpSync, rmSync, existsSync, mkdirSync, renameSync } from "node:fs";

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

// 3) 管理アプリを /admin/ へ移す（ルートは選択画面に明け渡す）
if (!existsSync("dist/index.html")) {
  throw new Error("dist/index.html が無い。Vite のビルド結果が想定と違う");
}
mkdirSync("dist/admin", { recursive: true });
renameSync("dist/index.html", "dist/admin/index.html");
console.log("moved  dist/index.html -> dist/admin/index.html （管理アプリ）");

// 4) 入口の選択画面をルートへ
if (!existsSync("home/index.html")) {
  throw new Error("home/index.html が無い。ルートに出すページが存在しない");
}
cpSync("home", "dist", { recursive: true });
console.log("copied home/ -> dist/ （ルートの選択画面）");

// 5) 静的サイトをサブパスへ配置
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
