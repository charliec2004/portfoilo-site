import { useState, useEffect } from 'react';

const CACHE_KEY = 'gh_repos_cache';
const CACHE_VERSION = 2; // bump when data shape changes
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCache(repos) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CACHE_VERSION || Date.now() - parsed.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    // Invalidate if any current repo is missing from cache
    if (repos && repos.some((r) => !parsed.data[r.repo])) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now(), version: CACHE_VERSION }));
  } catch { /* quota exceeded — ignore */ }
}

function relativeTime(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function useGitHubRepos(repos) {
  const [data, setData] = useState(() => getCache(repos) || {});
  const [loading, setLoading] = useState(() => !getCache(repos));

  useEffect(() => {
    const cached = getCache(repos);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;

    Promise.allSettled(
      repos.map((r) =>
        Promise.all([
          fetch(`https://api.github.com/repos/${r.repo}`)
            .then((res) => { if (!res.ok) throw new Error(`${res.status}`); return res.json(); }),
          fetch(`https://api.github.com/repos/${r.repo}/languages`)
            .then((res) => { if (!res.ok) throw new Error(`${res.status}`); return res.json(); }),
        ]).then(([json, langs]) => {
          const totalBytes = Object.values(langs).reduce((a, b) => a + b, 0);
          const languages = totalBytes > 0
            ? Object.entries(langs)
                .map(([name, bytes]) => ({ name, percent: bytes / totalBytes }))
                .filter((l) => l.percent >= 0.25)
                .sort((a, b) => b.percent - a.percent)
            : [];
          return {
            repo: r.repo,
            description: json.description,
            languages,
            stars: json.stargazers_count,
            updatedAt: relativeTime(json.pushed_at),
          };
        })
      )
    ).then((results) => {
      if (cancelled) return;
      const map = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          map[r.value.repo] = r.value;
        }
      });
      setData(map);
      setCache(map);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [repos]);

  return { data, loading };
}
