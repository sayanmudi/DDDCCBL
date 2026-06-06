import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import { authOptions } from '../../../lib/auth';
import { getMenusCollection, serializeMenuItems } from '../../../lib/mongodb';

const sampleData = [
  { branch: 'Central', transactions: 8582, deposits: 9856232, withdrawals: 622100 },
  { branch: 'North', transactions: 923, deposits: 742300, withdrawals: 511200 },
  { branch: 'East', transactions: 1150, deposits: 832100, withdrawals: 450800 },
  { branch: 'West', transactions: 776, deposits: 594200, withdrawals: 338900 }
];

export default async function CbsReportsPage() {
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
      title="CBS Reports"
      description="Centralized branch summary and sample CBS data."
      menuItems={menuItems}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Branches</p>
            <p className="mt-3 text-4xl font-semibold">4</p>
            <p className="mt-2 text-slate-400">Branches included in the CBS summary.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Total Deposits</p>
            <p className="mt-3 text-4xl font-semibold">$3.15M</p>
            <p className="mt-2 text-slate-400">Aggregated deposit volume across branches.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Total Withdrawals</p>
            <p className="mt-3 text-4xl font-semibold">$1.92M</p>
            <p className="mt-2 text-slate-400">Aggregated withdrawal volume across branches.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">CBS Branch Summary</h2>
              <p className="mt-2 text-slate-400">Sample transaction counts and amounts for each branch.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="w-full border-collapse text-left text-sm text-slate-200">
              <thead className="bg-slate-950/90 text-slate-300">
                <tr>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Transactions</th>
                  <th className="px-6 py-4">Deposits</th>
                  <th className="px-6 py-4">Withdrawals</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row) => (
                  <tr key={row.branch} className="border-t border-slate-800">
                    <td className="px-6 py-4 text-cyan-300">{row.branch}</td>
                    <td className="px-6 py-4">{row.transactions}</td>
                    <td className="px-6 py-4">${row.deposits.toLocaleString()}</td>
                    <td className="px-6 py-4">${row.withdrawals.toLocaleString()}</td>
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
