import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import { authOptions } from '../../../lib/auth';
import { getMenusCollection, serializeMenuItems } from '../../../lib/mongodb';

const sampleManagerData = [
  { manager: 'Supriyo Chakraborty', teams: 3, cases: 42, approvals: 36, reviews: 18 },
  { manager: 'Anita Roy', teams: 4, cases: 51, approvals: 47, reviews: 23 },
  { manager: 'Rahul Sen', teams: 2, cases: 34, approvals: 30, reviews: 15 }
];

export default async function ManagerReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = (session.user as any).role as string;
  const userName = session.user.name ?? 'User';
  const userImage = (session.user as any).image as string | undefined;
  const menus = await getMenusCollection();
  const menuItems = serializeMenuItems((await menus.find({}).toArray()) as any[]);

  return (
    <AppShell
      userName={userName}
      userRole={userRole}
      userImage={userImage}
      title="Manager Reports"
      description="Manager-level report summaries and sample metrics."
      menuItems={menuItems}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Teams</p>
            <p className="mt-3 text-4xl font-semibold">3</p>
            <p className="mt-2 text-slate-400">Active reporting teams.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Total Cases</p>
            <p className="mt-3 text-4xl font-semibold">127</p>
            <p className="mt-2 text-slate-400">Requests handled across teams.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Approvals</p>
            <p className="mt-3 text-4xl font-semibold">113</p>
            <p className="mt-2 text-slate-400">Approved cases in the current period.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Manager Performance</h2>
              <p className="mt-2 text-slate-400">Sample metrics for manager-driven processes.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="w-full border-collapse text-left text-sm text-slate-200">
              <thead className="bg-slate-950/90 text-slate-300">
                <tr>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4">Teams</th>
                  <th className="px-6 py-4">Cases</th>
                  <th className="px-6 py-4">Approvals</th>
                  <th className="px-6 py-4">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {sampleManagerData.map((row) => (
                  <tr key={row.manager} className="border-t border-slate-800">
                    <td className="px-6 py-4 text-cyan-300">{row.manager}</td>
                    <td className="px-6 py-4">{row.teams}</td>
                    <td className="px-6 py-4">{row.cases}</td>
                    <td className="px-6 py-4">{row.approvals}</td>
                    <td className="px-6 py-4">{row.reviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
