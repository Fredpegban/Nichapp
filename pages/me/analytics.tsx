import { useEffect, useState } from 'react';
import Layout from '../../src/components/Layout';

type StatCardProps = { label: string; value: number };

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    profileViews: 0,
    storyViews: 0,
    followers: 0,
    storyCount: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) return;
        const me = await meRes.json();
        const foundersRes = await fetch('/api/founders');
        if (!foundersRes.ok) return;
        const data = await foundersRes.json();
        const mine = (data.items || []).find((f: any) => f.userId === me.user?._id);
        if (mine?.stats) {
          setStats({
            profileViews: mine.stats.profileViews || 0,
            storyViews: mine.stats.storyCount || 0, // placeholder until dedicated analytics exists
            followers: mine.stats.followersCount || 0,
            storyCount: mine.stats.storyCount || 0,
          });
        }
      } catch {
        // ignore errors
      }
    };
    load();
  }, []);

  const cards: StatCardProps[] = [
    { label: 'Profile Views', value: stats.profileViews },
    { label: 'Story Views', value: stats.storyViews },
    { label: 'Followers', value: stats.followers },
    { label: 'Stories', value: stats.storyCount },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}
