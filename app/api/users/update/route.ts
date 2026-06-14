import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { getUserBranchCode, isSameBranch, normalizeBranchCode } from '../../../../lib/branchAccess';
import { getUsersCollection } from '../../../../lib/mongodb';
import { canChangeBranchCode, canChangeUserRole, canResetPasswordFor } from '../../../../lib/permissions';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const actorRole = (session.user as { role?: string }).role ?? '';
  const actorId = (session.user as { id?: string }).id ?? '';
  const actorBranchCode =
    normalizeBranchCode((session.user as { branch_code?: string }).branch_code) ||
    (await getUserBranchCode(actorId));

  const body = await request.json();
  const { userId, role, resetPassword, branch_code: branchCode, isActive } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  if (!role && !resetPassword && branchCode === undefined && isActive === undefined) {
    return NextResponse.json({ error: 'No update action provided' }, { status: 400 });
  }

  const users = await getUsersCollection();
  const targetUser = await users.findOne({ userId });

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const targetRole = String(targetUser.role ?? '');
  const targetBranchCode = normalizeBranchCode(targetUser.branch_code);
  const updateFields: Record<string, string | boolean> = {};

  if (role) {
    if (!canChangeUserRole(actorRole)) {
      return NextResponse.json({ error: 'Only Admin users can change roles.' }, { status: 403 });
    }
    if (userId === actorId) {
      return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 403 });
    }
    updateFields.role = role;
  }

  if (branchCode !== undefined) {
    if (!canChangeBranchCode(actorRole)) {
      return NextResponse.json({ error: 'Only Admin users can change branch codes.' }, { status: 403 });
    }
    if (userId === actorId) {
      return NextResponse.json({ error: 'You cannot change your own branch code.' }, { status: 403 });
    }
    const normalizedBranchCode = normalizeBranchCode(branchCode);
    if (!normalizedBranchCode) {
      return NextResponse.json({ error: 'Branch code is required.' }, { status: 400 });
    }
    updateFields.branch_code = normalizedBranchCode;
  }

  if (isActive !== undefined) {
    // Check if user has permission to toggle active status
    if (!['Admin', 'Manager', 'Supervisor'].includes(actorRole)) {
      return NextResponse.json({ error: 'Only Admin, Manager, or Supervisor can change user status.' }, { status: 403 });
    }
    if (userId === actorId) {
      return NextResponse.json({ error: 'You cannot change your own active status.' }, { status: 403 });
    }
    if (actorRole !== 'Admin' && !isSameBranch(actorBranchCode, targetBranchCode)) {
      return NextResponse.json(
        { error: 'You can only change status for users in your branch.' },
        { status: 403 }
      );
    }
    updateFields.isActive = isActive;
  }

  if (resetPassword) {
    if (userId === actorId) {
      return NextResponse.json({ error: 'You cannot reset your own password here.' }, { status: 403 });
    }
    if (!canResetPasswordFor(actorRole, targetRole)) {
      return NextResponse.json({ error: 'You are not authorized to reset this user\'s password.' }, { status: 403 });
    }
    if (actorRole !== 'Admin' && !isSameBranch(actorBranchCode, targetBranchCode)) {
      return NextResponse.json(
        { error: 'You can only reset passwords for users in your branch.' },
        { status: 403 }
      );
    }
    updateFields.password = '0';
  }

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ error: 'No update action provided' }, { status: 400 });
  }

  const result = await users.updateOne(
    { userId },
    { $set: updateFields }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Fetch the updated user
  const updatedUser = await users.findOne(
    { userId },
    { projection: { _id: 0, userId: 1, role: 1, branch_code: 1, isActive: 1 } }
  );

  return NextResponse.json({ updatedUser });
}

