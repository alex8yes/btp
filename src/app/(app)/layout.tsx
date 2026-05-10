'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Receipt, Package, Settings, Plus, Menu } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Accueil', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/devis', label: 'Devis', icon: FileText },
  { href: '/factures', label: 'Factures', icon: Receipt },
  { href: '/catalogue', label: 'Catalogue', icon: Package },
  { href: '/settings', label: 'Paramètres', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile: Top bar with menu button */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <button onClick={() => setShowMenu(true)} className="p-2 rounded-lg hover:bg-gray-100">
          <Menu size={24} />
        </button>
        <span className="text-lg font-bold">Devis<span className="text-orange-500">BTP</span></span>
        <div className="w-10" />
      </div>

      {/* Mobile menu overlay */}
      {showMenu && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMenu(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 p-6">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold text-white">Devis<span className="text-orange-500">BTP</span></span>
              <button onClick={() => setShowMenu(false)} className="text-gray-400">✕</button>
            </div>
            <nav className="space-y-2">
              {navItems.map(item => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${active ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Link href="/devis/new" className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-orange-500 text-white rounded-lg font-medium">
              <Plus size={20} />
              Nouveau devis
            </Link>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-60 bg-gray-900 p-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-8">Devis<span className="text-orange-500">BTP</span></h1>
        <nav className="space-y-2">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${active ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/devis/new" className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-orange-500 text-white rounded-lg font-medium">
          <Plus size={20} />
          Nouveau devis
        </Link>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}