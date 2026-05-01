import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Panel, Input, Select, Textarea, Toggle, Alert, Badge, StatusBadge, SectionHeader, ColorInput, FileUpload, EmptyState, Confirm } from '../components/UI';
import { useApp } from '../context';
import { CONSULTANTS, CUSTOMERS, TRANSACTIONS, SUBSCRIPTION, PLANS, COMPANY_INFO } from '../mock';
import type { Consultant } from '../types';

const SETTINGS_TABS = [
  { id: 'overview',     label: 'Übersicht',          icon: '🏠', section: null },
  { id: 'profile',      label: 'Mein Profil',         icon: '👤', section: null },
  { id: 'customers',    label: 'Kundenverwaltung',    icon: '🧑‍💼', section: 'Verwaltung' },
  { id: 'consultants',  label: 'Beraterverwaltung',   icon: '👥', section: null },
  { id: 'company',      label: 'Unternehmen',         icon: '🏢', section: 'Einstellungen' },
  { id: 'consultation', label: 'Beratung',             icon: '💬', section: null },
  { id: 'billing',      label: 'Abrechnung',           icon: '💳', section: null },
  { id: 'legal',        label: 'Rechtliches',          icon: '⚖️', section: null },
];

const RIGHTS_LABELS: Record<string, string> = {
  CAN_SEE_ALL_CLIENTS: 'Alle Kunden',
  CAN_SEE_CLIENTS_OF_LOWER_STAGES: 'Untergeordnete',
  CAN_MODIFY_COMPANY_SUGGESTION_REASONS: 'Vorschläge',
  ADMIN: 'Admin',
};

export const Settings: React.FC = () => {
  const { user, addToast } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get('tab') ?? 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const myConsultant = CONSULTANTS.find((c) => c.email === user?.email) ?? CONSULTANTS[0];

  const [profile, setProfile] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: user?.email ?? '',
    phone: myConsultant.phone,
    mobile: myConsultant.mobile ?? '',
    phone_office: myConsultant.phone_office ?? '',
    title: 'Finanzberater',
    street: myConsultant.address?.street ?? '',
    street_number: myConsultant.address?.number ?? '',
    zip: myConsultant.address?.zip ?? '',
    city: myConsultant.address?.city ?? '',
    profile_text: myConsultant.profile_text ?? '',
    areas_of_expertise: myConsultant.areas_of_expertise ?? [],
  });
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');

  const [company, setCompany] = useState({ ...COMPANY_INFO });

  const [consultationSettings, setConsultationSettings] = useState({
    show_income: true, show_retirement: true, show_investment: true,
    show_insurance: true, show_house: true,
    default_note_template: '',
    require_initial_info: true, auto_save: true,
  });

  const [consultants, setConsultants] = useState<Consultant[]>(CONSULTANTS);
  const [showAddConsultant, setShowAddConsultant] = useState(false);
  const [newConsultant, setNewConsultant] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editConsultantId, setEditConsultantId] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleSaveProfile = async () => {
    await new Promise((r) => setTimeout(r, 700));
    addToast('success', 'Profil wurde gespeichert.');
  };

  const handleChangePassword = async () => {
    setPwError('');
    if (!currentPw) { setPwError('Bitte aktuelles Passwort eingeben.'); return; }
    if (newPw.length < 8) { setPwError('Neues Passwort muss mind. 8 Zeichen haben.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwörter stimmen nicht überein.'); return; }
    await new Promise((r) => setTimeout(r, 800));
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    addToast('success', 'Passwort wurde erfolgreich geändert.');
  };

  const handleAddConsultant = async () => {
    if (!newConsultant.first_name || !newConsultant.email) { addToast('error', 'Pflichtfelder ausfüllen.'); return; }
    await new Promise((r) => setTimeout(r, 700));
    const created: Consultant = {
      id: `cons${Date.now()}`,
      ...newConsultant,
      company_id: 'c1',
      rights: ['CONSULTANT'],
      status: 'active',
      customers_count: 0,
      created_at: new Date().toISOString().slice(0, 10),
    };
    setConsultants((prev) => [...prev, created]);
    setShowAddConsultant(false);
    setNewConsultant({ first_name: '', last_name: '', email: '', phone: '' });
    addToast('success', `Berater ${created.first_name} ${created.last_name} wurde eingeladen.`);
  };

  const handleDeleteConsultant = async (id: string) => {
    await new Promise((r) => setTimeout(r, 500));
    setConsultants((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
    addToast('success', 'Berater wurde entfernt.');
  };

  const handleToggleRight = (consultantId: string, right: string) => {
    setConsultants((prev) => prev.map((c) => {
      if (c.id !== consultantId) return c;
      const has = c.rights.includes(right);
      return { ...c, rights: has ? c.rights.filter((r) => r !== right) : [...c.rights, right] };
    }));
  };

  const isAdmin = user?.role === 'admin';

  const availableRights = [
    { value: 'ADMIN',                              label: 'Anwendungs-Administrator',          desc: 'Voller Zugriff auf alle Funktionen und Einstellungen.' },
    { value: 'CAN_SEE_COMPANY_ADMIN_PAGE',         label: 'Firmeneinstellungen',               desc: 'Kann die Firmeneinstellungen einsehen.' },
    { value: 'CAN_MANAGE_HIERARCHY',               label: 'Beraterstruktur verwalten',         desc: 'Darf alle Berater sehen, CRM-Einstellungen und Beraterstruktur bearbeiten.' },
    { value: 'CAN_CONSULT_CLIENTS',                label: 'Kunden beraten',                    desc: 'Darf Kunden aktiv beraten.' },
    { value: 'CAN_SEE_ALL_CLIENTS',                label: 'Alle Kunden sehen',                 desc: 'Kann alle Kunden der Firma sehen.' },
    { value: 'CAN_SEE_CLIENTS_OF_LOWER_STAGES',   label: 'Untergeordnete Kunden sehen',       desc: 'Kann Kunden der untergeordneten Berater sehen.' },
    { value: 'CAN_MODIFY_CONSULTANT_RIGHTS',       label: 'Beraterrechte anpassen',            desc: 'Kann die Berechtigungen von zugänglichen Beratern anpassen.' },
    { value: 'CAN_DELETE_CONSULTANTS',             label: 'Berater anlegen & löschen',         desc: 'Kann Berater anlegen sowie zugängliche Berater löschen.' },
    { value: 'CAN_MODIFY_PRECAUTION_TYPES',        label: 'Beratungsvoreinstellungen',         desc: 'Kann die Beratungsvoreinstellungen der Firma anpassen.' },
    { value: 'CAN_MODIFY_COMPANY_DESIGN',          label: 'Firmendesign anpassen',             desc: 'Kann Farben und Logo der Firma anpassen.' },
    { value: 'CAN_MODIFY_COMPANY_SUGGESTION_REASONS', label: 'Begründungsbausteine',          desc: 'Kann die Begründungsbausteine der Firma bearbeiten.' },
  ];

  const initials = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();



  const extraNav = (
    <>
      <div className="sidebar-section-label">Konto</div>
      <div
        className={`nav-item${activeTab === 'company' ? ' active' : ''}`}
        onClick={() => { setActiveTab('company'); navigate('/settings?tab=company'); }}
      >
        <span className="nav-item-icon">🏢</span>
        <span className="nav-item-label">Unternehmenseinstellungen</span>
      </div>
      {isAdmin && (
        <div
          className={`nav-item${activeTab === 'billing' ? ' active' : ''}`}
          onClick={() => { setActiveTab('billing'); navigate('/settings?tab=billing'); }}
        >
          <span className="nav-item-icon">💳</span>
          <span className="nav-item-label">Abrechnung</span>
        </div>
      )}
    </>
  );

  return (
    <AppLayout title="Einstellungen" extraNav={extraNav}>
      <div>

          {/* ── Übersicht ───────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div>
              <SectionHeader title="Übersicht" />

              {/* Profile summary */}
              <div className="profile-header-card">
                <div>
                  <div className="profile-section-title">Expertise</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.areas_of_expertise.length > 0
                      ? profile.areas_of_expertise.map((e) => (
                          <span key={e} style={{ fontSize: 'var(--fs-xs)', background: 'var(--primary-tint)', color: 'var(--primary)', borderRadius: 20, padding: '3px 10px', fontWeight: 600 }}>{e}</span>
                        ))
                      : <span style={{ fontSize: 'var(--fs-s)', color: 'var(--text-muted)' }}>—</span>
                    }
                  </div>
                  <div style={{ marginTop: 'var(--sp-m)' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/legal')}>
                      Unternehmenspräsentation
                    </button>
                    {' '}
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/initial-legal')}>
                      Erstinformation ansehen
                    </button>
                  </div>
                </div>

                <div>
                  <div className="profile-section-title">Kontaktdaten</div>
                  <div className="profile-contact-row">
                    <span className="profile-contact-icon">📞</span>
                    <span>{profile.phone}</span>
                  </div>
                  {profile.mobile && (
                    <div className="profile-contact-row">
                      <span className="profile-contact-icon">📱</span>
                      <span>{profile.mobile}</span>
                    </div>
                  )}
                  <div className="profile-contact-row">
                    <span className="profile-contact-icon">✉️</span>
                    <a href={`mailto:${profile.email}`} style={{ color: 'var(--primary)' }}>{profile.email}</a>
                  </div>
                  <div className="profile-contact-row">
                    <span className="profile-contact-icon">🏢</span>
                    <span>{COMPANY_INFO.name}</span>
                  </div>
                  <div style={{ marginTop: 'var(--sp-m)', display: 'flex', gap: 6 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('profile')}>
                      Profil bearbeiten
                    </button>
                  </div>
                </div>

                <div className="profile-avatar-lg">{initials}</div>
              </div>

              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-m)', marginBottom: 'var(--sp-m)' }}>
                {[
                  { icon: '🧑‍💼', label: 'Kunden gesamt', value: CUSTOMERS.length },
                  { icon: '✅', label: 'Aktive Kunden', value: CUSTOMERS.filter(c => c.status === 'active').length },
                  { icon: '👥', label: 'Berater', value: consultants.filter(c => c.status === 'active').length },
                ].map((s) => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-card-icon">{s.icon}</div>
                    <div className="stat-card-value">{s.value}</div>
                    <div className="stat-card-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick nav cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-m)' }}>
                {[
                  { icon: '🧑‍💼', title: 'Zur Kundenliste', desc: 'Alle Kunden verwalten', action: () => navigate('/dashboard') },
                  { icon: '👥', title: 'Beraterverwaltung', desc: `${consultants.length} Berater`, action: () => setActiveTab('consultants') },
                  { icon: '🏢', title: 'Unternehmen', desc: COMPANY_INFO.name, action: () => setActiveTab('company') },
                  { icon: '💳', title: 'Abrechnung', desc: SUBSCRIPTION.plan_name, action: () => setActiveTab('billing') },
                ].map((c) => (
                  <div
                    key={c.title}
                    onClick={c.action}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-l)', padding: 'var(--sp-m)', cursor: 'pointer', display: 'flex', gap: 'var(--sp-m)', alignItems: 'center', transition: 'border-color var(--transition)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <span style={{ fontSize: 24 }}>{c.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--fs-s)' }}>{c.title}</div>
                      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Mein Profil ─────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div>
              {/* Profile header card */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-l)', padding: 'var(--sp-l)', marginBottom: 'var(--sp-l)', display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-l)' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div className="profile-avatar-lg">{initials}</div>
                  <label style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}>
                    📷
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => addToast('info', 'Profilbild wird hochgeladen...')} />
                  </label>
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 4px' }}>{profile.first_name} {profile.last_name}</h2>
                  <div style={{ fontSize: 'var(--fs-s)', color: 'var(--text-muted)', marginBottom: 'var(--sp-m)' }}>{profile.title} · {COMPANY_INFO.name}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => addToast('info', 'Als Kunde anmelden...')}>
                      👤 Als Kunde anmelden
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers/new')}>
                      + Neuer Kunde
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/legal')}>
                      Unternehmenspräsentation
                    </button>
                  </div>
                </div>
              </div>

              {/* Two-column layout: contact info left, expertise right */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--sp-l)', alignItems: 'start' }}>
                {/* Left — contact details (read-only display) */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-l)', padding: 'var(--sp-l)' }}>
                  <div className="profile-section-title" style={{ marginBottom: 'var(--sp-m)' }}>Kontaktdaten</div>
                  {[
                    { icon: '✉️', value: profile.email },
                    { icon: '📞', value: profile.phone },
                    profile.mobile ? { icon: '📱', value: profile.mobile } : null,
                    profile.phone_office ? { icon: '🏢', value: profile.phone_office } : null,
                    (profile.street || profile.city) ? { icon: '📍', value: `${profile.street}${profile.street_number ? ' ' + profile.street_number : ''}, ${profile.zip} ${profile.city}`.trim().replace(/^,\s*/, '') } : null,
                  ].filter(Boolean).map((row) => (
                    <div key={row!.icon} className="profile-contact-row">
                      <span className="profile-contact-icon">{row!.icon}</span>
                      <span style={{ fontSize: 'var(--fs-s)', color: 'var(--text-muted)' }}>{row!.value}</span>
                    </div>
                  ))}
                </div>

                {/* Right — expertise tags */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-l)', padding: 'var(--sp-l)' }}>
                  <div className="profile-section-title" style={{ marginBottom: 'var(--sp-m)' }}>Expertise & Schwerpunkte</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--sp-m)', minHeight: 40 }}>
                    {profile.areas_of_expertise.map((area) => (
                      <span key={area} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-xs)', background: 'var(--primary-tint)', color: 'var(--primary)', borderRadius: 20, padding: '5px 12px', fontWeight: 600 }}>
                        {area}
                        <button
                          onClick={() => setProfile((p) => ({ ...p, areas_of_expertise: p.areas_of_expertise.filter((x) => x !== area) }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }}
                        >×</button>
                      </span>
                    ))}
                    {profile.areas_of_expertise.length === 0 && (
                      <span style={{ fontSize: 'var(--fs-s)', color: 'var(--text-muted)' }}>Noch keine Schwerpunkte hinterlegt.</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="input"
                      placeholder="Neuer Schwerpunkt, dann Enter..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const val = e.currentTarget.value.trim();
                          setProfile((p) => ({ ...p, areas_of_expertise: [...p.areas_of_expertise, val] }));
                          e.currentTarget.value = '';
                        }
                      }}
                      style={{ flex: 1 }}
                    />
                    <button className="btn btn-secondary btn-sm" onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input.value.trim()) {
                        setProfile((p) => ({ ...p, areas_of_expertise: [...p.areas_of_expertise, input.value.trim()] }));
                        input.value = '';
                      }
                    }}>+ Hinzufügen</button>
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: 'var(--sp-m)' }} onClick={handleSaveProfile}>💾 Speichern</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Kundenverwaltung ────────────────────────────────── */}
          {activeTab === 'customers' && (
            <div>
              <SectionHeader
                title="Kundenverwaltung"
                action={<button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>→ Zur Kundenliste</button>}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--sp-m)', marginBottom: 'var(--sp-l)' }}>
                {[
                  { label: 'Gesamt', value: CUSTOMERS.length, color: 'var(--primary)' },
                  { label: 'Aktiv', value: CUSTOMERS.filter(c => c.status === 'active').length, color: 'var(--success)' },
                  { label: 'Support', value: CUSTOMERS.filter(c => c.status === 'support').length, color: 'var(--warning)' },
                ].map((s) => (
                  <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-l)', padding: 'var(--sp-l)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <Panel title="Letzte Kunden">
                {CUSTOMERS.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/customers/${c.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-m)', padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-tint)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--fs-xs)', flexShrink: 0 }}>
                      {c.first_name.charAt(0)}{c.last_name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--fs-s)' }}>{c.first_name} {c.last_name}</div>
                      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{c.email}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
                <div style={{ paddingTop: 'var(--sp-m)' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>Alle Kunden anzeigen →</button>
                </div>
              </Panel>
            </div>
          )}

          {/* ── Beraterverwaltung ───────────────────────────────── */}
          {activeTab === 'consultants' && (
            <div>
              <SectionHeader
                title="Beraterverwaltung"
                action={
                  isAdmin
                    ? <button className="btn btn-primary btn-sm" onClick={() => setShowAddConsultant(true)}>+ Berater einladen</button>
                    : undefined
                }
              />

              {!isAdmin && (
                <Alert type="warning">Nur Administratoren können Berater verwalten.</Alert>
              )}

              {showAddConsultant && (
                <Panel title="Neuen Berater einladen">
                  <div className="form-row">
                    <Input label="Vorname" value={newConsultant.first_name} onChange={(v) => setNewConsultant((p) => ({ ...p, first_name: v }))} required />
                    <Input label="Nachname" value={newConsultant.last_name} onChange={(v) => setNewConsultant((p) => ({ ...p, last_name: v }))} required />
                  </div>
                  <Input label="E-Mail" type="email" value={newConsultant.email} onChange={(v) => setNewConsultant((p) => ({ ...p, email: v }))} required hint="Der Berater erhält eine Einladungs-E-Mail" />
                  <Input label="Telefon" value={newConsultant.phone} onChange={(v) => setNewConsultant((p) => ({ ...p, phone: v }))} />
                  <div className="flex gap-s">
                    <button className="btn btn-secondary" onClick={() => { setShowAddConsultant(false); setNewConsultant({ first_name: '', last_name: '', email: '', phone: '' }); }}>Abbrechen</button>
                    <button className="btn btn-primary" onClick={handleAddConsultant}>✉️ Einladen</button>
                  </div>
                </Panel>
              )}

              {/* Consultant cards */}
              <div className="card">
                <div className="card-header">
                  <h3>Berater ({consultants.length})</h3>
                  <div className="flex gap-s">
                    <Badge type="success">{consultants.filter((c) => c.status === 'active').length} aktiv</Badge>
                    <Badge type="neutral">{consultants.filter((c) => c.status === 'inactive').length} inaktiv</Badge>
                  </div>
                </div>

                {consultants.map((c) => (
                  <div key={c.id} className="consultant-card">
                    <div className="consultant-card-avatar">
                      {c.first_name.charAt(0)}{c.last_name.charAt(0)}
                    </div>

                    <div className="consultant-card-info">
                      <div className="consultant-card-name">{c.first_name} {c.last_name}</div>
                      <div className="consultant-card-email">{c.email} · {c.customers_count} Kunden</div>
                      <div className="consultant-card-meta">
                        {c.rights.filter((r) => r !== 'CONSULTANT').map((r) => (
                          <Badge key={r} type={r === 'ADMIN' ? 'primary' : 'info'}>
                            {RIGHTS_LABELS[r] ?? r}
                          </Badge>
                        ))}
                        {c.rights.filter(r => r !== 'CONSULTANT').length === 0 && (
                          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>Basis-Berater</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <StatusBadge status={c.status} />
                      {isAdmin && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditConsultantId(c.id)}
                          >
                            ✏️ Rechte
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteConfirm(c.id)}
                            disabled={c.rights.includes('ADMIN') && c.id === 'cons1'}
                          >
                            🗑
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rights slide panel */}
              {editConsultantId && (() => {
                const target = consultants.find((c) => c.id === editConsultantId);
                if (!target) return null;
                return (
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 200 }}
                      onClick={() => setEditConsultantId(null)}
                    />
                    <div style={{
                      position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
                      background: 'var(--surface)', borderLeft: '1px solid var(--border)',
                      zIndex: 201, display: 'flex', flexDirection: 'column',
                      boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
                      animation: 'slideInRight 0.25s ease',
                    }}>
                      {/* Header */}
                      <div style={{ padding: 'var(--sp-l)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 'var(--sp-m)' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-tint)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'var(--fs-s)', flexShrink: 0 }}>
                          {target.first_name[0]}{target.last_name[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 'var(--fs-s)' }}>{target.first_name} {target.last_name}</div>
                          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{target.email}</div>
                        </div>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)', padding: 4 }}
                          onClick={() => setEditConsultantId(null)}
                        >✕</button>
                      </div>

                      {/* Permissions list */}
                      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-l)' }}>
                        <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--sp-m)' }}>
                          Berechtigungen
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {availableRights.map((r) => {
                            const active = target.rights.includes(r.value);
                            return (
                              <div
                                key={r.value}
                                onClick={() => handleToggleRight(target.id, r.value)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 'var(--sp-m)',
                                  padding: '12px var(--sp-m)', borderRadius: 'var(--radius)',
                                  cursor: 'pointer', userSelect: 'none',
                                  background: active ? 'var(--primary-tint)' : 'transparent',
                                  border: `1px solid ${active ? 'var(--primary)' : 'transparent'}`,
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {/* Toggle pill */}
                                <div style={{
                                  width: 40, height: 22, borderRadius: 11, flexShrink: 0,
                                  background: active ? 'var(--primary)' : 'var(--gray-300)',
                                  position: 'relative', transition: 'background 0.2s',
                                }}>
                                  <div style={{
                                    position: 'absolute', top: 3, left: active ? 21 : 3,
                                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                  }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 'var(--fs-s)', color: active ? 'var(--primary)' : 'var(--text)' }}>
                                    {r.label}
                                  </div>
                                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                                    {r.desc}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ padding: 'var(--sp-l)', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditConsultantId(null)}>Abbrechen</button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { addToast('success', `Rechte für ${target.first_name} ${target.last_name} gespeichert.`); setEditConsultantId(null); }}>💾 Speichern</button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ── Unternehmen ─────────────────────────────────────── */}
          {activeTab === 'company' && (
            <div>
              <SectionHeader title="Unternehmenseinstellungen" />
              <Panel title="Unternehmensdaten">
                <Input label="Unternehmensname" value={company.name} onChange={(v) => setCompany((p) => ({ ...p, name: v }))} />
                <Input label="Adresse" value={company.address} onChange={(v) => setCompany((p) => ({ ...p, address: v }))} />
                <div className="form-row">
                  <Input label="Telefon" value={company.phone} onChange={(v) => setCompany((p) => ({ ...p, phone: v }))} />
                  <Input label="E-Mail" type="email" value={company.email} onChange={(v) => setCompany((p) => ({ ...p, email: v }))} />
                </div>
                <Input label="Website" value={company.website} onChange={(v) => setCompany((p) => ({ ...p, website: v }))} />
              </Panel>

              <Panel title="Unternehmensdesign">
                <Alert type="info">Diese Einstellungen wirken sich auf das Design für Ihre Kunden aus.</Alert>
                <FileUpload label="Firmenlogo" accept="image/*" hint="PNG, SVG, max. 2 MB · empfohlen: 200×60px" />
                <div className="form-row">
                  <ColorInput label="Primärfarbe" value={company.primary_color} onChange={(v) => setCompany((p) => ({ ...p, primary_color: v }))} />
                  <ColorInput label="Sekundärfarbe" value={company.secondary_color} onChange={(v) => setCompany((p) => ({ ...p, secondary_color: v }))} />
                </div>
                <Select label="Schriftart (Überschriften)" value="poppins" onChange={() => {}} options={[
                  { value: 'poppins', label: 'Poppins' },
                  { value: 'roboto', label: 'Roboto' },
                  { value: 'playfair', label: 'Playfair Display' },
                  { value: 'montserrat', label: 'Montserrat' },
                ]} />
                <div style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)', border: '1px solid var(--border)' }}>
                  <div className="text-xs text-grey font-bold mb-s">Vorschau</div>
                  <div style={{ background: company.primary_color, color: '#fff', padding: '12px 16px', borderRadius: 4, fontFamily: 'Poppins', fontWeight: 700 }}>
                    {company.name}
                  </div>
                </div>
              </Panel>

              <div className="flex gap-s">
                <button className="btn btn-secondary" onClick={() => addToast('info', 'Vorschau wird geöffnet...')}>👁 Vorschau</button>
                <button className="btn btn-primary" onClick={() => addToast('success', 'Unternehmenseinstellungen gespeichert.')}>💾 Speichern</button>
              </div>
            </div>
          )}

          {/* ── Beratung ────────────────────────────────────────── */}
          {activeTab === 'consultation' && (
            <div>
              <SectionHeader title="Beratungseinstellungen" />
              <Panel title="Analysemodule aktivieren">
                <p className="text-sm text-grey" style={{ marginBottom: 'var(--sp-m)' }}>
                  Wählen Sie, welche Module in der Finanzanalyse angezeigt werden.
                </p>
                {[
                  { key: 'show_income', label: 'Einkommensanalyse', desc: 'Einnahmen, Ausgaben, frei verfügbares Einkommen' },
                  { key: 'show_retirement', label: 'Altersvorsorge', desc: 'Rentenlückenanalyse und Vorsorgeplanung' },
                  { key: 'show_investment', label: 'Investitionen', desc: 'Portfolio-Verwaltung und Renditerechner' },
                  { key: 'show_insurance', label: 'Versicherungen', desc: 'Versicherungsübersicht und Vertragsmanagement' },
                  { key: 'show_house', label: 'Immobilien', desc: 'Eigenheim-Planung und Finanzierungsrechner' },
                ].map((m) => (
                  <div key={m.key} className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-light)' }}>
                    <div>
                      <div className="text-sm font-bold">{m.label}</div>
                      <div className="text-xs text-grey">{m.desc}</div>
                    </div>
                    <Toggle
                      checked={(consultationSettings as any)[m.key]}
                      onChange={(v) => setConsultationSettings((p) => ({ ...p, [m.key]: v }))}
                    />
                  </div>
                ))}
              </Panel>

              <Panel title="Automatisierung">
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-m)' }}>
                  <div>
                    <div className="text-sm font-bold">Erstinformation automatisch senden</div>
                    <div className="text-xs text-grey">Beim ersten Öffnen eines Kundenprofils</div>
                  </div>
                  <Toggle checked={consultationSettings.require_initial_info} onChange={(v) => setConsultationSettings((p) => ({ ...p, require_initial_info: v }))} />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold">Automatisch speichern</div>
                    <div className="text-xs text-grey">Analysedaten alle 5 Minuten</div>
                  </div>
                  <Toggle checked={consultationSettings.auto_save} onChange={(v) => setConsultationSettings((p) => ({ ...p, auto_save: v }))} />
                </div>
              </Panel>

              <Panel title="Standardnotiz-Vorlage">
                <Textarea
                  label="Vorlage für neue Beratungsnotizen"
                  value={consultationSettings.default_note_template}
                  onChange={(v) => setConsultationSettings((p) => ({ ...p, default_note_template: v }))}
                  rows={5}
                  placeholder="Themen des Gesprächs:&#10;&#10;Vereinbarungen:&#10;&#10;Nächste Schritte:"
                />
              </Panel>

              <button className="btn btn-primary" onClick={() => addToast('success', 'Beratungseinstellungen gespeichert.')}>💾 Speichern</button>
            </div>
          )}

          {/* ── Abrechnung ──────────────────────────────────────── */}
          {activeTab === 'billing' && (
            <div>
              <SectionHeader title="Abrechnung & Abonnement" />

              <Panel title="Aktuelles Abonnement">
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-m)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--fs-l)', fontWeight: 700, color: 'var(--primary)' }}>{SUBSCRIPTION.plan_name}</div>
                    <StatusBadge status={SUBSCRIPTION.status} />
                    <span className="text-sm text-grey" style={{ marginLeft: 8 }}>
                      Verlängert am {new Date(SUBSCRIPTION.valid_until).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  <button className="btn btn-secondary" onClick={() => addToast('info', 'Abrechnungsportal wird geöffnet...')}>
                    Abrechnung verwalten
                  </button>
                </div>
                {SUBSCRIPTION.cancel_at_period_end && (
                  <Alert type="warning">
                    Ihr Abonnement wird am {new Date(SUBSCRIPTION.valid_until).toLocaleDateString('de-DE')} nicht verlängert.
                    <button className="btn btn-sm btn-primary" style={{ marginLeft: 8 }} onClick={() => addToast('success', 'Kündigung wurde zurückgenommen.')}>Rückgängig</button>
                  </Alert>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-s)', marginTop: 'var(--sp-m)' }}>
                  {[
                    { label: 'Kundenverwaltung', ok: true },
                    { label: 'Beratung & Vorsorge', ok: true },
                    { label: 'PDF-Downloads', ok: true },
                    { label: 'Unternehmensdesign', ok: true },
                    { label: 'Investitionsanalyse', ok: true },
                    { label: 'TAA Integration', ok: false },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-s text-sm" style={{ opacity: f.ok ? 1 : 0.5 }}>
                      <span style={{ color: f.ok ? 'var(--success)' : 'var(--gray-300)' }}>{f.ok ? '✓' : '✗'}</span>
                      {f.label}
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Plan upgraden" action={<Badge type="info">Verfügbare Pläne</Badge>}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-m)' }}>
                  {PLANS.map((plan) => {
                    const isCurrent = plan.id === SUBSCRIPTION.plan_id;
                    return (
                      <div key={plan.id} style={{ border: `2px solid ${isCurrent ? 'var(--success)' : plan.id === 'enterprise' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: 'var(--sp-m)', textAlign: 'center', background: isCurrent ? 'var(--success-tint)' : 'var(--surface)' }}>
                        {isCurrent && <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--success-text)', fontWeight: 700, marginBottom: 4 }}>✓ IHR PLAN</div>}
                        <div className="font-bold" style={{ fontSize: 'var(--fs-ml)', color: 'var(--primary)' }}>{plan.name}</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '8px 0' }}>
                          {plan.price_eur === 0 ? 'Gratis' : `${plan.price_eur} €`}
                        </div>
                        <div className="text-xs text-grey" style={{ marginBottom: 'var(--sp-m)' }}>
                          {plan.price_eur > 0 ? '/Monat zzgl. MwSt.' : 'Immer kostenlos'}<br />
                          {plan.max_consultants >= 9999 ? 'Unbegrenzte Berater' : `Bis zu ${plan.max_consultants} Berater`}
                        </div>
                        {isCurrent ? (
                          <button className="btn btn-full btn-sm" disabled style={{ background: 'var(--success)', color: '#fff' }}>Aktuell</button>
                        ) : (
                          <button className="btn btn-primary btn-full btn-sm" disabled={plan.id === 'starter'} onClick={() => addToast('info', `Checkout für "${plan.name}" wird gestartet...`)}>
                            {plan.id === 'starter' ? 'Downgrade' : 'Upgraden'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Panel>

              <Panel title="Transaktionsverlauf">
                {TRANSACTIONS.length === 0 ? (
                  <EmptyState icon="💳" text="Keine Transaktionen" />
                ) : (
                  TRANSACTIONS.map((tx) => (
                    <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-m)', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--fs-s)' }}>{tx.plan_name}</div>
                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleDateString('de-DE')}</div>
                      </div>
                      <div style={{ fontWeight: 700 }}>{tx.amount} €</div>
                      <StatusBadge status={tx.status} />
                      <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', 'Rechnung wird heruntergeladen...')}>⬇️ PDF</button>
                    </div>
                  ))
                )}
              </Panel>
            </div>
          )}

          {/* ── Rechtliches ──────────────────────────────────────── */}
          {activeTab === 'legal' && (
            <div>
              <SectionHeader title="Rechtliche Informationen" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-m)', marginBottom: 'var(--sp-m)' }}>
                {[
                  { icon: '📋', title: 'AGB', desc: 'Allgemeine Geschäftsbedingungen' },
                  { icon: '🔒', title: 'Datenschutz', desc: 'DSGVO-konforme Datenschutzerklärung' },
                  { icon: '🏢', title: 'Impressum', desc: 'Gesetzliche Pflichtangaben (§ 5 TMG)' },
                ].map((doc) => (
                  <div key={doc.title} className="card">
                    <div className="card-body" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 36, marginBottom: 'var(--sp-s)' }}>{doc.icon}</div>
                      <div className="font-bold" style={{ marginBottom: 6 }}>{doc.title}</div>
                      <div className="text-xs text-grey" style={{ marginBottom: 'var(--sp-m)', lineHeight: 1.5 }}>{doc.desc}</div>
                      <button className="btn btn-secondary btn-sm btn-full" onClick={() => navigate('/legal')}>Öffnen →</button>
                    </div>
                  </div>
                ))}
              </div>

              <Panel title="Pflichtdokumentation">
                <Alert type="info">
                  Als zugelassener Versicherungsmakler (§ 34d GewO) sind Sie verpflichtet, Kunden die IDD-Erstinformation sowie das Beratungsprotokoll auszuhändigen.
                </Alert>
                <div style={{ display: 'grid', gap: 'var(--sp-m)', marginTop: 'var(--sp-m)' }}>
                  {[
                    { label: 'IDD-Erstinformation bereitstellen', desc: 'Vor jedem Erstgespräch verpflichtend (EU-Richtlinie 2016/97)', status: 'ok' },
                    { label: 'Beratungsprotokoll erstellen', desc: 'Nach jedem Beratungsgespräch (§ 18 VersVermV)', status: 'ok' },
                    { label: 'Wechselgründe dokumentieren', desc: 'Bei Ablösung bestehender Verträge', status: 'ok' },
                    { label: 'Datenschutzerklärung einholen', desc: 'Einwilligung zur Datenverarbeitung', status: 'warning' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-m text-sm" style={{ padding: 'var(--sp-s) 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: item.status === 'ok' ? 'var(--success)' : 'var(--warning)', fontSize: 18, flexShrink: 0 }}>
                        {item.status === 'ok' ? '✓' : '⚠'}
                      </span>
                      <div>
                        <div className="font-bold">{item.label}</div>
                        <div className="text-xs text-grey">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

        </div>

      {deleteConfirm && (
        <Confirm
          message="Soll dieser Berater wirklich entfernt werden? Alle zugewiesenen Kunden bleiben erhalten."
          onConfirm={() => handleDeleteConsultant(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          danger
        />
      )}
    </AppLayout>
  );
};
