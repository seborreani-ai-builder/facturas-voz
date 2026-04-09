import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Strip accents and lowercase for comparison */
export function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Check if two strings are a fuzzy match (accent-insensitive, tolerant) */
export function fuzzyMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  // Levenshtein-like: allow 2 char difference for names > 5 chars
  if (na.length > 5 && nb.length > 5) {
    const distance = levenshtein(na, nb);
    const maxLen = Math.max(na.length, nb.length);
    return distance <= Math.min(2, Math.floor(maxLen * 0.2));
  }
  return false;
}

/** Find best matching client by name */
export function findClientMatch<T extends { name: string }>(
  name: string,
  clients: T[]
): T | null {
  if (!name || name.length < 2) return null;
  // Exact normalized match first
  const exact = clients.find((c) => normalize(c.name) === normalize(name));
  if (exact) return exact;
  // Fuzzy match
  const fuzzy = clients.find((c) => fuzzyMatch(c.name, name));
  return fuzzy || null;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
