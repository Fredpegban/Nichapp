import { useEffect, useState } from 'react';
import Button from '../../src/components/ui/Button';
import Card from '../../src/components/ui/Card';
import SectionHeader from '../../src/components/ui/SectionHeader';
import { authHeaders, authFetch } from '../../src/lib/auth-client';
import { useCurrentUser } from '../../src/hooks/useCurrentUser';

type ProfileForm = {
  brandName?: string;
  aboutFounder?: string;
  storyHighlights?: string;
  nicheCategoryId?: string;
  region?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
};

export default function EditProfilePage() {
  const { user, loading: loadingUser } = useCurrentUser();
  const [form, setForm] = useState<ProfileForm>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authFetch('/api/auth/me');
        if (!res.ok) return;
        const me = await res.json();
        if (!me?.user?._id) return;
        const foundersRes = await authFetch('/api/founders');
        if (foundersRes.ok) {
          const data = await foundersRes.json();
          const mine = (data.items || []).find((f: any) => f.userId === me.user._id);
          if (mine) {
            setForm({
              brandName: mine.brandName,
              aboutFounder: mine.aboutFounder,
              storyHighlights: (mine.storyHighlights || []).join('\n'),
              nicheCategoryId: mine.nicheCategoryId,
              region: mine.region,
              instagram: mine.socialLinks?.instagram,
              tiktok: mine.socialLinks?.tiktok,
              linkedin: mine.socialLinks?.linkedin,
            });
          }
        }
      } catch {
        // ignore
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const highlights = form.storyHighlights
        ? form.storyHighlights.split('\n').map((h) => h.trim()).filter(Boolean)
        : [];
      const res = await authFetch('/api/founders', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          ...form,
          storyHighlights: highlights,
          socialLinks: {
            instagram: form.instagram,
            tiktok: form.tiktok,
            linkedin: form.linkedin,
          },
        }),
      });
      if (res.ok) {
        setMessage('Profile saved');
      } else if (res.status === 401) {
        setMessage('Please log in');
      } else {
        setMessage('Failed to save');
      }
    } catch {
      setMessage('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <SectionHeader
          eyebrow="Onboarding"
          title="Step 1 of 2 – Complete your founder profile"
          description="Add your brand, niche, and story highlights. Next, share your first story on the feed."
        />
        <Card>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Edit Founder Profile</h1>
            <Button onClick={handleSubmit} disabled={loading || loadingUser} size="sm">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <div className="mt-6 space-y-4">
            <FormField label="Brand Name">
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={form.brandName || ''}
                onChange={(e) => setForm((f) => ({ ...f, brandName: e.target.value }))}
              />
            </FormField>
            <FormField label="About Founder">
              <textarea
                className="w-full rounded-md border px-3 py-2 text-sm"
                rows={4}
                value={form.aboutFounder || ''}
                onChange={(e) => setForm((f) => ({ ...f, aboutFounder: e.target.value }))}
              />
            </FormField>
            <FormField label="Highlights (one per line)">
              <textarea
                className="w-full rounded-md border px-3 py-2 text-sm"
                rows={3}
                value={form.storyHighlights || ''}
                onChange={(e) => setForm((f) => ({ ...f, storyHighlights: e.target.value }))}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Niche">
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.nicheCategoryId || ''}
                  onChange={(e) => setForm((f) => ({ ...f, nicheCategoryId: e.target.value }))}
                />
              </FormField>
              <FormField label="Region">
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.region || ''}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                >
                  <option value="">Select</option>
                  <option value="Africa">Africa</option>
                  <option value="UK">UK</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Instagram">
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.instagram || ''}
                  onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
                />
              </FormField>
              <FormField label="TikTok">
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.tiktok || ''}
                  onChange={(e) => setForm((f) => ({ ...f, tiktok: e.target.value }))}
                />
              </FormField>
              <FormField label="LinkedIn">
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.linkedin || ''}
                  onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
                />
              </FormField>
            </div>
            {message && <div className="text-sm text-gray-700">{message}</div>}
          </div>
        </Card>
      </main>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {children}
    </label>
  );
}
