/* 空の候補者を生成（ストア・予約ページ共通） */
import type { Candidate } from "./types";

export function blankCandidate(partial: Partial<Candidate> = {}): Candidate {
  return {
    id: crypto.randomUUID(),
    name: "",
    phone: "",
    exp: "なし",
    age: "",
    job: "",
    loc: "",
    seg: "career",
    stage: "無料体験予約",
    src: "",
    date: new Date().toISOString().slice(0, 10),
    coach: "",
    i1: {},
    i2: {},
    test: {},
    asmt: {
      marketValue: 0,
      selfAwareness: 0,
      stressRes: 0,
      growthDrive: 0,
      communication: 0,
      motivation: 0,
      notes: "",
    },
    place: { industry: "", role: "", status: "面談済", next: "", memo: "" },
    at: new Date().toISOString(),
    ...partial,
  };
}
