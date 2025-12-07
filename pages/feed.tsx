import type { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';
import StoryCard from '../src/components/StoryCard';
import StoryComposer from '../src/components/StoryComposer';
import Button from '../src/components/ui/Button';
import Card from '../src/components/ui/Card';
import SectionHeader from '../src/components/ui/SectionHeader';
import { authHeaders, authFetch } from '../src/lib/auth-client';
import { useCurrentUser } from '../src/hooks/useCurrentUser';
import { demoStories } from '../src/lib/demoData';

type User = {
  _id: string;
  displayName: string;
  role: 'founder' | 'supporter' | 'admin';
};

type Story = {
  _id: string;
  authorId: { displayName: string; avatarUrl?: string } | string;
  founderProfileId?: { brandName?: string } | string;
  text: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isLiked?: boolean;
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const FeedPage: NextPage = () => {
  const { user, loading: loadingUser } = useCurrentUser();
  const [stories, setStories] = useState<Story[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingStories, setLoadingStories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [posting, setPosting] = useState(false);
  const [postMessage, setPostMessage] = useState<string | null>(null);
  const [storyViewsLogged, setStoryViewsLogged] = useState<Set<string>>(new Set());

  const isFounder = user?.role === 'founder';

  const fetchStories = async (nextPage = 1) => {
    setLoadingStories(true);
    setError(null);
    try {
      const res = await fetch(`/api/stories?page=${nextPage}&limit=20`);
      if (!res.ok) throw new Error('Failed to load stories');
      const data = await res.json();
      const fetched = data.items || [];
      if ((nextPage === 1 && fetched.length === 0) || fetched.length === 0) {
        setStories((prev) => (nextPage === 1 ? demoStories : [...prev, ...demoStories]));
        setPage(1);
        setTotalPages(1);
      } else {
        setStories((prev) => (nextPage === 1 ? fetched : [...prev, ...fetched]));
        setPage(data.page || nextPage);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load stories');
      if (nextPage === 1) {
        setStories(demoStories);
        setPage(1);
        setTotalPages(1);
      }
    } finally {
      setLoadingStories(false);
    }
  };

  useEffect(() => {
    fetchStories(1);
  }, []);

  const handleCreate = async ({
    text,
    nicheCategoryId,
  }: {
    text: string;
    mediaFiles: File[];
    nicheCategoryId?: string;
  }) => {
    if (posting) return;
    setPosting(true);
    setPostMessage(null);
    try {
      const res = await authFetch('/api/stories', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ text, mediaUrls: [], nicheCategoryId }),
      });
      if (res.ok) {
        const { story } = await res.json();
        setStories((prev) => [story, ...prev]);
        setPostMessage('Story posted ✨');
        // log event
        authFetch('/api/events', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ type: 'story_created', targetId: story._id }),
        });
      } else {
        setPostMessage('Could not post story.');
      }
    } catch {
      setPostMessage('Could not post story.');
    } finally {
      setPosting(false);
      setTimeout(() => setPostMessage(null), 3000);
    }
  };

  const handleLikeToggle = async (id: string) => {
    const currentlyLiked = likedIds.has(id);
    const method = currentlyLiked ? 'DELETE' : 'POST';
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (currentlyLiked) next.delete(id);
      else next.add(id);
      return next;
    });
    setStories((prev) =>
      prev.map((s) =>
        s._id === id
          ? {
              ...s,
              likeCount: Math.max(0, s.likeCount + (currentlyLiked ? -1 : 1)),
            }
          : s
      )
    );
    try {
      await authFetch(`/api/stories/${id}/like`, { method });
    } catch {
      // revert on failure
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (currentlyLiked) next.add(id);
        else next.delete(id);
        return next;
      });
      setStories((prev) =>
        prev.map((s) =>
          s._id === id
            ? {
                ...s,
                likeCount: Math.max(0, s.likeCount + (currentlyLiked ? 1 : -1)),
              }
            : s
        )
      );
    }
  };

  const isEmpty = useMemo(
    () => !loadingStories && stories.length === 0,
    [loadingStories, stories.length]
  );

  useEffect(() => {
    // log story_view once per story per page load
    stories.forEach((story) => {
      if (!storyViewsLogged.has(story._id)) {
        setStoryViewsLogged((prev) => new Set(prev).add(story._id));
        authFetch('/api/events', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ type: 'story_view', targetId: story._id }),
        });
      }
    });
  }, [stories, storyViewsLogged]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <SectionHeader
          eyebrow="Feed"
          title="Founder Stories"
          description="Browse the latest journeys from founders across Africa and the UK."
          className="mb-6"
        />
        {user && (
          <div className="mb-2 text-sm font-medium text-slate-700">
            Welcome back, {user.displayName}.
          </div>
        )}

        {!loadingUser && !isFounder && (
          <Card className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-700">Log in as a founder to share your story.</p>
              <Button onClick={() => (window.location.href = '/auth/login')} size="sm">
                Login
              </Button>
            </div>
          </Card>
        )}

        {isFounder && (
          <div className="mb-6">
            <StoryComposer onSubmit={handleCreate} submitting={posting} successMessage={postMessage} />
          </div>
        )}

        {loadingStories && stories.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex animate-pulse gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                    <div className="h-3 w-1/4 rounded bg-slate-200" />
                    <div className="h-20 w-full rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-700">
            {isFounder
              ? 'No stories yet. Be the first founder to share your journey.'
              : 'Follow founders to see more stories.'}
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <StoryCard
                key={story._id}
                id={story._id}
                authorName={
                  typeof story.authorId === 'string'
                    ? 'Founder'
                    : story.authorId.displayName || 'Founder'
                }
                authorAvatarUrl={typeof story.authorId === 'string' ? undefined : story.authorId.avatarUrl}
                brandName={
                  typeof story.founderProfileId === 'string'
                    ? undefined
                    : story.founderProfileId?.brandName
                }
                createdAt={formatRelativeTime(story.createdAt)}
                text={story.text}
                mediaUrls={story.mediaUrls}
                likeCount={story.likeCount}
                commentCount={story.commentCount}
                isLiked={likedIds.has(story._id) || story.isLiked}
                onLikeToggle={handleLikeToggle}
                onClick={() => {
                  window.location.href = `/stories/${story._id}`;
                }}
              />
            ))}
          </div>
        )}

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        {page < totalPages && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => fetchStories(page + 1)}
              disabled={loadingStories}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingStories ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedPage;
