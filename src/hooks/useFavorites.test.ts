import { act, renderHook } from "@testing-library/react";
import { resolveOptions } from "dottomon";
import { beforeEach, describe, expect, it } from "vitest";
import { type Fav, sameOpts, useFavorites } from "./useFavorites";

const FAV_KEY = "dottomon:favorites";
const PRE_RENAME_KEY = "dotmon:favorites";
const OLD_FAV_KEY = "monsterlab:favorites";

const retro = resolveOptions({ preset: "retro" });
const stored = (): Fav[] => JSON.parse(localStorage.getItem(FAV_KEY) ?? "null");

beforeEach(() => localStorage.clear());

describe("sameOpts", () => {
  it("treats null as equal only to null", () => {
    // Arrange + Act + Assert (small): null means "follow current settings",
    // which never equals a pinned snapshot
    expect(sameOpts(null, null)).toBe(true);
    expect(sameOpts(null, retro)).toBe(false);
    expect(sameOpts(retro, { ...retro })).toBe(true);
    expect(sameOpts(retro, { ...retro, face: !retro.face })).toBe(false);
  });
});

describe("useFavorites", () => {
  it("migrates data from the pre-rename monsterlab key", () => {
    // Arrange: legacy storage with a bare-seed entry and a legMode-era entry
    // (both shapes predate the current { seed, opts } schema)
    localStorage.setItem(
      OLD_FAV_KEY,
      JSON.stringify([
        "Poko",
        {
          seed: "ズゴン",
          opts: {
            connected: false,
            symmetric: true,
            outline: true,
            face: false,
            legMode: "two",
          },
        },
      ]),
    );

    // Act: mounting the hook loads, normalizes and persists under the new key
    const { result } = renderHook(() => useFavorites());

    // Assert: legMode → legs, gapFill backfilled with core's dynamic default
    // (ON for retro-shaped options), data moved to dotmon:favorites
    expect(result.current.favs).toEqual([
      { seed: "Poko", opts: null },
      {
        seed: "ズゴン",
        opts: {
          connected: false,
          symmetric: true,
          outline: true,
          face: false,
          legs: "two",
          gapFill: true,
        },
      },
    ]);
    expect(stored()).toEqual(result.current.favs);
    expect(localStorage.getItem(OLD_FAV_KEY)).toBeNull();
  });

  it("migrates favorites from the pre-rename dotmon key", () => {
    // Arrange: favorites saved under the dotmon-era key (current schema)
    localStorage.setItem(
      PRE_RENAME_KEY,
      JSON.stringify([{ seed: "Poko", opts: null }]),
    );

    // Act
    const { result } = renderHook(() => useFavorites());

    // Assert: data moves to dottomon:favorites and the old key is removed
    expect(result.current.favs).toEqual([{ seed: "Poko", opts: null }]);
    expect(stored()).toEqual(result.current.favs);
    expect(localStorage.getItem(PRE_RENAME_KEY)).toBeNull();
  });

  it("drops malformed entries instead of crashing", () => {
    // Arrange: garbage mixed into the array, plus a non-array payload case
    localStorage.setItem(
      FAV_KEY,
      JSON.stringify([42, { nope: true }, "Poko", null]),
    );

    // Act
    const { result } = renderHook(() => useFavorites());

    // Assert: only the salvageable entry survives
    expect(result.current.favs).toEqual([{ seed: "Poko", opts: null }]);
  });

  it("toggle adds then removes, keyed by seed AND options", () => {
    // Arrange
    const { result } = renderHook(() => useFavorites());

    // Act: favorite the same seed twice — once live (null) and once pinned
    act(() => result.current.toggle("Poko", null));
    act(() => result.current.toggle("Poko", retro));

    // Assert: they are distinct favorites
    expect(result.current.favs).toHaveLength(2);
    expect(result.current.isFav("Poko", null)).toBe(true);
    expect(result.current.isFav("Poko", retro)).toBe(true);

    // Act: toggling one off leaves the other alone
    act(() => result.current.toggle("Poko", null));

    // Assert
    expect(result.current.favs).toEqual([{ seed: "Poko", opts: retro }]);
    expect(stored()).toEqual(result.current.favs);
  });

  it("swap exchanges two positions and ignores out-of-range indices", () => {
    // Arrange: three favorites in insertion order
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggle("a", null);
      result.current.toggle("b", null);
      result.current.toggle("c", null);
    });

    // Act: a valid swap, then attempts that must be no-ops
    act(() => result.current.swap(0, 2));
    const afterValid = result.current.favs.map((f) => f.seed);
    act(() => result.current.swap(0, 3));
    act(() => result.current.swap(-1, 1));

    // Assert: only the two swapped cells traded places, invalid calls did nothing
    expect(afterValid).toEqual(["c", "b", "a"]);
    expect(result.current.favs.map((f) => f.seed)).toEqual(["c", "b", "a"]);
  });

  it("clear empties the list and the storage", () => {
    // Arrange
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggle("Poko", null));

    // Act
    act(() => result.current.clear());

    // Assert
    expect(result.current.favs).toEqual([]);
    expect(stored()).toEqual([]);
  });
});
