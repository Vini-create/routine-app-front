export const routineBlockRecordsStorageKey = "rotina-ai-routine-block-records";

export type RoutineBlockRecordStatus = "done" | "not_done";

export type RoutineBlockRecord = {
  blockId: string;
  date: string;
  status: RoutineBlockRecordStatus;
  automatic?: boolean;
  updatedAt: string;
};

export function getRoutineBlockSourceId(blockId: string, date: string) {
  const datePrefix = `${date}-`;
  return blockId.startsWith(datePrefix) ? blockId.slice(datePrefix.length) : blockId;
}

export function readRoutineBlockRecords(): RoutineBlockRecord[] {
  // API_CONNECTION_POINT: replace with GET /routine/block-records?from=...&to=...
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(routineBlockRecordsStorageKey) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isRoutineBlockRecord) : [];
  } catch {
    return [];
  }
}

export function writeRoutineBlockRecords(records: RoutineBlockRecord[]) {
  // API_CONNECTION_POINT: replace with POST/PATCH /routine/block-records.
  window.localStorage.setItem(routineBlockRecordsStorageKey, JSON.stringify(records));
}

export function upsertRoutineBlockRecord(records: RoutineBlockRecord[], record: RoutineBlockRecord) {
  const next = records.filter((item) => !(item.blockId === record.blockId && item.date === record.date));
  return [...next, record];
}

export function removeRoutineBlockRecord(records: RoutineBlockRecord[], blockId: string, date: string) {
  return records.filter((item) => !(item.blockId === blockId && item.date === date));
}

export function ensureRoutineBlockRecords(records: RoutineBlockRecord[], defaults: RoutineBlockRecord[]) {
  const existingKeys = new Set(records.map((record) => `${record.date}:${record.blockId}`));
  const missing = defaults.filter((record) => !existingKeys.has(`${record.date}:${record.blockId}`));
  return missing.length ? [...records, ...missing] : records;
}

function isRoutineBlockRecord(value: unknown): value is RoutineBlockRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Partial<RoutineBlockRecord>;
  return (
    typeof record.blockId === "string" &&
    typeof record.date === "string" &&
    (record.status === "done" || record.status === "not_done") &&
    typeof record.updatedAt === "string"
  );
}
