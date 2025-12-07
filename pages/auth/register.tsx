import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { setAuthToken, demoEnabled, setDemoUser } from '../../src/lib/auth-client';
import AuthLayout from '../../src/components/auth/AuthLayout';
import AuthCard from '../../src/components/auth/AuthCard';

const RegisterPage: NextPage = () => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'founder' | 'supporter'>('founder');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email, password, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Registration failed. Try another email.');
      }
      const data = await res.json();
      if (data?.token) {
        setAuthToken(data.token);
      }
      router.push('/feed');
    } catch (err: any) {
      if (demoEnabled) {
        const demoUser = { _id: 'demo-user', displayName: displayName || email.split('@')[0], role };
        setDemoUser(demoUser);
        setAuthToken('demo-token');
        router.push('/feed');
        return;
      }
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Join Nichapp" subtitle="Sign up as a founder or supporter and start your journey.">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-800">Display name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-800">Role</label>
            <select
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={role}
              onChange={(e) => setRole(e.target.value as 'founder' | 'supporter')}
            >
              <option value="founder">Founder</option>
              <option value="supporter">Supporter</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Log in.
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default RegisterPage;
