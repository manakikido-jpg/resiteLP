/* 管理者ログイン（Supabase Auth・チーム共有アカウント） */
import { useState } from "react";
import { useApp } from "../store/AppStore";

export function LoginView() {
  const { signIn } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      await signIn(email.trim(), password);
    } catch {
      setErr("メールアドレスかパスワードが正しくありません。");
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={onSubmit}>
        <img className="login-logo" src="/assets/logo-mark.png" alt="可能性ラボ" />
        <div className="eyebrow" style={{ textAlign: "center" }}>Candidate Profiling</div>
        <h1 className="login-title">可能性ラボ｜管理ログイン</h1>
        <p className="login-sub">チーム共有アカウントでログインしてください。</p>

        <div className="field">
          <label>メールアドレス</label>
          <input
            className="input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="team@example.com"
            required
          />
        </div>
        <div className="field">
          <label>パスワード</label>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {err && <div className="login-err">{err}</div>}

        <button className="btn btn-primary login-btn" type="submit" disabled={busy}>
          {busy ? "ログイン中…" : "ログイン"}
        </button>
      </form>
    </div>
  );
}
