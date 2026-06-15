import { describe, it, expect } from "vitest";
import { slotsPerDay, sampleSlotTimes } from "./slots";
import type { SlotConfig } from "./types";

const baseConfig = (over: Partial<SlotConfig> = {}): SlotConfig => ({
  weekly: {
    0: { on: false, start: "10:00", end: "18:00" },
    1: { on: true, start: "10:00", end: "19:00" },
    2: { on: true, start: "10:00", end: "13:00" },
  },
  slotMinutes: 60,
  capacity: 2,
  leadDays: 1,
  rangeDays: 30,
  holidays: [],
  ...over,
});

describe("slotsPerDay", () => {
  it("computes floor((end-start)/slotMinutes)", () => {
    expect(slotsPerDay(1, baseConfig())).toBe(9); // 10:00-19:00 / 60
    expect(slotsPerDay(2, baseConfig())).toBe(3); // 10:00-13:00 / 60
  });

  it("returns 0 for days that are off", () => {
    expect(slotsPerDay(0, baseConfig())).toBe(0);
  });

  it("returns 0 for unknown weekday", () => {
    expect(slotsPerDay(5, baseConfig())).toBe(0);
  });

  it("respects slotMinutes (45min)", () => {
    expect(slotsPerDay(1, baseConfig({ slotMinutes: 45 }))).toBe(12); // 540 / 45
  });

  it("returns 0 when end <= start", () => {
    const cfg = baseConfig({ weekly: { 1: { on: true, start: "19:00", end: "10:00" } } });
    expect(slotsPerDay(1, cfg)).toBe(0);
  });
});

describe("sampleSlotTimes", () => {
  it("lists start times stepped by slotMinutes within the window", () => {
    expect(sampleSlotTimes(2, baseConfig())).toEqual(["10:00", "11:00", "12:00"]);
  });

  it("caps to max", () => {
    expect(sampleSlotTimes(1, baseConfig(), 2)).toEqual(["10:00", "11:00"]);
  });

  it("returns empty for an off day", () => {
    expect(sampleSlotTimes(0, baseConfig())).toEqual([]);
  });
});
