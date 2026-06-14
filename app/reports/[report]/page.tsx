import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import { authOptions } from '../../../lib/auth';
import { hasAccess } from '../../../lib/permissions';
import { getMenusCollection, serializeMenuItems } from '../../../lib/mongodb';
import { normalizeBranchCode } from '../../../lib/branchAccess';
import { getBranchName } from '../../../lib/branches';

interface ReportPageProps {
  params: { report: string };
}

export default async function ReportDetailPage({ params }: ReportPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role as string;
  const userName = session.user.name ?? 'User';
  const userImage = (session.user as any).image as string | undefined;
  const userBranchCode = normalizeBranchCode((session.user as any).branch_code);
  const reportSlug = params.report;
  const menus = await getMenusCollection();
  const menuItems = serializeMenuItems((await menus.find({}).toArray()) as any[]);
  const reportsMenu = menuItems.find((menu: any) => menu.slug === 'reports');
  const report = reportsMenu?.subMenus?.find((item: any) => item.slug === reportSlug);
  const userBranchName = await getBranchName(userBranchCode);

  if (!report) {
    return (
      <AppShell
        userName={userName}
        userRole={userRole}
        userBranchCode={userBranchCode}
        userBranchName={userBranchName}
        userImage={userImage}
        title="Reports"
        description="Report not found."
        menuItems={menuItems}
      >
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold">Report not found</h1>
          <p className="mt-4 text-slate-400">The requested report does not exist.</p>
        </div>
      </AppShell>
    );
  }

  const hasAccessToReport = hasAccess(userRole, report.access);

  if (!hasAccessToReport) {
    return (
      <AppShell
        userName={userName}
        userRole={userRole}
        userBranchCode={userBranchCode}
        userBranchName={userBranchName}
        userImage={userImage}
        title="Access denied"
        description="You do not have permission to view this report."
        menuItems={menuItems}
      >
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold">Access denied</h1>
          <p className="mt-4 text-slate-400">Your role does not allow access to this report.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      userName={userName}
      userRole={userRole}
      userBranchCode={userBranchCode}
      userBranchName={userBranchName}
      userImage={userImage}
      title={report.title}
      description={`Accessible by ${report.access.join(', ')}`}
      menuItems={menuItems}
    >
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
        <h1 className="text-4xl font-semibold">{report.title}</h1>
        <p className="mt-3 text-slate-400">Accessible by: {report.access.join(', ')}</p>
        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-slate-200">
          <p className="text-slate-300">
            This is the {report.title} page. Replace this content with real report widgets or charts.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
