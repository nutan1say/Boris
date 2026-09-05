import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const STORAGE_KEY = 'boris_leaderboard';

/**
 * @typedef {{
 *   userId: string,
 *   name: string,
 *   avatarUrl?: string | null,
 *   deaths: number,
 *   coins: number,
 *   updatedAt: string,
 * }} ScoreEntry
 */

function clerkDisplayName(user) {
  if (!user) return 'Player';
  return (
    user.fullName ||
    user.username ||
    user.primaryEmailAddress?.emailAddress ||
    'Player'
  );
}

function sortScores(scores) {
  return [...scores].sort((a, b) => {
    if (a.deaths !== b.deaths) return a.deaths - b.deaths;
    if (a.coins !== b.coins) return b.coins - a.coins;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
}

function isBetterRun(next, existing) {
  if (!existing || existing.deaths == null) return true;
  return (
    next.deaths < existing.deaths ||
    (next.deaths === existing.deaths && next.coins > existing.coins)
  );
}

/** @returns {ScoreEntry[]} */
function getLocalScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalScores(scores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sortScores(scores)));
}

function mapProfileRow(row) {
  return {
    userId: row.clerk_user_id,
    name: row.display_name || 'Player',
    avatarUrl: row.avatar_url || null,
    deaths: row.best_deaths ?? 0,
    coins: row.best_coins ?? 0,
    updatedAt: row.best_updated_at || row.updated_at || new Date().toISOString(),
  };
}

/**
 * @param {number} [limit=10]
 * @returns {Promise<ScoreEntry[]>}
 */
export async function fetchTopProfiles(limit = 10) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'clerk_user_id, display_name, avatar_url, best_deaths, best_coins, best_updated_at, updated_at',
      )
      .not('best_deaths', 'is', null)
      .order('best_deaths', { ascending: true, nullsFirst: false })
      .order('best_coins', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error('Supabase fetchTopProfiles:', error.message);
      return sortScores(getLocalScores()).slice(0, limit);
    }

    return (data || []).map(mapProfileRow);
  }

  return sortScores(getLocalScores()).slice(0, limit);
}

/** @deprecated use fetchTopProfiles */
export function getTopScores(limit = 10) {
  return sortScores(getLocalScores()).slice(0, limit);
}

/**
 * Sync Clerk user name/avatar into profiles (no score change).
 * @param {{ id: string, fullName?: string | null, username?: string | null, imageUrl?: string, primaryEmailAddress?: { emailAddress?: string } }} user
 */
export async function upsertProfileFromClerk(user) {
  if (!user?.id) return;

  const displayName = clerkDisplayName(user);
  const avatarUrl = user.imageUrl || null;

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('profiles').upsert(
      {
        clerk_user_id: user.id,
        display_name: displayName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_user_id' },
    );

    if (error) {
      console.error('Supabase upsertProfileFromClerk:', error.message);
    }
  }
}

/**
 * Upsert best finished run: fewest deaths, then most coins.
 * @param {{ userId: string, name: string, avatarUrl?: string | null, deaths: number, coins: number }} entry
 * @returns {Promise<ScoreEntry[]>}
 */
export async function upsertBestScore({ userId, name, avatarUrl = null, deaths, coins }) {
  if (!userId) return fetchTopProfiles(10);

  const nextDeaths = Number(deaths) || 0;
  const nextCoins = Number(coins) || 0;
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { data: existing, error: readError } = await supabase
      .from('profiles')
      .select('best_deaths, best_coins')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (readError) {
      console.error('Supabase upsertBestScore read:', readError.message);
    }

    const shouldWrite = isBetterRun(
      { deaths: nextDeaths, coins: nextCoins },
      existing
        ? { deaths: existing.best_deaths, coins: existing.best_coins }
        : null,
    );

    const payload = {
      clerk_user_id: userId,
      display_name: name || 'Player',
      avatar_url: avatarUrl,
      updated_at: now,
    };

    if (shouldWrite) {
      payload.best_deaths = nextDeaths;
      payload.best_coins = nextCoins;
      payload.best_updated_at = now;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'clerk_user_id' });

    if (error) {
      console.error('Supabase upsertBestScore:', error.message);
    }

    return fetchTopProfiles(10);
  }

  // localStorage fallback
  const scores = getLocalScores();
  const existing = scores.find((s) => s.userId === userId);
  const next = {
    userId,
    name: name || 'Player',
    avatarUrl,
    deaths: nextDeaths,
    coins: nextCoins,
    updatedAt: now,
  };

  if (!existing) {
    scores.push(next);
  } else if (isBetterRun(next, existing)) {
    Object.assign(existing, next);
  } else {
    existing.name = next.name;
    existing.avatarUrl = next.avatarUrl;
  }

  saveLocalScores(scores);
  return sortScores(scores).slice(0, 10);
}

/** @deprecated use upsertBestScore */
export async function upsertScore(entry) {
  return upsertBestScore(entry);
}
