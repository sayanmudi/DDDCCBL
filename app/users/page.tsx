import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import AppShell from '../../components/AppShell';
import UserManagementTable from '../../components/UserManagementTable';
import { authOptions } from '../../lib/auth';
import { getMenusCollection, getUsersCollection, serializeMenuItems } from '../../lib/mongodb';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role as string;
  const currentUserId = (session.user as any).id as string;
  const userName = session.user.name ?? 'User';
  const userImage = (session.user as any).image as string | undefined;
  const menus = await getMenusCollection();
  const menuItems = serializeMenuItems((await menus.find({}).toArray()) as any[]);
  const usersCollection = await getUsersCollection();
  type PageUserRow = { userId: string; name: string; mobile: string; role: string };
  const users = (await usersCollection
    .find({}, { projection: { _id: 0, userId: 1, name: 1, mobile: 1, role: 1 } })
    .toArray()) as unknown as PageUserRow[];

  return (
    <AppShell
      userName={userName}
      userRole={userRole}
      userImage={userImage}
      title="Users"
      description="Manage the user list stored in MongoDB."
      menuItems={menuItems}
    >
      <UserManagementTable users={users} currentUserId={currentUserId} currentUserRole={userRole} />
    </AppShell>
  );
}
