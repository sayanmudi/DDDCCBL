'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAccessibleSubMenus, hasAccess } from '../lib/permissions';

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

interface SidebarProps {
  menuItems: MenuItem[];
  userRole: string;
}

export default function Sidebar({ menuItems, userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 'w-10' : 'w-50';

  return (
    <aside
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={`flex h-screen flex-col border-r border-slate-200 bg-white/95 shadow-sm transition-all duration-300 ease-in-out ${sidebarWidth}`}
    >
      <nav className="flex-1 overflow-y-auto px-2 pb-6">
        <div className="-space-y-1">
          <div className={`rounded-3xl ${isCollapsed ? 'p-2' : 'p-3'} transition`}>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              {!isCollapsed ? <span>Dashboard</span> : null}
            </Link>
          </div>
          {menuItems
            .filter((menu) => ((menu.slug?.toString?.() ?? '').toLowerCase() !== 'dashboard'))
            .map((menu) => {
            const menuAccessible = hasAccess(userRole, menu.access);
            const visibleSubmenus = getAccessibleSubMenus(userRole, menu.subMenus);

            return (
              <div
                key={menu._id.toString()}
                className={`rounded-3xl ${isCollapsed ? 'p-2' : 'p-4'} transition`}
              >
                <Link
                  href={`/${menu.slug}`}
                  className={`flex items-center gap-0 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                    menuAccessible
                      ? 'text-slate-900 hover:bg-slate-100'
                      : 'cursor-not-allowed text-slate-400'
                  }`}
                >
                  {!isCollapsed ? <span>{menu.title}</span> : null}
                </Link>

                {!isCollapsed && visibleSubmenus?.length ? (
                  <div className="mt-1 space-y-0 border-l border-slate-200 pl-2">
                    {visibleSubmenus.map((submenu) => (
                      <Link
                        key={submenu.slug}
                        href={`/${menu.slug}/${submenu.slug}`}
                        className="block rounded-2xl px-3 py-0.5 text-sm text-slate-600 transition hover:bg-slate-100"
                      >
                        {submenu.title}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
