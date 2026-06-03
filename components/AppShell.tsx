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
  userImage?: string;
  title: string;
  description: string;
  menuItems: MenuItem[];
  children: React.ReactNode;
}

export default function AppShell({ userName, userRole, userImage, title, description, menuItems, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="w-full bg-white border-b border-slate-200 shadow-sm shadow-slate-200/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-0 py-3">
          <div className="flex items-center gap-0 -ml-6">
            <Image
              src="/photos/dddccb_logo.png"
              width={100}
              height={56}
              alt="DDDCCBL"
              priority
              loading="eager"
              className="h-auto w-auto object-contain"
            />
            <p className="text-sm font-bold leading-[100px] h-full flex items-center">Dakshin Dinajpur District Central Co-operative Bank Ltd.</p>
          </div>
          <div className="flex items-center gap-0 -mr-6">
            <div className="relative" ref={popupRef}>
              <button
                onClick={() => setOpen((s) => !s)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                {userImage ? (
                  <Image src={userImage} width={40} height={40} alt="profile" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-sm font-semibold text-cyan-700">
                    {userName?.charAt(0) ?? 'U'}
                  </div>
                )}
                <div className="hidden sm:block text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-600">Welcome</p>
                  <p className="text-sm font-semibold">{userName}</p>
                </div>
              </button>
              {open && (
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="space-y-2">
                    <Link href="/users" className="block w-full rounded-md bg-slate-100 px-3 py-2 text-center text-sm text-slate-900 hover:bg-slate-200">
                      Users
                    </Link>
                    <Link href="/settings" className="block w-full rounded-md bg-slate-100 px-3 py-2 text-center text-sm text-slate-900 hover:bg-slate-200">
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        signOut({ callbackUrl: '/login' });
                      }}
                      className="block w-full rounded-md bg-slate-100 px-3 py-2 text-center text-sm text-blue-600 hover:bg-slate-200"
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
      <div className="flex min-h-[calc(100vh-56px)] w-full">
        <Sidebar menuItems={menuItems} userRole={userRole} />
        <div className="flex-1 px-6 py-6">
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
