import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { setAuthToken, demoEnabled, setDemoUser } from '../../src/lib/auth-client';
import AuthLayout from '../../src/components/auth/AuthLayout';
import AuthCard from '../../src/components/auth/AuthCard';

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid email or password');
      }
      const data = await res.json();
      if (data?.token) {
        setAuthToken(data.token);
      }
      router.push('/feed');
    } catch (err: any) {
      if (demoEnabled) {
        const demoUser = { _id: 'demo-user', displayName: email.split('@')[0] || 'Demo User', role: 'founder' as const };
        setDemoUser(demoUser);
        setAuthToken('demo-token');
        router.push('/feed');
        return;
      }
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Log in to Nichapp" subtitle="Welcome back. Continue sharing your niche story.">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-800">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          New here?{' '}
          <Link href="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Join as a founder or supporter.
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default LoginPage;
