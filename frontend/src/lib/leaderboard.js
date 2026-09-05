const STORAGE_KEY = 'boris_leaderboard';

/**
 * @typedef {{ userId: string, name: string, deaths: number, coins: number, updatedAt: string }} ScoreEntry
 */

/** @returns {ScoreEntry[]} */
export function getScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Upsert a player's best run: fewest deaths, then most coins.
 * @param {{ userId: string, name: string, deaths: number, coins: number }} entry
 * @returns {ScoreEntry[]}
 */
export function upsertScore({ userId, name, deaths, coins }) {
  if (!userId) return getScores();

  const scores = getScores();
  const existing = scores.find((s) => s.userId === userId);
  const next = {
    userId,
    name: name || 'Player',
    deaths: Number(deaths) || 0,
    coins: Number(coins) || 0,
    updatedAt: new Date().toISOString(),
  };

  if (!existing) {
    scores.push(next);
  } else {
    const better =
      next.deaths < existing.deaths ||
      (next.deaths === existing.deaths && next.coins > existing.coins);
    if (better) {
      Object.assign(existing, next);
    } else {
      existing.name = next.name;
    }
  }

  scores.sort((a, b) => {
    if (a.deaths !== b.deaths) return a.deaths - b.deaths;
    if (a.coins !== b.coins) return b.coins - a.coins;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  return scores;
}

/** @param {number} [limit=10] */
export function getTopScores(limit = 10) {
  return getScores().slice(0, limit);
}
