'use client';

import { useState, useEffect } from 'react';

export default function OrganizationSettings() {
  const [sessionTimeout, setSessionTimeout] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/organization/settings');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load settings');
        return;
      }

      setSessionTimeout(data.sessionTimeoutMinutes || 15);
    } catch (err) {
      setError('Failed to load organization settings');
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveSettings() {
    setMessage(null);
    setError(null);

    if (sessionTimeout < 15 || sessionTimeout > 720) {
      setError('Session timeout must be between 15 minutes and 12 hours (720 minutes)');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/organization/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionTimeoutMinutes: sessionTimeout })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save settings');
        return;
      }

      setMessage('Organization settings saved successfully. Users will need to log in again for changes to take effect.');
    } catch (err) {
      setError('Failed to save organization settings');
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  }

  function handleTimeoutChange(value: string) {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setSessionTimeout(numValue);
    }
  }

  function formatTimeoutDisplay(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-400">Loading organization settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Organization Settings</h1>
          <p className="mt-3 text-slate-400">Configure organization-wide settings. Only visible to administrators.</p>
        </div>
      </div>

      {message && (
        <div className="mt-6 rounded-3xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-green-100">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-100">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-6">
        <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-100">Session Timeout</h2>
              <p className="text-sm text-slate-400">
                Set the maximum idle time before users are automatically logged out.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Save settings'}
            </button>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="sessionTimeout" className="text-sm font-medium text-slate-300">
                Timeout Duration (minutes)
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="sessionTimeout"
                  type="range"
                  min="15"
                  max="720"
                  step="15"
                  value={sessionTimeout}
                  onChange={(e) => handleTimeoutChange(e.target.value)}
                  className="flex-1 accent-cyan-500"
                />
                <input
                  type="number"
                  min="15"
                  max="720"
                  value={sessionTimeout}
                  onChange={(e) => handleTimeoutChange(e.target.value)}
                  className="w-24 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Current: {formatTimeoutDisplay(sessionTimeout)}</span>
                <span>Range: 15 minutes to 12 hours</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-300">Quick Presets</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSessionTimeout(15)}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500 hover:text-cyan-200"
                >
                  15 min
                </button>
                <button
                  type="button"
                  onClick={() => setSessionTimeout(30)}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500 hover:text-cyan-200"
                >
                  30 min
                </button>
                <button
                  type="button"
                  onClick={() => setSessionTimeout(60)}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500 hover:text-cyan-200"
                >
                  1 hour
                </button>
                <button
                  type="button"
                  onClick={() => setSessionTimeout(120)}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500 hover:text-cyan-200"
                >
                  2 hours
                </button>
                <button
                  type="button"
                  onClick={() => setSessionTimeout(240)}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500 hover:text-cyan-200"
                >
                  4 hours
                </button>
                <button
                  type="button"
                  onClick={() => setSessionTimeout(480)}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500 hover:text-cyan-200"
                >
                  8 hours
                </button>
                <button
                  type="button"
                  onClick={() => setSessionTimeout(720)}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500 hover:text-cyan-200"
                >
                  12 hours
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex gap-3">
                <svg className="h-5 w-5 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-amber-200">
                  <p className="font-semibold">Important Note</p>
                  <p className="mt-1 text-amber-200/80">
                    Changes to session timeout will apply to new login sessions. Existing logged-in users will need to log out and log back in for the new timeout to take effect.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Made with Bob
