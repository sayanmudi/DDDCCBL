import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AppShell from '../../components/AppShell';
import { authOptions } from '../../lib/auth';
import { getAccessibleSubMenus, hasAccess } from '../../lib/permissions';
import { getMenusCollection, serializeMenuItems } from '../../lib/mongodb';
import { normalizeBranchCode } from '../../lib/branchAccess';

export default async function ReportsPage() {
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
  const reportsMenu = menuItems.find((menu: any) => menu.slug === 'reports');

  const availableReports = reportsMenu?.subMenus?.filter((item: any) => hasAccess(userRole, item.access)) ?? [];

  return (
    <AppShell
      userName={userName}
      userRole={userRole}
      userBranchCode={userBranchCode}
      userImage={userImage}
      title="Reports"
      description="Choose the correct report for your role."
      menuItems={menuItems}
    >
      <div className="grid gap-4">
        {availableReports.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-slate-400">
            You do not have access to any reports.
          </div>
        ) : (
          availableReports.map((report: any) => (
            <Link
              key={report.slug}
              href={`/reports/${report.slug}`}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 px-5 py-5 transition hover:border-cyan-500"
            >
              <h2 className="text-2xl font-semibold">{report.title}</h2>
              <p className="mt-2 text-slate-400">Allowed roles: {report.access.join(', ')}</p>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  );
}
