/** Three calendar months, clamped to the last day of the target month. */
export function retentionDeadline(closedAt: Date): string {
  const result = new Date(closedAt);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + 3);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result.toISOString().slice(0, 19).replace("T", " ");
}
