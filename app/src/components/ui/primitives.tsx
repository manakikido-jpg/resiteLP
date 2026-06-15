/* =========================================================
   共通UI部品（ui.jsx を移植）
   ========================================================= */
import { useState, type ReactNode } from "react";
import type { AxisScores, Segment } from "../../lib/types";
import { STATUS_TONE } from "../../lib/assessment";
import { STAGE_TONE } from "../../lib/stage";
import { SEGMENTS } from "../../lib/interview";
import { typeOf } from "../../lib/codes";

export function Avatar({ name, size }: { name?: string; size?: number }) {
  const initial = (name || "?").trim().charAt(0);
  const style = size ? { width: size, height: size, fontSize: size * 0.38 } : undefined;
  return (
    <div className="avatar" style={style}>
      {initial}
    </div>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const tone = STATUS_TONE[status] || "neutral";
  return (
    <span className={"status tone-" + tone}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

export function SegBadge({ seg }: { seg: Segment }) {
  return <span className={"badge badge-seg-" + seg}>{SEGMENTS[seg] || seg}</span>;
}

export function StageBadge({ stage }: { stage?: string }) {
  if (!stage) return null;
  const tone = STAGE_TONE[stage] || "neutral";
  return (
    <span className={"status tone-" + tone}>
      <span className="status-dot" />
      {stage}
    </span>
  );
}

export function TypeChip({ test }: { test: AxisScores }) {
  const t = typeOf(test);
  if (!t)
    return (
      <span className="typechip empty">
        <span className="nm">未診断</span>
      </span>
    );
  return (
    <span className="typechip">
      <span className="code">{t.code}</span>
      <span className="nm">{t.name}</span>
    </span>
  );
}

export function Field({
  label,
  required,
  children,
  full,
}: {
  label?: string;
  required?: boolean;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={"field" + (full ? " col-2" : "")}>
      {label && (
        <label>
          {label}
          {required && <span className="req">必須</span>}
        </label>
      )}
      {children}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className="input"
      type={type}
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

type Option = string | { value: string; label: string };

export function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value?: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
}) {
  return (
    <select className="select" value={value || ""} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => {
        const val = typeof o === "string" ? o : o.value;
        const lab = typeof o === "string" ? o : o.label;
        return (
          <option key={val} value={val}>
            {lab}
          </option>
        );
      })}
    </select>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      className="textarea"
      rows={rows}
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function StarRating({
  value = 0,
  onChange,
}: {
  value?: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            className={"star" + (on ? " on" : "")}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(value === n ? 0 : n)}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill={on ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            >
              <path d="M12 3.5l2.6 5.3 5.9.86-4.27 4.16 1 5.88L12 17.9l-5.27 2.76 1-5.88L3.5 9.66l5.9-.86z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export function Saver({ saving }: { saving: boolean }) {
  return (
    <span className={"saver" + (saving ? " saving" : "")}>
      <span className="dot" />
      {saving ? "保存中…" : "自動保存済み"}
    </span>
  );
}

export function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={"switch" + (on ? " on" : "")}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
    >
      <span className="switch-track">
        <span className="switch-thumb" />
      </span>
      {label && <span className="switch-label">{label}</span>}
    </button>
  );
}

/** 空値表示ヘルパ */
export function val(v: unknown, empty = "—"): ReactNode {
  if (v === undefined || v === null || v === "") return <span className="empty-val">{empty}</span>;
  return v as ReactNode;
}
