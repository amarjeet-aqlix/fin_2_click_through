import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { StatCard, Modal, Input, Select, Badge, StatusBadge, EmptyState, LoadingCenter, Alert, Avatar } from '../components/UI';
import { useApp } from '../context';
import { CUSTOMERS, CONSULTANTS, SUBSCRIPTION, PLANS } from '../mock';
import type { Customer } from '../types';

const CUSTOMER_PERMISSIONS = [
  { value: 'PORTAL_ACCESS',      label: 'Zugang zum Kundenportal',       desc: 'Kunde kann sich im Kundenportal einloggen und Daten einsehen.' },
  { value: 'VIEW_ANALYSIS',      label: 'Analysen einsehen',             desc: 'Kunde kann seine Finanzanalyse und Auswertungen einsehen.' },
  { value: 'DATA_INPUT',         label: 'Dateneingabe',                  desc: 'Kunde kann Finanzdaten und persönliche Angaben selbst eingeben.' },
  { value: 'EDIT_PERSONAL_DATA', label: 'Persönliche Daten bearbeiten',  desc: 'Kunde darf Adresse, Telefon und weitere Stammdaten ändern.' },
  { value: 'VIEW_DOCUMENTS',     label: 'Dokumente einsehen',            desc: 'Kunde kann hochgeladene und generierte Dokumente einsehen.' },
  { value: 'UPLOAD_DOCUMENTS',   label: 'Dokumente hochladen',           desc: 'Kunde darf eigene Dokumente in den sicheren Bereich hochladen.' },
  { value: 'DIGITAL_SIGNATURE',  label: 'Digitale Unterschrift',         desc: 'Kunde kann Dokumente digital unterzeichnen.' },
  { value: 'VIEW_OFFERS',        label: 'Angebote einsehen',             desc: 'Kunde kann erstellte Angebote und Empfehlungen des Beraters sehen.' },
  { value: 'RECEIVE_REPORTS',    label: 'Berichte per E-Mail erhalten',  desc: 'Kunde erhält regelmäßige Zusammenfassungen und Berichte per E-Mail.' },
  { value: 'BOOK_APPOINTMENTS',  label: 'Termine buchen',                desc: 'Kunde kann Beratungstermine selbständig buchen und verwalten.' },
  { value: 'SEND_MESSAGES',      label: 'Nachrichten senden',            desc: 'Kunde kann dem Berater direkt Nachrichten schicken.' },
];

export const Dashboard: React.FC = () => {
  const { user, addToast } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [filterConsultant, setFilterConsultant] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [rightsCustomerId, setRightsCustomerId] = useState<string | null>(null);
  const [customerRights, setCustomerRights] = useState<Record<string, string[]>>({});

  // Add customer form state
  const [newCustomer, setNewCustomer] = useState({ first_name: '', last_name: '', email: '', phone: '', sex: 'm', birth_date: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addStep, setAddStep] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = user?.role === 'admin'
        ? CUSTOMERS
        : CUSTOMERS.filter((c) => c.consultant_id === 'cons1');
      setCustomers(filtered);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [user]);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${c.first_name} ${c.last_name} ${c.email} ${c.address.city}`.toLowerCase().includes(q);
    const matchConsultant = filterConsultant === 'all' || c.consultant_id === filterConsultant;
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchConsultant && matchStatus;
  });

  const handleAddCustomer = async () => {
    if (addStep === 1) { setAddStep(2); return; }
    setAddLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const created: Customer = {
      id: `cust${Date.now()}`,
      ...newCustomer,
      sex: newCustomer.sex as 'm' | 'f' | 'd',
      address: { street: '', zip: '', city: '' },
      consultant_id: 'cons1',
      consultant_name: 'Sarah Berger',
      company_id: 'c1',
      status: 'active',
      created_at: new Date().toISOString().slice(0, 10),
      last_edited: new Date().toISOString().slice(0, 10),
      personal_wishes: [],
      income: 0,
      has_partner: false,
    };
    setCustomers((prev) => [created, ...prev]);
    setAddLoading(false);
    setShowAddModal(false);
    setAddStep(1);
    setNewCustomer({ first_name: '', last_name: '', email: '', phone: '', sex: 'm', birth_date: '' });
    addToast('success', `Kunde ${created.first_name} ${created.last_name} wurde erfolgreich angelegt.`);
  };

  const handleToggleCustomerRight = (customerId: string, right: string) => {
    setCustomerRights((prev) => {
      const current = prev[customerId] ?? ['PORTAL_ACCESS'];
      const has = current.includes(right);
      return { ...prev, [customerId]: has ? current.filter((r) => r !== right) : [...current, right] };
    });
  };

  const getCustomerRights = (customerId: string) =>
    customerRights[customerId] ?? ['PORTAL_ACCESS'];

  const handleDeleteCustomer = async (id: string) => {
    await new Promise((r) => setTimeout(r, 500));
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setShowDeleteConfirm(null);
    addToast('success', 'Kunde wurde archiviert.');
  };

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === 'active').length,
    support: customers.filter((c) => c.status === 'support').length,
    consultants: CONSULTANTS.filter((c) => c.status === 'active').length,
  };

  const formatDate = (s: string) => new Date(s).toLocaleDateString('de-DE');

  return (
    <AppLayout title="Kundenverwaltung">
      {/* Stats bar */}
      <div className="stats-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--sp-m)', marginBottom: 'var(--sp-l)' }}>
        <StatCard icon="👥" value={stats.total} label="Kunden gesamt" />
        <StatCard icon="✅" value={stats.active} label="Aktive Kunden" />
        <StatCard icon="🔧" value={stats.support} label="Im Support-Modus" />
        <StatCard icon="💼" value={stats.consultants} label="Aktive Berater" />
      </div>

      {/* Subscription banner for non-professional */}
      {SUBSCRIPTION.status !== 'active' && (
        <Alert type="warning">
          Ihr Abonnement läuft am {new Date(SUBSCRIPTION.valid_until).toLocaleDateString('de-DE')} ab.{' '}
          <button className="btn btn-sm btn-primary" onClick={() => setShowPaymentModal(true)}>Jetzt upgraden</button>
        </Alert>
      )}

      {/* Customer list card */}
      <div className="card">
        <div className="card-header">
          <h3>Kunden</h3>
          <div className="flex gap-s">
            {user?.role === 'admin' && (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPaymentModal(true)}>
                💳 Abonnement
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              + Neuer Kunde
            </button>
          </div>
        </div>

        {/* Filter strip */}
        <div className="filter-strip">
          <div className="search-pill-wrap">
            <span className="search-pill-icon">🔍</span>
            <input
              className="search-pill"
              placeholder="Name, E-Mail oder Ort suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {user?.role === 'admin' && (
            <select
              className="filter-pill"
              value={filterConsultant}
              onChange={(e) => setFilterConsultant(e.target.value)}
            >
              <option value="all">Alle Berater</option>
              {CONSULTANTS.map((c) => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          )}

          <select
            className="filter-pill"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Alle Status</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Inaktiv</option>
            <option value="support">Support</option>
          </select>

          {(search || filterConsultant !== 'all' || filterStatus !== 'all') && (
            <button className="btn btn-sm btn-secondary" style={{ borderRadius: 'var(--radius-pill)' }} onClick={() => { setSearch(''); setFilterConsultant('all'); setFilterStatus('all'); }}>
              × Zurücksetzen
            </button>
          )}

          <span className="text-xs text-grey" style={{ marginLeft: 'auto' }}>
            {filtered.length} Kunden
          </span>
        </div>

        {/* Customer cards */}
        {loading ? (
          <LoadingCenter text="Kunden werden geladen..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            text="Keine Kunden gefunden"
            sub={search ? `Keine Ergebnisse für "${search}"` : 'Legen Sie Ihren ersten Kunden an.'}
            action={<button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Neuer Kunde</button>}
          />
        ) : (
          <div className="customer-cards-grid">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="customer-card"
                onClick={() => navigate(`/customers/${c.id}`)}
              >
                {/* Avatar */}
                <Avatar first={c.first_name} last={c.last_name} />

                {/* Name + DOB */}
                <div className="cc-identity">
                  <div className="cc-name">{c.first_name} {c.last_name}</div>
                  <div className="cc-dob">geb. {formatDate(c.birth_date)}</div>
                </div>

                {/* Contact */}
                <div className="cc-contact">
                  <div className="cc-email">{c.email}</div>
                  <div className="cc-phone">{c.phone}</div>
                </div>

                {/* Location */}
                <div>
                  <div className="cc-location">{c.address.city || '—'}</div>
                  {user?.role === 'admin' && <div className="cc-consultant">{c.consultant_name}</div>}
                </div>

                {/* Status */}
                <StatusBadge status={c.status} />

                {/* Date + Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <div className="cc-date">{formatDate(c.last_edited)}</div>
                  <div className="cc-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/customers/${c.id}`)} title="Öffnen">📂</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/analysis/${c.id}`)} title="Analyse">📊</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/consultation/${c.id}`)} title="Daten">📝</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/documentation/${c.id}`)} title="Protokoll">📋</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setRightsCustomerId(c.id)} title="Rechte">🔑</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(c.id)} title="Archivieren">🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <Modal
          title={addStep === 1 ? 'Neuer Kunde – Stammdaten' : 'Neuer Kunde – Einstellungen'}
          onClose={() => { setShowAddModal(false); setAddStep(1); }}
          footer={
            <>
              {addStep === 2 && <button className="btn btn-secondary" onClick={() => setAddStep(1)}>← Zurück</button>}
              <button className="btn btn-secondary" onClick={() => { setShowAddModal(false); setAddStep(1); }}>Abbrechen</button>
              <button className="btn btn-primary" onClick={handleAddCustomer} disabled={addLoading || (!newCustomer.first_name && addStep === 1)}>
                {addLoading ? '⌛ Wird erstellt...' : addStep === 1 ? 'Weiter →' : '✓ Kunde anlegen'}
              </button>
            </>
          }
        >
          {addStep === 1 ? (
            <>
              <div className="flex gap-s" style={{ marginBottom: 8 }}>
                <Badge type="primary">Schritt 1/2</Badge>
                <span className="text-sm text-grey">Grunddaten</span>
              </div>
              <div className="form-row">
                <Input label="Vorname" value={newCustomer.first_name} onChange={(v) => setNewCustomer((p) => ({ ...p, first_name: v }))} placeholder="Max" required />
                <Input label="Nachname" value={newCustomer.last_name} onChange={(v) => setNewCustomer((p) => ({ ...p, last_name: v }))} placeholder="Mustermann" required />
              </div>
              <Input label="E-Mail-Adresse" type="email" value={newCustomer.email} onChange={(v) => setNewCustomer((p) => ({ ...p, email: v }))} placeholder="max@email.de" required />
              <Input label="Telefonnummer" value={newCustomer.phone} onChange={(v) => setNewCustomer((p) => ({ ...p, phone: v }))} placeholder="+49 170 1234567" />
              <div className="form-row">
                <Select
                  label="Anrede"
                  value={newCustomer.sex}
                  onChange={(v) => setNewCustomer((p) => ({ ...p, sex: v }))}
                  options={[{ value: 'm', label: 'Herr' }, { value: 'f', label: 'Frau' }, { value: 'd', label: 'Divers' }]}
                />
                <Input label="Geburtsdatum" type="date" value={newCustomer.birth_date} onChange={(v) => setNewCustomer((p) => ({ ...p, birth_date: v }))} />
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-s" style={{ marginBottom: 'var(--sp-m)' }}>
                <Badge type="primary">Schritt 2/2</Badge>
                <span className="text-sm text-grey">Konfiguration</span>
              </div>
              <Alert type="info">
                Nach dem Anlegen erhält der Kunde automatisch eine E-Mail mit seinen Zugangsdaten.
              </Alert>
              <Select
                label="Zugewiesener Berater"
                value="cons1"
                onChange={() => {}}
                options={CONSULTANTS.filter((c) => c.status === 'active').map((c) => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))}
              />
              <Select
                label="Designvorlage"
                value="standard"
                onChange={() => {}}
                options={[{ value: 'standard', label: 'Standard' }, { value: 'modern', label: 'Modern' }, { value: 'classic', label: 'Klassisch' }]}
              />
              <div style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)' }}>
                <div className="text-sm font-bold" style={{ marginBottom: 8 }}>Zusammenfassung</div>
                <div className="text-sm">Name: <strong>{newCustomer.first_name} {newCustomer.last_name}</strong></div>
                <div className="text-sm">E-Mail: <strong>{newCustomer.email || '—'}</strong></div>
                <div className="text-sm">Telefon: <strong>{newCustomer.phone || '—'}</strong></div>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <Modal title="Vollzugriff freischalten" onClose={() => setShowPaymentModal(false)} wide>
          <div style={{ marginBottom: 'var(--sp-m)' }}>
            <div style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-l)' }}>
              <div>
                <span className="text-sm text-grey">Aktueller Plan: </span>
                <strong>{SUBSCRIPTION.plan_name}</strong>
                <StatusBadge status={SUBSCRIPTION.status} />
                <span className="text-sm text-grey"> · Verlängert am {new Date(SUBSCRIPTION.valid_until).toLocaleDateString('de-DE')}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', 'Abrechnungsportal wird geöffnet...')}>
                Abrechnung verwalten
              </button>
            </div>

            <div className="plan-grid">
              {PLANS.map((plan) => {
                const isCurrent = plan.id === SUBSCRIPTION.plan_id;
                const features = [
                  { label: 'Kundenverwaltung', included: true },
                  { label: 'Basisberatung & Vorsorge', included: true },
                  { label: 'Unternehmensdesign', included: !plan.isDisabled.companyDesign },
                  { label: 'PDF-Downloads', included: !plan.isDisabled.download },
                  { label: 'Hierarchie & Rechtevergabe', included: !plan.isDisabled.hierarchy },
                  { label: 'Vorschlagsbausteine', included: !plan.isDisabled.suggestionReasons },
                  { label: 'Investitionsanalyse', included: !plan.isDisabled.investmentAnalysis },
                  { label: 'TAA Rechner', included: !plan.isDisabled.taaIntegration },
                ];
                return (
                  <div key={plan.id} className={`plan-card${plan.id === 'professional' ? ' featured' : ''}${isCurrent ? ' current' : ''}`}>
                    {plan.id === 'professional' && <div className="plan-badge">Beliebteste Wahl</div>}
                    {isCurrent && <div className="plan-badge" style={{ background: 'var(--color-green)' }}>Ihr Plan</div>}
                    <div className="plan-name">{plan.name}</div>
                    <div>
                      <span className="plan-price">{plan.price_eur === 0 ? 'Kostenlos' : `${plan.price_eur} €`}</span>
                      {plan.price_eur > 0 && <span className="plan-price-sub"> / Monat zzgl. MwSt.</span>}
                    </div>
                    <div className="text-xs text-grey" style={{ marginTop: 4 }}>
                      {plan.max_consultants >= 9999 ? 'Unbegrenzte Berater' : `Bis zu ${plan.max_consultants} Berater`}
                    </div>
                    <ul className="plan-features">
                      {features.map((f) => (
                        <li key={f.label} className={f.included ? 'included' : 'excluded'}>
                          <span className="feat-icon">{f.included ? '✓' : '✗'}</span>
                          {f.label}
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <button className="btn btn-full" disabled style={{ background: 'var(--color-green)', color: '#fff' }}>Aktueller Plan</button>
                    ) : (
                      <button
                        className="btn btn-primary btn-full"
                        disabled={plan.id === 'starter'}
                        onClick={() => { addToast('success', `Checkout für "${plan.name}" wird gestartet...`); setShowPaymentModal(false); }}
                      >
                        {plan.id === 'starter' ? 'Kostenloser Plan' : `${plan.name} wählen`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-grey" style={{ textAlign: 'center', marginTop: 'var(--sp-m)' }}>
              Alle Preise zzgl. MwSt. · Kündigung jederzeit möglich · Zahlungen sicher über Stripe
            </p>
          </div>
        </Modal>
      )}

      {/* Customer Rights Panel */}
      {rightsCustomerId && (() => {
        const target = customers.find((c) => c.id === rightsCustomerId);
        if (!target) return null;
        const rights = getCustomerRights(rightsCustomerId);
        return (
          <>
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 200 }}
              onClick={() => setRightsCustomerId(null)}
            />
            <div style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 440,
              background: 'var(--surface)', borderLeft: '1px solid var(--border)',
              zIndex: 201, display: 'flex', flexDirection: 'column',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
              animation: 'slideInRight 0.28s ease',
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
                  onClick={() => setRightsCustomerId(null)}
                >✕</button>
              </div>

              {/* Permissions list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-l)' }}>
                <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--sp-m)' }}>
                  Berechtigungen
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {CUSTOMER_PERMISSIONS.map((p) => {
                    const active = rights.includes(p.value);
                    return (
                      <div
                        key={p.value}
                        onClick={() => handleToggleCustomerRight(rightsCustomerId, p.value)}
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
                            {p.label}
                          </div>
                          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                            {p.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: 'var(--sp-l)', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRightsCustomerId(null)}>Abbrechen</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                  addToast('success', `Rechte für ${target.first_name} ${target.last_name} gespeichert.`);
                  setRightsCustomerId(null);
                }}>💾 Speichern</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <Modal
          title="Kunde archivieren"
          onClose={() => setShowDeleteConfirm(null)}
          narrow
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Abbrechen</button>
              <button className="btn btn-danger" onClick={() => handleDeleteCustomer(showDeleteConfirm)}>Archivieren</button>
            </>
          }
        >
          <Alert type="warning">
            Dieser Kunde wird archiviert und nicht mehr in der Liste angezeigt. Alle Daten bleiben erhalten.
          </Alert>
          <p className="text-sm">Möchten Sie fortfahren?</p>
        </Modal>
      )}
    </AppLayout>
  );
};
