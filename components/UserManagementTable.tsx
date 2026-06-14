'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSameBranch, normalizeBranchCode } from '../lib/branchAccessUtils';
import { canChangeBranchCode, canChangeUserRole, canResetPasswordFor } from '../lib/permissions';

interface UserRow {
  userId: string;
  name: string;
  mobile: string;
  role: string;
  branch_code: string;
}

interface UserManagementTableProps {
  users: UserRow[];
  currentUserId: string;
  currentUserRole: string;
  currentUserBranchCode: string;
}

const roleOptions = ['Admin', 'Manager', 'Supervisor', 'Teller', 'PACS'];

export default function UserManagementTable({
  users,
  currentUserId,
  currentUserRole,
  currentUserBranchCode,
}: UserManagementTableProps) {
  const [userList, setUserList] = useState<UserRow[]>(users);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>(
    Object.fromEntries(users.map((user) => [user.userId, user.role]))
  );
  const [selectedBranchCodes, setSelectedBranchCodes] = useState<Record<string, string>>(
    Object.fromEntries(users.map((user) => [user.userId, user.branch_code]))
  );
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const router = useRouter();

  const isAdmin = currentUserRole === 'Admin';
  const showActionsColumn =
    isAdmin || currentUserRole === 'Manager' || currentUserRole === 'Supervisor';

  function canResetPassword(user: UserRow) {
    if (user.userId === currentUserId) return false;
    if (!canResetPasswordFor(currentUserRole, user.role)) return false;
    if (currentUserRole === 'Admin') return true;
    return isSameBranch(currentUserBranchCode, user.branch_code);
  }

  async function updateUser(
    userId: string,
    options: { role?: string; resetPassword?: boolean; branch_code?: string } = {}
  ) {
    setLoadingUserId(userId);
    setStatusMessage('');

    const response = await fetch('/api/users/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, ...options }),
    });

    const result = await response.json();
    setLoadingUserId(null);

    if (!response.ok) {
      setStatusMessage(result?.error || 'Unable to update user.');
      return;
    }

    if (result.updatedUser) {
      setUserList((prev) =>
        prev.map((user) =>
          user.userId === userId
            ? {
                ...user,
                role: result.updatedUser.role ?? user.role,
                branch_code: normalizeBranchCode(result.updatedUser.branch_code ?? user.branch_code),
              }
            : user
        )
      );
      setSelectedRoles((prev) => ({
        ...prev,
        [userId]: result.updatedUser.role ?? prev[userId],
      }));
      setSelectedBranchCodes((prev) => ({
        ...prev,
        [userId]: normalizeBranchCode(result.updatedUser.branch_code ?? prev[userId]),
      }));
      setStatusMessage('User updated successfully.');
      router.refresh();
      return;
    }

    setStatusMessage('Update complete.');
  }

  return (
    <div className="space-y-4">
      {statusMessage ? (
        <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-cyan-100">{statusMessage}</div>
      ) : null}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl shadow-slate-950/20">
        <table className="w-full border-collapse text-left text-sm text-slate-200">
          <thead className="bg-slate-950/90 text-slate-300">
            <tr>
              <th className="px-6 py-4">User ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Mobile</th>
              <th className="px-6 py-4">Branch</th>
              <th className="px-6 py-4">Role</th>
              {showActionsColumn ? <th className="px-6 py-4">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {userList.map((user) => {
              const canEditRole = isAdmin && canChangeUserRole(currentUserRole) && user.userId !== currentUserId;
              const canEditBranch =
                isAdmin && canChangeBranchCode(currentUserRole) && user.userId !== currentUserId;
              const canReset = canResetPassword(user);

              return (
                <tr key={user.userId} className="border-t border-slate-800">
                  <td className="px-6 py-4 text-cyan-300">{user.userId}</td>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.mobile}</td>
                  <td className="px-6 py-4">
                    {canEditBranch ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={selectedBranchCodes[user.userId] ?? user.branch_code}
                          onChange={(event) =>
                            setSelectedBranchCodes((prev) => ({
                              ...prev,
                              [user.userId]: event.target.value,
                            }))
                          }
                          className="w-24 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
                          disabled={loadingUserId === user.userId}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateUser(user.userId, {
                              branch_code: selectedBranchCodes[user.userId],
                            })
                          }
                          disabled={
                            loadingUserId === user.userId ||
                            normalizeBranchCode(selectedBranchCodes[user.userId]) === user.branch_code
                          }
                          className="rounded-2xl bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-800"
                        >
                          {loadingUserId === user.userId ? 'Saving…' : 'Save Branch'}
                        </button>
                      </div>
                    ) : (
                      user.branch_code || '—'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {canEditRole ? (
                      <div className="flex items-center gap-3">
                        <select
                          value={selectedRoles[user.userId] ?? user.role}
                          onChange={(event) =>
                            setSelectedRoles((prev) => ({
                              ...prev,
                              [user.userId]: event.target.value,
                            }))
                          }
                          className="rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none"
                          disabled={loadingUserId === user.userId}
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role} className="bg-slate-900 text-slate-100">
                              {role}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => updateUser(user.userId, { role: selectedRoles[user.userId] })}
                          disabled={
                            loadingUserId === user.userId ||
                            selectedRoles[user.userId] === user.role
                          }
                          className="rounded-2xl bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-800"
                        >
                          {loadingUserId === user.userId ? 'Saving…' : 'Change Role'}
                        </button>
                      </div>
                    ) : (
                      user.role
                    )}
                  </td>
                  {showActionsColumn ? (
                    <td className="px-6 py-4">
                      {canReset ? (
                        <button
                          type="button"
                          onClick={() => updateUser(user.userId, { resetPassword: true })}
                          disabled={loadingUserId === user.userId}
                          className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                        >
                          {loadingUserId === user.userId ? 'Updating…' : 'Reset Password'}
                        </button>
                      ) : user.userId === currentUserId ? (
                        <span className="text-slate-500">Self</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
