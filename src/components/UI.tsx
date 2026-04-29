import React, { useState } from 'react';
import type { Toast } from '../types';
import { useApp } from '../context';

// ── Spinner ─────────────────────────────────────────────────
export const Spinner: React.FC<{ small?: boolean }> = ({ small }) => (
  <div className={small ? 'spinner spinner-sm' : 'spinner'} />
);

export const LoadingCenter: React.FC<{ text?: string }> = ({ text }) => (
  <div className="loading-center">
    <Spinner />
    {text && <p>{text}</p>}
  </div>
);

// ── Badge ────────────────────────────────────────────────────
type BadgeType = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'primary';
export const Badge: React.FC<{ type?: BadgeType; children: React.ReactNode }> = ({ type = 'neutral', children }) => (
  <span className={`badge badge-${type}`}>{children}</span>
);

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { type: BadgeType; label: string }> = {
    active: { type: 'success', label: 'Aktiv' },
    inactive: { type: 'neutral', label: 'Inaktiv' },
    support: { type: 'warning', label: 'Support' },
    paid: { type: 'success', label: 'Bezahlt' },
    pending: { type: 'warning', label: 'Ausstehend' },
    failed: { type: 'danger', label: 'Fehlgeschlagen' },
    trialing: { type: 'info', label: 'Testphase' },
    past_due: { type: 'danger', label: 'Überfällig' },
    cancelled: { type: 'neutral', label: 'Gekündigt' },
  };
  const info = map[status] ?? { type: 'neutral', label: status };
  return <Badge type={info.type}>{info.label}</Badge>;
};

// ── Toast Container ──────────────────────────────────────────
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();
  return (
    <div className="toast-container">
      {toasts.map((t: Toast) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : t.type === 'warning' ? '⚠' : 'ℹ'}</span>
          <span>{t.message}</span>
          <button className="toast-dismiss" onClick={() => removeToast(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
};

// ── Modal ────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
  narrow?: boolean;
}
export const Modal: React.FC<ModalProps> = ({ title, onClose, children, footer, wide, narrow }) => (
  <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className={`modal${wide ? ' modal-wide' : ''}${narrow ? ' modal-narrow' : ''}`}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

// ── Confirm dialog ───────────────────────────────────────────
interface ConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}
export const Confirm: React.FC<ConfirmProps> = ({ message, onConfirm, onCancel, danger }) => (
  <Modal
    title="Bestätigung erforderlich"
    onClose={onCancel}
    narrow
    footer={
      <>
        <button className="btn btn-secondary" onClick={onCancel}>Abbrechen</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>Bestätigen</button>
      </>
    }
  >
    <p>{message}</p>
  </Modal>
);

// ── Input ────────────────────────────────────────────────────
interface InputProps {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  error?: string;
}
export const Input: React.FC<InputProps> = ({ label, value, onChange, type = 'text', placeholder, required, disabled, hint, error }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}{required && ' *'}</label>}
    <input
      className={`form-control${error ? ' error' : ''}`}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
    />
    {error && <span className="form-error">{error}</span>}
    {hint && !error && <span className="form-hint">{hint}</span>}
  </div>
);

// ── Select ───────────────────────────────────────────────────
interface SelectProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}
export const Select: React.FC<SelectProps> = ({ label, value, onChange, options, disabled }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <select className="form-control" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ── Toggle ───────────────────────────────────────────────────
export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: string }> = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-s">
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
    {label && <span className="text-sm">{label}</span>}
  </div>
);

// ── Panel ────────────────────────────────────────────────────
export const Panel: React.FC<{ title?: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
  <div className="panel">
    {title && (
      <div className="panel-header">
        <span className="panel-title">{title}</span>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="panel-body">{children}</div>
  </div>
);

// ── Stat Card ────────────────────────────────────────────────
export const StatCard: React.FC<{ icon: string; value: string | number; label: string; sub?: string }> = ({ icon, value, label, sub }) => (
  <div className="stat-card">
    <div className="stat-card-icon">{icon}</div>
    <div className="stat-card-value">{value}</div>
    <div className="stat-card-label">{label}</div>
    {sub && <div className="text-xs text-grey">{sub}</div>}
  </div>
);

// ── Empty State ──────────────────────────────────────────────
export const EmptyState: React.FC<{ icon?: string; text: string; sub?: string; action?: React.ReactNode }> = ({ icon, text, sub, action }) => (
  <div className="empty-state">
    {icon && <div className="empty-state-icon">{icon}</div>}
    <div className="empty-state-text">{text}</div>
    {sub && <div className="empty-state-sub">{sub}</div>}
    {action && <div className="mt-m">{action}</div>}
  </div>
);

// ── Tabs ─────────────────────────────────────────────────────
interface TabsProps {
  tabs: { id: string; label: string; icon?: string }[];
  active: string;
  onChange: (id: string) => void;
}
export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange }) => (
  <div className="tab-bar">
    {tabs.map((t) => (
      <button key={t.id} className={`tab-btn${active === t.id ? ' active' : ''}`} onClick={() => onChange(t.id)}>
        {t.icon && <span style={{ marginRight: 5 }}>{t.icon}</span>}
        {t.label}
      </button>
    ))}
  </div>
);

// ── Alert ────────────────────────────────────────────────────
export const Alert: React.FC<{ type?: 'info' | 'success' | 'warning' | 'danger'; children: React.ReactNode }> = ({ type = 'info', children }) => (
  <div className={`alert alert-${type}`}>
    <span>{type === 'success' ? '✓' : type === 'danger' ? '✗' : type === 'warning' ? '⚠' : 'ℹ'}</span>
    <div>{children}</div>
  </div>
);

// ── Avatar initials ──────────────────────────────────────────
export const Avatar: React.FC<{ first: string; last: string; size?: 'sm' | 'lg' }> = ({ first, last, size }) => {
  const initials = `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
  if (size === 'lg') return <div className="customer-avatar-lg">{initials}</div>;
  return <div className="avatar-sm">{initials}</div>;
};

// ── Progress bar ─────────────────────────────────────────────
export const Progress: React.FC<{ value: number; max?: number; type?: 'primary' | 'success' | 'warning' | 'danger' }> = ({ value, max = 100, type = 'primary' }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress-bar">
      <div className={`progress-fill progress-${type}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

// ── Section header ───────────────────────────────────────────
export const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <div className="section-header">
    <div>
      <h2 className="section-title" style={{ marginBottom: subtitle ? 2 : 0 }}>{title}</h2>
      {subtitle && <div className="text-xs text-grey">{subtitle}</div>}
    </div>
    {action}
  </div>
);

// ── Color swatch input ───────────────────────────────────────
export const ColorInput: React.FC<{ label?: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <div className="flex items-center gap-s">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 44, height: 36, border: 'none', background: 'none', cursor: 'pointer' }} />
      <input className="form-control" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 120 }} />
    </div>
  </div>
);

// ── Textarea ─────────────────────────────────────────────────
export const Textarea: React.FC<{ label?: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }> = ({ label, value, onChange, rows = 4, placeholder }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    <textarea className="form-control" value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{ resize: 'vertical' }} />
  </div>
);

// ── File upload placeholder ──────────────────────────────────
export const FileUpload: React.FC<{ label?: string; accept?: string; hint?: string }> = ({ label, accept, hint }) => {
  const [name, setName] = useState('');
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div style={{ border: '2px dashed var(--gray-dark)', borderRadius: 'var(--radius)', padding: 'var(--sp-l)', textAlign: 'center', cursor: 'pointer', background: 'var(--gray-light)' }}>
        <input type="file" accept={accept} style={{ display: 'none' }} id="file-upload" onChange={(e) => setName(e.target.files?.[0]?.name ?? '')} />
        <label htmlFor="file-upload" style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>
          {name || '📎 Datei auswählen oder hierher ziehen'}
        </label>
      </div>
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
};
