import { getUsersCollection } from './mongodb';

export const normalizeBranchCode = (value: unknown) => String(value ?? '').trim();

export async function getUserBranchCode(userId: string | undefined | null) {
  if (!userId) return '';

  const users = await getUsersCollection();
  const user = await users.findOne({ userId }, { projection: { branch_code: 1 } });
  return normalizeBranchCode(user?.branch_code);
}

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

export async function resolveSubmissionBranchCode(
  submission: { branch_code?: unknown; submittedById?: string | null }
) {
  const storedBranchCode = normalizeBranchCode(submission.branch_code);
  if (storedBranchCode) return storedBranchCode;
  return getUserBranchCode(submission.submittedById);
}

export async function filterSubmissionsByBranch<T extends { branch_code?: unknown; submittedById?: string | null }>(
  submissions: T[],
  viewerRole: string,
  viewerBranchCode: string
) {
  if (!isBranchScopedRole(viewerRole)) {
    return submissions;
  }

  if (!viewerBranchCode) {
    return [];
  }

  const filtered: T[] = [];
  for (const submission of submissions) {
    const submissionBranchCode = await resolveSubmissionBranchCode(submission);
    if (submissionBranchCode === viewerBranchCode) {
      filtered.push(submission);
    }
  }

  return filtered;
}
