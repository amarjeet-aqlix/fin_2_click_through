import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context';
import { ToastContainer } from './UI';

const NAV_ITEMS_CONSULTANT = [
  { id: 'dashboard', label: 'Übersicht', icon: '🏠', path: '/dashboard' },
  { id: 'customers', label: 'Kunden', icon: '👥', path: '/customers' },
  { id: 'analysis', label: 'Analyse', icon: '📊', path: '/analysis' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙️', path: '/settings' },
];

const NAV_ITEMS_ADMIN = [
  { id: 'dashboard', label: 'Übersicht', icon: '🏠', path: '/dashboard' },
  { id: 'customers', label: 'Kunden', icon: '👥', path: '/customers' },
  { id: 'analysis', label: 'Analyse', icon: '📊', path: '/analysis' },
  { id: 'billing', label: 'Abrechnung', icon: '💳', path: '/settings?tab=billing' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙️', path: '/settings' },
];

const NAV_ITEMS_CUSTOMER = [
  { id: 'portal', label: 'Mein Bereich', icon: '🏠', path: '/portal' },
  { id: 'documents', label: 'Dokumente', icon: '📄', path: '/portal?tab=documents' },
  { id: 'goals', label: 'Ziele', icon: '🎯', path: '/portal?tab=goals' },
];

export const AppLayout: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = user?.role === 'customer'
    ? NAV_ITEMS_CUSTOMER
    : user?.role === 'admin'
      ? NAV_ITEMS_ADMIN
      : NAV_ITEMS_CONSULTANT;

  const isActive = (path: string) => location.pathname === path.split('?')[0];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
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

          <div className="topnav-actions">
            <div className="user-dropdown">
              <div
                className="topnav-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title="Benutzerprofil"
              >
                {initials}
              </div>

              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-name">{user?.first_name} {user?.last_name}</div>
                    <div className="user-dropdown-email">{user?.email}</div>
                  </div>

                  <div className="user-dropdown-item" onClick={() => { navigate('/settings'); setDropdownOpen(false); }}>
                    ⚙️ Einstellungen
                  </div>

                  {user?.role !== 'customer' && (
                    <div className="user-dropdown-item" onClick={() => { navigate('/settings?tab=profile'); setDropdownOpen(false); }}>
                      👤 Mein Profil
                    </div>
                  )}

                  {user?.role === 'customer' && (
                    <div className="user-dropdown-item" onClick={() => { navigate('/portal'); setDropdownOpen(false); }}>
                      🏠 Mein Bereich
                    </div>
                  )}

                  <hr className="divider" style={{ margin: 0 }} />

                  <div className="user-dropdown-item danger" onClick={handleLogout}>
                    🚪 Abmelden
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="page-content" onClick={() => setDropdownOpen(false)}>
          {children}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
