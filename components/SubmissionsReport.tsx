'use client';

import { useEffect, useMemo, useState } from 'react';

interface SubmissionFilter {
  submittedBy: string;
  templateName: string;
  templateId: string;
  createdFrom: string;
  createdTo: string;
  updatedFrom: string;
  updatedTo: string;
  status: string;
}

interface SubmissionRecord {
  _id: string;
  templateId: string;
  templateName: string;
  submittedBy: string;
  submittedById: string;
  data: Record<string, any>;
  status: string;
  locked: boolean;
  reviewer_comment?: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SubmissionsReportProps {
  userRole: string;
}

export default function SubmissionsReport({ userRole }: SubmissionsReportProps) {
  const [filters, setFilters] = useState<SubmissionFilter>({
    submittedBy: '',
    templateName: '',
    templateId: '',
    createdFrom: '',
    createdTo: '',
    updatedFrom: '',
    updatedTo: '',
    status: '',
  });
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.submittedBy.trim()) {
      params.set('submittedBy', filters.submittedBy.trim());
    }
    if (filters.templateName.trim()) {
      params.set('templateName', filters.templateName.trim());
    }
    if (filters.templateId.trim()) {
      params.set('templateId', filters.templateId.trim());
    }
    if (filters.status.trim()) {
      params.set('status', filters.status.trim());
    }
    if (filters.createdFrom) {
      params.set('createdFrom', filters.createdFrom);
    }
    if (filters.createdTo) {
      params.set('createdTo', filters.createdTo);
    }
    if (filters.updatedFrom) {
      params.set('updatedFrom', filters.updatedFrom);
    }
    if (filters.updatedTo) {
      params.set('updatedTo', filters.updatedTo);
    }

    return params.toString();
  }, [filters]);

  const loadSubmissions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/forms/submissions?${queryString}`);
      const payload = await response.json();
      if (payload.success) {
        setSubmissions(payload.submissions || []);
      } else {
        setError(payload.error || 'Unable to load submissions.');
      }
    } catch (err) {
      setError('Unable to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [queryString]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Submitted Forms Report</h2>
        <p className="mt-2 text-slate-500">Filter by user, form, status, submit date, and create date.</p>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            Submitted By
            <input
              value={filters.submittedBy}
              onChange={(e) => setFilters((current) => ({ ...current, submittedBy: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
              placeholder="User name or ID"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Form Name
            <input
              value={filters.templateName}
              onChange={(e) => setFilters((current) => ({ ...current, templateName: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Form name"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Form ID
            <input
              value={filters.templateId}
              onChange={(e) => setFilters((current) => ({ ...current, templateId: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Template ID"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Status
            <select
              value={filters.status}
              onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Created From
            <input
              type="date"
              value={filters.createdFrom}
              onChange={(e) => setFilters((current) => ({ ...current, createdFrom: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Created To
            <input
              type="date"
              value={filters.createdTo}
              onChange={(e) => setFilters((current) => ({ ...current, createdTo: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Updated From
            <input
              type="date"
              value={filters.updatedFrom}
              onChange={(e) => setFilters((current) => ({ ...current, updatedFrom: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Updated To
            <input
              type="date"
              value={filters.updatedTo}
              onChange={(e) => setFilters((current) => ({ ...current, updatedTo: e.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={loadSubmissions}
            className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
          >
            Apply Filters
          </button>
          <span className="text-sm text-slate-500">Filters update automatically after change.</span>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Submission Results</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading submissions…</p>
        ) : error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : !submissions.length ? (
          <p className="mt-4 text-sm text-slate-500">No submissions found for current filters.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {submissions.map((submission) => (
              <div key={submission._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{submission.templateName}</p>
                    <p className="text-sm text-slate-600">Submitted by: {submission.submittedBy}</p>
                    <p className="text-sm text-slate-600">Status: {submission.status}</p>
                  </div>
                  <div className="space-y-1 text-right text-sm text-slate-500">
                    <p>Created: {new Date(submission.createdAt).toLocaleString()}</p>
                    <p>Updated: {new Date(submission.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
                    <p className="text-sm font-semibold text-slate-900">Submission Data</p>
                    <pre className="mt-3 whitespace-pre-wrap break-words text-xs">{JSON.stringify(submission.data, null, 2)}</pre>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
                    <p className="text-sm font-semibold text-slate-900">Review Notes</p>
                    <p className="mt-3 text-sm text-slate-600">{submission.reviewer_comment || 'None'}</p>
                    {submission.approvedBy ? (
                      <p className="mt-2 text-sm text-slate-600">Approved by: {submission.approvedBy} at {new Date(submission.approvedAt ?? submission.updatedAt).toLocaleString()}</p>
                    ) : null}
                    {submission.rejectedBy ? (
                      <p className="mt-2 text-sm text-slate-600">Rejected by: {submission.rejectedBy} at {new Date(submission.rejectedAt ?? submission.updatedAt).toLocaleString()}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
