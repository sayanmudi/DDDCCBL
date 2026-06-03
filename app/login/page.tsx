'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      username: userId,
      password,
      callbackUrl: '/dashboard'
    });

    if (result?.error) {
      setError('Invalid credentials.');
      return;
    }

    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 text-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl shadow-slate-200/80 backdrop-blur-sm">
        <h1 className="text-3xl font-semibold mb-2 text-slate-1200">Welcome to Dakshin Dinajpur District Central Co-operative Bank Ltd.</h1>
        <p className="text-slate-600 mb-6">Please sign in with your user id and password.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-slate-700">User ID</span>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              pattern="[0-9]*"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              placeholder="Employee ID"
              required
            />
          </label>

          <label className="block">
            <span className="text-slate-700">Password</span>
            <div className="relative mt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-24 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-cyan-400"
          >
            Sign in
          </button>

          {error && <p className="text-sm text-rose-500">{error}</p>}
        </form>
      </div>
    </main>
  );
}
