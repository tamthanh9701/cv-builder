'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutTemplate, BarChart3, Settings, LogOut, Menu, X, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { useI18n } from '@/lib/i18n-provider';
import type { Locale } from '@/lib/types';

const navItems = [
  { key: 'nav.cvs' as const, href: '/cvs', icon: FileText },
  { key: 'nav.templates' as const, href: '/templates', icon: LayoutTemplate },
  { key: 'nav.analysis' as const, href: '/analysis', icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || '?';

  const pageTitle = navItems.find(i => pathname.startsWith(i.href))?.key;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <FileText size={20} />
          </div>
          <span className="sidebar-logo-text">CV Builder</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="sidebar-nav-icon" />
              {t(item.key)}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              href="/settings"
              className={`sidebar-nav-item ${pathname === '/settings' ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="sidebar-nav-icon" />
              {t('nav.settings')}
            </Link>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-nav-item" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {user?.email}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 45 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="dashboard-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="topbar-title">{pageTitle ? t(pageTitle) : 'CV Builder'}</h2>
          </div>
          <div className="topbar-right">
            {/* Locale Toggle */}
            <div className="locale-toggle">
              <button
                className={`locale-btn ${locale === 'vi' ? 'active' : ''}`}
                onClick={() => setLocale('vi')}
              >
                VI
              </button>
              <button
                className={`locale-btn ${locale === 'en' ? 'active' : ''}`}
                onClick={() => setLocale('en')}
              >
                EN
              </button>
            </div>

            {/* User dropdown */}
            <div className="user-dropdown" ref={dropdownRef}>
              <div className="topbar-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {initials}
              </div>
              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <div style={{ padding: '8px 16px', fontSize: '13px' }}>
                    <div style={{ fontWeight: 600 }}>{user?.full_name || 'User'}</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{user?.email}</div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item danger" onClick={signOut}>
                    <LogOut size={16} />
                    {t('auth.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-items">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{t(item.key)}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
