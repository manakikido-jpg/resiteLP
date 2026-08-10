/* 空の候補者を生成（ストア・予約ページ共通） */
import type { Candidate } from "./types";

/**
 * マイページ用のアクセストークン（32桁hex）。
 * DB側 candidates.reservation_token は `encode(gen_random_bytes(16),'hex')` を
 * default に持つが、upsert では列を明示送信するため default が効かない。
 * 生成をクライアントに寄せることで、保存直後から「マイページlink」を出せる。
 * 長さ・エントロピーはDB既定と同じ16バイト（R-003）。
 */
export function newReservationToken(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return [...b].map((n) => n.toString(16).padStart(2, "0")).join("");
}

export function blankCandidate(partial: Partial<Candidate> = {}): Candidate {
  return {
    id: crypto.randomUUID(),
    reservationToken: newReservationToken(),
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
    mypageMessage: "",
    mypageLayout: {},
    at: new Date().toISOString(),
    ...partial,
  };
}
