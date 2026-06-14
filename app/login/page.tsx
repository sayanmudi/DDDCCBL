import { getOrganizationSettings } from '../../lib/organizationSettings';
import LoginForm from '../../components/LoginForm';

export default async function LoginPage() {
  // Fetch organization settings from database
  const { organizationName, logoPath } = await getOrganizationSettings();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 text-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl shadow-slate-200/80 backdrop-blur-sm">
        <h1 className="text-3xl font-semibold mb-2 text-slate-1200">Welcome to {organizationName}</h1>
        <p className="text-slate-600 mb-6">Please sign in with your user id and password.</p>

        <LoginForm />
      </div>
    </main>
  );
}
