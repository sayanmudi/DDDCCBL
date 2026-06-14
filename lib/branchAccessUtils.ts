// Client-safe utility functions (no MongoDB imports)

export const normalizeBranchCode = (value: unknown) => String(value ?? '').trim();

export function isBranchScopedRole(role: string) {
  return role === 'Manager' || role === 'Supervisor';
}

export function canAccessSubmissionByBranch(
  viewerRole: string,
  viewerBranchCode: string,
  submissionBranchCode: string
) {
  if (viewerRole === 'Admin') return true;
  if (!isBranchScopedRole(viewerRole)) return true;
  if (!viewerBranchCode || !submissionBranchCode) return false;
  return viewerBranchCode === submissionBranchCode;
}

export function isSameBranch(viewerBranchCode: string, targetBranchCode: string) {
  return Boolean(viewerBranchCode && targetBranchCode && viewerBranchCode === targetBranchCode);
}

// Made with Bob
