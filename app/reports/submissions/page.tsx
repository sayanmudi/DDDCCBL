import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import SubmissionsReport from '../../../components/SubmissionsReport';
import { authOptions } from '../../../lib/auth';
import { getMenusCollection, serializeMenuItems } from '../../../lib/mongodb';
import { normalizeBranchCode } from '../../../lib/branchAccess';

export default async function FormSubmissionsReportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role as string;
  const userName = session.user.name ?? 'User';
  const userImage = (session.user as any).image as string | undefined;
  const userBranchCode = normalizeBranchCode((session.user as any).branch_code);
  const menus = await getMenusCollection();
  const menuItems = serializeMenuItems((await menus.find({}).toArray()) as any[]);

  return (
    <AppShell
      userName={userName}
      userRole={userRole}
      userBranchCode={userBranchCode}
      userImage={userImage}
      title="Form Submissions"
      description="Browse submitted forms and apply filters by user, status, and dates."
      menuItems={menuItems}
    >
      <SubmissionsReport userRole={userRole} />
    </AppShell>
  );
}
