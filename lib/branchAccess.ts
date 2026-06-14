// Server-only functions that require MongoDB
import { getUsersCollection } from './mongodb';
import { normalizeBranchCode, isBranchScopedRole } from './branchAccessUtils';

// Re-export client-safe utilities for backward compatibility
export { normalizeBranchCode, isBranchScopedRole, canAccessSubmissionByBranch, isSameBranch } from './branchAccessUtils';

export async function getUserBranchCode(userId: string | undefined | null) {
  if (!userId) return '';

  const users = await getUsersCollection();
  const user = await users.findOne({ userId }, { projection: { branch_code: 1 } });
  return normalizeBranchCode(user?.branch_code);
}

export type SubmissionBranchSource = Record<string, unknown> & {
  branch_code?: unknown;
  submittedById?: string | null;
};

export async function resolveSubmissionBranchCode(submission: SubmissionBranchSource) {
  const storedBranchCode = normalizeBranchCode(submission.branch_code);
  if (storedBranchCode) return storedBranchCode;
  return getUserBranchCode(
    typeof submission.submittedById === 'string' ? submission.submittedById : null
  );
}

export async function filterSubmissionsByBranch<T extends SubmissionBranchSource>(
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
