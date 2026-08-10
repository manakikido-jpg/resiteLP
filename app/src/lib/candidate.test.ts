import { describe, it, expect } from "vitest";
import { blankCandidate, newReservationToken } from "./candidate";

describe("newReservationToken", () => {
  it("returns 32 hex chars (= DB既定の gen_random_bytes(16) と同じ長さ)", () => {
    expect(newReservationToken()).toMatch(/^[0-9a-f]{32}$/);
  });

  it("does not repeat", () => {
    const seen = new Set(Array.from({ length: 200 }, () => newReservationToken()));
    expect(seen.size).toBe(200);
  });
});

describe("blankCandidate", () => {
  // トークンが空だと管理画面からマイページのリンクを発行できない（R-003）
  it("always carries a reservation token", () => {
    expect(blankCandidate().reservationToken).toMatch(/^[0-9a-f]{32}$/);
  });

  it("lets the caller keep an existing token", () => {
    const t = "a".repeat(32);
    expect(blankCandidate({ reservationToken: t }).reservationToken).toBe(t);
  });

  it("starts at the first funnel stage", () => {
    expect(blankCandidate().stage).toBe("無料体験予約");
  });
});
