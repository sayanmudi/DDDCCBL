import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import AppShell from '../../components/AppShell';
import FormsDashboard from '../../components/FormsDashboard';
import { authOptions } from '../../lib/auth';
import { getMenusCollection, serializeMenuItems } from '../../lib/mongodb';
import { normalizeBranchCode } from '../../lib/branchAccess';
import { getOrganizationSettings } from '../../lib/organizationSettings';

export default async function FormsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role as string;
  const userName = session.user.name ?? 'User';
  const userId = (session.user as any).id as string | undefined;
  const branchCode = String((session.user as any).branch_code ?? '').trim();
  const userBranchCode = normalizeBranchCode(branchCode);
  const menus = await getMenusCollection();
  const menuItems = serializeMenuItems((await menus.find({}).toArray()) as any[]);
  const { organizationName, logoPath } = await getOrganizationSettings();

  return (
    <AppShell
      organizationName={organizationName}
      logoPath={logoPath}
      userName={userName}
      userRole={userRole}
      userBranchCode={userBranchCode}
      userImage={(session.user as any).image as string | undefined}
      title="Forms"
      description="Create, update, assign, and manage form workflows."
      menuItems={menuItems}
    >
      <FormsDashboard userRole={userRole} userId={userId} userName={userName} branchCode={branchCode} />
    </AppShell>
  );
}
