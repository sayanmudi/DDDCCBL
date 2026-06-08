'use client';

import { useEffect, useMemo, useState } from 'react';

interface FormField {
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface FormTemplate {
  _id?: string;
  formName: string;
  description: string;
  fields: FormField[];
  assignedRoles: string[];
  approvalRoles: string[];
  status?: string;
}

interface FormSubmission {
  _id: string;
  templateId: string;
  templateName: string;
  submittedBy: string;
  submittedById: string;
  data: Record<string, string>;
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

interface FormsDashboardProps {
  userRole: string;
  userId?: string;
  userName: string;
}

const roleOptions = ['Manager', 'Supervisor', 'Teller','PACS'];
const fieldTypes = ['text', 'number', 'date', 'textarea', 'dropdown', 'checkbox'];
const optionFieldTypes = ['dropdown', 'checkbox'];
const cleanOptions = (options?: string[]) => options?.map((option) => String(option).trim()).filter(Boolean) ?? [];
const isRequiredValue = (value: unknown) => value === true || value === 'true';
const normalizeFormField = (field: any): FormField => ({
  label: typeof field?.label === 'string' ? field.label : '',
  type: fieldTypes.includes(field?.type) ? field.type : 'text',
  required: isRequiredValue(field?.required),
  options: Array.isArray(field?.options) ? field.options.map((option: unknown) => String(option)) : [],
});

const emptyTemplate: FormTemplate = {
  formName: '',
  description: '',
  fields: [],
  assignedRoles: ['PACS'],
  approvalRoles: [],
};

export default function FormsDashboard({ userRole, userId, userName }: FormsDashboardProps) {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate>(emptyTemplate);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [approvedSubmissions, setApprovedSubmissions] = useState<FormSubmission[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [viewingLockedTemplateId, setViewingLockedTemplateId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const assignedTemplates = useMemo(
    () => templates.filter((template) => template.assignedRoles?.includes(userRole)),
    [templates, userRole]
  );

  const mySubmissions = useMemo(
    () => submissions.filter((submission) => submission.submittedById === userId),
    [submissions, userId]
  );

  const pendingSubmissions = useMemo(
    () => submissions.filter((submission) => submission.status === 'Pending'),
    [submissions]
  );

  const canReviewSubmission = (submission: FormSubmission) => {
    if (userRole === 'Admin') return true;
    const template = templates.find((item) => item._id === submission.templateId);
    return template ? Array.isArray(template.approvalRoles) && template.approvalRoles.includes(userRole) : false;
  };

  const reviewableSubmissions = useMemo(
    () => pendingSubmissions.filter(canReviewSubmission),
    [pendingSubmissions, templates, userRole]
  );

  useEffect(() => {
    loadTemplates();
    loadSubmissions();
    loadApprovedSubmissions();
  }, []);

  useEffect(() => {
    if (activeTemplateId && assignedTemplates.length) {
      const template = templates.find((item) => item._id === activeTemplateId);
      if (template) {
        const newValues: Record<string, string> = {};
        template.fields.forEach((field) => {
          const hasCheckboxOptions = field.type === 'checkbox' && field.options?.length;
          newValues[field.label] = field.type === 'checkbox' && !hasCheckboxOptions ? 'false' : '';
        });
        const existing = mySubmissions.find((submission) => submission.templateId === activeTemplateId && submission.status !== 'Approved');
        if (existing) {
          setFormData({ ...newValues, ...existing.data });
        } else {
          setFormData(newValues);
        }
      }
    }
  }, [activeTemplateId, templates, mySubmissions, assignedTemplates]);

  const loadTemplates = async () => {
    const response = await fetch('/api/forms/templates');
    const payload = await response.json();
    if (payload.success) {
      setTemplates(
        (payload.templates || []).map((template: any) => ({
          ...template,
          fields: Array.isArray(template.fields) ? template.fields.map(normalizeFormField) : [],
          assignedRoles: Array.isArray(template.assignedRoles) ? template.assignedRoles : [],
          approvalRoles: Array.isArray(template.approvalRoles) ? template.approvalRoles : [],
        }))
      );
    }
  };

  const loadSubmissions = async () => {
    const params = new URLSearchParams();
    if (userRole === 'Teller' && userId) {
      params.set('submittedById', userId);
    }
    if (userRole === 'Manager') {
      params.set('status', 'Pending');
    }
    const url = `/api/forms/submissions?${params.toString()}`;
    const response = await fetch(url);
    const payload = await response.json();
    if (payload.success) {
      setSubmissions(payload.submissions || []);
    }
  };

  const loadApprovedSubmissions = async () => {
    const response = await fetch('/api/forms/submissions?status=Approved');
    const payload = await response.json();
    if (payload.success) {
      setApprovedSubmissions(payload.submissions || []);
    }
  };

  const clearStatus = () => setStatusMessage('');

  const setTemplateField = (index: number, field: Partial<FormField>) => {
    setSelectedTemplate((current) => {
      const fields = [...current.fields];
      fields[index] = { ...fields[index], ...field };
      return { ...current, fields };
    });
  };

  const addTemplateField = () => {
    setSelectedTemplate((current) => ({
      ...current,
      fields: [
        ...current.fields,
        { label: '', type: 'text', required: false, options: [] },
      ],
    }));
  };

  const removeTemplateField = (index: number) => {
    setSelectedTemplate((current) => ({
      ...current,
      fields: current.fields.filter((_, i) => i !== index),
    }));
  };

  const updateAssignedRole = (role: string, checked: boolean) => {
    setSelectedTemplate((current) => {
      const assignedRoles = checked
        ? Array.from(new Set([...current.assignedRoles, role]))
        : current.assignedRoles.filter((item) => item !== role);
      return { ...current, assignedRoles };
    });
  };

  const updateApprovalRole = (role: string, checked: boolean) => {
    setSelectedTemplate((current) => {
      const approvalRoles = checked
        ? Array.from(new Set([...current.approvalRoles, role]))
        : current.approvalRoles.filter((item) => item !== role);
      return { ...current, approvalRoles };
    });
  };

  const getTemplateForSave = () => ({
    ...selectedTemplate,
    fields: selectedTemplate.fields.map((field) => ({
      ...field,
      required: isRequiredValue(field.required),
      options: optionFieldTypes.includes(field.type)
        ? cleanOptions(field.options)
        : [],
    })),
  });

  const saveTemplate = async () => {
    clearStatus();
    if (!selectedTemplate.formName.trim()) {
      setStatusMessage('Please enter a form name.');
      return;
    }
    if (!selectedTemplate.fields.length) {
      setStatusMessage('Add at least one form field.');
      return;
    }
    if (!selectedTemplate.assignedRoles.length) {
      setStatusMessage('Assign the form to at least one role.');
      return;
    }
    if (!selectedTemplate.approvalRoles.length) {
      setStatusMessage('Select at least one approval role.');
      return;
    }
    setIsSaving(true);
    const response = await fetch('/api/forms/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getTemplateForSave()),
    });
    const payload = await response.json();
    setIsSaving(false);
    if (payload.success) {
      setStatusMessage('Template saved successfully.');
      setSelectedTemplate(emptyTemplate);
      loadTemplates();
      loadSubmissions();
    } else {
      setStatusMessage(payload.error || 'Failed to save template.');
    }
  };

  const editTemplate = (template: FormTemplate) => {
    setSelectedTemplate({ ...template });
  };

  const approveTemplate = async (templateId: string | undefined, action: 'approve' | 'reject') => {
    if (!templateId) return;
    clearStatus();
    try {
      const response = await fetch(`/api/forms/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json();
      if (payload.success) {
        setStatusMessage(`Template ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
        loadTemplates();
      } else {
        setStatusMessage(payload.error || `Failed to ${action} template.`);
      }
    } catch (error) {
      setStatusMessage(`Error ${action}ing template.`);
    }
  };

  const handleFieldValueChange = (label: string, value: string) => {
    setFormData((current) => ({ ...current, [label]: value }));
  };

  const getFieldOptions = (field: FormField) => cleanOptions(field.options);

  const getSelectedCheckboxOptions = (value: string | undefined) =>
    value?.split(',').map((option) => option.trim()).filter(Boolean) ?? [];

  const handleCheckboxValueChange = (label: string, checked: boolean) => {
    handleFieldValueChange(label, checked ? 'true' : 'false');
  };

  const handleCheckboxOptionChange = (label: string, option: string, checked: boolean) => {
    setFormData((current) => {
      const selectedOptions = new Set(getSelectedCheckboxOptions(current[label]));
      if (checked) {
        selectedOptions.add(option);
      } else {
        selectedOptions.delete(option);
      }
      return { ...current, [label]: Array.from(selectedOptions).join(', ') };
    });
  };

  const isCheckboxChecked = (value: string | undefined) => value === 'true';

  const isCheckboxOptionChecked = (value: string | undefined, option: string) =>
    getSelectedCheckboxOptions(value).includes(option);

  const getMissingRequiredFields = (template: FormTemplate, data: Record<string, string>) =>
    template.fields
      .filter((field) => {
        if (!isRequiredValue(field.required)) return false;
        const value = data[field.label];
        if (field.type === 'checkbox') {
          return getFieldOptions(field).length
            ? getSelectedCheckboxOptions(value).length === 0
            : !isCheckboxChecked(value);
        }
        return !String(value ?? '').trim();
      })
      .map((field, index) => field.label || `Field ${index + 1}`);

  const submitAssignedForm = async () => {
    if (!activeTemplateId) {
      setStatusMessage('Select a form to fill first.');
      return;
    }
    const template = templates.find((item) => item._id === activeTemplateId);
    if (!template) {
      setStatusMessage('Template not found.');
      return;
    }
    const missingRequiredFields = getMissingRequiredFields(template, formData);
    if (missingRequiredFields.length) {
      setStatusMessage(`Please fill required field${missingRequiredFields.length > 1 ? 's' : ''}: ${missingRequiredFields.join(', ')}.`);
      return;
    }
    const response = await fetch('/api/forms/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: activeTemplateId, data: formData }),
    });
    const payload = await response.json();
    if (payload.success) {
      setStatusMessage('Form submitted to manager for review.');
      loadSubmissions();
      loadApprovedSubmissions();
    } else {
      setStatusMessage(payload.error || 'Failed to submit form.');
    }
  };

  const reviewSubmission = async (submissionId: string, action: 'approve' | 'reject') => {
    const comment = reviewComments[submissionId] || '';
    if (action === 'reject' && !comment.trim()) {
      setStatusMessage('Add a comment when rejecting a form.');
      return;
    }
    const response = await fetch(`/api/forms/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, comment: comment.trim() }),
    });
    const payload = await response.json();
    if (payload.success) {
      setStatusMessage(`Submission ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      setReviewComments((current) => ({ ...current, [submissionId]: '' }));
      loadSubmissions();
      loadApprovedSubmissions();
    } else {
      setStatusMessage(payload.error || 'Unable to update submission.');
    }
  };

  const currentSubmission = activeTemplateId
    ? mySubmissions.find((submission) => submission.templateId === activeTemplateId)
    : undefined;

  const displayTemplate = templates.find((template) => template._id === activeTemplateId);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-semibold">Forms Workspace</h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Use this page to create or update form templates, assign target roles, fill assigned forms, and review submissions.
        </p>
      </div>

      {statusMessage ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-900">
          {statusMessage}
        </div>
      ) : null}

      {userRole === 'Admin' ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold">Create / Update Form Template</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Form Name</label>
                <input
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 sm:py-2 text-sm"
                  value={selectedTemplate.formName}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, formName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 sm:py-2 text-sm"
                  rows={3}
                  value={selectedTemplate.description}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, description: e.target.value })}
                />
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">Assign Target Roles</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {roleOptions.map((role) => (
                    <label key={role} className="inline-flex items-center gap-2 text-sm text-slate-800">
                      <input
                        type="checkbox"
                        checked={selectedTemplate.assignedRoles.includes(role)}
                        onChange={(e) => updateAssignedRole(role, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 cursor-pointer"
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">Approval Roles</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {roleOptions.map((role) => (
                    <label key={role} className="inline-flex items-center gap-2 text-sm text-slate-800">
                      <input
                        type="checkbox"
                        checked={selectedTemplate.approvalRoles.includes(role)}
                        onChange={(e) => updateApprovalRole(role, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 cursor-pointer"
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-slate-700">Form Fields</p>
                  <button
                    type="button"
                    onClick={addTemplateField}
                    className="rounded-2xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700 transition"
                  >
                    Add Field
                  </button>
                </div>
                <div className="space-y-4">
                  {selectedTemplate.fields.map((field, index) => (
                    <div key={index} className="rounded-3xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Label</label>
                          <input
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2.5 sm:py-2 text-sm"
                            value={field.label}
                            onChange={(e) => setTemplateField(index, { label: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Type</label>
                          <select
                            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2.5 sm:py-2 text-sm"
                            value={field.type}
                            onChange={(e) => setTemplateField(index, { type: e.target.value, options: optionFieldTypes.includes(e.target.value) ? field.options ?? [] : [] })}
                          >
                            {fieldTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => setTemplateField(index, { required: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-cyan-600 cursor-pointer"
                          />
                          Required
                        </label>
                        {optionFieldTypes.includes(field.type) ? (
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Options (comma separated)</label>
                            <input
                              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2.5 sm:py-2 text-sm"
                              value={field.options?.join(',') ?? ''}
                              onChange={(e) => setTemplateField(index, { options: e.target.value.split(',').map((value) => value.trim()) })}
                            />
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeTemplateField(index)}
                          className="rounded-2xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition"
                        >
                          Remove Field
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={saveTemplate}
                  disabled={isSaving}
                  className="w-full sm:w-auto rounded-2xl bg-cyan-600 px-4 py-2.5 sm:py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
                >
                  {selectedTemplate._id ? 'Update Template' : 'Save Template'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(emptyTemplate)}
                  className="w-full sm:w-auto rounded-2xl border border-slate-300 px-4 py-2.5 sm:py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold">Existing Templates</h2>
            <div className="mt-5 space-y-3 max-h-[600px] overflow-y-auto">
              {templates.length ? (
                templates.map((template) => (
                  <div key={template._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-900 text-sm sm:text-base">{template.formName}</p>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                              template.status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : template.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {template.status || 'Draft'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">{template.description}</p>
                        <p className="mt-2 text-xs sm:text-sm text-slate-500 break-words">
                          Assigned to: {template.assignedRoles.join(', ') || 'None'}
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 break-words">
                          Approval roles: {template.approvalRoles?.join(', ') || 'None'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {template.status !== 'Approved' && (
                          <>
                            <button
                              type="button"
                              onClick={() => approveTemplate(template._id, 'approve')}
                              className="flex-1 sm:flex-none rounded-2xl bg-green-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-green-700 transition"
                            >
                              Approve
                            </button>
                            {template.status === 'Draft' && (
                              <button
                                type="button"
                                onClick={() => approveTemplate(template._id, 'reject')}
                                className="flex-1 sm:flex-none rounded-2xl bg-rose-500 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-rose-600 transition"
                              >
                                Reject
                              </button>
                            )}
                          </>
                        )}
                        {template.status === 'Draft' && (
                          <button
                            type="button"
                            onClick={() => editTemplate(template)}
                            className="flex-1 sm:flex-none rounded-2xl bg-slate-900 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition"
                          >
                            Edit
                          </button>
                        )}
                        {template.status === 'Approved' && (
                          <button
                            type="button"
                            onClick={() => setViewingLockedTemplateId(template._id ?? null)}
                            className="flex-1 sm:flex-none rounded-2xl bg-blue-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No form templates available yet.</p>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {viewingLockedTemplateId ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          {(() => {
            const lockedTemplate = templates.find((t) => t._id === viewingLockedTemplateId);
            return lockedTemplate ? (
              <div>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold">{lockedTemplate.formName} - View Mode</h2>
                  <button
                    type="button"
                    onClick={() => setViewingLockedTemplateId(null)}
                    className="w-full sm:w-auto rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Close
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Form Name</p>
                        <p className="mt-1 text-slate-900 break-words">{lockedTemplate.formName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Description</p>
                        <p className="mt-1 whitespace-pre-wrap text-slate-900 text-sm break-words">{lockedTemplate.description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Status</p>
                        <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-xs sm:text-sm font-semibold text-green-800">
                          {lockedTemplate.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Assigned to Roles</p>
                        <p className="mt-1 text-slate-900 text-sm break-words">{lockedTemplate.assignedRoles.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Approval Roles</p>
                        <p className="mt-1 text-slate-900 text-sm break-words">{lockedTemplate.approvalRoles.join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-4 text-sm font-medium text-slate-700">Form Fields (Read-Only)</p>
                    <div className="space-y-4">
                      {lockedTemplate.fields.map((field, index) => (
                        <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                          <label className="block text-sm font-medium text-slate-700">
                            {field.label}{field.required ? ' *' : ''}
                          </label>
                          <p className="mt-1 text-xs text-slate-500">Type: {field.type}</p>
                          {field.options && field.options.length > 0 && (
                            <p className="mt-1 text-xs text-slate-500 break-words">Options: {field.options.join(', ')}</p>
                          )}
                          {field.type === 'textarea' ? (
                            <textarea
                              readOnly
                              rows={4}
                              placeholder="Preview"
                              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500"
                            />
                          ) : field.type === 'checkbox' ? (
                            getFieldOptions(field).length ? (
                              <div className="mt-3 space-y-2">
                                {getFieldOptions(field).map((option) => (
                                  <label key={option} className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                      type="checkbox"
                                      disabled
                                      className="h-4 w-4 rounded border-slate-300 text-cyan-600"
                                    />
                                    {option}
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <input
                                type="checkbox"
                                disabled
                                aria-label={`${field.label} preview`}
                                className="mt-3 h-4 w-4 rounded border-slate-300 text-cyan-600"
                              />
                            )
                          ) : field.type === 'dropdown' ? (
                            <select
                              disabled
                              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500"
                            >
                              <option>Preview</option>
                              {field.options?.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              readOnly
                              placeholder="Preview"
                              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      ) : null}

      {userRole === 'Teller' ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold">Assigned Forms</h2>
          {assignedTemplates.length ? (
            <div className="mt-5 space-y-4">
              {assignedTemplates.map((template) => {
                const submission = mySubmissions.find((item) => item.templateId === template._id);
                const isLocked = submission?.locked ?? false;
                return (
                  <div key={template._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm sm:text-base">{template.formName}</p>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">{template.description}</p>
                        <p className="mt-2 text-xs sm:text-sm text-slate-500">Status: {submission?.status ?? 'Not started'}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTemplateId(template._id ?? null);
                            clearStatus();
                          }}
                          className="flex-1 sm:flex-none rounded-2xl bg-cyan-600 px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-cyan-700 transition"
                        >
                          {submission ? 'View / Resubmit' : 'Fill Form'}
                        </button>
                        {submission?.status === 'Pending' ? (
                          <span className="rounded-2xl bg-amber-100 px-3 py-2.5 sm:py-2 text-xs sm:text-sm text-amber-700">Locked for review</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">You do not have any form assignments yet.</p>
          )}

          {displayTemplate ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold">{displayTemplate.formName}</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">{displayTemplate.description}</p>
              {currentSubmission && currentSubmission.status === 'Approved' ? (
                <div className="mt-4 space-y-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-3 sm:p-4 text-xs sm:text-sm text-slate-900">
                  <p className="font-semibold">Approved Submission</p>
                  <p className="text-xs sm:text-sm text-slate-600">Reviewer comment: {currentSubmission.reviewer_comment || 'None'}</p>
                  {currentSubmission.approvedBy ? (
                    <p className="text-xs sm:text-sm text-slate-600">Approved by: {currentSubmission.approvedBy} at {new Date(currentSubmission.approvedAt ?? currentSubmission.updatedAt).toLocaleString()}</p>
                  ) : null}
                  <div className="overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(currentSubmission.data, null, 2)}</pre>
                  </div>
                </div>
              ) : currentSubmission && currentSubmission.status === 'Rejected' ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl border border-rose-200 bg-rose-50 p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs sm:text-sm font-semibold text-rose-800">
                        Rejected
                      </span>
                    </div>
                    <p className="mt-3 text-xs sm:text-sm font-medium text-slate-900">Reviewer's Feedback:</p>
                    <p className="mt-2 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap break-words">{currentSubmission.reviewer_comment || 'No feedback provided'}</p>
                    {currentSubmission.rejectedBy ? (
                      <p className="mt-2 text-xs sm:text-sm text-slate-500">
                        Rejected by: {currentSubmission.rejectedBy} at {new Date(currentSubmission.rejectedAt ?? currentSubmission.updatedAt).toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                  {displayTemplate.fields.length ? (
                    <div className="space-y-4">
                      <p className="text-xs sm:text-sm font-medium text-slate-700">Please correct the form and resubmit:</p>
                      {displayTemplate.fields.map((field, index) => {
                        const value = formData[field.label] ?? '';
                        return (
                          <div key={index} className="space-y-2">
                            <label className="block text-xs sm:text-sm font-medium text-slate-700">
                              {field.label}{field.required ? ' *' : ''}
                            </label>
                            {field.type === 'textarea' ? (
                              <textarea
                                value={value}
                                rows={4}
                                onChange={(e) => handleFieldValueChange(field.label, e.target.value)}
                                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm"
                              />
                            ) : field.type === 'checkbox' ? (
                              getFieldOptions(field).length ? (
                                <div className="space-y-2">
                                  {getFieldOptions(field).map((option) => (
                                    <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={isCheckboxOptionChecked(value, option)}
                                        onChange={(e) => handleCheckboxOptionChange(field.label, option, e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 cursor-pointer"
                                      />
                                      {option}
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={isCheckboxChecked(value)}
                                  onChange={(e) => handleCheckboxValueChange(field.label, e.target.checked)}
                                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 cursor-pointer"
                                />
                              )
                            ) : field.type === 'dropdown' ? (
                              <select
                                value={value}
                                onChange={(e) => handleFieldValueChange(field.label, e.target.value)}
                                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm"
                              >
                                <option value="">Choose option</option>
                                {field.options?.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type}
                                value={value}
                                onChange={(e) => handleFieldValueChange(field.label, e.target.value)}
                                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm"
                              />
                            )}
                          </div>
                        );
                      })}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={submitAssignedForm}
                          className="rounded-2xl bg-cyan-600 px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-cyan-700 transition"
                        >
                          Resubmit
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : displayTemplate.fields.length ? (
                <div className="mt-6 space-y-4">
                  {displayTemplate.fields.map((field, index) => {
                    const value = formData[field.label] ?? '';
                    const readOnly = currentSubmission?.status === 'Pending';
                    return (
                      <div key={index} className="space-y-2">
                        <label className="block text-xs sm:text-sm font-medium text-slate-700">
                          {field.label}{field.required ? ' *' : ''}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={value}
                            readOnly={readOnly}
                            rows={4}
                            onChange={(e) => handleFieldValueChange(field.label, e.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        ) : field.type === 'checkbox' ? (
                          getFieldOptions(field).length ? (
                            <div className="space-y-2">
                              {getFieldOptions(field).map((option) => (
                                <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={isCheckboxOptionChecked(value, option)}
                                    disabled={readOnly}
                                    onChange={(e) => handleCheckboxOptionChange(field.label, option, e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 cursor-pointer disabled:cursor-not-allowed"
                                  />
                                  {option}
                                </label>
                              ))}
                            </div>
                          ) : (
                            <input
                              type="checkbox"
                              checked={isCheckboxChecked(value)}
                              disabled={readOnly}
                              onChange={(e) => handleCheckboxValueChange(field.label, e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-cyan-600 cursor-pointer disabled:cursor-not-allowed"
                            />
                          )
                        ) : field.type === 'dropdown' ? (
                          <select
                            value={value}
                            disabled={readOnly}
                            onChange={(e) => handleFieldValueChange(field.label, e.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="">Choose option</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={value}
                            disabled={readOnly}
                            onChange={(e) => handleFieldValueChange(field.label, e.target.value)}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        )}
                      </div>
                    );
                  })}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={submitAssignedForm}
                      className="w-full sm:w-auto rounded-2xl bg-cyan-600 px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      disabled={currentSubmission?.status === 'Pending'}
                    >
                      {currentSubmission?.status === 'Rejected' ? 'Resubmit' : 'Submit to Manager'}
                    </button>
                    {currentSubmission?.status === 'Pending' ? (
                      <span className="text-xs sm:text-sm text-amber-700">This form is locked until manager review.</span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {userRole === 'Manager' ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold">Pending Review</h2>
          {reviewableSubmissions.length ? (
            <div className="mt-5 space-y-4">
              {reviewableSubmissions.map((submission) => (
                <div key={submission._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm sm:text-base">{submission.templateName}</p>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">Submitted by: {submission.submittedBy}</p>
                      <p className="text-xs sm:text-sm text-slate-600">Submitted: {new Date(submission.createdAt).toLocaleString()}</p>
                      <p className="text-xs sm:text-sm text-slate-500">Updated: {new Date(submission.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-3 sm:p-4 overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-words text-xs sm:text-sm text-slate-800">{JSON.stringify(submission.data, null, 2)}</pre>
                  </div>
                  <div className="mt-4 space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Review Comments</label>
                    <textarea
                      rows={3}
                      value={reviewComments[submission._id] ?? ''}
                      onChange={(e) => setReviewComments((current) => ({ ...current, [submission._id]: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                    />
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => reviewSubmission(submission._id, 'approve')}
                        className="flex-1 sm:flex-none rounded-2xl bg-emerald-600 px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => reviewSubmission(submission._id, 'reject')}
                        className="flex-1 sm:flex-none rounded-2xl bg-rose-600 px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-rose-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No submissions pending review.</p>
          )}
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold">Approved Form Data</h2>
        {approvedSubmissions.length ? (
          <div className="mt-5 space-y-4">
            {approvedSubmissions.map((submission) => (
              <div key={submission._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <p className="font-semibold text-slate-900 text-sm sm:text-base">{submission.templateName}</p>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">Submitted by: {submission.submittedBy}</p>
                <p className="text-xs sm:text-sm text-slate-600">Submitted: {new Date(submission.createdAt).toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-slate-500">Approved: {new Date(submission.approvedAt ?? submission.updatedAt).toLocaleString()}</p>
                {submission.approvedBy ? (
                  <p className="text-xs sm:text-sm text-slate-500">Approved by: {submission.approvedBy}</p>
                ) : null}
                <div className="mt-3 rounded-2xl bg-white p-3 sm:p-4 text-xs sm:text-sm text-slate-800 overflow-x-auto">
                  <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(submission.data, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No approved forms have been published yet.</p>
        )}
      </section>
    </div>
  );
}
