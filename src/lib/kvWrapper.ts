export const { openKv } = Deno;
export const { AtomicOperation, Kv, KvListIterator, KvU64 } = Deno;
export type KvConsistencyLevel = Deno.KvConsistencyLevel;
export type KvEntry<T> = Deno.KvEntry<T>;
export type KvEntryMaybe<T> = Deno.KvEntryMaybe<T>;
export type KvKey = Deno.KvKey;
export type KvKeyPart = Deno.KvKeyPart;
export type KvListSelector = Deno.KvListSelector;
export type KvMutation = Deno.KvMutation;
