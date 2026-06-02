export function sqlString(value: string): string {
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function sqlNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return String(Math.trunc(value));
}

export function normalizePage(value: unknown, fallback = 1): number {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.trunc(page) : fallback;
}

export function normalizePageSize(value: unknown, fallback = 10): number {
  const pageSize = Number(value);
  if (!Number.isFinite(pageSize) || pageSize <= 0) return fallback;
  return Math.min(Math.trunc(pageSize), 50);
}

export function normalizeSort(value: unknown, allowed: string[], fallback: string): string {
  const sort = String(value || fallback);
  return allowed.includes(sort) ? sort : fallback;
}

export function normalizeOrder(value: unknown): "ASC" | "DESC" {
  return String(value).toUpperCase() === "ASC" ? "ASC" : "DESC";
}
