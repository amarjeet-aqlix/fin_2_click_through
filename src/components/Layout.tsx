import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context';
import { ToastContainer } from './UI';

const NAV_ITEMS_CONSULTANT = [
  { id: 'profile',      label: 'Profil',         icon: '👤', path: '/settings?tab=profile' },
  { id: 'customers',   label: 'Kunden',          icon: '👥', path: '/customers' },
  { id: 'consultants', label: 'Berater',          icon: '🤝', path: '/settings?tab=consultants' },
  { id: 'analysis',    label: 'Analyse',          icon: '📊', path: '/analysis' },
  { id: 'advice',      label: 'Beratung',         icon: '💬', path: '/settings?tab=consultation' },
  { id: 'legal',       label: 'Rechtliches',      icon: '⚖️', path: '/legal' },
  { id: 'settings',    label: 'Einstellungen',    icon: '⚙️', path: '/settings' },
];

const NAV_ITEMS_ADMIN = [
  { id: 'profile',      label: 'Profil',         icon: '👤', path: '/settings?tab=profile' },
  { id: 'customers',   label: 'Kunden',          icon: '👥', path: '/customers' },
  { id: 'consultants', label: 'Berater',          icon: '🤝', path: '/settings?tab=consultants' },
  { id: 'analysis',    label: 'Analyse',          icon: '📊', path: '/analysis' },
  { id: 'advice',      label: 'Beratung',         icon: '💬', path: '/settings?tab=consultation' },
  { id: 'legal',       label: 'Rechtliches',      icon: '⚖️', path: '/legal' },
  { id: 'settings',    label: 'Einstellungen',    icon: '⚙️', path: '/settings' },
];

const NAV_ITEMS_CUSTOMER = [
  { id: 'profile',    label: 'Profil',        icon: '👤', path: '/portal?tab=account' },
  { id: 'portal',    label: 'Mein Bereich',   icon: '🏠', path: '/portal' },
  { id: 'documents', label: 'Dokumente',      icon: '📄', path: '/portal?tab=documents' },
  { id: 'goals',     label: 'Ziele',          icon: '🎯', path: '/portal?tab=goals' },
  { id: 'legal',     label: 'Rechtliches',    icon: '⚖️', path: '/legal' },
  { id: 'settings',  label: 'Einstellungen',  icon: '⚙️', path: '/settings' },
];

export const AppLayout: React.FC<{ children: React.ReactNode; title?: string; extraNav?: React.ReactNode }> = ({ children, title, extraNav }) => {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = user?.role === 'customer'
    ? NAV_ITEMS_CUSTOMER
    : user?.role === 'admin'
      ? NAV_ITEMS_ADMIN
      : NAV_ITEMS_CONSULTANT;

  const isActive = (path: string) => {
    const [pathname, queryStr] = path.split('?');
    // nested routes like /customers/cust1
    if (!queryStr && location.pathname.startsWith(pathname + '/')) return true;
    if (location.pathname !== pathname) return false;
    if (!queryStr) {
      // /settings (no tab) → only active when URL has no tab param
      const currentTab = new URLSearchParams(location.search).get('tab');
      return !currentTab;
    }
    const tabParam = new URLSearchParams(queryStr).get('tab');
    return new URLSearchParams(location.search).get('tab') === tabParam;
  };


  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role === 'consultant' ? 'Berater' : 'Kunde';
  const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <div className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ cursor: 'pointer' }}>
            💰
          </div>
          <div className="sidebar-logo-text">finExpert</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item${isActive(item.path) ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </div>
          ))}
          {extraNav}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.first_name} {user?.last_name}</div>
            <div className="sidebar-user-role">{roleLabel}</div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="main-area">
        <div className="topnav">
          <button
            className="btn btn-icon btn-secondary"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Menü öffnen' : 'Menü schließen'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>

          {title && <span className="topnav-title">{title}</span>}
          <div className="topnav-spacer" />

        </div>

        <div className="page-content">
          {children}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
