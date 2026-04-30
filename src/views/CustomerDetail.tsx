import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Tabs, Panel, Avatar, StatusBadge, Badge, Modal, Input, Textarea, Alert, LoadingCenter, EmptyState, SectionHeader } from '../components/UI';
import { useApp } from '../context';
import { CUSTOMERS, FINANCIAL_DATA, CONSULTATION_NOTES, DOCUMENTS, WISHES_OPTIONS, VIRTUAL_PARTNERS } from '../mock';
import type { Customer } from '../types';

const TABS = [
  { id: 'stammdaten', label: 'Stammdaten', icon: '👤' },
  { id: 'finanzen', label: 'Finanzen', icon: '💰' },
  { id: 'dokumente', label: 'Dokumente', icon: '📄' },
  { id: 'beratung', label: 'Beratung', icon: '📝' },
];

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState('stammdaten');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Customer>>({});
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [supportMode, setSupportMode] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);

  const fin = FINANCIAL_DATA[id ?? ''] ?? null;
  const notes = CONSULTATION_NOTES[id ?? ''] ?? [];
  const docs = DOCUMENTS[id ?? ''] ?? [];
  const partner = id ? (VIRTUAL_PARTNERS[id] ?? null) : null;

  useEffect(() => {
    setTimeout(() => {
      const found = CUSTOMERS.find((c) => c.id === id);
      setCustomer(found ?? null);
      if (found) {
        setEditData({ ...found });
        setSupportMode(found.status === 'support');
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 700));
    setCustomer((prev) => prev ? { ...prev, ...editData } : prev);
    setEditMode(false);
    addToast('success', 'Kundendaten wurden gespeichert.');
  };

  const handleAddNote = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setShowNoteModal(false);
    setNewNote({ title: '', content: '' });
    addToast('success', 'Beratungsnotiz wurde gespeichert.');
  };

  const handleSupportToggle = () => {
    setSupportMode(!supportMode);
    addToast('info', `Support-Modus ${!supportMode ? 'aktiviert' : 'deaktiviert'}.`);
  };

  if (loading) return <AppLayout title="Kunde"><LoadingCenter text="Kundendaten werden geladen..." /></AppLayout>;
  if (!customer) return (
    <AppLayout title="Kunde nicht gefunden">
      <EmptyState icon="❓" text="Dieser Kunde wurde nicht gefunden." action={<button className="btn btn-primary" onClick={() => navigate('/customers')}>← Zurück zur Übersicht</button>} />
    </AppLayout>
  );

  const formatDate = (s: string) => s ? new Date(s).toLocaleDateString('de-DE') : '—';
  const formatCurrency = (n: number) => `${n.toLocaleString('de-DE')} €`;

  return (
    <AppLayout title={`${customer.first_name} ${customer.last_name}`}>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/customers')}>Kunden</span>
        <span className="breadcrumb-sep">›</span>
        <span>{customer.first_name} {customer.last_name}</span>
      </div>

      {/* Customer header card */}
      <div className="customer-detail-header">
        <Avatar first={customer.first_name} last={customer.last_name} size="lg" />
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-s" style={{ marginBottom: 4 }}>
            <h2 style={{ margin: 0 }}>{customer.first_name} {customer.last_name}</h2>
            <StatusBadge status={customer.status} />
            {supportMode && <Badge type="warning">🔧 Support</Badge>}
          </div>
          <div className="customer-meta">
            <span className="customer-meta-item">📧 {customer.email}</span>
            <span className="customer-meta-item">📱 {customer.phone}</span>
            <span className="customer-meta-item">📍 {customer.address.city || '—'}</span>
            <span className="customer-meta-item">🎂 {formatDate(customer.birth_date)}</span>
            <span className="customer-meta-item">💼 {customer.consultant_name}</span>
          </div>
        </div>
        <div className="flex flex-col gap-s" style={{ flexShrink: 0 }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/analysis/${customer.id}`)}>
            📊 Analyse starten
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/consultation/${customer.id}`)}>
            📝 Daten erfassen
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/property-insurance/${customer.id}`)}>
            🏡 Eigentumsabfrage
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/documentation/${customer.id}`)}>
            📋 Protokoll
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(!editMode)}>
            {editMode ? '✕ Abbrechen' : '✏️ Bearbeiten'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleSupportToggle}>
            {supportMode ? '⬇️ Support beenden' : '🔧 Support aktivieren'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        <div className="tab-content">

          {/* ── Stammdaten ──────────────────────────────────────── */}
          {activeTab === 'stammdaten' && (
            <div>
              {editMode && (
                <Alert type="info">Bearbeitungsmodus aktiv. Änderungen werden erst beim Speichern übernommen.</Alert>
              )}

              <div className="form-row" style={{ marginBottom: 'var(--sp-l)' }}>
                {/* Personal data */}
                <Panel title="Persönliche Daten">
                  {editMode ? (
                    <>
                      <div className="form-row">
                        <Input label="Vorname" value={editData.first_name ?? ''} onChange={(v) => setEditData((p) => ({ ...p, first_name: v }))} />
                        <Input label="Nachname" value={editData.last_name ?? ''} onChange={(v) => setEditData((p) => ({ ...p, last_name: v }))} />
                      </div>
                      <Input label="E-Mail" type="email" value={editData.email ?? ''} onChange={(v) => setEditData((p) => ({ ...p, email: v }))} />
                      <Input label="Telefon" value={editData.phone ?? ''} onChange={(v) => setEditData((p) => ({ ...p, phone: v }))} />
                      <Input label="Geburtsdatum" type="date" value={editData.birth_date ?? ''} onChange={(v) => setEditData((p) => ({ ...p, birth_date: v }))} />
                      <button className="btn btn-primary btn-sm" onClick={handleSave}>💾 Speichern</button>
                    </>
                  ) : (
                    <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }}>
                      {[
                        ['Anrede', customer.sex === 'm' ? 'Herr' : customer.sex === 'f' ? 'Frau' : 'Divers'],
                        ['E-Mail', customer.email],
                        ['Telefon', customer.phone],
                        ['Geburtsdatum', formatDate(customer.birth_date)],
                        ['Partner', customer.has_partner ? 'Ja' : 'Nein'],
                        ['Kunde seit', formatDate(customer.created_at)],
                      ].map(([k, v]) => (
                        <React.Fragment key={k}>
                          <dt className="text-sm text-grey font-bold">{k}</dt>
                          <dd className="text-sm">{v}</dd>
                        </React.Fragment>
                      ))}
                    </dl>
                  )}
                </Panel>

                {/* Address */}
                <Panel title="Adresse">
                  {editMode ? (
                    <>
                      <Input label="Straße & Hausnummer" value={editData.address?.street ?? ''} onChange={(v) => setEditData((p) => ({ ...p, address: { ...p.address!, street: v } }))} />
                      <div className="form-row">
                        <Input label="PLZ" value={editData.address?.zip ?? ''} onChange={(v) => setEditData((p) => ({ ...p, address: { ...p.address!, zip: v } }))} />
                        <Input label="Stadt" value={editData.address?.city ?? ''} onChange={(v) => setEditData((p) => ({ ...p, address: { ...p.address!, city: v } }))} />
                      </div>
                    </>
                  ) : (
                    <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }}>
                      {[
                        ['Straße', customer.address.street || '—'],
                        ['PLZ', customer.address.zip || '—'],
                        ['Stadt', customer.address.city || '—'],
                      ].map(([k, v]) => (
                        <React.Fragment key={k}>
                          <dt className="text-sm text-grey font-bold">{k}</dt>
                          <dd className="text-sm">{v}</dd>
                        </React.Fragment>
                      ))}
                    </dl>
                  )}
                </Panel>
              </div>

              {/* Partner section */}
              <Panel title="Familie & Partner">
                {partner ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-m)', flexWrap: 'wrap' }}>
                    {/* Main customer node */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      background: 'var(--gray-50)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      minWidth: 160,
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 'var(--radius-s)',
                        background: 'var(--primary-tint)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 'var(--fs-xs)', flexShrink: 0,
                      }}>
                        {customer.first_name[0]}{customer.last_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{customer.first_name} {customer.last_name}</div>
                        <div className="text-xs text-grey">Hauptperson</div>
                      </div>
                    </div>

                    {/* Relationship connector */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: 18 }}>⟷</div>
                      <span style={{
                        fontSize: 'var(--fs-xs)', fontWeight: 700,
                        color: 'var(--primary)', background: 'var(--primary-tint)',
                        padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                      }}>
                        {partner.rel_name === 'spouse' ? 'Ehepartner/in' : 'Lebenspartner/in'}
                      </span>
                    </div>

                    {/* Partner node */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      background: 'var(--primary-tint)',
                      border: '2px solid var(--primary)',
                      borderRadius: 'var(--radius)',
                      minWidth: 160,
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 'var(--radius-s)',
                        background: 'var(--primary)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 'var(--fs-xs)', flexShrink: 0,
                      }}>
                        {partner.first_name[0]}{partner.last_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: 'var(--primary)' }}>
                          {partner.first_name} {partner.last_name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--primary)' }}>
                          {partner.profession || 'Beruf nicht erfasst'}
                        </div>
                      </div>
                    </div>

                    {/* Quick info + action */}
                    <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <span className="badge badge-neutral">Virtueller Datensatz</span>
                        {partner.salary_net && (
                          <span className="badge badge-primary">
                            {partner.salary_net.toLocaleString('de-DE')} €/Monat
                          </span>
                        )}
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/partner/${customer.id}`)}
                      >
                        ✏️ Partnerdaten bearbeiten
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-m)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-m)' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--radius)',
                        background: 'var(--gray-100)', border: '1.5px dashed var(--gray-300)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, color: 'var(--text-muted)',
                      }}>👥</div>
                      <div>
                        <div className="font-bold text-sm">Kein Partner erfasst</div>
                        <div className="text-xs text-grey">Virtueller Datensatz kann in der Datenerfassung angelegt werden</div>
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/consultation/${customer.id}`, { state: { tab: 'familie' } })}
                    >
                      + Partner hinzufügen
                    </button>
                  </div>
                )}
              </Panel>

              {/* Wishes & Goals */}
              <Panel title="Persönliche Wünsche & Ziele">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-s)' }}>
                  {WISHES_OPTIONS.map((w) => {
                    const selected = customer.personal_wishes.includes(w);
                    return (
                      <button
                        key={w}
                        className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          if (!editMode) return;
                          setEditData((p) => ({
                            ...p,
                            personal_wishes: selected
                              ? (p.personal_wishes ?? []).filter((x) => x !== w)
                              : [...(p.personal_wishes ?? []), w],
                          }));
                        }}
                        style={{ opacity: editMode ? 1 : selected ? 1 : 0.5 }}
                      >
                        {selected ? '✓ ' : ''}{w}
                      </button>
                    );
                  })}
                </div>
                {!editMode && <p className="text-xs text-grey mt-s">Bearbeitungsmodus aktivieren um Wünsche anzupassen.</p>}
              </Panel>
            </div>
          )}

          {/* ── Finanzen ─────────────────────────────────────────── */}
          {activeTab === 'finanzen' && (
            fin ? (
              <div>
                {/* Income overview */}
                <SectionHeader title="Einkommensübersicht" action={<button className="btn btn-primary btn-sm" onClick={() => navigate(`/analysis/${customer.id}`)}>Vollständige Analyse →</button>} />
                <div className="finance-grid">
                  <div className="finance-card">
                    <div className="finance-card-label">Bruttoeinkommen</div>
                    <div className="finance-card-value">{formatCurrency(fin.income.gross_salary)}</div>
                    <div className="finance-card-sub">monatlich</div>
                  </div>
                  <div className="finance-card">
                    <div className="finance-card-label">Nettoeinkommen</div>
                    <div className="finance-card-value">{formatCurrency(fin.income.net_salary)}</div>
                    <div className="finance-card-sub">monatlich</div>
                  </div>
                  {fin.income.partner_net && (
                    <div className="finance-card">
                      <div className="finance-card-label">Partner Netto</div>
                      <div className="finance-card-value">{formatCurrency(fin.income.partner_net)}</div>
                      <div className="finance-card-sub">monatlich</div>
                    </div>
                  )}
                  <div className="finance-card">
                    <div className="finance-card-label">Ersparnisse</div>
                    <div className="finance-card-value">{formatCurrency(fin.savings)}</div>
                    <div className="finance-card-sub">Gesamtvermögen</div>
                  </div>
                </div>

                {/* Retirement gap */}
                <Panel title="Altersvorsorge – Übersicht">
                  <div className="insight-row">
                    <div className="insight-box">
                      <div className="insight-label">Rentenbedarf / Monat</div>
                      <div className="insight-value">{formatCurrency(fin.retirement.monthly_need)}</div>
                    </div>
                    <div className="insight-box">
                      <div className="insight-label">Gesetzliche Rente</div>
                      <div className="insight-value" style={{ color: 'var(--color-green)' }}>{formatCurrency(fin.retirement.state_pension)}</div>
                    </div>
                    <div className="insight-box">
                      <div className="insight-label">Private Vorsorge</div>
                      <div className="insight-value" style={{ color: 'var(--primary)' }}>{formatCurrency(fin.retirement.private_pension)}</div>
                    </div>
                    <div className="insight-box">
                      <div className="insight-label">Deckungslücke</div>
                      <div className="insight-value" style={{ color: 'var(--color-red)' }}>{formatCurrency(fin.retirement.gap)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'var(--sp-m)' }}>
                    <div className="flex justify-between text-xs text-grey mb-s">
                      <span>Abdeckungsgrad</span>
                      <span>{Math.round(((fin.retirement.state_pension + fin.retirement.private_pension) / fin.retirement.monthly_need) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill progress-warning" style={{ width: `${Math.round(((fin.retirement.state_pension + fin.retirement.private_pension) / fin.retirement.monthly_need) * 100)}%` }} />
                    </div>
                  </div>
                </Panel>

                {/* Investments */}
                <Panel title="Investments & Geldanlagen">
                  {fin.investments.length === 0 ? (
                    <EmptyState icon="📈" text="Keine Investments erfasst" sub="Starten Sie die Analyse um Daten zu erfassen." />
                  ) : (
                    <table>
                      <thead><tr><th>Bezeichnung</th><th>Typ</th><th>Wert</th><th>mtl. Beitrag</th><th>Rendite</th></tr></thead>
                      <tbody>
                        {fin.investments.map((inv) => (
                          <tr key={inv.id}>
                            <td className="font-bold text-sm">{inv.name}</td>
                            <td><Badge type="info">{inv.type}</Badge></td>
                            <td className="text-sm">{formatCurrency(inv.value)}</td>
                            <td className="text-sm">{formatCurrency(inv.monthly_contribution)}</td>
                            <td className="text-sm text-success">{inv.return_rate}% p.a.</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Panel>

                {/* Insurances */}
                <Panel title="Versicherungen">
                  <table>
                    <thead><tr><th>Bezeichnung</th><th>Anbieter</th><th>Monatsprämie</th><th>Absicherung</th><th>Status</th></tr></thead>
                    <tbody>
                      {fin.insurances.map((ins) => (
                        <tr key={ins.id}>
                          <td className="font-bold text-sm">{ins.name}</td>
                          <td className="text-sm">{ins.provider}</td>
                          <td className="text-sm">{formatCurrency(ins.monthly_premium)}</td>
                          <td className="text-sm">{formatCurrency(ins.coverage)}</td>
                          <td><StatusBadge status={ins.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Panel>
              </div>
            ) : (
              <EmptyState
                icon="💰"
                text="Keine Finanzdaten vorhanden"
                sub="Starten Sie die Finanzanalyse um Daten zu erfassen."
                action={<button className="btn btn-primary" onClick={() => navigate(`/analysis/${customer.id}`)}>Analyse starten</button>}
              />
            )
          )}

          {/* ── Dokumente ────────────────────────────────────────── */}
          {activeTab === 'dokumente' && (
            <div>
              <SectionHeader title="Dokumente" action={
                <button className="btn btn-primary btn-sm" onClick={() => addToast('info', 'PDF-Upload Funktion wird geöffnet...')}>
                  + Dokument hochladen
                </button>
              } />
              {docs.length === 0 ? (
                <EmptyState icon="📄" text="Keine Dokumente vorhanden" sub="Laden Sie das erste Dokument hoch." />
              ) : (
                <div className="card">
                  <table>
                    <thead><tr><th>Dateiname</th><th>Typ</th><th>Größe</th><th>Erstellt am</th><th>Aktionen</th></tr></thead>
                    <tbody>
                      {docs.map((doc) => (
                        <tr key={doc.id}>
                          <td>
                            <div className="flex items-center gap-s">
                              <span style={{ fontSize: 20 }}>📄</span>
                              <span className="text-sm font-bold">{doc.name}</span>
                            </div>
                          </td>
                          <td><Badge type="info">{doc.type.toUpperCase()}</Badge></td>
                          <td className="text-sm text-grey">{doc.size}</td>
                          <td className="text-sm text-grey">{new Date(doc.created_at).toLocaleDateString('de-DE')}</td>
                          <td>
                            <div className="table-actions">
                              <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', `"${doc.name}" wird geöffnet...`)}>📂 Öffnen</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => addToast('success', `"${doc.name}" wird heruntergeladen...`)}>⬇️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Beratung ─────────────────────────────────────────── */}
          {activeTab === 'beratung' && (
            <div>
              <SectionHeader
                title="Beratungshistorie"
                action={<button className="btn btn-primary btn-sm" onClick={() => setShowNoteModal(true)}>+ Neue Notiz</button>}
              />
              {notes.length === 0 ? (
                <EmptyState icon="📝" text="Keine Beratungsnotizen" sub="Halten Sie erste Ergebnisse fest." action={<button className="btn btn-primary" onClick={() => setShowNoteModal(true)}>+ Neue Notiz</button>} />
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="card" style={{ marginBottom: 'var(--sp-m)' }}>
                    <div className="card-header">
                      <div>
                        <strong>{note.title}</strong>
                        <div className="text-xs text-grey">{new Date(note.date).toLocaleDateString('de-DE')} · {note.consultant_name}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', 'Notiz wird als PDF exportiert...')}>📄 PDF</button>
                    </div>
                    <div className="card-body">
                      <p className="text-sm" style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{note.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add note modal */}
      {showNoteModal && (
        <Modal
          title="Neue Beratungsnotiz"
          onClose={() => setShowNoteModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Abbrechen</button>
              <button className="btn btn-primary" onClick={handleAddNote} disabled={!newNote.title || !newNote.content}>Speichern</button>
            </>
          }
        >
          <Input label="Titel" value={newNote.title} onChange={(v) => setNewNote((p) => ({ ...p, title: v }))} placeholder="z.B. Jahresgespräch 2024" required />
          <Textarea label="Inhalt" value={newNote.content} onChange={(v) => setNewNote((p) => ({ ...p, content: v }))} rows={6} placeholder="Gesprächsinhalte, Empfehlungen, nächste Schritte..." />
        </Modal>
      )}

      {/* Move customer modal */}
      {showMoveModal && (
        <Modal title="Kunden übertragen" onClose={() => setShowMoveModal(false)} footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowMoveModal(false)}>Abbrechen</button>
            <button className="btn btn-primary" onClick={() => { setShowMoveModal(false); addToast('success', 'Kunde wurde erfolgreich übertragen.'); }}>Übertragen</button>
          </>
        }>
          <Alert type="warning">Der Kunde wird einem anderen Berater zugewiesen. Diese Aktion kann nicht rückgängig gemacht werden.</Alert>
          <p className="text-sm" style={{ marginBottom: 'var(--sp-m)' }}>Neuen Berater auswählen:</p>
        </Modal>
      )}
    </AppLayout>
  );
};
