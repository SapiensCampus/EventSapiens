import { useEffect, useState } from 'react';

const CACHE_KEY = 'eventsapiens:github-contributors';
const CACHE_DURATION_MS = 2 * 60 * 60 * 1000;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const FALLBACK_COUNT = 9;
const CONTRIBUTORS_API_URL =
  'https://api.github.com/repos/SapiensCampus/EventSapiens/contributors?per_page=100';

interface ContributorCache {
  count: number;
  expiresAt: number;
}

function readCachedCount(): number | undefined {
  try {
    const value = window.localStorage.getItem(CACHE_KEY);
    if (!value) return undefined;

    const cached = JSON.parse(value) as Partial<ContributorCache>;
    if (
      Number.isInteger(cached.count) &&
      Number.isFinite(cached.expiresAt) &&
      cached.count! > 0 &&
      cached.expiresAt! > Date.now()
    ) {
      return cached.count;
    }
  } catch {
    // Storage may be unavailable or contain stale data.
  }

  return undefined;
}

function cacheCount(count: number): void {
  try {
    const value: ContributorCache = {
      count,
      expiresAt: Date.now() + CACHE_DURATION_MS
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // The live count still works when storage is unavailable.
  }
}

export function useGitHubContributors(): number {
  const [count, setCount] = useState(() => readCachedCount() ?? FALLBACK_COUNT);

  useEffect(() => {
    const controller = new AbortController();
    let requestInProgress = false;

    async function loadContributors(): Promise<void> {
      if (requestInProgress || controller.signal.aborted) return;
      requestInProgress = true;

      try {
        const response = await fetch(CONTRIBUTORS_API_URL, {
          cache: 'no-store',
          headers: { Accept: 'application/vnd.github+json' },
          signal: controller.signal
        });
        if (!response.ok) return;

        const contributors: unknown = await response.json();
        if (!Array.isArray(contributors) || contributors.length === 0) return;

        setCount(contributors.length);
        cacheCount(contributors.length);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      } finally {
        requestInProgress = false;
      }
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void loadContributors();
    };

    void loadContributors();
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadContributors();
    }, REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  return count;
}
