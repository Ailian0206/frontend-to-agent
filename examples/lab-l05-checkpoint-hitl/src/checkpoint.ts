/** One persisted snapshot for a conversation thread. */
export type CheckpointRecord<T> = {
  version: number;
  savedAt: string;
  state: T;
};

/** Snapshot state so callers cannot mutate history by reference. */
function cloneState<T>(state: T): T {
  return structuredClone(state);
}

/**
 * In-memory checkpoint store for agent thread state (S6).
 * Each save appends a new version; load without version returns the latest.
 */
export class MemoryCheckpointStore<T = unknown> {
  private readonly threads = new Map<string, CheckpointRecord<T>[]>();

  /** Persist a cloned snapshot and return the new version metadata. */
  save(threadId: string, state: T): CheckpointRecord<T> {
    const history = this.threads.get(threadId) ?? [];
    const version = history.length + 1;
    const record: CheckpointRecord<T> = {
      version,
      savedAt: new Date().toISOString(),
      state: cloneState(state),
    };
    history.push(record);
    this.threads.set(threadId, history);
    return { ...record, state: cloneState(record.state) };
  }

  /**
   * Load latest state when `version` is omitted; otherwise load that version.
   * Returns `null` when the thread or version does not exist.
   */
  load(threadId: string, version?: number): T | null {
    const history = this.threads.get(threadId);
    if (!history || history.length === 0) {
      return null;
    }
    if (version === undefined) {
      return cloneState(history[history.length - 1]!.state);
    }
    const match = history.find((entry) => entry.version === version);
    return match ? cloneState(match.state) : null;
  }

  /** List all versions for a thread (oldest first), with cloned states. */
  listVersions(threadId: string): CheckpointRecord<T>[] {
    return (this.threads.get(threadId) ?? []).map((entry) => ({
      ...entry,
      state: cloneState(entry.state),
    }));
  }
}
