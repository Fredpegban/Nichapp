import { useEffect, useState } from 'react';
import Layout from '../../src/components/Layout';

type Story = {
  _id: string;
  authorId?: string | { displayName?: string };
  status: string;
};

const STATUS_OPTIONS = ['published', 'flagged', 'removed'];

export default function AdminDashboard() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stories?status=flagged');
      if (res.ok) {
        const data = await res.json();
        setStories(data.stories || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch('/api/admin/stories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      loadStories();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Story ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Author</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stories.map((story) => (
                <tr key={story._id}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{story._id}</td>
                  <td className="px-4 py-3 text-gray-800">
                    {typeof story.authorId === 'string'
                      ? story.authorId
                      : story.authorId?.displayName || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{story.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(story._id, status)}
                          className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stories.length === 0 && (
            <div className="p-4 text-sm text-gray-600">No flagged stories.</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
