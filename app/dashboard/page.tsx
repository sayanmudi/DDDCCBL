import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import AppShell from '../../components/AppShell';
import { authOptions } from '../../lib/auth';
import { getMenusCollection, serializeMenuItems } from '../../lib/mongodb';
import { getAccessibleSubMenus, hasAccess } from '../../lib/permissions';
import { normalizeBranchCode } from '../../lib/branchAccess';
import { getOrganizationSettings } from '../../lib/organizationSettings';

export default async function DashboardPage() {
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
  const { organizationName, logoPath } = await getOrganizationSettings();

  const accessibleMenus = menuItems.filter((menu) => hasAccess(userRole, menu.access));

  return (
    <AppShell
      userName={userName}
      userRole={userRole}
      userBranchCode={userBranchCode}
      userImage={userImage}
      title="Dashboard"
      description="Role-based access to menus and reports."
      menuItems={menuItems}
      organizationName={organizationName}
      logoPath={logoPath}
    >
      <section className="grid gap-4 lg:grid-cols-2">
        {accessibleMenus.map((menu) => (
          <div key={menu._id.toString()} className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">{menu.title}</h2>
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm text-cyan-700">
                {menu.access.join(', ')}
              </span>
            </div>
            <p className="mt-4 text-slate-600">{menu.description || 'Quick access to the section.'}</p>
            {menu.subMenus?.length ? (
              <div className="mt-6 space-y-3">
                {getAccessibleSubMenus(userRole, menu.subMenus).map((submenu: any) => (
                  <span key={submenu.slug} className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                    {submenu.title}
                  </span>
                ))}
              </div>
            ) : (
              <span className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-sm">
                Open {menu.title}
              </span>
            )}
          </div>
        ))}
      </section>
    </AppShell>
  );
}
