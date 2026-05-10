'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Package,
  Settings,
  Plus,
  Menu,
  X,
} from 'lucide-react';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile sidebar - only rendered when mobileOpen is true */}
      {isMobile && mobileOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 50,
          display: 'flex'
        }}>
          <div
            onClick={() => setMobileOpen(false)}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          />
          <div style={{
            width: '240px',
            height: '100vh',
            backgroundColor: '#2D2D2D',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                Devis<span style={{ color: '#E85D04' }}>BTP</span>
              </h1>
              <button onClick={() => setMobileOpen(false)} style={{ padding: '8px', color: '#D1D5DB', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
              {navItems.map(item => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      marginBottom: '4px',
                      color: isActive ? 'white' : '#D1D5DB',
                      backgroundColor: isActive ? '#E85D04' : 'transparent',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div style={{ padding: '16px' }}>
              <Link
                href="/devis/new"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#E85D04',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                <Plus size={20} />
                Nouveau devis
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <div style={{ width: '240px', backgroundColor: '#2D2D2D', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
              Devis<span style={{ color: '#E85D04' }}>BTP</span>
            </h1>
          </div>
          <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
            {navItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    marginBottom: '4px',
                    color: isActive ? 'white' : '#D1D5DB',
                    backgroundColor: isActive ? '#E85D04' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div style={{ padding: '16px' }}>
            <Link
              href="/devis/new"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                backgroundColor: '#E85D04',
                color: 'white',
                borderRadius: '8px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <Plus size={20} />
              Nouveau devis
            </Link>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Mobile header */}
        {isMobile && (
          <div style={{ height: '56px', backgroundColor: 'white', borderBottom: '1px solid #E5E2DD', display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0 }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              <Menu size={24} />
            </button>
            <h1 style={{ marginLeft: '12px', fontSize: '18px', fontWeight: 'bold' }}>
              Devis<span style={{ color: '#E85D04' }}>BTP</span>
            </h1>
          </div>
        )}

        {/* Page content */}
        <main style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '16px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </>
  );
}