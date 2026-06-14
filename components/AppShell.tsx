'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import Sidebar from './Sidebar';

interface SubMenuItem {
  title: string;
  slug: string;
  access: string[];
}

interface MenuItem {
  _id: any;
  title: string;
  slug: string;
  access: string[];
  subMenus?: SubMenuItem[];
}

interface AppShellProps {
  userName: string;
  userRole: string;
  userBranchCode?: string;
  userImage?: string;
  title: string;
  description: string;
  menuItems: MenuItem[];
  organizationName?: string;
  logoPath?: string;
  children: React.ReactNode;
}

export default function AppShell({ userName, userRole, userBranchCode, userImage, title, description, menuItems, organizationName = 'Dakshin Dinajpur District Central Co-operative Bank Ltd.', logoPath = '/photos/dddccb_logo.png', children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        if (!(e.target as HTMLElement).closest('button[aria-label="Toggle sidebar"]')) {
          setSidebarOpen(false);
        }
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm shadow-slate-200/50">
        <div className="mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 sm:flex-none">
              <button
                aria-label="Toggle sidebar"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Image
                src={logoPath}
                width={80}
                height={45}
                alt={organizationName}
                priority
                loading="eager"
                className="h-auto w-16 sm:w-20 object-contain"
              />
              <p className="text-xs sm:text-sm font-bold leading-tight hidden sm:block">
                {organizationName}
              </p>
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={popupRef}>
              <button
                onClick={() => setProfileOpen((s) => !s)}
                className="flex items-center gap-2 sm:gap-3 rounded-2xl px-2 sm:px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 transition"
              >
                {userImage ? (
                  <Image src={userImage} width={40} height={40} alt="profile" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-cyan-100 text-xs sm:text-sm font-semibold text-cyan-700">
                    {userName?.charAt(0) ?? 'U'}
                  </div>
                )}
                <div className="hidden sm:block text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-600">Welcome</p>
                  <p className="text-sm font-semibold">{userName}</p>
                  <p className="text-xs text-slate-500">
                    {userRole}{userBranchCode ? ` • Branch ${userBranchCode}` : ''}
                  </p>
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 sm:w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="space-y-2">
                    <Link href="/users" className="block w-full rounded-md bg-slate-100 px-3 py-2 text-center text-sm text-slate-900 hover:bg-slate-200 transition">
                      Users
                    </Link>
                    <Link href="/settings" className="block w-full rounded-md bg-slate-100 px-3 py-2 text-center text-sm text-slate-900 hover:bg-slate-200 transition">
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut({ callbackUrl: process.env.NEXT_PUBLIC_NEXTAUTH_URL ?? '/login' });
                      }}
                      className="block w-full rounded-md bg-slate-100 px-3 py-2 text-center text-sm text-blue-600 hover:bg-slate-200 transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-[calc(100vh-56px)] w-full relative">
        {/* Sidebar - Desktop Fixed, Mobile Overlay */}
        <div
          ref={sidebarRef}
          className={`fixed md:static inset-0 z-30 md:z-0 md:flex transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Mobile Overlay Backdrop */}
          {sidebarOpen && (
            <div
              className="md:hidden absolute inset-0 bg-black/50 z-0"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {/* Sidebar Component */}
          <div className="relative z-10 bg-white md:bg-white/95 w-64 md:w-auto h-full md:h-auto md:flex md:flex-col">
            <Sidebar menuItems={menuItems} userRole={userRole} onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-6 max-w-7xl mx-auto">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
