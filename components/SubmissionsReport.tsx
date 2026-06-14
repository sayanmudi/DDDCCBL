'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';

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

function statusBadgeClass(status: string) {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-100 text-emerald-800';
    case 'Rejected':
      return 'bg-rose-100 text-rose-800';
    case 'Pending':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Submission Results</h2>
            {!loading && !error ? (
              <p className="mt-1 text-sm text-slate-500">
                {submissions.length} submission{submissions.length === 1 ? '' : 's'} found
              </p>
            ) : null}
          </div>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading submissions…</p>
        ) : error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : !submissions.length ? (
          <p className="mt-4 text-sm text-slate-500">No submissions found for current filters.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Form Name</th>
                  <th className="px-4 py-3 font-semibold">Submitted By</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold">Review Notes</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => {
                  const isExpanded = expandedId === submission._id;
                  const dataEntries = Object.entries(submission.data || {});

                  return (
                    <Fragment key={submission._id}>
                      <tr className="border-t border-slate-200 bg-white hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <div>{submission.templateName}</div>
                          <div className="mt-1 text-xs text-slate-500">ID: {submission.templateId}</div>
                        </td>
                        <td className="px-4 py-3">{submission.submittedBy}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(submission.status)}`}>
                            {submission.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(submission.createdAt)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(submission.updatedAt)}</td>
                        <td className="max-w-[220px] px-4 py-3">
                          <span className="line-clamp-2">{submission.reviewer_comment || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : submission._id)}
                            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            {isExpanded ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                <p className="border-b border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">
                                  Submission Data
                                </p>
                                {dataEntries.length ? (
                                  <table className="w-full border-collapse text-sm">
                                    <tbody>
                                      {dataEntries.map(([field, value]) => (
                                        <tr key={field} className="border-t border-slate-100">
                                          <td className="w-1/3 px-4 py-2 font-medium text-slate-600">{field}</td>
                                          <td className="px-4 py-2 text-slate-800">{String(value ?? '—')}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p className="px-4 py-3 text-sm text-slate-500">No submission data recorded.</p>
                                )}
                              </div>
                              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                <p className="border-b border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">
                                  Review Details
                                </p>
                                <div className="space-y-2 px-4 py-3 text-sm text-slate-700">
                                  <p>
                                    <span className="font-medium text-slate-900">Comment:</span>{' '}
                                    {submission.reviewer_comment || 'None'}
                                  </p>
                                  {submission.approvedBy ? (
                                    <p>
                                      <span className="font-medium text-slate-900">Approved by:</span> {submission.approvedBy}{' '}
                                      at {formatDate(submission.approvedAt ?? submission.updatedAt)}
                                    </p>
                                  ) : null}
                                  {submission.rejectedBy ? (
                                    <p>
                                      <span className="font-medium text-slate-900">Rejected by:</span> {submission.rejectedBy}{' '}
                                      at {formatDate(submission.rejectedAt ?? submission.updatedAt)}
                                    </p>
                                  ) : null}
                                  {!submission.approvedBy && !submission.rejectedBy ? (
                                    <p className="text-slate-500">No review action recorded yet.</p>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
