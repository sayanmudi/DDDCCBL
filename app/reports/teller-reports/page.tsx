import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import { authOptions } from '../../../lib/auth';
import { getMenusCollection, serializeMenuItems } from '../../../lib/mongodb';
import { normalizeBranchCode } from '../../../lib/branchAccess';
import { getBranchName } from '../../../lib/branches';

const sampleTellerData = [
  { teller: 'Teller A', transactions: 94, cashIn: 82000, cashOut: 76000 },
  { teller: 'Teller B', transactions: 78, cashIn: 69000, cashOut: 64000 },
  { teller: 'Teller C', transactions: 105, cashIn: 98000, cashOut: 90000 },
  { teller: 'Teller D', transactions: 62, cashIn: 51000, cashOut: 47000 }
];

export default async function TellerReportsPage() {
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
  const userBranchName = await getBranchName(userBranchCode);

  return (
    <AppShell
      userName={userName}
      userRole={userRole}
      userBranchCode={userBranchCode}
      userBranchName={userBranchName}
      userImage={userImage}
      title="Teller Reports"
      description="Teller transaction summary and performance sample data."
      menuItems={menuItems}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Tellers</p>
            <p className="mt-3 text-4xl font-semibold">4</p>
            <p className="mt-2 text-slate-400">Active tellers included in this report.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Total Transactions</p>
            <p className="mt-3 text-4xl font-semibold">339</p>
            <p className="mt-2 text-slate-400">Transactions processed by the teller team.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-slate-100 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Net Cash Flow</p>
            <p className="mt-3 text-4xl font-semibold">$31,000</p>
            <p className="mt-2 text-slate-400">Total net cash in minus out across tellers.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Teller Performance Summary</h2>
              <p className="mt-2 text-slate-400">Sample teller transactions, cash in, and cash out.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="w-full border-collapse text-left text-sm text-slate-200">
              <thead className="bg-slate-950/90 text-slate-300">
                <tr>
                  <th className="px-6 py-4">Teller</th>
                  <th className="px-6 py-4">Transactions</th>
                  <th className="px-6 py-4">Cash In</th>
                  <th className="px-6 py-4">Cash Out</th>
                  <th className="px-6 py-4">Net</th>
                </tr>
              </thead>
              <tbody>
                {sampleTellerData.map((row) => (
                  <tr key={row.teller} className="border-t border-slate-800">
                    <td className="px-6 py-4 text-cyan-300">{row.teller}</td>
                    <td className="px-6 py-4">{row.transactions}</td>
                    <td className="px-6 py-4">${row.cashIn.toLocaleString()}</td>
                    <td className="px-6 py-4">${row.cashOut.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-100">${(row.cashIn - row.cashOut).toLocaleString()}</td>
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
