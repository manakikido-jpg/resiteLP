/* =========================================================
   アプリ状態ストア（プロトタイプ app.jsx の AppCtx を React Context 化）
   - 永続化は repository 越し（localStorage / Supabase）
   - フィールド変更はデバウンス自動保存（600ms）
   ========================================================= */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Appointment,
  Candidate,
  FormConfig,
  FormField,
  SlotConfig,
  WebhookPayload,
} from "../lib/types";
import { blankCandidate } from "../lib/candidate";
import { buildBookingRecords } from "../lib/booking";
import { repository } from "./repository";

export type View =
  | { name: "list" }
  | { name: "schedule" }
  | { name: "form" }
  | { name: "profile"; id: string };

type Updater<T> = T | ((prev: T) => T);

export interface AppContextValue {
  loading: boolean;
  candidates: Candidate[];
  appts: Appointment[];
  formFields: FormField[];
  slotConfig: SlotConfig;
  saving: boolean;
  view: View;
  toast: string | null;
  setField: (id: string, path: string[], value: unknown) => void;
  addCandidate: () => void;
  removeCandidate: (id: string) => void;
  upsertAppt: (appt: Appointment) => void;
  removeAppt: (id: string) => void;
  simulateWebhook: (payload: WebhookPayload) => { candidate: Candidate; appt: Appointment };
  setFormFields: (updater: Updater<FormField[]>) => void;
  setSlotConfig: (updater: Updater<SlotConfig>) => void;
  navigate: (v: View) => void;
  notify: (msg: string) => void;
}

const AppCtx = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}

/* immutable nested set: setIn(obj, ["i1","mq1"], v) */
function setIn<T>(obj: T, path: string[], value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  const o = (obj ?? {}) as Record<string, unknown>;
  return { ...o, [head]: setIn(o[head] ?? {}, rest, value) } as T;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [formCfg, setFormCfg] = useState<FormConfig>({ fields: [], slots: {} as SlotConfig });
  const [view, setView] = useState<View>({ name: "list" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<number | null>(null);
  const flushTimer = useRef<number | null>(null);
  const pending = useRef({
    cands: new Map<string, Candidate>(),
    appts: new Map<string, Appointment>(),
    form: null as FormConfig | null,
  });

  // 初回ロード
  useEffect(() => {
    let active = true;
    repository
      .loadAll()
      .then((data) => {
        if (!active) return;
        setCandidates(data.candidates);
        setAppts(data.appts);
        setFormCfg(data.formConfig);
        setLoading(false);
      })
      .catch((e) => {
        console.error("loadAll failed", e);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const flush = useCallback(async () => {
    const p = pending.current;
    const cands = [...p.cands.values()];
    const apptList = [...p.appts.values()];
    const form = p.form;
    p.cands.clear();
    p.appts.clear();
    p.form = null;
    try {
      await Promise.all([
        ...cands.map((c) => repository.saveCandidate(c)),
        ...apptList.map((a) => repository.saveAppt(a)),
        ...(form ? [repository.saveFormConfig(form)] : []),
      ]);
    } catch (e) {
      console.error("autosave failed", e);
    } finally {
      setSaving(false);
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    setSaving(true);
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = window.setTimeout(() => void flush(), 600);
  }, [flush]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const navigate = useCallback((v: View) => {
    window.scrollTo(0, 0);
    setView(v);
  }, []);

  /* ---- 候補者 ---- */
  const setField = useCallback(
    (id: string, path: string[], value: unknown) => {
      setCandidates((cs) => {
        const next = cs.map((c) => (c.id === id ? setIn(c, path, value) : c));
        const updated = next.find((c) => c.id === id);
        if (updated) {
          pending.current.cands.set(id, updated);
          scheduleFlush();
        }
        return next;
      });
    },
    [scheduleFlush]
  );

  const addCandidate = useCallback(() => {
    const c = blankCandidate();
    setCandidates((cs) => [c, ...cs]);
    repository.saveCandidate(c).catch((e) => console.error(e));
    navigate({ name: "profile", id: c.id });
  }, [navigate]);

  const removeCandidate = useCallback(
    (id: string) => {
      setCandidates((cs) => cs.filter((c) => c.id !== id));
      setAppts((as) => as.filter((a) => a.candidateId !== id));
      repository.deleteCandidate(id).catch((e) => console.error(e));
      navigate({ name: "list" });
    },
    [navigate]
  );

  /* ---- 予定 ---- */
  const upsertAppt = useCallback(
    (appt: Appointment) => {
      setAppts((as) => {
        const exists = as.some((a) => a.id === appt.id);
        return exists ? as.map((a) => (a.id === appt.id ? appt : a)) : [...as, appt];
      });
      pending.current.appts.set(appt.id, appt);
      scheduleFlush();
    },
    [scheduleFlush]
  );

  const removeAppt = useCallback((id: string) => {
    setAppts((as) => as.filter((a) => a.id !== id));
    pending.current.appts.delete(id);
    repository.deleteAppt(id).catch((e) => console.error(e));
  }, []);

  /* ---- 予約フォーム連携（Webhook シミュレーション） ---- */
  const simulateWebhook = useCallback((payload: WebhookPayload) => {
    const { candidate, appointment } = buildBookingRecords(payload);
    setCandidates((cs) => [candidate, ...cs]);
    setAppts((as) => [...as, appointment]);
    repository.saveCandidate(candidate).catch((e) => console.error(e));
    repository.saveAppt(appointment).catch((e) => console.error(e));
    return { candidate, appt: appointment };
  }, []);

  /* ---- フォーム設定 ---- */
  const setFormFields = useCallback(
    (updater: Updater<FormField[]>) => {
      setFormCfg((c) => {
        const fields = typeof updater === "function" ? (updater as (p: FormField[]) => FormField[])(c.fields) : updater;
        const next = { ...c, fields };
        pending.current.form = next;
        scheduleFlush();
        return next;
      });
    },
    [scheduleFlush]
  );
  const setSlotConfig = useCallback(
    (updater: Updater<SlotConfig>) => {
      setFormCfg((c) => {
        const slots = typeof updater === "function" ? (updater as (p: SlotConfig) => SlotConfig)(c.slots) : updater;
        const next = { ...c, slots };
        pending.current.form = next;
        scheduleFlush();
        return next;
      });
    },
    [scheduleFlush]
  );

  const value: AppContextValue = {
    loading,
    candidates,
    appts,
    formFields: formCfg.fields,
    slotConfig: formCfg.slots,
    saving,
    view,
    toast,
    setField,
    addCandidate,
    removeCandidate,
    upsertAppt,
    removeAppt,
    simulateWebhook,
    setFormFields,
    setSlotConfig,
    navigate,
    notify,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
