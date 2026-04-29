import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Panel, Input, Select, Textarea, Toggle, Alert, Badge, StatusBadge, SectionHeader, ColorInput, FileUpload, EmptyState, Confirm } from '../components/UI';
import { useApp } from '../context';
import { CONSULTANTS, TRANSACTIONS, SUBSCRIPTION, PLANS, COMPANY_INFO } from '../mock';
import type { Consultant } from '../types';

const SETTINGS_TABS = [
  { id: 'profile', label: 'Mein Profil', icon: '👤' },
  { id: 'company', label: 'Unternehmen', icon: '🏢' },
  { id: 'consultation', label: 'Beratung', icon: '💬' },
  { id: 'admin', label: 'Verwaltung', icon: '👥' },
  { id: 'billing', label: 'Abrechnung', icon: '💳' },
];

export const Settings: React.FC = () => {
  const { user, addToast } = useApp();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') ?? 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile state
  const [profile, setProfile] = useState({ first_name: user?.first_name ?? '', last_name: user?.last_name ?? '', email: user?.email ?? '', phone: '+49 89 12345678', title: '' });
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');

  // Company state
  const [company, setCompany] = useState({ ...COMPANY_INFO });

  // Consultation state
  const [consultationSettings, setConsultationSettings] = useState({
    show_income: true,
    show_retirement: true,
    show_investment: true,
    show_insurance: true,
    show_house: true,
    default_note_template: '',
    require_initial_info: true,
    auto_save: true,
  });

  // Admin state
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

  const handleSaveCompany = async () => {
    await new Promise((r) => setTimeout(r, 700));
    addToast('success', 'Unternehmenseinstellungen wurden gespeichert.');
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
    { value: 'CAN_SEE_ALL_CLIENTS', label: 'Alle Kunden sehen' },
    { value: 'CAN_SEE_CLIENTS_OF_LOWER_STAGES', label: 'Untergeordnete Kunden' },
    { value: 'CAN_MODIFY_COMPANY_SUGGESTION_REASONS', label: 'Vorschlagsbausteine' },
    { value: 'ADMIN', label: 'Administrator' },
  ];

  return (
    <AppLayout title="Einstellungen">
      <div className="settings-layout">
        {/* Settings Nav */}
        <div className="settings-nav">
          {SETTINGS_TABS.filter((t) => isAdmin || !['admin', 'billing'].includes(t.id)).map((t) => (
            <div
              key={t.id}
              className={`settings-nav-item${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div>

          {/* ── Profil ──────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div>
              <SectionHeader title="Mein Profil" />

              <Panel title="Persönliche Daten">
                <div className="form-row">
                  <Input label="Vorname" value={profile.first_name} onChange={(v) => setProfile((p) => ({ ...p, first_name: v }))} required />
                  <Input label="Nachname" value={profile.last_name} onChange={(v) => setProfile((p) => ({ ...p, last_name: v }))} required />
                </div>
                <Input label="E-Mail-Adresse" type="email" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} required />
                <Input label="Telefon" value={profile.phone} onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} />
                <Input label="Titel / Bezeichnung" value={profile.title} onChange={(v) => setProfile((p) => ({ ...p, title: v }))} placeholder="z.B. Finanzberater, CFP" />
                <FileUpload label="Profilbild" accept="image/*" hint="PNG, JPG, max. 5 MB" />
                <button className="btn btn-primary" onClick={handleSaveProfile}>💾 Speichern</button>
              </Panel>

              <Panel title="E-Mail Server (für Kundenmails)">
                <Alert type="info">
                  Richten Sie Ihren SMTP-Server ein, um Kunden direkt aus finExpert E-Mails zu senden.
                </Alert>
                <Input label="SMTP-Server" value="smtp.office365.com" onChange={() => {}} placeholder="smtp.example.com" />
                <div className="form-row">
                  <Input label="Port" type="number" value="587" onChange={() => {}} />
                  <Select label="Verschlüsselung" value="starttls" onChange={() => {}} options={[{ value: 'starttls', label: 'STARTTLS' }, { value: 'ssl', label: 'SSL/TLS' }]} />
                </div>
                <Input label="Benutzername" value="berater@unternehmen.de" onChange={() => {}} />
                <Input label="Passwort" type="password" value="••••••••" onChange={() => {}} />
                <div className="flex gap-s">
                  <button className="btn btn-secondary" onClick={() => addToast('info', 'Verbindung wird getestet...')}>🔌 Verbindung testen</button>
                  <button className="btn btn-primary" onClick={() => addToast('success', 'E-Mail-Server gespeichert.')}>💾 Speichern</button>
                </div>
              </Panel>

              <Panel title="Passwort ändern">
                {pwError && <Alert type="danger">{pwError}</Alert>}
                <Input label="Aktuelles Passwort" type="password" value={currentPw} onChange={setCurrentPw} />
                <Input label="Neues Passwort" type="password" value={newPw} onChange={setNewPw} hint="Mindestens 8 Zeichen" />
                <Input label="Passwort bestätigen" type="password" value={confirmPw} onChange={setConfirmPw} />
                <button className="btn btn-primary" onClick={handleChangePassword}>🔑 Passwort ändern</button>
              </Panel>
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
                <Select label="Schriftart (Text)" value="opensans" onChange={() => {}} options={[
                  { value: 'opensans', label: 'Open Sans' },
                  { value: 'lato', label: 'Lato' },
                  { value: 'source', label: 'Source Sans Pro' },
                ]} />
                <div style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)', border: '1px solid var(--gray-border)' }}>
                  <div className="text-xs text-grey font-bold mb-s">Vorschau</div>
                  <div style={{ background: company.primary_color, color: '#fff', padding: '12px 16px', borderRadius: 4, fontFamily: 'Poppins', fontWeight: 700 }}>
                    {company.name}
                  </div>
                </div>
              </Panel>

              <div className="flex gap-s">
                <button className="btn btn-secondary" onClick={() => addToast('info', 'Vorschau wird geöffnet...')}>👁 Vorschau</button>
                <button className="btn btn-primary" onClick={handleSaveCompany}>💾 Speichern</button>
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

          {/* ── Verwaltung ──────────────────────────────────────── */}
          {activeTab === 'admin' && (
            <div>
              <SectionHeader title="Beraterverwaltung" action={
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddConsultant(true)}>+ Berater einladen</button>
              } />

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

              <div className="card">
                <div className="card-header">
                  <h3>Berater ({consultants.length})</h3>
                  <div className="text-sm text-grey">
                    <Badge type="success">{consultants.filter((c) => c.status === 'active').length} aktiv</Badge>
                    {' '}
                    <Badge type="neutral">{consultants.filter((c) => c.status === 'inactive').length} inaktiv</Badge>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Berater</th>
                      <th>Kunden</th>
                      <th>Rechte</th>
                      <th>Status</th>
                      <th>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultants.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="font-bold text-sm">{c.first_name} {c.last_name}</div>
                          <div className="text-xs text-grey">{c.email}</div>
                        </td>
                        <td className="text-sm">{c.customers_count}</td>
                        <td>
                          {editConsultantId === c.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {availableRights.map((r) => (
                                <label key={r.value} className="flex items-center gap-s text-xs" style={{ cursor: 'pointer' }}>
                                  <input type="checkbox" checked={c.rights.includes(r.value)} onChange={() => handleToggleRight(c.id, r.value)} />
                                  {r.label}
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                              {c.rights.filter((r) => r !== 'CONSULTANT').map((r) => (
                                <Badge key={r} type={r === 'ADMIN' ? 'primary' : 'info'}>{r.replace(/_/g, ' ')}</Badge>
                              ))}
                              {c.rights.filter((r) => r !== 'CONSULTANT').length === 0 && <span className="text-xs text-grey">Basis</span>}
                            </div>
                          )}
                        </td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditConsultantId(editConsultantId === c.id ? null : c.id)}
                            >
                              {editConsultantId === c.id ? '✓ Fertig' : '✏️ Rechte'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeleteConfirm(c.id)}
                              disabled={c.rights.includes('ADMIN') && c.id === 'cons1'}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Abrechnung ──────────────────────────────────────── */}
          {activeTab === 'billing' && (
            <div>
              <SectionHeader title="Abrechnung & Abonnement" />

              {/* Current plan */}
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

                {/* Plan features */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-s)', marginTop: 'var(--sp-m)' }}>
                  {[
                    { label: 'Kundenverwaltung', ok: true },
                    { label: 'Beratung & Vorsorge', ok: true },
                    { label: 'PDF-Downloads', ok: true },
                    { label: 'Unternehmensdesign', ok: true },
                    { label: 'Investitionsanalyse', ok: true },
                    { label: 'TAA Integration', ok: false },
                    { label: 'FBXpert Integration', ok: false },
                    { label: 'Dionera CRM', ok: false },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-s text-sm" style={{ opacity: f.ok ? 1 : 0.5 }}>
                      <span style={{ color: f.ok ? 'var(--color-green)' : 'var(--gray-dark)' }}>{f.ok ? '✓' : '✗'}</span>
                      {f.label}
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Upgrade plans */}
              <Panel title="Plan upgraden" action={<Badge type="info">Verfügbare Pläne</Badge>}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-m)' }}>
                  {PLANS.map((plan) => {
                    const isCurrent = plan.id === SUBSCRIPTION.plan_id;
                    return (
                      <div key={plan.id} style={{ border: `2px solid ${isCurrent ? 'var(--color-green)' : plan.id === 'enterprise' ? 'var(--primary)' : 'var(--gray-border)'}`, borderRadius: 'var(--radius)', padding: 'var(--sp-m)', textAlign: 'center', background: isCurrent ? '#f0fff0' : '#fff' }}>
                        {isCurrent && <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-green)', fontWeight: 700, marginBottom: 4 }}>✓ IHR PLAN</div>}
                        <div className="font-bold" style={{ fontSize: 'var(--fs-ml)', color: 'var(--primary)' }}>{plan.name}</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '8px 0' }}>
                          {plan.price_eur === 0 ? 'Gratis' : `${plan.price_eur} €`}
                        </div>
                        <div className="text-xs text-grey" style={{ marginBottom: 'var(--sp-m)' }}>
                          {plan.price_eur > 0 ? '/Monat zzgl. MwSt.' : 'Immer kostenlos'}<br/>
                          {plan.max_consultants >= 9999 ? 'Unbegrenzte Berater' : `Bis zu ${plan.max_consultants} Berater`}
                        </div>
                        {isCurrent ? (
                          <button className="btn btn-full btn-sm" disabled style={{ background: 'var(--color-green)', color: '#fff' }}>Aktuell</button>
                        ) : (
                          <button
                            className="btn btn-primary btn-full btn-sm"
                            disabled={plan.id === 'starter'}
                            onClick={() => addToast('info', `Checkout für "${plan.name}" wird gestartet...`)}
                          >
                            {plan.id === 'starter' ? 'Downgrade' : `Upgraden`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Panel>

              {/* Transactions */}
              <Panel title="Transaktionsverlauf">
                {TRANSACTIONS.length === 0 ? (
                  <EmptyState icon="💳" text="Keine Transaktionen" />
                ) : (
                  <table>
                    <thead><tr><th>Datum</th><th>Plan</th><th>Betrag</th><th>Status</th><th>Rechnung</th></tr></thead>
                    <tbody>
                      {TRANSACTIONS.map((tx) => (
                        <tr key={tx.id}>
                          <td className="text-sm">{new Date(tx.date).toLocaleDateString('de-DE')}</td>
                          <td className="text-sm">{tx.plan_name}</td>
                          <td className="text-sm font-bold">{tx.amount} €</td>
                          <td><StatusBadge status={tx.status} /></td>
                          <td>
                            <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', 'Rechnung wird heruntergeladen...')}>
                              ⬇️ PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Panel>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
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
