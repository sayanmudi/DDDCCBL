import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import AppShell from '../../components/AppShell';
import FormsDashboard from '../../components/FormsDashboard';
import { authOptions } from '../../lib/auth';
import { getMenusCollection, serializeMenuItems } from '../../lib/mongodb';

export default async function FormsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role as string;
  const userName = session.user.name ?? 'User';
  const userId = (session.user as any).id as string | undefined;
  const menus = await getMenusCollection();
  const menuItems = serializeMenuItems((await menus.find({}).toArray()) as any[]);

  return (
    <AppShell
      userName={userName}
      userRole={userRole}
      userImage={(session.user as any).image as string | undefined}
      title="Forms"
      description="Create, update, assign, and manage form workflows."
      menuItems={menuItems}
    >
      <FormsDashboard userRole={userRole} userId={userId} userName={userName} />
    </AppShell>
  );
}
