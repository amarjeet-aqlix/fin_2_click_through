import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Panel, Input, Select, Textarea, Toggle, Alert, Badge, StatusBadge, SectionHeader, ColorInput, FileUpload, EmptyState, Confirm } from '../components/UI';
import { useApp } from '../context';
import { CONSULTANTS, CUSTOMERS, TRANSACTIONS, SUBSCRIPTION, PLANS, COMPANY_INFO } from '../mock';
import type { Consultant } from '../types';

const RIGHTS_LABELS: Record<string, string> = {
  CAN_SEE_ALL_CLIENTS: 'Alle Kunden',
  CAN_SEE_CLIENTS_OF_LOWER_STAGES: 'Untergeordnete',
  CAN_MODIFY_COMPANY_SUGGESTION_REASONS: 'Vorschläge',
  CAN_MODIFY_COMPANY_DESIGN: 'Design',
  CAN_MANAGE_HIERARCHY: 'Hierarchie',
  CAN_CONSULT_CLIENTS: 'Beratung',
  CAN_MODIFY_CONSULTANT_RIGHTS: 'Rechte',
  CAN_DELETE_CONSULTANTS: 'Berater verwalten',
  CAN_MODIFY_PRECAUTION_TYPES: 'Vorsorgetypen',
  CAN_SEE_COMPANY_ADMIN_PAGE: 'Firmeneinstellungen',
  ADMIN: 'Admin',
};

const SUGGESTION_CATEGORIES = [
  { value: 'retirement',  label: 'Altersvorsorge' },
  { value: 'insurance',   label: 'Versicherung' },
  { value: 'investment',  label: 'Investition' },
  { value: 'income',      label: 'Einkommen' },
  { value: 'property',    label: 'Immobilien' },
];

export const Settings: React.FC = () => {
  const { user, addToast } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get('tab') ?? 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const isAdmin = user?.role === 'admin';
  const myConsultant = CONSULTANTS.find((c) => c.email === user?.email) ?? CONSULTANTS[0];
  const canManageDesign   = isAdmin || myConsultant.rights.includes('CAN_MODIFY_COMPANY_DESIGN');
  const canManageSuggestions = isAdmin || myConsultant.rights.includes('CAN_MODIFY_COMPANY_SUGGESTION_REASONS');

  // ── Profile ────────────────────────────────────────────────
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

  // ── Company basic data ──────────────────────────────────────
  const [company, setCompany] = useState({ ...COMPANY_INFO });
  const [companyColors, setCompanyColors] = useState({
    primary: COMPANY_INFO.primary_color,
    text_color_on_primary: '#ffffff',
    analysis_gap: '#f59e0b',
    analysis_green: '#10b981',
    analysis_orange: '#f97316',
    analysis_red: '#ef4444',
    background: '#f8fafc',
    headlines_on_background: '#1e293b',
  });
  const [companyFonts, setCompanyFonts] = useState({ headline_font: 'poppins', text_font: 'roboto' });

  // ── Legal texts ─────────────────────────────────────────────
  const [legalTexts, setLegalTexts] = useState({
    imprint: 'Angaben gemäß § 5 TMG\n\nFinanz & Vorsorge GmbH\nMaximilianstraße 12\n80539 München\n\nHandelsregister: HRB 12345\nRegistergericht: Amtsgericht München',
    privacy_policy: 'Datenschutzerklärung gemäß DSGVO\n\nVerantwortlicher im Sinne der Datenschutzgesetze ist die Finanz & Vorsorge GmbH.',
    terms_and_conditions: 'Allgemeine Geschäftsbedingungen\n\n§ 1 Geltungsbereich\nDiese AGB gelten für alle Leistungen der Finanz & Vorsorge GmbH.',
  });

  // ── Suggestion reasons ──────────────────────────────────────
  const [suggestionReasons, setSuggestionReasons] = useState([
    { id: 'sr1', category: 'retirement', text: 'Altersvorsorgelücke schließen und Rentenniveau langfristig sichern', active: true },
    { id: 'sr2', category: 'insurance',  text: 'Berufsunfähigkeitsabsicherung optimieren und Einkommensschutz gewährleisten', active: true },
    { id: 'sr3', category: 'investment', text: 'Vermögensaufbau mit nachhaltiger Renditeoptimierung', active: true },
    { id: 'sr4', category: 'insurance',  text: 'Risikolebensversicherung für Hinterbliebenenschutz abschließen', active: true },
    { id: 'sr5', category: 'retirement', text: 'Betriebliche Altersvorsorge (bAV) steueroptimiert nutzen', active: false },
    { id: 'sr6', category: 'property',   text: 'Eigenheimfinanzierung mit optimaler Tilgungsstruktur', active: true },
    { id: 'sr7', category: 'income',     text: 'Krankentagegeld zur Absicherung bei Krankheit', active: false },
  ]);
  const [newReasonText, setNewReasonText] = useState('');
  const [newReasonCategory, setNewReasonCategory] = useState('retirement');

  // ── Introduction pages ──────────────────────────────────────
  const [introPages, setIntroPages] = useState([
    { id: 'ip1', title: 'Unser Unternehmen', content: 'Wir sind seit Jahren Ihr vertrauenswürdiger Partner in der Finanzberatung.', order: 1 },
    { id: 'ip2', title: 'Unsere Leistungen', content: 'Wir bieten umfassende Finanzplanung, Vorsorgeberatung und Versicherungsoptimierung.', order: 2 },
  ]);
  const [editingPage, setEditingPage] = useState<string | null>(null);

  // ── CRM credentials ─────────────────────────────────────────
  const [crmCredentials, setCrmCredentials] = useState({
    dionera: { enabled: false, consultant_id: '', api_id: '', api_key: '', blau_id: '' },
    bca:     { enabled: false, consultant_id: '', api_id: '', api_key: '' },
    fbxpert: { enabled: false, consultant_id: '', api_id: '', api_key: '' },
  });
  const [companyCrmManaged, setCompanyCrmManaged] = useState({
    dionera: false,
    bca: false,
    fbxpert: false,
  });

  // ── Consultation ────────────────────────────────────────────
  const [consultationSettings, setConsultationSettings] = useState({
    show_income: true, show_retirement: true, show_investment: true,
    show_insurance: true, show_house: true,
    default_note_template: '',
    require_initial_info: true, auto_save: true,
  });

  // ── Precaution types ────────────────────────────────────────
  const [precautionTypes, setPrecautionTypes] = useState([
    { id: 'pt1', name: 'Private Rentenversicherung', category: 'retirement', active: true },
    { id: 'pt2', name: 'Riester-Rente', category: 'retirement', active: true },
    { id: 'pt3', name: 'Rürup-Rente / Basisrente', category: 'retirement', active: true },
    { id: 'pt4', name: 'Betriebliche Altersvorsorge', category: 'retirement', active: true },
    { id: 'pt5', name: 'Berufsunfähigkeitsversicherung', category: 'insurance', active: true },
    { id: 'pt6', name: 'Risikolebensversicherung', category: 'insurance', active: true },
    { id: 'pt7', name: 'Krankentagegeld', category: 'insurance', active: false },
    { id: 'pt8', name: 'ETF-Sparplan', category: 'investment', active: true },
  ]);

  // ── Consultant management ───────────────────────────────────
  const [consultants, setConsultants] = useState<Consultant[]>(CONSULTANTS);
  const [showAddConsultant, setShowAddConsultant] = useState(false);
  const [newConsultant, setNewConsultant] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editConsultantId, setEditConsultantId] = useState<string | null>(null);

  // ── Administration ──────────────────────────────────────────
  const [systemConstants, setSystemConstants] = useState({
    inflation_rate: 2.0,
    statutory_pension_factor: 48.0,
    expected_return_conservative: 3.5,
    expected_return_balanced: 5.0,
    expected_return_aggressive: 7.0,
  });
  const [taaPresets, setTaaPresets] = useState([
    { id: 'taa1', name: 'DWS Vorsorge Flex', isin: 'DE0008490962', provider: 'DWS', active: true },
    { id: 'taa2', name: 'Flossbach von Storch SICAV', isin: 'LU0323578657', provider: 'FvS', active: true },
    { id: 'taa3', name: 'Allianz Interglobal', isin: 'DE0008475070', provider: 'Allianz', active: false },
  ]);
  const [newTaaPreset, setNewTaaPreset] = useState({ name: '', isin: '', provider: '' });
  const [docModules, setDocModules] = useState({
    consultation_protocol: true,
    initial_info: true,
    product_info: true,
    privacy_declaration: true,
    change_reasons: true,
    needs_analysis: false,
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // ── Handlers ────────────────────────────────────────────────
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

  const handleAddSuggestionReason = () => {
    if (!newReasonText.trim()) return;
    setSuggestionReasons((prev) => [...prev, { id: `sr${Date.now()}`, category: newReasonCategory, text: newReasonText.trim(), active: true }]);
    setNewReasonText('');
  };

  const handleAddTaaPreset = () => {
    if (!newTaaPreset.name || !newTaaPreset.isin) return;
    setTaaPresets((prev) => [...prev, { id: `taa${Date.now()}`, ...newTaaPreset, active: true }]);
    setNewTaaPreset({ name: '', isin: '', provider: '' });
    addToast('success', 'TAA-Preset wurde hinzugefügt.');
  };

  const availableRights = [
    { value: 'ADMIN',                              label: 'Anwendungs-Administrator',     desc: 'Voller Zugriff auf alle Funktionen und Einstellungen.' },
    { value: 'CAN_SEE_COMPANY_ADMIN_PAGE',         label: 'Firmeneinstellungen',          desc: 'Kann die Firmeneinstellungen einsehen.' },
    { value: 'CAN_MANAGE_HIERARCHY',               label: 'Beraterstruktur verwalten',    desc: 'Darf alle Berater sehen, CRM-Einstellungen und Beraterstruktur bearbeiten.' },
    { value: 'CAN_CONSULT_CLIENTS',                label: 'Kunden beraten',               desc: 'Darf Kunden aktiv beraten.' },
    { value: 'CAN_SEE_ALL_CLIENTS',                label: 'Alle Kunden sehen',            desc: 'Kann alle Kunden der Firma sehen.' },
    { value: 'CAN_SEE_CLIENTS_OF_LOWER_STAGES',   label: 'Untergeordnete Kunden sehen',  desc: 'Kann Kunden der untergeordneten Berater sehen.' },
    { value: 'CAN_MODIFY_CONSULTANT_RIGHTS',       label: 'Beraterrechte anpassen',       desc: 'Kann die Berechtigungen von zugänglichen Beratern anpassen.' },
    { value: 'CAN_DELETE_CONSULTANTS',             label: 'Berater anlegen & löschen',    desc: 'Kann Berater anlegen sowie zugängliche Berater löschen.' },
    { value: 'CAN_MODIFY_PRECAUTION_TYPES',        label: 'Beratungsvoreinstellungen',    desc: 'Kann die Beratungsvoreinstellungen der Firma anpassen.' },
    { value: 'CAN_MODIFY_COMPANY_DESIGN',          label: 'Firmendesign anpassen',        desc: 'Kann Farben und Logo der Firma anpassen.' },
    { value: 'CAN_MODIFY_COMPANY_SUGGESTION_REASONS', label: 'Begründungsbausteine',     desc: 'Kann die Begründungsbausteine der Firma bearbeiten.' },
  ];

  const initials = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();

  const navTo = (tab: string) => { setActiveTab(tab); navigate(`/settings?tab=${tab}`); };

  const extraNav = (
    <>
      <div className="sidebar-section-label">Konto</div>
      <div className={`nav-item${activeTab === 'company' ? ' active' : ''}`} onClick={() => navTo('company')}>
        <span className="nav-item-icon">🏢</span>
        <span className="nav-item-label">Unternehmenseinstellungen</span>
      </div>
      <div className={`nav-item${activeTab === 'crm' ? ' active' : ''}`} onClick={() => navTo('crm')}>
        <span className="nav-item-icon">🔗</span>
        <span className="nav-item-label">CRM-Integration</span>
      </div>
      {isAdmin && (
        <>
          <div className={`nav-item${activeTab === 'billing' ? ' active' : ''}`} onClick={() => navTo('billing')}>
            <span className="nav-item-icon">💳</span>
            <span className="nav-item-label">Abrechnung</span>
          </div>
          <div className={`nav-item${activeTab === 'administration' ? ' active' : ''}`} onClick={() => navTo('administration')}>
            <span className="nav-item-icon">⚙️</span>
            <span className="nav-item-label">Administration</span>
          </div>
        </>
      )}
    </>
  );

  // ── Shared toggle-pill component ────────────────────────────
  const TogglePill = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
    <div
      onClick={onToggle}
      style={{ width: 40, height: 22, borderRadius: 11, flexShrink: 0, background: active ? 'var(--primary)' : 'var(--gray-300)', position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }}
    >
      <div style={{ position: 'absolute', top: 3, left: active ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  );

  return (
    <AppLayout title="Einstellungen" extraNav={extraNav}>
      <div>

        {/* ── Übersicht ─────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div>
            <SectionHeader title="Übersicht" />

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
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/legal')}>Unternehmenspräsentation</button>{' '}
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/initial-legal')}>Erstinformation ansehen</button>
                </div>
              </div>
              <div>
                <div className="profile-section-title">Kontaktdaten</div>
                <div className="profile-contact-row"><span className="profile-contact-icon">📞</span><span>{profile.phone}</span></div>
                {profile.mobile && <div className="profile-contact-row"><span className="profile-contact-icon">📱</span><span>{profile.mobile}</span></div>}
                <div className="profile-contact-row"><span className="profile-contact-icon">✉️</span><a href={`mailto:${profile.email}`} style={{ color: 'var(--primary)' }}>{profile.email}</a></div>
                <div className="profile-contact-row"><span className="profile-contact-icon">🏢</span><span>{COMPANY_INFO.name}</span></div>
                <div style={{ marginTop: 'var(--sp-m)', display: 'flex', gap: 6 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navTo('profile')}>Profil bearbeiten</button>
                </div>
              </div>
              <div className="profile-avatar-lg">{initials}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-m)', marginBottom: 'var(--sp-m)' }}>
              {[
                { icon: '🧑‍💼', label: 'Kunden gesamt',  value: CUSTOMERS.length },
                { icon: '✅',   label: 'Aktive Kunden',  value: CUSTOMERS.filter(c => c.status === 'active').length },
                { icon: '👥',   label: 'Berater',         value: consultants.filter(c => c.status === 'active').length },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-card-icon">{s.icon}</div>
                  <div className="stat-card-value">{s.value}</div>
                  <div className="stat-card-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-m)' }}>
              {[
                { icon: '🧑‍💼', title: 'Zur Kundenliste',     desc: 'Alle Kunden verwalten',    action: () => navigate('/dashboard') },
                { icon: '👥',   title: 'Beraterverwaltung',   desc: `${consultants.length} Berater`, action: () => navTo('consultants') },
                { icon: '🏢',   title: 'Unternehmen',         desc: COMPANY_INFO.name,           action: () => navTo('company') },
                { icon: '🔗',   title: 'CRM-Integration',     desc: 'Externe Systeme verbinden', action: () => navTo('crm') },
                ...(isAdmin ? [
                  { icon: '💳', title: 'Abrechnung',          desc: SUBSCRIPTION.plan_name,      action: () => navTo('billing') },
                  { icon: '⚙️', title: 'Administration',      desc: 'Systemeinstellungen',        action: () => navTo('administration') },
                ] : []),
              ].map((c) => (
                <div key={c.title} onClick={c.action} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-l)', padding: 'var(--sp-m)', cursor: 'pointer', display: 'flex', gap: 'var(--sp-m)', alignItems: 'center', transition: 'border-color var(--transition)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
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

        {/* ── Mein Profil ───────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-l)', padding: 'var(--sp-l)', marginBottom: 'var(--sp-l)', display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-l)' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div className="profile-avatar-lg">{initials}</div>
                <label style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}>
                  📷<input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => addToast('info', 'Profilbild wird hochgeladen...')} />
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 4px' }}>{profile.first_name} {profile.last_name}</h2>
                <div style={{ fontSize: 'var(--fs-s)', color: 'var(--text-muted)', marginBottom: 'var(--sp-m)' }}>{profile.title} · {COMPANY_INFO.name}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => addToast('info', 'Als Kunde anmelden...')}>👤 Als Kunde anmelden</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers/new')}>+ Neuer Kunde</button>
                </div>
              </div>
            </div>

            <Panel title="Persönliche Daten">
              <div className="form-row">
                <Input label="Vorname" value={profile.first_name} onChange={(v) => setProfile((p) => ({ ...p, first_name: v }))} />
                <Input label="Nachname" value={profile.last_name} onChange={(v) => setProfile((p) => ({ ...p, last_name: v }))} />
              </div>
              <Input label="E-Mail" type="email" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} />
              <div className="form-row">
                <Input label="Telefon" value={profile.phone} onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} />
                <Input label="Mobil" value={profile.mobile} onChange={(v) => setProfile((p) => ({ ...p, mobile: v }))} />
              </div>
              <Input label="Bürotelefon" value={profile.phone_office} onChange={(v) => setProfile((p) => ({ ...p, phone_office: v }))} />
              <div className="form-row">
                <Input label="Straße" value={profile.street} onChange={(v) => setProfile((p) => ({ ...p, street: v }))} />
                <Input label="Nr." value={profile.street_number} onChange={(v) => setProfile((p) => ({ ...p, street_number: v }))} />
              </div>
              <div className="form-row">
                <Input label="PLZ" value={profile.zip} onChange={(v) => setProfile((p) => ({ ...p, zip: v }))} />
                <Input label="Ort" value={profile.city} onChange={(v) => setProfile((p) => ({ ...p, city: v }))} />
              </div>
              <Textarea label="Profiltext" value={profile.profile_text} onChange={(v) => setProfile((p) => ({ ...p, profile_text: v }))} rows={4} placeholder="Kurzbeschreibung Ihrer Tätigkeit und Beratungsschwerpunkte..." />
            </Panel>

            <Panel title="Expertise & Schwerpunkte">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--sp-m)', minHeight: 40 }}>
                {profile.areas_of_expertise.map((area) => (
                  <span key={area} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-xs)', background: 'var(--primary-tint)', color: 'var(--primary)', borderRadius: 20, padding: '5px 12px', fontWeight: 600 }}>
                    {area}
                    <button onClick={() => setProfile((p) => ({ ...p, areas_of_expertise: p.areas_of_expertise.filter((x) => x !== area) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
                  </span>
                ))}
                {profile.areas_of_expertise.length === 0 && <span style={{ fontSize: 'var(--fs-s)', color: 'var(--text-muted)' }}>Noch keine Schwerpunkte hinterlegt.</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" placeholder="Neuer Schwerpunkt, dann Enter..." style={{ flex: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      setProfile((p) => ({ ...p, areas_of_expertise: [...p.areas_of_expertise, e.currentTarget.value.trim()] }));
                      e.currentTarget.value = '';
                    }
                  }} />
                <button className="btn btn-secondary btn-sm" onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (input.value.trim()) { setProfile((p) => ({ ...p, areas_of_expertise: [...p.areas_of_expertise, input.value.trim()] })); input.value = ''; }
                }}>+ Hinzufügen</button>
              </div>
            </Panel>

            <Panel title="Passwort ändern">
              {pwError && <Alert type="danger">{pwError}</Alert>}
              <Input label="Aktuelles Passwort" type="password" value={currentPw} onChange={setCurrentPw} />
              <Input label="Neues Passwort" type="password" value={newPw} onChange={setNewPw} hint="Mind. 8 Zeichen" />
              <Input label="Passwort bestätigen" type="password" value={confirmPw} onChange={setConfirmPw} />
              <button className="btn btn-secondary" onClick={handleChangePassword}>🔒 Passwort ändern</button>
            </Panel>

            <button className="btn btn-primary" onClick={handleSaveProfile}>💾 Profil speichern</button>
          </div>
        )}

        {/* ── Kundenverwaltung ──────────────────────────────────── */}
        {activeTab === 'customers' && (
          <div>
            <SectionHeader title="Kundenverwaltung" action={<button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>→ Zur Kundenliste</button>} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--sp-m)', marginBottom: 'var(--sp-l)' }}>
              {[
                { label: 'Gesamt', value: CUSTOMERS.length,                                         color: 'var(--primary)' },
                { label: 'Aktiv',  value: CUSTOMERS.filter(c => c.status === 'active').length,      color: 'var(--success)' },
                { label: 'Support',value: CUSTOMERS.filter(c => c.status === 'support').length,     color: 'var(--warning)' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-l)', padding: 'var(--sp-l)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <Panel title="Letzte Kunden">
              {CUSTOMERS.slice(0, 5).map((c) => (
                <div key={c.id} onClick={() => navigate(`/customers/${c.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-m)', padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
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

        {/* ── Beraterverwaltung ─────────────────────────────────── */}
        {activeTab === 'consultants' && (
          <div>
            <SectionHeader title="Beraterverwaltung" action={isAdmin ? <button className="btn btn-primary btn-sm" onClick={() => setShowAddConsultant(true)}>+ Berater einladen</button> : undefined} />

            {!isAdmin && <Alert type="warning">Nur Administratoren können Berater verwalten.</Alert>}

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
                  <div className="consultant-card-avatar">{c.first_name.charAt(0)}{c.last_name.charAt(0)}</div>
                  <div className="consultant-card-info">
                    <div className="consultant-card-name">{c.first_name} {c.last_name}</div>
                    <div className="consultant-card-email">{c.email} · {c.customers_count} Kunden</div>
                    <div className="consultant-card-meta">
                      {c.rights.filter((r) => r !== 'CONSULTANT').map((r) => (
                        <Badge key={r} type={r === 'ADMIN' ? 'primary' : 'info'}>{RIGHTS_LABELS[r] ?? r}</Badge>
                      ))}
                      {c.rights.filter(r => r !== 'CONSULTANT').length === 0 && <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-subtle)' }}>Basis-Berater</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <StatusBadge status={c.status} />
                    {isAdmin && (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditConsultantId(c.id)}>✏️ Rechte</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(c.id)} disabled={c.rights.includes('ADMIN') && c.id === 'cons1'}>🗑</button>
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
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 200 }} onClick={() => setEditConsultantId(null)} />
                  <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: 'var(--surface)', borderLeft: '1px solid var(--border)', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', animation: 'slideInRight 0.25s ease' }}>
                    <div style={{ padding: 'var(--sp-l)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 'var(--sp-m)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-tint)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'var(--fs-s)', flexShrink: 0 }}>
                        {target.first_name[0]}{target.last_name[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--fs-s)' }}>{target.first_name} {target.last_name}</div>
                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{target.email}</div>
                      </div>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)', padding: 4 }} onClick={() => setEditConsultantId(null)}>✕</button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-l)' }}>
                      <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--sp-m)' }}>Berechtigungen</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {availableRights.map((r) => {
                          const active = target.rights.includes(r.value);
                          return (
                            <div key={r.value} onClick={() => handleToggleRight(target.id, r.value)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-m)', padding: '12px var(--sp-m)', borderRadius: 'var(--radius)', cursor: 'pointer', userSelect: 'none', background: active ? 'var(--primary-tint)' : 'transparent', border: `1px solid ${active ? 'var(--primary)' : 'transparent'}`, transition: 'all 0.15s ease' }}>
                              <div style={{ width: 40, height: 22, borderRadius: 11, flexShrink: 0, background: active ? 'var(--primary)' : 'var(--gray-300)', position: 'relative', transition: 'background 0.2s' }}>
                                <div style={{ position: 'absolute', top: 3, left: active ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 'var(--fs-s)', color: active ? 'var(--primary)' : 'var(--text)' }}>{r.label}</div>
                                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{r.desc}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
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

        {/* ── Unternehmen ───────────────────────────────────────── */}
        {activeTab === 'company' && (
          <div>
            <SectionHeader title="Unternehmenseinstellungen" />

            {/* Panel 1 — Grunddaten */}
            <Panel title="Unternehmensdaten">
              <div className="form-row">
                <Input label="Unternehmensname" value={company.name} onChange={(v) => setCompany((p) => ({ ...p, name: v }))} />
                <Input label="Website" value={company.website} onChange={(v) => setCompany((p) => ({ ...p, website: v }))} />
              </div>
              <Input label="Adresse" value={company.address} onChange={(v) => setCompany((p) => ({ ...p, address: v }))} />
              <div className="form-row">
                <Input label="Telefon" value={company.phone} onChange={(v) => setCompany((p) => ({ ...p, phone: v }))} />
                <Input label="E-Mail" type="email" value={company.email} onChange={(v) => setCompany((p) => ({ ...p, email: v }))} />
              </div>
            </Panel>

            {/* Panel 2 — Firmendesign */}
            {canManageDesign ? (
              <Panel title="Firmendesign">
                <Alert type="info">Diese Einstellungen wirken sich auf das Design für Ihre Kunden aus.</Alert>
                <div className="form-row">
                  <FileUpload label="Firmenlogo (Web)" accept="image/*" hint="PNG, SVG, max. 2 MB · empfohlen: 200×60px" />
                  <FileUpload label="Firmenlogo (Druck)" accept="image/*" hint="PNG, max. 5 MB · hochauflösend für PDFs" />
                </div>
                <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 'var(--sp-m) 0 var(--sp-s)' }}>Brandingfarben</div>
                <div className="form-row">
                  <ColorInput label="Primärfarbe" value={companyColors.primary} onChange={(v) => setCompanyColors((p) => ({ ...p, primary: v }))} />
                  <ColorInput label="Text auf Primärfarbe" value={companyColors.text_color_on_primary} onChange={(v) => setCompanyColors((p) => ({ ...p, text_color_on_primary: v }))} />
                </div>
                <div className="form-row">
                  <ColorInput label="Hintergrundfarbe" value={companyColors.background} onChange={(v) => setCompanyColors((p) => ({ ...p, background: v }))} />
                  <ColorInput label="Überschriften" value={companyColors.headlines_on_background} onChange={(v) => setCompanyColors((p) => ({ ...p, headlines_on_background: v }))} />
                </div>
                <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 'var(--sp-m) 0 var(--sp-s)' }}>Analysefarben</div>
                <div className="form-row">
                  <ColorInput label="Lücke / Bedarf" value={companyColors.analysis_gap} onChange={(v) => setCompanyColors((p) => ({ ...p, analysis_gap: v }))} />
                  <ColorInput label="Positiv / Grün" value={companyColors.analysis_green} onChange={(v) => setCompanyColors((p) => ({ ...p, analysis_green: v }))} />
                </div>
                <div className="form-row">
                  <ColorInput label="Warnung / Orange" value={companyColors.analysis_orange} onChange={(v) => setCompanyColors((p) => ({ ...p, analysis_orange: v }))} />
                  <ColorInput label="Kritisch / Rot" value={companyColors.analysis_red} onChange={(v) => setCompanyColors((p) => ({ ...p, analysis_red: v }))} />
                </div>
                {isAdmin && (
                  <>
                    <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 'var(--sp-m) 0 var(--sp-s)' }}>Schriftarten</div>
                    <div className="form-row">
                      <Select label="Überschriften-Schrift" value={companyFonts.headline_font} onChange={(v) => setCompanyFonts((p) => ({ ...p, headline_font: v }))} options={[
                        { value: 'poppins', label: 'Poppins' }, { value: 'roboto', label: 'Roboto' },
                        { value: 'playfair', label: 'Playfair Display' }, { value: 'montserrat', label: 'Montserrat' },
                      ]} />
                      <Select label="Text-Schrift" value={companyFonts.text_font} onChange={(v) => setCompanyFonts((p) => ({ ...p, text_font: v }))} options={[
                        { value: 'roboto', label: 'Roboto' }, { value: 'poppins', label: 'Poppins' },
                        { value: 'opensans', label: 'Open Sans' }, { value: 'lato', label: 'Lato' },
                      ]} />
                    </div>
                  </>
                )}
                <div style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)', border: '1px solid var(--border)', marginTop: 'var(--sp-m)' }}>
                  <div className="text-xs text-grey font-bold" style={{ marginBottom: 8 }}>Vorschau</div>
                  <div style={{ background: companyColors.primary, color: companyColors.text_color_on_primary, padding: '12px 16px', borderRadius: 4, fontFamily: companyFonts.headline_font, fontWeight: 700 }}>
                    {company.name}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {[
                      { label: 'Lücke', color: companyColors.analysis_gap },
                      { label: 'Positiv', color: companyColors.analysis_green },
                      { label: 'Warnung', color: companyColors.analysis_orange },
                      { label: 'Kritisch', color: companyColors.analysis_red },
                    ].map(({ label, color }) => (
                      <div key={label} style={{ flex: 1, background: color, color: '#fff', textAlign: 'center', padding: '4px 0', borderRadius: 4, fontSize: 'var(--fs-xs)', fontWeight: 600 }}>{label}</div>
                    ))}
                  </div>
                </div>
              </Panel>
            ) : (
              <Panel title="Firmendesign">
                <Alert type="info">Sie benötigen das Recht "Firmendesign anpassen" um diese Einstellungen zu ändern.</Alert>
                <div style={{ background: companyColors.primary, color: '#fff', padding: '12px 16px', borderRadius: 4, fontWeight: 700 }}>{company.name}</div>
              </Panel>
            )}

            {/* Panel 3 — Rechtliche Texte (admin only) */}
            {isAdmin && (
              <Panel title="Rechtliche Unternehmenstexte">
                <Alert type="warning">Diese Texte werden Ihren Kunden im Portal und in generierten PDFs angezeigt.</Alert>
                <Textarea label="Impressum" value={legalTexts.imprint} onChange={(v) => setLegalTexts((p) => ({ ...p, imprint: v }))} rows={6} placeholder="Pflichtangaben nach § 5 TMG..." />
                <Textarea label="Datenschutzerklärung" value={legalTexts.privacy_policy} onChange={(v) => setLegalTexts((p) => ({ ...p, privacy_policy: v }))} rows={6} placeholder="DSGVO-konforme Datenschutzerklärung..." />
                <Textarea label="Allgemeine Geschäftsbedingungen (AGB)" value={legalTexts.terms_and_conditions} onChange={(v) => setLegalTexts((p) => ({ ...p, terms_and_conditions: v }))} rows={6} />
                <button className="btn btn-primary" onClick={() => addToast('success', 'Rechtliche Texte gespeichert.')}>💾 Speichern</button>
              </Panel>
            )}

            {/* Panel 4 — Begründungsbausteine */}
            {canManageSuggestions && (
              <Panel title="Begründungsbausteine" action={<Badge type="info">{suggestionReasons.filter(r => r.active).length} aktiv</Badge>}>
                <p className="text-sm text-grey" style={{ marginBottom: 'var(--sp-m)' }}>
                  Diese Textbausteine stehen als Begründungen in der Beratungsempfehlung zur Verfügung.
                </p>
                {SUGGESTION_CATEGORIES.map((cat) => {
                  const items = suggestionReasons.filter(r => r.category === cat.value);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat.value} style={{ marginBottom: 'var(--sp-m)' }}>
                      <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{cat.label}</div>
                      {items.map((r) => (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-m)', padding: '10px var(--sp-m)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 6, background: r.active ? 'var(--surface)' : 'var(--gray-light)', opacity: r.active ? 1 : 0.6 }}>
                          <TogglePill active={r.active} onToggle={() => setSuggestionReasons(prev => prev.map(x => x.id === r.id ? { ...x, active: !x.active } : x))} />
                          <span style={{ flex: 1, fontSize: 'var(--fs-s)' }}>{r.text}</span>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: 16 }} onClick={() => setSuggestionReasons(prev => prev.filter(x => x.id !== r.id))}>🗑</button>
                        </div>
                      ))}
                    </div>
                  );
                })}
                <div style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)', border: '1px solid var(--border)', marginTop: 'var(--sp-m)' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--fs-s)', marginBottom: 'var(--sp-s)' }}>Neuen Baustein hinzufügen</div>
                  <div className="form-row">
                    <Select label="Kategorie" value={newReasonCategory} onChange={setNewReasonCategory} options={SUGGESTION_CATEGORIES} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" placeholder="Begründungstext eingeben..." value={newReasonText} onChange={e => setNewReasonText(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn btn-primary btn-sm" onClick={handleAddSuggestionReason}>+ Hinzufügen</button>
                  </div>
                </div>
              </Panel>
            )}

            {/* Panel 5 — Firmenvorstellungsseiten (admin only) */}
            {isAdmin && (
              <Panel title="Firmenvorstellungsseiten">
                <p className="text-sm text-grey" style={{ marginBottom: 'var(--sp-m)' }}>
                  Diese Seiten werden Kunden beim ersten Login im Portal angezeigt.
                </p>
                {introPages.map((page) => (
                  <div key={page.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)', marginBottom: 'var(--sp-s)', background: 'var(--surface)' }}>
                    {editingPage === page.id ? (
                      <>
                        <Input label="Titel" value={page.title} onChange={(v) => setIntroPages(prev => prev.map(p => p.id === page.id ? { ...p, title: v } : p))} />
                        <Textarea label="Inhalt" value={page.content} onChange={(v) => setIntroPages(prev => prev.map(p => p.id === page.id ? { ...p, content: v } : p))} rows={4} />
                        <button className="btn btn-primary btn-sm" onClick={() => { setEditingPage(null); addToast('success', 'Seite gespeichert.'); }}>💾 Speichern</button>
                        {' '}
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingPage(null)}>Abbrechen</button>
                      </>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-m)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{page.title}</div>
                          <div style={{ fontSize: 'var(--fs-s)', color: 'var(--text-muted)', lineHeight: 1.5 }}>{page.content}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingPage(page.id)}>✏️ Bearbeiten</button>
                          <button className="btn btn-danger btn-sm" onClick={() => { setIntroPages(prev => prev.filter(p => p.id !== page.id)); addToast('success', 'Seite gelöscht.'); }}>🗑</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  const newPage = { id: `ip${Date.now()}`, title: 'Neue Seite', content: '', order: introPages.length + 1 };
                  setIntroPages(prev => [...prev, newPage]);
                  setEditingPage(newPage.id);
                }}>+ Neue Seite</button>
                <div style={{ marginTop: 'var(--sp-m)' }}>
                  <FileUpload label="Einführungs-PDF hochladen" accept="application/pdf" hint="Alternativ zu Einzelseiten · max. 10 MB" />
                </div>
              </Panel>
            )}

            {/* Panel 6 — Vorsorgetypen (admin or CAN_MODIFY_PRECAUTION_TYPES) */}
            {(isAdmin || myConsultant.rights.includes('CAN_MODIFY_PRECAUTION_TYPES')) && (
              <Panel title="Vorsorge- & Produkttypen">
                <p className="text-sm text-grey" style={{ marginBottom: 'var(--sp-m)' }}>
                  Legen Sie fest, welche Produkttypen in der Beratung angezeigt und ausgewählt werden können.
                </p>
                {SUGGESTION_CATEGORIES.map((cat) => {
                  const items = precautionTypes.filter(pt => pt.category === cat.value);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat.value} style={{ marginBottom: 'var(--sp-m)' }}>
                      <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{cat.label}</div>
                      {items.map((pt) => (
                        <div key={pt.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-m)', padding: '10px var(--sp-m)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 6 }}>
                          <TogglePill active={pt.active} onToggle={() => setPrecautionTypes(prev => prev.map(x => x.id === pt.id ? { ...x, active: !x.active } : x))} />
                          <span style={{ flex: 1, fontSize: 'var(--fs-s)' }}>{pt.name}</span>
                          <Badge type={pt.active ? 'success' : 'neutral'}>{pt.active ? 'Aktiv' : 'Inaktiv'}</Badge>
                        </div>
                      ))}
                    </div>
                  );
                })}
                <button className="btn btn-primary btn-sm" onClick={() => addToast('success', 'Vorsorgetypen gespeichert.')}>💾 Speichern</button>
              </Panel>
            )}

            <div className="flex gap-s">
              <button className="btn btn-secondary" onClick={() => addToast('info', 'Vorschau wird geöffnet...')}>👁 Vorschau</button>
              <button className="btn btn-primary" onClick={() => addToast('success', 'Unternehmenseinstellungen gespeichert.')}>💾 Speichern</button>
            </div>
          </div>
        )}

        {/* ── CRM-Integration ───────────────────────────────────── */}
        {activeTab === 'crm' && (
          <div>
            <SectionHeader title="CRM-Integration" />
            <Alert type="info">
              Verbinden Sie externe CRM-Systeme, um Kundendaten und Produktinformationen automatisch zu synchronisieren.
            </Alert>

            {/* Dionera / Blau */}
            <Panel title="Dionera / Blau" action={<TogglePill active={crmCredentials.dionera.enabled} onToggle={() => setCrmCredentials(p => ({ ...p, dionera: { ...p.dionera, enabled: !p.dionera.enabled } }))} />}>
              {companyCrmManaged.dionera ? (
                <Alert type="warning">
                  Diese Zugangsdaten werden firmenweit verwaltet.{' '}
                  {isAdmin && <button className="btn btn-sm btn-danger" onClick={() => setCompanyCrmManaged(p => ({ ...p, dionera: false }))}>Firmenverwaltung aufheben</button>}
                </Alert>
              ) : (
                <>
                  <div className="form-row">
                    <Input label="Berater-ID" value={crmCredentials.dionera.consultant_id} onChange={(v) => setCrmCredentials(p => ({ ...p, dionera: { ...p.dionera, consultant_id: v } }))} placeholder="z. B. 12345" />
                    <Input label="API-ID" value={crmCredentials.dionera.api_id} onChange={(v) => setCrmCredentials(p => ({ ...p, dionera: { ...p.dionera, api_id: v } }))} />
                  </div>
                  <div className="form-row">
                    <Input label="API-Key" type="password" value={crmCredentials.dionera.api_key} onChange={(v) => setCrmCredentials(p => ({ ...p, dionera: { ...p.dionera, api_key: v } }))} />
                    <Input label="Blau-ID" value={crmCredentials.dionera.blau_id} onChange={(v) => setCrmCredentials(p => ({ ...p, dionera: { ...p.dionera, blau_id: v } }))} placeholder="Blau-Rechner Kennung" />
                  </div>
                  <div className="flex gap-s">
                    <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', 'Verbindung wird getestet...')}>🔌 Verbindung testen</button>
                    <button className="btn btn-primary btn-sm" onClick={() => addToast('success', 'Dionera-Zugangsdaten gespeichert.')}>💾 Speichern</button>
                    {isAdmin && <button className="btn btn-secondary btn-sm" onClick={() => { setCompanyCrmManaged(p => ({ ...p, dionera: true })); addToast('success', 'Firmenweit aktiviert.'); }}>🏢 Firmenweit aktivieren</button>}
                  </div>
                </>
              )}
            </Panel>

            {/* BCA */}
            <Panel title="BCA Diva" action={<TogglePill active={crmCredentials.bca.enabled} onToggle={() => setCrmCredentials(p => ({ ...p, bca: { ...p.bca, enabled: !p.bca.enabled } }))} />}>
              {companyCrmManaged.bca ? (
                <Alert type="warning">
                  Diese Zugangsdaten werden firmenweit verwaltet.{' '}
                  {isAdmin && <button className="btn btn-sm btn-danger" onClick={() => setCompanyCrmManaged(p => ({ ...p, bca: false }))}>Firmenverwaltung aufheben</button>}
                </Alert>
              ) : (
                <>
                  <div className="form-row">
                    <Input label="Berater-ID" value={crmCredentials.bca.consultant_id} onChange={(v) => setCrmCredentials(p => ({ ...p, bca: { ...p.bca, consultant_id: v } }))} />
                    <Input label="API-ID" value={crmCredentials.bca.api_id} onChange={(v) => setCrmCredentials(p => ({ ...p, bca: { ...p.bca, api_id: v } }))} />
                  </div>
                  <Input label="API-Key" type="password" value={crmCredentials.bca.api_key} onChange={(v) => setCrmCredentials(p => ({ ...p, bca: { ...p.bca, api_key: v } }))} />
                  <div className="flex gap-s">
                    <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', 'Verbindung wird getestet...')}>🔌 Verbindung testen</button>
                    <button className="btn btn-primary btn-sm" onClick={() => addToast('success', 'BCA-Zugangsdaten gespeichert.')}>💾 Speichern</button>
                    {isAdmin && <button className="btn btn-secondary btn-sm" onClick={() => { setCompanyCrmManaged(p => ({ ...p, bca: true })); addToast('success', 'Firmenweit aktiviert.'); }}>🏢 Firmenweit aktivieren</button>}
                  </div>
                </>
              )}
            </Panel>

            {/* FBXpert */}
            <Panel title="FBXpert" action={<TogglePill active={crmCredentials.fbxpert.enabled} onToggle={() => setCrmCredentials(p => ({ ...p, fbxpert: { ...p.fbxpert, enabled: !p.fbxpert.enabled } }))} />}>
              {companyCrmManaged.fbxpert ? (
                <Alert type="warning">
                  Diese Zugangsdaten werden firmenweit verwaltet.{' '}
                  {isAdmin && <button className="btn btn-sm btn-danger" onClick={() => setCompanyCrmManaged(p => ({ ...p, fbxpert: false }))}>Firmenverwaltung aufheben</button>}
                </Alert>
              ) : (
                <>
                  <div className="form-row">
                    <Input label="Berater-ID" value={crmCredentials.fbxpert.consultant_id} onChange={(v) => setCrmCredentials(p => ({ ...p, fbxpert: { ...p.fbxpert, consultant_id: v } }))} />
                    <Input label="API-ID" value={crmCredentials.fbxpert.api_id} onChange={(v) => setCrmCredentials(p => ({ ...p, fbxpert: { ...p.fbxpert, api_id: v } }))} />
                  </div>
                  <Input label="API-Key" type="password" value={crmCredentials.fbxpert.api_key} onChange={(v) => setCrmCredentials(p => ({ ...p, fbxpert: { ...p.fbxpert, api_key: v } }))} />
                  <div className="flex gap-s">
                    <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', 'Verbindung wird getestet...')}>🔌 Verbindung testen</button>
                    <button className="btn btn-primary btn-sm" onClick={() => addToast('success', 'FBXpert-Zugangsdaten gespeichert.')}>💾 Speichern</button>
                    {isAdmin && <button className="btn btn-secondary btn-sm" onClick={() => { setCompanyCrmManaged(p => ({ ...p, fbxpert: true })); addToast('success', 'Firmenweit aktiviert.'); }}>🏢 Firmenweit aktivieren</button>}
                  </div>
                </>
              )}
            </Panel>
          </div>
        )}

        {/* ── Beratung ──────────────────────────────────────────── */}
        {activeTab === 'consultation' && (
          <div>
            <SectionHeader title="Beratungseinstellungen" />
            <Panel title="Analysemodule aktivieren">
              <p className="text-sm text-grey" style={{ marginBottom: 'var(--sp-m)' }}>Wählen Sie, welche Module in der Finanzanalyse angezeigt werden.</p>
              {[
                { key: 'show_income',     label: 'Einkommensanalyse', desc: 'Einnahmen, Ausgaben, frei verfügbares Einkommen' },
                { key: 'show_retirement', label: 'Altersvorsorge',    desc: 'Rentenlückenanalyse und Vorsorgeplanung' },
                { key: 'show_investment', label: 'Investitionen',     desc: 'Portfolio-Verwaltung und Renditerechner' },
                { key: 'show_insurance',  label: 'Versicherungen',    desc: 'Versicherungsübersicht und Vertragsmanagement' },
                { key: 'show_house',      label: 'Immobilien',        desc: 'Eigenheim-Planung und Finanzierungsrechner' },
              ].map((m) => (
                <div key={m.key} className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-light)' }}>
                  <div><div className="text-sm font-bold">{m.label}</div><div className="text-xs text-grey">{m.desc}</div></div>
                  <Toggle checked={(consultationSettings as any)[m.key]} onChange={(v) => setConsultationSettings((p) => ({ ...p, [m.key]: v }))} />
                </div>
              ))}
            </Panel>

            <Panel title="Automatisierung">
              <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-m)' }}>
                <div><div className="text-sm font-bold">Erstinformation automatisch senden</div><div className="text-xs text-grey">Beim ersten Öffnen eines Kundenprofils</div></div>
                <Toggle checked={consultationSettings.require_initial_info} onChange={(v) => setConsultationSettings((p) => ({ ...p, require_initial_info: v }))} />
              </div>
              <div className="flex justify-between items-center">
                <div><div className="text-sm font-bold">Automatisch speichern</div><div className="text-xs text-grey">Analysedaten alle 5 Minuten</div></div>
                <Toggle checked={consultationSettings.auto_save} onChange={(v) => setConsultationSettings((p) => ({ ...p, auto_save: v }))} />
              </div>
            </Panel>

            <Panel title="Standardnotiz-Vorlage">
              <Textarea label="Vorlage für neue Beratungsnotizen" value={consultationSettings.default_note_template} onChange={(v) => setConsultationSettings((p) => ({ ...p, default_note_template: v }))} rows={5} placeholder={'Themen des Gesprächs:\n\nVereinbarungen:\n\nNächste Schritte:'} />
            </Panel>

            <button className="btn btn-primary" onClick={() => addToast('success', 'Beratungseinstellungen gespeichert.')}>💾 Speichern</button>
          </div>
        )}

        {/* ── Abrechnung ────────────────────────────────────────── */}
        {activeTab === 'billing' && (
          <div>
            {!isAdmin && <Alert type="warning">Nur Administratoren können die Abrechnung einsehen.</Alert>}
            {isAdmin && (
              <>
                <SectionHeader title="Abrechnung & Abonnement" />
                <Panel title="Aktuelles Abonnement">
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-m)' }}>
                    <div>
                      <div style={{ fontSize: 'var(--fs-l)', fontWeight: 700, color: 'var(--primary)' }}>{SUBSCRIPTION.plan_name}</div>
                      <StatusBadge status={SUBSCRIPTION.status} />
                      <span className="text-sm text-grey" style={{ marginLeft: 8 }}>Verlängert am {new Date(SUBSCRIPTION.valid_until).toLocaleDateString('de-DE')}</span>
                    </div>
                    <button className="btn btn-secondary" onClick={() => addToast('info', 'Abrechnungsportal wird geöffnet...')}>Abrechnung verwalten</button>
                  </div>
                  {SUBSCRIPTION.cancel_at_period_end && (
                    <Alert type="warning">
                      Ihr Abonnement wird am {new Date(SUBSCRIPTION.valid_until).toLocaleDateString('de-DE')} nicht verlängert.
                      <button className="btn btn-sm btn-primary" style={{ marginLeft: 8 }} onClick={() => addToast('success', 'Kündigung wurde zurückgenommen.')}>Rückgängig</button>
                    </Alert>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-s)', marginTop: 'var(--sp-m)' }}>
                    {[
                      { label: 'Kundenverwaltung', ok: true }, { label: 'Beratung & Vorsorge', ok: true },
                      { label: 'PDF-Downloads', ok: true }, { label: 'Unternehmensdesign', ok: true },
                      { label: 'Investitionsanalyse', ok: true }, { label: 'TAA Integration', ok: false },
                    ].map((f) => (
                      <div key={f.label} className="flex items-center gap-s text-sm" style={{ opacity: f.ok ? 1 : 0.5 }}>
                        <span style={{ color: f.ok ? 'var(--success)' : 'var(--gray-300)' }}>{f.ok ? '✓' : '✗'}</span>{f.label}
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
                          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '8px 0' }}>{plan.price_eur === 0 ? 'Gratis' : `${plan.price_eur} €`}</div>
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
              </>
            )}
          </div>
        )}

        {/* ── Rechtliches ───────────────────────────────────────── */}
        {activeTab === 'legal' && (
          <div>
            <SectionHeader title="Rechtliche Informationen" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-m)', marginBottom: 'var(--sp-m)' }}>
              {[
                { icon: '📋', title: 'AGB',         desc: 'Allgemeine Geschäftsbedingungen' },
                { icon: '🔒', title: 'Datenschutz', desc: 'DSGVO-konforme Datenschutzerklärung' },
                { icon: '🏢', title: 'Impressum',   desc: 'Gesetzliche Pflichtangaben (§ 5 TMG)' },
              ].map((doc) => (
                <div key={doc.title} className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 'var(--sp-s)' }}>{doc.icon}</div>
                    <div className="font-bold" style={{ marginBottom: 6 }}>{doc.title}</div>
                    <div className="text-xs text-grey" style={{ marginBottom: 'var(--sp-m)', lineHeight: 1.5 }}>{doc.desc}</div>
                    <button className="btn btn-secondary btn-sm btn-full" onClick={() => navigate('/legal')}>Öffnen →</button>
                    {isAdmin && <button className="btn btn-primary btn-sm btn-full" style={{ marginTop: 6 }} onClick={() => navTo('company')}>✏️ Bearbeiten</button>}
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
                  { label: 'Beratungsprotokoll erstellen',       desc: 'Nach jedem Beratungsgespräch (§ 18 VersVermV)',               status: 'ok' },
                  { label: 'Wechselgründe dokumentieren',        desc: 'Bei Ablösung bestehender Verträge',                          status: 'ok' },
                  { label: 'Datenschutzerklärung einholen',      desc: 'Einwilligung zur Datenverarbeitung',                         status: 'warning' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-m text-sm" style={{ padding: 'var(--sp-s) 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: item.status === 'ok' ? 'var(--success)' : 'var(--warning)', fontSize: 18, flexShrink: 0 }}>{item.status === 'ok' ? '✓' : '⚠'}</span>
                    <div><div className="font-bold">{item.label}</div><div className="text-xs text-grey">{item.desc}</div></div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* ── Administration (Admin only) ───────────────────────── */}
        {activeTab === 'administration' && (
          <div>
            {!isAdmin ? (
              <Alert type="danger">Diese Seite ist nur für Administratoren zugänglich.</Alert>
            ) : (
              <>
                <SectionHeader title="Administration" />

                {/* Panel 1 — Berater-Hierarchie */}
                <Panel title="Berater-Hierarchie" action={<Badge type="info">{consultants.length} Berater</Badge>}>
                  <p className="text-sm text-grey" style={{ marginBottom: 'var(--sp-m)' }}>
                    Übersicht der Beraterstruktur. Ordnen Sie Berater hierarchisch einem Vorgesetzten zu.
                  </p>
                  {consultants.map((c) => {
                    const boss = consultants.find(b => b.id !== c.id && c.rights.includes('CONSULTANT'));
                    return (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-m)', padding: '10px var(--sp-m)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.rights.includes('ADMIN') ? 'var(--primary)' : 'var(--primary-tint)', color: c.rights.includes('ADMIN') ? '#fff' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--fs-xs)', flexShrink: 0 }}>
                          {c.first_name[0]}{c.last_name[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 'var(--fs-s)' }}>{c.first_name} {c.last_name}</div>
                          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{c.email}</div>
                        </div>
                        <Select
                          label=""
                          value={boss?.id ?? 'none'}
                          onChange={() => addToast('info', 'Hierarchie wird aktualisiert...')}
                          options={[{ value: 'none', label: '— Kein Vorgesetzter —' }, ...consultants.filter(b => b.id !== c.id).map(b => ({ value: b.id, label: `${b.first_name} ${b.last_name}` }))]}
                        />
                        {c.rights.includes('ADMIN') && <Badge type="primary">Admin</Badge>}
                      </div>
                    );
                  })}
                  <button className="btn btn-primary btn-sm" onClick={() => addToast('success', 'Hierarchie gespeichert.')}>💾 Hierarchie speichern</button>
                </Panel>

                {/* Panel 2 — Systemkonstanten */}
                <Panel title="Systemkonstanten">
                  <p className="text-sm text-grey" style={{ marginBottom: 'var(--sp-m)' }}>
                    Diese Werte werden für alle Berechnungen und Analysen verwendet und firmenweit angewendet.
                  </p>
                  <div className="form-row">
                    <Input label="Inflationsrate (%)" type="number" value={String(systemConstants.inflation_rate)} onChange={(v) => setSystemConstants(p => ({ ...p, inflation_rate: parseFloat(v) || 0 }))} hint="z. B. 2.0 für 2%" />
                    <Input label="Gesetzl. Rentenniveau (%)" type="number" value={String(systemConstants.statutory_pension_factor)} onChange={(v) => setSystemConstants(p => ({ ...p, statutory_pension_factor: parseFloat(v) || 0 }))} hint="z. B. 48.0 für 48%" />
                  </div>
                  <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 'var(--sp-m) 0 var(--sp-s)' }}>Erwartete Renditen</div>
                  <div className="form-row">
                    <Input label="Konservativ (%)" type="number" value={String(systemConstants.expected_return_conservative)} onChange={(v) => setSystemConstants(p => ({ ...p, expected_return_conservative: parseFloat(v) || 0 }))} />
                    <Input label="Ausgewogen (%)" type="number" value={String(systemConstants.expected_return_balanced)} onChange={(v) => setSystemConstants(p => ({ ...p, expected_return_balanced: parseFloat(v) || 0 }))} />
                    <Input label="Wachstum (%)" type="number" value={String(systemConstants.expected_return_aggressive)} onChange={(v) => setSystemConstants(p => ({ ...p, expected_return_aggressive: parseFloat(v) || 0 }))} />
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => addToast('success', 'Systemkonstanten gespeichert.')}>💾 Speichern</button>
                </Panel>

                {/* Panel 3 — TAA-Fondspresets */}
                <Panel title="TAA-Fondspresets" action={<Badge type="info">{taaPresets.filter(t => t.active).length} aktiv</Badge>}>
                  <p className="text-sm text-grey" style={{ marginBottom: 'var(--sp-m)' }}>
                    Vordefinierte Fonds für die TAA-Altersvorsorgeberechnung. Diese stehen bei der Beratung zur Auswahl.
                  </p>
                  {taaPresets.map((preset) => (
                    <div key={preset.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-m)', padding: '10px var(--sp-m)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 8 }}>
                      <TogglePill active={preset.active} onToggle={() => setTaaPresets(prev => prev.map(x => x.id === preset.id ? { ...x, active: !x.active } : x))} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--fs-s)' }}>{preset.name}</div>
                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>ISIN: {preset.isin} · {preset.provider}</div>
                      </div>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: 16 }} onClick={() => { setTaaPresets(prev => prev.filter(x => x.id !== preset.id)); addToast('success', 'Preset entfernt.'); }}>🗑</button>
                    </div>
                  ))}
                  <div style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)', border: '1px solid var(--border)', marginTop: 'var(--sp-m)' }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--fs-s)', marginBottom: 'var(--sp-s)' }}>Neuen Fonds hinzufügen</div>
                    <div className="form-row">
                      <Input label="Fondsname" value={newTaaPreset.name} onChange={(v) => setNewTaaPreset(p => ({ ...p, name: v }))} placeholder="z. B. DWS Vorsorge Flex" />
                      <Input label="Anbieter" value={newTaaPreset.provider} onChange={(v) => setNewTaaPreset(p => ({ ...p, provider: v }))} placeholder="z. B. DWS" />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Input label="ISIN" value={newTaaPreset.isin} onChange={(v) => setNewTaaPreset(p => ({ ...p, isin: v }))} placeholder="z. B. DE0008490962" />
                      <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                        <button className="btn btn-primary btn-sm" onClick={handleAddTaaPreset}>+ Hinzufügen</button>
                      </div>
                    </div>
                  </div>
                </Panel>

                {/* Panel 4 — Dokumentations-Module */}
                <Panel title="Dokumentations-Module">
                  <p className="text-sm text-grey" style={{ marginBottom: 'var(--sp-m)' }}>
                    Wählen Sie, welche Dokumentationsmodule für alle Berater verfügbar sind.
                  </p>
                  {[
                    { key: 'consultation_protocol', label: 'Beratungsprotokoll',    desc: 'Automatisch generiertes Protokoll nach Beratungsgespräch' },
                    { key: 'initial_info',           label: 'IDD-Erstinformation',  desc: 'Gesetzlich vorgeschriebene Erstinformation für Neukunden' },
                    { key: 'product_info',           label: 'Produktinformationen', desc: 'IPID und Produktdatenblätter für empfohlene Produkte' },
                    { key: 'privacy_declaration',    label: 'Datenschutzerklärung', desc: 'Einwilligungserklärung zur DSGVO-konformen Datenverarbeitung' },
                    { key: 'change_reasons',         label: 'Wechselbegründung',    desc: 'Dokumentation der Gründe bei Produktwechsel' },
                    { key: 'needs_analysis',         label: 'Bedarfsanalyse',       desc: 'Strukturierte Bedarfsermittlung vor der Beratung' },
                  ].map((m) => (
                    <div key={m.key} className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-light)' }}>
                      <div><div className="text-sm font-bold">{m.label}</div><div className="text-xs text-grey">{m.desc}</div></div>
                      <Toggle checked={(docModules as any)[m.key]} onChange={(v) => setDocModules(p => ({ ...p, [m.key]: v }))} />
                    </div>
                  ))}
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 'var(--sp-m)' }} onClick={() => addToast('success', 'Dokumentationsmodule gespeichert.')}>💾 Speichern</button>
                </Panel>

                {/* Panel 5 — Firmen-Lizenzinfo */}
                <Panel title="Lizenz & Firmenkonfiguration">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-m)' }}>
                    {[
                      { label: 'Unternehmen', value: COMPANY_INFO.name },
                      { label: 'Lizenzierte Berater', value: `${consultants.length} / unbegrenzt` },
                      { label: 'Aktive Kunden', value: CUSTOMERS.filter(c => c.status === 'active').length },
                      { label: 'Aktueller Plan', value: SUBSCRIPTION.plan_name },
                    ].map((item) => (
                      <div key={item.label} style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)' }}>
                        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--fs-ml)' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </>
            )}
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
