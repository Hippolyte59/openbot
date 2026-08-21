const numberFormatter = new Intl.NumberFormat("fr-FR");

/** Formate un nombre à la française : 1234567 -> 1 234 567 */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Barre de progression visuelle. */
export function progressBar(
  current: number,
  max: number,
  size = 12,
): string {
  const ratio = max <= 0 ? 0 : Math.min(1, current / max);
  const filled = Math.round(ratio * size);
  const empty = Math.max(0, size - filled);
  return "▰".repeat(filled) + "▱".repeat(empty);
}

/** Formate une durée en millisecondes : "2 h 05 min", "3 min", "45 s". */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  }
  if (minutes > 0) {
    return `${minutes} min`;
  }
  return `${seconds} s`;
}
