import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import AppShell from '../../components/AppShell';
import SettingsPanel from '../../components/SettingsPanel';
import { authOptions } from '../../lib/auth';
import { getMenusCollection, getUsersCollection, serializeMenuItems } from '../../lib/mongodb';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role as string;
  const userName = session.user.name ?? 'User';
  const userImage = (session.user as any).image as string | undefined;
  const userId = (session.user as any).id as string;

  const menus = await getMenusCollection();
  const menuItems = serializeMenuItems((await menus.find({}).toArray()) as any[]);

  const users = await getUsersCollection();
  const currentUser = await users.findOne({ userId });
  const currentMobile = currentUser?.mobile ?? '';
  const currentImage = currentUser?.image ?? userImage;

  return (
    <AppShell
      userName={userName}
      userRole={userRole}
      userImage={userImage}
      title="Settings"
      description="Application preferences, roles, and menu configuration."
      menuItems={menuItems}
    >
      <SettingsPanel userId={userId} currentMobile={currentMobile} currentImage={currentImage} />
    </AppShell>
  );
}
