import { describe, it, expect } from "vitest";
import {
  scoresToCode,
  codeToScores,
  scoresToTypeCode,
  scoreToChar,
  charToScore,
  typeOf,
} from "./codes";

describe("scoreToChar / charToScore", () => {
  it("encodes the full -10..+10 range to 0..K", () => {
    expect(scoreToChar(-10)).toBe("0");
    expect(scoreToChar(0)).toBe("A");
    expect(scoreToChar(10)).toBe("K");
  });

  it("is the inverse of charToScore across the table", () => {
    for (let s = -10; s <= 10; s++) {
      expect(charToScore(scoreToChar(s))).toBe(s);
    }
  });

  it("clamps out-of-range scores", () => {
    expect(scoreToChar(99)).toBe("K");
    expect(scoreToChar(-99)).toBe("0");
  });

  it("returns null for invalid chars", () => {
    expect(charToScore("Z")).toBeNull();
    expect(charToScore("!")).toBeNull();
  });
});

describe("scoresToCode / codeToScores", () => {
  it("encodes scores to a 4-char result code (spec example)", () => {
    expect(scoresToCode({ axis1: 3, axis2: 7, axis3: -2, axis4: 5 })).toBe("DH8F");
  });

  it("decodes a result code back to axis scores", () => {
    expect(codeToScores("DH8F")).toEqual({ axis1: 3, axis2: 7, axis3: -2, axis4: 5 });
  });

  it("round-trips", () => {
    const scores = { axis1: -10, axis2: 0, axis3: 6, axis4: -4 };
    expect(codeToScores(scoresToCode(scores))).toEqual(scores);
  });

  it("normalizes case and ignores noise characters", () => {
    expect(codeToScores("dh8f")).toEqual({ axis1: 3, axis2: 7, axis3: -2, axis4: 5 });
  });

  it("rejects codes that are not exactly 4 valid chars", () => {
    expect(codeToScores("DH8")).toBeNull();
    expect(codeToScores("DH8FF")).toBeNull();
    expect(codeToScores("DHZF")).toBeNull();
  });
});

describe("scoresToTypeCode / typeOf", () => {
  // 正本 type-test-spec に整合: axis1 は S(戦略, >=0) / E(共感, <0)
  it("derives the type code (DH8F -> STIP)", () => {
    const scores = codeToScores("DH8F")!;
    expect(scoresToTypeCode(scores)).toBe("STIP");
  });

  it("treats 0 as the positive pole", () => {
    expect(scoresToTypeCode({ axis1: 0, axis2: 0, axis3: 0, axis4: 0 })).toBe("STOP");
  });

  it("resolves a full type definition", () => {
    const t = typeOf(codeToScores("DH8F"));
    expect(t?.code).toBe("STIP");
    expect(t?.name).toBe("発想の伝道師");
    expect(t?.feats).toHaveLength(3);
  });

  it("returns null when no axis scores are present", () => {
    expect(typeOf({})).toBeNull();
    expect(typeOf(null)).toBeNull();
  });
});
