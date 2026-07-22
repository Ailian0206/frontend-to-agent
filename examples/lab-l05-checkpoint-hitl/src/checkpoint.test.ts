import { describe, expect, it } from "vitest";
import { MemoryCheckpointStore } from "./checkpoint.js";

describe("MemoryCheckpointStore", () => {
  it("save then load returns latest state", () => {
    const store = new MemoryCheckpointStore<{ step: number }>();
    store.save("thread-a", { step: 1 });
    store.save("thread-a", { step: 2 });

    expect(store.load("thread-a")).toEqual({ step: 2 });
  });

  it("load by version returns that snapshot", () => {
    const store = new MemoryCheckpointStore<{ v: string }>();
    store.save("t1", { v: "first" });
    store.save("t1", { v: "second" });

    expect(store.load("t1", 1)).toEqual({ v: "first" });
    expect(store.load("t1", 2)).toEqual({ v: "second" });
  });

  it("returns null for unknown thread or version", () => {
    const store = new MemoryCheckpointStore<string>();
    expect(store.load("missing")).toBeNull();
    store.save("t", "ok");
    expect(store.load("t", 99)).toBeNull();
  });

  it("listVersions returns ordered history with metadata", () => {
    const store = new MemoryCheckpointStore<number>();
    const first = store.save("t", 10);
    const second = store.save("t", 20);

    const versions = store.listVersions("t");
    expect(versions).toHaveLength(2);
    expect(versions[0]?.version).toBe(first.version);
    expect(versions[0]?.state).toBe(10);
    expect(versions[1]?.version).toBe(second.version);
    expect(versions[1]?.state).toBe(20);
    expect(versions[0]!.savedAt <= versions[1]!.savedAt).toBe(true);
  });
});
