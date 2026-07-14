import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useNameHistory } from "./useNameHistory";

const HIST_KEY = "dottomon:history";
const PRE_RENAME_KEY = "dotmon:history";
const OLD_HIST_KEY = "monstermaker:history";

const stored = (): string[] =>
  JSON.parse(localStorage.getItem(HIST_KEY) ?? "null");

beforeEach(() => localStorage.clear());

describe("useNameHistory", () => {
  it("back returns the previous name and unwinds the stack", () => {
    // Arrange: three generated names
    const { result } = renderHook(() => useNameHistory());
    act(() => {
      result.current.push("a");
      result.current.push("b");
      result.current.push("c");
    });
    expect(result.current.canBack).toBe(true);

    // Act + Assert: each back() steps one name up the history
    let prev: string | null = null;
    act(() => {
      prev = result.current.back();
    });
    expect(prev).toBe("b");
    act(() => {
      prev = result.current.back();
    });
    expect(prev).toBe("a");

    // Assert: at the oldest entry there is nothing to go back to
    expect(result.current.canBack).toBe(false);
    act(() => {
      prev = result.current.back();
    });
    expect(prev).toBeNull();
  });

  it("skips consecutive duplicates and keeps only the last 10", () => {
    // Arrange
    const { result } = renderHook(() => useNameHistory());

    // Act: a repeated name and then a long stream of pushes
    act(() => {
      result.current.push("same");
      result.current.push("same");
    });
    const afterDup = stored();
    act(() => {
      for (let i = 1; i <= 12; i++) result.current.push(`n${i}`);
    });

    // Assert: the duplicate collapsed to one; storage is capped at 10
    expect(afterDup).toEqual(["same"]);
    expect(stored()).toHaveLength(10);
    expect(stored()[9]).toBe("n12");
  });

  it("migrates from the pre-rename monstermaker key, dropping junk", () => {
    // Arrange: legacy history with a non-string entry mixed in
    localStorage.setItem(OLD_HIST_KEY, JSON.stringify(["Poko", 42, "ズゴン"]));

    // Act
    const { result } = renderHook(() => useNameHistory());

    // Assert: strings survive under the new key, the old key is gone
    expect(stored()).toEqual(["Poko", "ズゴン"]);
    expect(localStorage.getItem(OLD_HIST_KEY)).toBeNull();
    expect(result.current.canBack).toBe(true);
  });

  it("migrates history from the pre-rename dotmon key", () => {
    // Arrange + Act + Assert (small): dotmon-era history moves to the new
    // key and the old key is removed
    localStorage.setItem(PRE_RENAME_KEY, JSON.stringify(["Poko", "ズゴン"]));
    renderHook(() => useNameHistory());
    expect(stored()).toEqual(["Poko", "ズゴン"]);
    expect(localStorage.getItem(PRE_RENAME_KEY)).toBeNull();
  });
});
