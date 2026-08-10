import { describe, it, expect } from "vitest";
import { dayStatus, slotsForDate, usageFromAppointments, type SlotUsage } from "./availability";
import type { Appointment, SlotConfig } from "../lib/types";

/* 月曜だけ 10:00-13:00 受付、1枠60分、定員2名 */
const config = (over: Partial<SlotConfig> = {}): SlotConfig => ({
  weekly: {
    0: { on: false, start: "10:00", end: "18:00" },
    1: { on: true, start: "10:00", end: "13:00" },
    2: { on: true, start: "10:00", end: "13:00" },
  },
  slotMinutes: 60,
  capacity: 2,
  leadDays: 1,
  rangeDays: 30,
  holidays: [],
  ...over,
});

// 2026-08-17 は月曜
const MON = { y: 2026, m: 8, d: 17 };
// 判定を固定するため「今」を明示的に渡す
const NOW = new Date("2026-08-10T09:00:00+09:00");

const appt = (at: string, status: Appointment["status"] = "予定"): Appointment => ({
  id: at + status,
  candidateId: null,
  name: "テスト",
  type: "first",
  coach: "",
  at,
  status,
  source: "form",
});

describe("usageFromAppointments", () => {
  it("counts non-cancelled appointments per slot", () => {
    const u = usageFromAppointments([
      appt("2026-08-17T10:00:00+09:00"),
      appt("2026-08-17T10:00:00+09:00"),
      appt("2026-08-17T11:00:00+09:00"),
    ]);
    expect(u).toEqual({ "2026-08-17T10:00": 2, "2026-08-17T11:00": 1 });
  });

  it("ignores cancelled appointments", () => {
    const u = usageFromAppointments([
      appt("2026-08-17T10:00:00+09:00", "キャンセル"),
      appt("2026-08-17T10:00:00+09:00", "完了"),
    ]);
    expect(u).toEqual({ "2026-08-17T10:00": 1 });
  });

  it("returns an empty map for no appointments", () => {
    expect(usageFromAppointments([])).toEqual({});
  });
});

describe("slotsForDate", () => {
  it("opens every slot when nothing is booked", () => {
    const slots = slotsForDate(MON, config(), {}, NOW.getTime());
    expect(slots.map((s) => s.t)).toEqual(["10:00", "11:00", "12:00"]);
    expect(slots.every((s) => s.ok)).toBe(true);
  });

  it("closes a slot once it reaches capacity", () => {
    const usage: SlotUsage = { "2026-08-17T10:00": 2, "2026-08-17T11:00": 1 };
    const slots = slotsForDate(MON, config(), usage, NOW.getTime());
    expect(slots.find((s) => s.t === "10:00")?.ok).toBe(false); // 満枠
    expect(slots.find((s) => s.t === "11:00")?.ok).toBe(true); // 定員2のうち1
  });

  it("treats capacity 1 as a single booking per slot", () => {
    const usage: SlotUsage = { "2026-08-17T10:00": 1 };
    const slots = slotsForDate(MON, config({ capacity: 1 }), usage, NOW.getTime());
    expect(slots.find((s) => s.t === "10:00")?.ok).toBe(false);
  });

  it("closes slots that are already in the past", () => {
    const later = new Date("2026-08-17T11:30:00+09:00").getTime();
    const slots = slotsForDate(MON, config(), {}, later);
    expect(slots.find((s) => s.t === "10:00")?.ok).toBe(false);
    expect(slots.find((s) => s.t === "12:00")?.ok).toBe(true);
  });

  it("returns nothing for a closed weekday", () => {
    expect(slotsForDate({ y: 2026, m: 8, d: 16 }, config(), {}, NOW.getTime())).toEqual([]);
  });
});

describe("dayStatus", () => {
  it("is open when free slots remain", () => {
    expect(dayStatus(MON, config(), {}, NOW)).toBe("open");
  });

  it("is full when every slot hit capacity", () => {
    const usage: SlotUsage = {
      "2026-08-17T10:00": 2,
      "2026-08-17T11:00": 2,
      "2026-08-17T12:00": 2,
    };
    expect(dayStatus(MON, config(), usage, NOW)).toBe("full");
  });

  it("is past before leadDays", () => {
    // 当日（leadDays=1 なので受付開始前）
    expect(dayStatus({ y: 2026, m: 8, d: 10 }, config(), {}, NOW)).toBe("past");
  });

  it("is closed beyond rangeDays", () => {
    expect(dayStatus({ y: 2026, m: 12, d: 21 }, config(), {}, NOW)).toBe("closed");
  });

  it("is closed on a holiday", () => {
    expect(dayStatus(MON, config({ holidays: ["2026-08-17"] }), {}, NOW)).toBe("closed");
  });
});
