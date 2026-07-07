/* 共有アプリバー（ロゴ + ナビ + 右スロット） */
import type { ReactNode } from "react";
import { useApp } from "../store/AppStore";
import { Icon } from "./ui/Icon";

export function AppBar({ right }: { right?: ReactNode }) {
  const { navigate, view, authEnabled, signOut } = useApp();
  const cur = view.name;
  return (
    <header className="appbar">
      <div className="appbar-inner">
        <button
          className="brand"
          onClick={() => navigate({ name: "list" })}
          style={{ border: 0, background: "none" }}
        >
          <img src="/assets/logo-mark.png" alt="可能性ラボ" />
          <span className="brand-name">
            <b>可能性ラボ</b>
            <small>候補者プロファイル</small>
          </span>
        </button>
        <nav className="topnav">
          <button
            className={"navitem" + (cur === "list" || cur === "profile" ? " on" : "")}
            onClick={() => navigate({ name: "list" })}
          >
            <Icon name="users" size={16} />
            候補者
          </button>
          <button
            className={"navitem" + (cur === "schedule" ? " on" : "")}
            onClick={() => navigate({ name: "schedule" })}
          >
            <Icon name="cal" size={16} />
            スケジュール
          </button>
          <button
            className={"navitem" + (cur === "form" ? " on" : "")}
            onClick={() => navigate({ name: "form" })}
          >
            <Icon name="form" size={16} />
            予約フォーム
          </button>
          <button
            className={"navitem" + (cur === "news" ? " on" : "")}
            onClick={() => navigate({ name: "news" })}
          >
            <Icon name="spark" size={16} />
            お知らせ
          </button>
        </nav>
        <div className="appbar-spacer" />
        {right}
        {authEnabled && (
          <button className="btn btn-ghost btn-sm" onClick={() => void signOut()} title="ログアウト">
            ログアウト
          </button>
        )}
      </div>
    </header>
  );
}
