import { useState, useEffect } from 'react';

const CACHE_KEY = 'gh_repos_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
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
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
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
  const [data, setData] = useState(() => getCache() || {});
  const [loading, setLoading] = useState(() => !getCache());

  useEffect(() => {
    const cached = getCache();
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;

    Promise.allSettled(
      repos.map((r) =>
        fetch(`https://api.github.com/repos/${r.repo}`)
          .then((res) => {
            if (!res.ok) throw new Error(`${res.status}`);
            return res.json();
          })
          .then((json) => ({
            repo: r.repo,
            description: json.description,
            language: json.language,
            stars: json.stargazers_count,
            updatedAt: relativeTime(json.pushed_at),
          }))
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
