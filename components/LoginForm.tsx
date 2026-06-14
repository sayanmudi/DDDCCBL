'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginForm() {
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
      // Check if it's a deactivated user error
      if (result.error.includes('Deactivated')) {
        setError('User Deactivated. Please contact administrator or the Branch Manager');
      } else {
        setError('Invalid credentials.');
      }
      return;
    }

    router.push('/dashboard');
  }

  return (
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
  );
}

// Made with Bob
