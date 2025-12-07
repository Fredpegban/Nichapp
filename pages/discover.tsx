import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { demoFounders, demoStories } from '../src/lib/demoData';

interface Founder {
  _id: string;
  name?: string;
  brandName?: string;
  nicheName?: string;
  nicheCategoryId?: string;
  region?: string;
  aboutFounder?: string;
}

interface Niche {
  _id: string;
  name: string;
  slug: string;
}

interface DiscoverResponse {
  trendingFounders: Founder[];
  trendingNiches: Niche[];
  recentFounders: Founder[];
}

interface FoundersListResponse {
  items: Founder[];
  page: number;
  totalPages?: number;
}

const DiscoverPage: NextPage = () => {
  const [trendingFounders, setTrendingFounders] = useState<Founder[]>([]);
  const [trendingNiches, setTrendingNiches] = useState<Niche[]>([]);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<{ niche?: string; region?: string }>({});
  const [isLoadingFounders, setIsLoadingFounders] = useState(false);
  const [isLoadingDiscover, setIsLoadingDiscover] = useState(false);

  const loadDiscover = async () => {
    setIsLoadingDiscover(true);
    try {
      const res = await fetch('/api/discover');
      if (res.ok) {
        const data: DiscoverResponse = await res.json();
        setTrendingFounders(data.trendingFounders || []);
        setTrendingNiches(data.trendingNiches || []);
      }
      // If empty, use demo
      if (trendingFounders.length === 0) setTrendingFounders(demoFounders.slice(0, 4));
      if (trendingNiches.length === 0) {
        setTrendingNiches(
          demoStories.slice(0, 3).map((s, idx) => ({
            _id: `demo-n${idx}`,
            name: (s.founderProfileId as any)?.brandName || 'Niche',
            slug: `demo-${idx}`,
          }))
        );
      }
    } finally {
      setIsLoadingDiscover(false);
    }
  };

  const loadFounders = async (nextPage = 1, append = false) => {
    setIsLoadingFounders(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(nextPage));
      params.set('limit', '12');
      if (filters.niche) params.set('niche', filters.niche);
      if (filters.region) params.set('region', filters.region);
      const res = await fetch(`/api/founders?${params.toString()}`);
      if (res.ok) {
        const data: FoundersListResponse = await res.json();
        const items = data.items || [];
        if (items.length === 0 && nextPage === 1) {
          setFounders(demoFounders);
          setPage(1);
          setTotalPages(1);
        } else {
          setFounders((prev) => (append ? [...prev, ...items] : items));
          setPage(data.page || nextPage);
          setTotalPages(data.totalPages || 1);
        }
      } else if (nextPage === 1) {
        setFounders(demoFounders);
        setPage(1);
        setTotalPages(1);
      }
    } finally {
      setIsLoadingFounders(false);
    }
  };

  useEffect(() => {
    loadDiscover();
    loadFounders(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadFounders(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const hasMore = useMemo(() => page < totalPages, [page, totalPages]);

  const handleLoadMore = () => {
    if (hasMore && !isLoadingFounders) {
      loadFounders(page + 1, true);
    }
  };

  const filteredLabel = useMemo(() => {
    if (!filters.niche && !filters.region) return 'All founders';
    const parts = [];
    if (filters.niche) parts.push(`Niche: ${filters.niche}`);
    if (filters.region) parts.push(`Region: ${filters.region}`);
    return parts.join(' · ');
  }, [filters.niche, filters.region]);

  const renderFounderCard = (founder: Founder) => {
    const initial = (founder.name || founder.brandName || '?').charAt(0).toUpperCase();
    const about = founder.aboutFounder || '';
    const snippet = about.length > 80 ? `${about.slice(0, 77)}...` : about;
    return (
      <div
        key={founder._id}
        className="transform rounded-lg bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {initial}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{founder.name || 'Founder'}</div>
            <div className="text-xs text-slate-600">{founder.brandName || 'Brand'}</div>
          </div>
        </div>
        <div className="mt-3 space-y-1 text-xs text-slate-700">
          <div className="font-medium text-indigo-700">{founder.nicheName || founder.nicheCategoryId || 'Niche'}</div>
          <div className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
            {founder.region || 'Region'}
          </div>
          <p className="text-slate-600">{snippet || 'No description yet.'}</p>
        </div>
        <div className="mt-3">
          <Link
            href={`/founders/${founder._id}`}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View profile
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">Discover niche founders and stories</h1>
          <p className="mt-2 text-sm text-slate-600">
            Browse founders by niche and region, discover new brands, and follow the stories that inspire you.
          </p>
        </header>

        <section className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <select
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={filters.niche || ''}
                onChange={(e) => setFilters((f) => ({ ...f, niche: e.target.value || undefined }))}
              >
                <option value="">All niches</option>
                {trendingNiches.map((niche) => (
                  <option key={niche._id} value={niche._id}>
                    {niche.name}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={filters.region || ''}
                onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value || undefined }))}
              >
                <option value="">All regions</option>
                <option value="Africa">Africa</option>
                <option value="UK">UK</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="text-xs font-medium text-slate-600">
              Showing {founders.length} founders · {filteredLabel}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900">Trending niches</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {trendingNiches.map((niche) => (
              <button
                key={niche._id}
                onClick={() => setFilters((f) => ({ ...f, niche: niche._id }))}
                className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
              >
                {niche.name}
              </button>
            ))}
            {!isLoadingDiscover && trendingNiches.length === 0 && (
              <div className="text-xs text-slate-500">No trending niches yet.</div>
            )}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-gray-900">Founders to watch</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {trendingFounders.map((founder) => (
              <div
                key={founder._id}
                className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-sm font-semibold text-gray-900">{founder.name || 'Founder'}</div>
                <div className="text-xs text-slate-600">{founder.brandName || 'Brand'}</div>
                <div className="mt-2 text-xs text-indigo-700">{founder.nicheName || founder.nicheCategoryId || 'Niche'}</div>
                <div className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                  {founder.region || 'Region'}
                </div>
                <div className="mt-3">
                  <Link
                    href={`/founders/${founder._id}`}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            ))}
            {isLoadingDiscover && trendingFounders.length === 0 && (
              <div className="col-span-full text-xs text-slate-500">Loading trending founders...</div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All founders</h2>
            <p className="text-sm text-slate-600">Discover and follow niche founders you care about.</p>
          </div>

          {isLoadingFounders && founders.length === 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex animate-pulse flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/2 rounded bg-slate-200" />
                        <div className="h-3 w-1/3 rounded bg-slate-200" />
                      </div>
                    </div>
                    <div className="h-3 w-full rounded bg-slate-200" />
                    <div className="h-3 w-3/4 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : founders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-700">
              No founders match these filters yet. Try changing the niche or region.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {founders.map((founder) => renderFounderCard(founder))}
            </div>
          )}

          {hasMore && founders.length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingFounders}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingFounders ? 'Loading...' : 'Load more founders'}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DiscoverPage;
