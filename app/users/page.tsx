import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import AppShell from '../../components/AppShell';
import UserManagementTable from '../../components/UserManagementTable';
import { authOptions } from '../../lib/auth';
import { getUserBranchCode, normalizeBranchCode } from '../../lib/branchAccess';
import { getMenusCollection, getUsersCollection, serializeMenuItems } from '../../lib/mongodb';

type PageUserRow = {
  userId: string;
  name: string;
  mobile: string;
  role: string;
  branch_code: string;
  isActive?: boolean;
};

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as { role?: string }).role ?? '';
  const currentUserId = (session.user as { id?: string }).id ?? '';
  const userName = session.user.name ?? 'User';
  const userImage = (session.user as { image?: string }).image;
  const viewerBranchCode =
    normalizeBranchCode((session.user as { branch_code?: string }).branch_code) ||
    (await getUserBranchCode(currentUserId));

  const menus = await getMenusCollection();
  const menuItems = serializeMenuItems((await menus.find({}).toArray()) as Record<string, unknown>[]);
  const usersCollection = await getUsersCollection();

  let userFilter: Record<string, unknown> = {};
  if (userRole === 'Manager') {
    userFilter = {
      branch_code: viewerBranchCode,
      role: { $in: ['Supervisor', 'Teller', 'PACS'] },
    };
  } else if (userRole === 'Supervisor') {
    userFilter = {
      branch_code: viewerBranchCode,
      role: 'PACS',
    };
  }

  const users = (await usersCollection
    .find(userRole === 'Admin' ? {} : userFilter, {
      projection: { _id: 0, userId: 1, name: 1, mobile: 1, role: 1, branch_code: 1, isActive: 1 },
    })
    .toArray()) as unknown as PageUserRow[];

  return (
    <AppShell
      userName={userName}
      userRole={userRole}
      userBranchCode={viewerBranchCode}
      userImage={userImage}
      title="Users"
      description={
        userRole === 'Admin'
          ? 'Manage user roles, branch codes, and passwords.'
          : userRole === 'Manager'
            ? 'Reset passwords for Supervisor, Teller, and PACS users in your branch.'
            : userRole === 'Supervisor'
              ? 'Reset passwords for PACS users in your branch.'
              : 'View the user list stored in MongoDB.'
      }
      menuItems={menuItems}
    >
      <UserManagementTable
        users={users.map((user) => ({
          ...user,
          branch_code: normalizeBranchCode(user.branch_code),
        }))}
        currentUserId={currentUserId}
        currentUserRole={userRole}
        currentUserBranchCode={viewerBranchCode}
      />
    </AppShell>
  );
}
