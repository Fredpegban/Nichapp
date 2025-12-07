import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import StoryCard from '../../src/components/StoryCard';
import { authFetch } from '../../src/lib/auth-client';
import { useCurrentUser } from '../../src/hooks/useCurrentUser';
import { demoFounders, demoStories } from '../../src/lib/demoData';

interface Story {
  _id: string;
  text: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

interface FounderProfile {
  _id: string;
  userId: string;
  name: string;
  brandName?: string;
  nicheName?: string;
  region?: string;
  aboutFounder?: string;
  storyHighlights?: string[];
  stats: {
    storyCount: number;
    followersCount: number;
    profileViews: number;
  };
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    linkedin?: string;
  };
  stories?: Story[];
}

const FounderProfilePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [founder, setFounder] = useState<FounderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followPending, setFollowPending] = useState(false);
  const { user, loading: loadingUser } = useCurrentUser();

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    const fetchFounder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/founders/${id}`);
        if (res.ok) {
          const data: { founder: FounderProfile } = await res.json();
          setFounder(data.founder);
          // fire analytics
          await authFetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'profile_view', targetId: data.founder._id }),
          });
        } else {
          const fallback = demoFounders.find((f) => f._id === id);
          if (!fallback) throw new Error('Failed to load founder');
          setFounder({
            ...fallback,
            stats: fallback.stats || { storyCount: 0, followersCount: 0, profileViews: 0 },
            stories: demoStories.filter(
              (s) =>
                (typeof s.authorId === 'object' && s.authorId.displayName === fallback.name) ||
                (typeof s.founderProfileId === 'object' &&
                  s.founderProfileId.brandName === fallback.brandName)
            ),
          });
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load founder');
      } finally {
        setLoading(false);
      }
    };
    fetchFounder();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!founder) return;
    const method = isFollowing ? 'DELETE' : 'POST';
    setFollowPending(true);
    setIsFollowing((prev) => !prev);
    setFounder((prev) =>
      prev
        ? {
            ...prev,
            stats: {
              ...prev.stats,
              followersCount: Math.max(0, prev.stats.followersCount + (isFollowing ? -1 : 1)),
            },
          }
        : prev
    );
    try {
      await authFetch(`/api/follow/${founder._id}`, { method });
    } catch {
      // revert on error
      setIsFollowing((prev) => !prev);
      setFounder((prev) =>
        prev
          ? {
              ...prev,
              stats: {
                ...prev.stats,
                followersCount: Math.max(0, prev.stats.followersCount + (isFollowing ? 1 : -1)),
              },
            }
          : prev
      );
    } finally {
      setFollowPending(false);
    }
  };

  const canFollow = user && founder && user._id !== founder.userId && !loadingUser;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-6 w-48 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-200" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !founder) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-lg bg-white p-6 text-sm text-red-600 shadow-sm ring-1 ring-slate-100">
            {error || 'Founder not found.'}
          </div>
        </main>
      </div>
    );
  }

  const initial = (founder.name || founder.brandName || 'F').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 text-sm">
          <Link href="/discover" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Discover
          </Link>
        </div>

        <section className="mb-8 flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
              {initial}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">{founder.name}</h1>
              <p className="text-sm text-slate-600">{founder.brandName}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {founder.nicheName && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
                    {founder.nicheName}
                  </span>
                )}
                {founder.region && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                    {founder.region}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canFollow && (
              <button
                onClick={handleFollowToggle}
                disabled={followPending}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm ${
                  isFollowing
                    ? 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {followPending ? 'Updating...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
            {user && founder && user._id === founder.userId && (
              <Link
                href="/me/profile"
                className="inline-flex items-center justify-center rounded-md bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-100 hover:bg-indigo-100"
              >
                Edit profile
              </Link>
            )}
          </div>
        </section>

        <section className="mb-8 space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">About this founder</h2>
            <p className="mt-2 text-sm text-slate-700">{founder.aboutFounder || 'No details yet.'}</p>
          </div>

          {founder.storyHighlights && founder.storyHighlights.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Story highlights</h3>
              <div className="flex flex-wrap gap-2">
                {founder.storyHighlights.map((h, idx) => (
                  <span
                    key={`${h}-${idx}`}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mb-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-500">Stories</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{founder.stats.storyCount}</div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-500">Followers</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{founder.stats.followersCount}</div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-500">Profile views</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{founder.stats.profileViews}</div>
            </div>
          </div>

          {founder.socialLinks && (
            <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <h3 className="text-sm font-semibold text-gray-900">Social links</h3>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-indigo-700">
                {founder.socialLinks.instagram && (
                  <a
                    className="rounded-md bg-indigo-50 px-3 py-1 hover:bg-indigo-100"
                    href={founder.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                )}
                {founder.socialLinks.tiktok && (
                  <a
                    className="rounded-md bg-indigo-50 px-3 py-1 hover:bg-indigo-100"
                    href={founder.socialLinks.tiktok}
                    target="_blank"
                    rel="noreferrer"
                  >
                    TikTok
                  </a>
                )}
                {founder.socialLinks.linkedin && (
                  <a
                    className="rounded-md bg-indigo-50 px-3 py-1 hover:bg-indigo-100"
                    href={founder.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent stories</h2>
            <p className="text-sm text-slate-600">Highlights from this founder’s journey.</p>
          </div>
          {founder.stories && founder.stories.length > 0 ? (
            <div className="space-y-4">
              {founder.stories.map((story) => (
                <StoryCard
                  key={story._id}
                  id={story._id}
                  authorName={founder.name}
                  authorAvatarUrl={undefined}
                  brandName={founder.brandName}
                  createdAt={story.createdAt}
                  text={story.text}
                  mediaUrls={[]}
                  likeCount={story.likeCount}
                  commentCount={story.commentCount}
                  onLikeToggle={() => {}}
                  onClick={() => {
                    window.location.href = `/stories/${story._id}`;
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
              This founder hasn’t shared any stories yet.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default FounderProfilePage;
