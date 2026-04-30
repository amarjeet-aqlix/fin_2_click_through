import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Tabs, Panel, Input, Select, Toggle, Alert, Badge, EmptyState, LoadingCenter, Modal, SectionHeader } from '../components/UI';
import { useApp } from '../context';
import { CUSTOMERS, VIRTUAL_PARTNERS } from '../mock';
import type { Customer, VirtualPartner } from '../types';

// ── Relation type labels ─────────────────────────────────────
const REL_LABELS: Record<string, string> = {
  spouse:  'Ehepartner/in',
  partner: 'Lebenspartner/in',
};

const EMPLOYMENT_OPTIONS = [
  { value: 'angestellt',     label: 'Angestellt (Vollzeit)' },
  { value: 'teilzeit',       label: 'Angestellt (Teilzeit)' },
  { value: 'selbststaendig', label: 'Selbständig / Freiberuflich' },
  { value: 'beamter',        label: 'Beamter/in' },
  { value: 'rentner',        label: 'Rentner/in' },
  { value: 'student',        label: 'Student/in' },
  { value: 'arbeitslos',     label: 'Nicht berufstätig' },
];

const KV_OPTIONS = [
  { value: 'gesetzlich', label: 'Gesetzlich (GKV)' },
  { value: 'privat',     label: 'Privat (PKV)' },
  { value: 'beihilfe',   label: 'Beihilfe + PKV' },
];

const TABS = [
  { id: 'personal',    label: 'Persönliche Daten',   icon: '👤' },
  { id: 'contact',     label: 'Kontakt & Adresse',   icon: '📍' },
  { id: 'employment',  label: 'Beruf & Einkommen',   icon: '💼' },
  { id: 'health',      label: 'Krankenversicherung', icon: '🏥' },
  { id: 'retirement',  label: 'Altersvorsorge',      icon: '🎯' },
  { id: 'insurances',  label: 'Versicherungen',      icon: '🛡️' },
];

// ── FamilySwitcher — visual relationship header ───────────────
const FamilySwitcher: React.FC<{
  customer: Customer;
  partner: VirtualPartner;
  onSwitchToMain: () => void;
}> = ({ customer, partner, onSwitchToMain }) => {
  const initials = (fn: string, ln: string) =>
    `${fn[0] ?? ''}${ln[0] ?? ''}`.toUpperCase();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-m)',
      padding: 'var(--sp-m) var(--sp-l)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-l)',
      marginBottom: 'var(--sp-m)',
      flexWrap: 'wrap',
    }}>
      {/* Main customer card — clickable to switch back */}
      <div
        onClick={onSwitchToMain}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          borderRadius: 'var(--radius)',
          border: '1.5px solid var(--border)',
          cursor: 'pointer',
          background: 'var(--gray-50)',
          transition: 'border-color var(--transition)',
          minWidth: 180,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-s)',
          background: 'var(--primary-tint)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 'var(--fs-xs)', color: 'var(--primary)',
        }}>
          {initials(customer.first_name, customer.last_name)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--fs-s)' }}>
            {customer.first_name} {customer.last_name}
          </div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Hauptperson</div>
        </div>
      </div>

      {/* Relationship arrow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{ fontSize: 18, color: 'var(--text-muted)' }}>⟷</div>
        <span style={{
          fontSize: 'var(--fs-xs)', fontWeight: 700,
          color: 'var(--primary)',
          background: 'var(--primary-tint)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-pill)',
        }}>
          {REL_LABELS[partner.rel_name]}
        </span>
      </div>

      {/* Partner card — active (currently editing) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        borderRadius: 'var(--radius)',
        border: '2px solid var(--primary)',
        background: 'var(--primary-tint)',
        minWidth: 180,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-s)',
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 'var(--fs-xs)', color: '#fff',
        }}>
          {initials(partner.first_name, partner.last_name)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--fs-s)', color: 'var(--primary)' }}>
            {partner.first_name} {partner.last_name}
          </div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--primary)' }}>
            {partner.sex === 'f' ? 'Partnerin' : 'Partner'} · wird bearbeitet
          </div>
        </div>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--success)',
          marginLeft: 'auto', flexShrink: 0,
        }} />
      </div>

      <div style={{ marginLeft: 'auto', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', textAlign: 'right' }}>
        <div>Virtueller Datensatz</div>
        <div style={{ fontFamily: 'monospace', opacity: 0.6 }}>{partner.id}</div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
export const PartnerForm: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting]   = useState(false);

  const [customer, setCustomer]   = useState<Customer | null>(null);
  const [partner, setPartner]     = useState<VirtualPartner | null>(null);

  // Editable form state — initialized from mock
  const [form, setForm] = useState<Partial<VirtualPartner>>({});
  const set = (field: keyof VirtualPartner) => (v: string | boolean | number) =>
    setForm((p) => ({ ...p, [field]: v }));

  useEffect(() => {
    setTimeout(() => {
      const c = CUSTOMERS.find((x) => x.id === customerId);
      const p = customerId ? VIRTUAL_PARTNERS[customerId] ?? null : null;
      setCustomer(c ?? null);
      setPartner(p);
      if (p) setForm({ ...p });
      setLoading(false);
    }, 500);
  }, [customerId]);

  const handleSave = async (showToast = true) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    if (!completedTabs.includes(activeTab)) {
      setCompletedTabs((prev) => [...prev, activeTab]);
    }
    if (showToast) addToast('success', 'Partnerdaten wurden gespeichert.');
  };

  const handleNextTab = async () => {
    await handleSave(false);
    const idx = TABS.findIndex((t) => t.id === activeTab);
    if (idx < TABS.length - 1) {
      setActiveTab(TABS[idx + 1].id);
      addToast('success', `"${TABS[idx].label}" gespeichert.`);
    } else {
      addToast('success', 'Alle Partnerdaten vollständig gespeichert!');
      navigate(`/customers/${customerId}`);
    }
  };

  // "Daten übernehmen" — copies last name + address from main customer
  const handleCopyFromMain = () => {
    if (!customer) return;
    setForm((p) => ({
      ...p,
      last_name: customer.last_name,
      street:    customer.address.street,
      zip:       customer.address.zip,
      city:      customer.address.city,
    }));
    addToast('info', 'Nachname und Adresse wurden vom Hauptkunden übernommen.');
  };

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setDeleting(false);
    setShowDeleteConfirm(false);
    addToast('success', 'Partnerverknüpfung wurde entfernt.');
    navigate(`/customers/${customerId}`);
  };

  const progress = Math.round((completedTabs.length / TABS.length) * 100);

  const tabsWithStatus = TABS.map((t) => ({
    ...t,
    label: completedTabs.includes(t.id) ? `✓ ${t.label}` : t.label,
  }));

  // ── Loading / error states ───────────────────────────────────
  if (loading) {
    return (
      <AppLayout title="Partnerdaten">
        <LoadingCenter text="Partnerdaten werden geladen..." />
      </AppLayout>
    );
  }

  if (!customer) {
    return (
      <AppLayout title="Fehler">
        <EmptyState icon="❓" text="Kunde nicht gefunden"
          action={<button className="btn btn-primary" onClick={() => navigate('/customers')}>← Zurück</button>} />
      </AppLayout>
    );
  }

  // ── No partner yet — should not normally reach here via routing ──
  if (!partner) {
    return (
      <AppLayout title="Partnerdaten">
        <div className="card" style={{ padding: 'var(--sp-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3 style={{ marginBottom: 8 }}>Kein Partner erfasst</h3>
          <p className="text-sm text-grey" style={{ marginBottom: 24 }}>
            Für {customer.first_name} {customer.last_name} ist noch kein Partner hinterlegt.
          </p>
          <button className="btn btn-primary"
            onClick={() => navigate(`/consultation/${customerId}`)}>
            ← Zurück zur Datenerfassung
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Partnerdaten – ${partner.first_name} ${partner.last_name}`}>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }}
          onClick={() => navigate('/customers')}>Kunden</span>
        <span className="breadcrumb-sep">›</span>
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }}
          onClick={() => navigate(`/customers/${customerId}`)}>
          {customer.first_name} {customer.last_name}
        </span>
        <span className="breadcrumb-sep">›</span>
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }}
          onClick={() => navigate(`/consultation/${customerId}`)}>Datenerfassung</span>
        <span className="breadcrumb-sep">›</span>
        <span>Partnerdaten</span>
      </div>

      {/* Family Switcher */}
      <FamilySwitcher
        customer={customer}
        partner={partner}
        onSwitchToMain={() => navigate(`/consultation/${customerId}`)}
      />

      {/* Header actions */}
      <div className="card" style={{ marginBottom: 'var(--sp-m)', padding: 'var(--sp-m) var(--sp-l)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-s)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--fs-m)' }}>
              {partner.sex === 'f' ? 'Partnerin' : 'Partner'}:&nbsp;
              <span style={{ color: 'var(--primary)' }}>{partner.first_name} {partner.last_name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-s)', marginTop: 4, flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{REL_LABELS[partner.rel_name]}</span>
              <span className="badge badge-neutral">Virtueller Datensatz</span>
              <span className="text-xs text-grey">
                Erstellt: {new Date(partner.created_at).toLocaleDateString('de-DE')}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-s)' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCopyFromMain}
              title="Nachname und Adresse des Hauptkunden übernehmen">
              📋 Daten übernehmen
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleSave(true)} disabled={saving}>
              {saving ? 'Speichert…' : '💾 Speichern'}
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
              🗑 Partner entfernen
            </button>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginTop: 'var(--sp-m)' }}>
          <div className="flex justify-between text-xs text-grey" style={{ marginBottom: 6 }}>
            <span>Vollständigkeit der Partnerdaten</span>
            <span>{completedTabs.length} / {TABS.length} Abschnitte</span>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div className="progress-fill progress-success" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex gap-s mt-s" style={{ flexWrap: 'wrap' }}>
            {TABS.map((t) => (
              <div key={t.id} className="flex items-center gap-xs"
                style={{ fontSize: 'var(--fs-xs)', cursor: 'pointer' }}
                onClick={() => setActiveTab(t.id)}>
                <span style={{ color: completedTabs.includes(t.id) ? 'var(--success)' : 'var(--gray-300)' }}>
                  {completedTabs.includes(t.id) ? '✓' : '○'}
                </span>
                <span style={{ color: activeTab === t.id ? 'var(--primary)' : completedTabs.includes(t.id) ? 'var(--success-text)' : 'var(--text-muted)' }}>
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="card">
        <Tabs tabs={tabsWithStatus} active={activeTab} onChange={setActiveTab} />
        <div className="tab-content">

          {/* ── Persönliche Daten ─────────────────────────────── */}
          {activeTab === 'personal' && (
            <div>
              <Alert type="info">
                Persönliche Grunddaten des Partners. Der Partner wird als eigenständiger
                virtueller Datensatz gespeichert und ist mit dem Hauptkunden verknüpft.
              </Alert>

              <Panel title="Grunddaten">
                <div className="grid-2">
                  <Select label="Anrede" value={form.sex ?? 'f'}
                    onChange={set('sex')}
                    options={[
                      { value: 'm', label: 'Herr' },
                      { value: 'f', label: 'Frau' },
                      { value: 'd', label: 'Divers' },
                    ]} />
                  <Select label="Beziehungstyp" value={form.rel_name ?? 'spouse'}
                    onChange={set('rel_name')}
                    options={[
                      { value: 'spouse',  label: 'Ehepartner/in (verheiratet)' },
                      { value: 'partner', label: 'Lebenspartner/in (unverheiratet)' },
                    ]} />
                </div>
                <div className="grid-2">
                  <Input label="Vorname *" value={form.first_name ?? ''}
                    onChange={set('first_name')} placeholder="Vorname" />
                  <Input label="Nachname *" value={form.last_name ?? ''}
                    onChange={set('last_name')} placeholder="Nachname" />
                </div>
                <div className="grid-2">
                  <Input label="Geburtsname (optional)" value={form.birth_name ?? ''}
                    onChange={set('birth_name')} placeholder="Mädchenname, etc." />
                  <Input label="Geburtsdatum *" type="date" value={form.birth_date ?? ''}
                    onChange={set('birth_date')} />
                </div>
                <div className="grid-2">
                  <Input label="Geburtsort" value={form.city_of_birth ?? ''}
                    onChange={set('city_of_birth')} placeholder="Hamburg" />
                  <Select label="Staatsangehörigkeit" value={form.nationality ?? 'deutsch'}
                    onChange={set('nationality')}
                    options={[
                      { value: 'deutsch',  label: 'Deutsch' },
                      { value: 'eu',       label: 'EU-Bürger/in' },
                      { value: 'sonstig',  label: 'Sonstige' },
                    ]} />
                </div>
              </Panel>

              <Panel title="Beziehungsstatus im Haushalt">
                <div style={{ display: 'grid', gap: 'var(--sp-m)' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 'var(--sp-m)', background: 'var(--gray-50)',
                    borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                  }}>
                    <div>
                      <div className="font-bold text-sm">Gleiche Adresse wie Hauptperson</div>
                      <div className="text-xs text-grey">Wohnt im gleichen Haushalt</div>
                    </div>
                    <Toggle checked={true} onChange={() => {}} />
                  </div>
                  <Alert type="success">
                    Tipp: Verwenden Sie „Daten übernehmen" oben, um Nachname und
                    Adresse des Hauptkunden automatisch zu übertragen.
                  </Alert>
                </div>
              </Panel>
            </div>
          )}

          {/* ── Kontakt & Adresse ─────────────────────────────── */}
          {activeTab === 'contact' && (
            <div>
              <Panel title="Kontaktdaten">
                <Input label="E-Mail" type="email" value={form.email ?? ''}
                  onChange={set('email')} placeholder="partner@email.de" />
                <div className="grid-2">
                  <Input label="Telefon" value={form.phone ?? ''}
                    onChange={set('phone')} placeholder="+49 89 ..." />
                  <Input label="Mobilnummer" value={form.mobile ?? ''}
                    onChange={set('mobile')} placeholder="+49 170 ..." />
                </div>
              </Panel>

              <Panel title="Wohnadresse">
                <div style={{ marginBottom: 'var(--sp-m)' }}>
                  <button className="btn btn-secondary btn-sm" onClick={handleCopyFromMain}>
                    📋 Adresse vom Hauptkunden übernehmen
                  </button>
                </div>
                <Input label="Straße & Hausnummer" value={form.street ?? ''}
                  onChange={set('street')} placeholder="Musterstraße 42" />
                <div className="grid-2">
                  <Input label="PLZ" value={form.zip ?? ''}
                    onChange={set('zip')} placeholder="80331" />
                  <Input label="Stadt" value={form.city ?? ''}
                    onChange={set('city')} placeholder="München" />
                </div>
              </Panel>
            </div>
          )}

          {/* ── Beruf & Einkommen ─────────────────────────────── */}
          {activeTab === 'employment' && (
            <div>
              <Panel title="Berufliche Situation">
                <div className="grid-2">
                  <Select label="Beschäftigungsstatus" value={form.employment ?? 'angestellt'}
                    onChange={set('employment')} options={EMPLOYMENT_OPTIONS} />
                  <Input label="Berufsbezeichnung" value={form.profession ?? ''}
                    onChange={set('profession')} placeholder="z.B. Lehrerin" />
                </div>
                <Input label="Arbeitgeber / Unternehmen" value={form.employer ?? ''}
                  onChange={set('employer')} placeholder="Musterfirma GmbH" />
                <div className="grid-2">
                  <Input label="Beschäftigt seit" type="date" value={form.employed_since ?? ''}
                    onChange={set('employed_since')} />
                </div>
              </Panel>

              <Panel title="Einkommensdaten">
                <div className="grid-2">
                  <Input label="Bruttogehalt (€/Monat)" type="number"
                    value={String(form.salary_gross ?? '')}
                    onChange={(v) => setForm((p) => ({ ...p, salary_gross: parseFloat(v) || 0 }))}
                    hint="Monatliches Bruttogehalt" />
                  <Input label="Nettogehalt (€/Monat)" type="number"
                    value={String(form.salary_net ?? '')}
                    onChange={(v) => setForm((p) => ({ ...p, salary_net: parseFloat(v) || 0 }))}
                    hint="Monatliches Nettogehalt" />
                </div>

                {/* Live net income display */}
                {(form.salary_gross || form.salary_net) ? (
                  <div style={{
                    background: 'var(--primary-tint)',
                    borderRadius: 'var(--radius)',
                    padding: 'var(--sp-m)',
                    marginTop: 'var(--sp-m)',
                    border: '1px solid var(--primary-tint2)',
                  }}>
                    <div className="text-xs text-grey font-bold" style={{ marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Einkommensübersicht Partner
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-m)' }}>
                      <div>
                        <div className="text-xs text-grey">Brutto/Monat</div>
                        <div className="font-bold" style={{ color: 'var(--primary)', fontSize: 'var(--fs-ml)' }}>
                          {(form.salary_gross ?? 0).toLocaleString('de-DE')} €
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-grey">Netto/Monat</div>
                        <div className="font-bold" style={{ color: 'var(--success-text)', fontSize: 'var(--fs-ml)' }}>
                          {(form.salary_net ?? 0).toLocaleString('de-DE')} €
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {form.employment === 'rentner' && (
                  <Alert type="info">
                    Bei Rentnern bitte Renteneinnahmen unter „Altersvorsorge" erfassen.
                  </Alert>
                )}
              </Panel>
            </div>
          )}

          {/* ── Krankenversicherung ───────────────────────────── */}
          {activeTab === 'health' && (
            <div>
              <Panel title="Krankenversicherung">
                <Select label="Art der Krankenversicherung" value={form.kv_type ?? 'gesetzlich'}
                  onChange={set('kv_type')} options={KV_OPTIONS} />
                <div className="grid-2">
                  <Input label="Anbieter / Kasse" value={form.kv_provider ?? ''}
                    onChange={set('kv_provider')} placeholder="z.B. TK, AOK, Allianz" />
                  <Input label="Monatlicher Beitrag (€)" type="number"
                    value={String(form.kv_monthly ?? '')}
                    onChange={(v) => setForm((p) => ({ ...p, kv_monthly: parseFloat(v) || 0 }))} />
                </div>

                {form.kv_type === 'privat' && (
                  <Alert type="warning">
                    Bei PKV: Bitte beachten Sie, dass Beiträge im Alter stark steigen können.
                    Dies sollte in der Altersvorsorgeplanung berücksichtigt werden.
                  </Alert>
                )}
              </Panel>

              <Panel title="Gesundheitliche Angaben">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-m)' }}>
                  <div>
                    <div className="font-bold text-sm">Raucher/in</div>
                    <div className="text-xs text-grey">Relevant für Versicherungskonditionen</div>
                  </div>
                  <Toggle checked={form.smoker ?? false} onChange={set('smoker')} />
                </div>

                {form.smoker && (
                  <Alert type="warning">
                    Als Raucher/in können sich Versicherungsprämien (besonders BU und Risiko-Leben)
                    erhöhen. Bitte im Versicherungstab berücksichtigen.
                  </Alert>
                )}
              </Panel>
            </div>
          )}

          {/* ── Altersvorsorge ────────────────────────────────── */}
          {activeTab === 'retirement' && (
            <div>
              <Panel title="Rentenwünsche">
                <div className="grid-2">
                  <Input label="Gewünschtes Rentenalter" type="number"
                    value={String(form.retirement_age ?? 65)}
                    onChange={(v) => setForm((p) => ({ ...p, retirement_age: parseInt(v) || 65 }))} />
                </div>
              </Panel>

              <Panel title="Bestehende Rentenansprüche">
                <Input label="Erwartete gesetzliche Rente (€/Monat)" type="number"
                  value={String(form.state_pension ?? '')}
                  onChange={(v) => setForm((p) => ({ ...p, state_pension: parseFloat(v) || 0 }))}
                  hint="Aus dem Rentenbescheid entnehmen" />

                {/* Retirement gap display */}
                {form.state_pension !== undefined && (
                  <div style={{
                    marginTop: 'var(--sp-m)',
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 'var(--sp-m)',
                  }}>
                    {[
                      { label: 'Gesetzl. Rente', value: `${(form.state_pension ?? 0).toLocaleString('de-DE')} €`, color: 'var(--success-text)' },
                      { label: 'Akt. Nettoeinkommen', value: `${(form.salary_net ?? 0).toLocaleString('de-DE')} €`, color: 'var(--primary)' },
                      {
                        label: 'Vorläufige Lücke',
                        value: `${Math.max(0, (form.salary_net ?? 0) * 0.8 - (form.state_pension ?? 0)).toLocaleString('de-DE')} €`,
                        color: 'var(--danger-text)',
                      },
                    ].map((item) => (
                      <div key={item.label} style={{
                        padding: 'var(--sp-m)',
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        textAlign: 'center',
                      }}>
                        <div className="text-xs text-grey" style={{ marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontWeight: 800, color: item.color, fontSize: 'var(--fs-ml)', fontFamily: 'var(--font-headlines)' }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 'var(--sp-m)' }}>
                  <Alert type="info">
                    Die vollständige Altersvorsorgeanalyse für den Partner erfolgt
                    im Analyse-Modul unter „Altersvorsorge".
                  </Alert>
                </div>
              </Panel>
            </div>
          )}

          {/* ── Versicherungen ────────────────────────────────── */}
          {activeTab === 'insurances' && (
            <div>
              <Alert type="info">
                Erfassen Sie bestehende Versicherungen des Partners. Diese fließen
                in die gemeinsame Haushaltsanalyse ein.
              </Alert>

              {[
                {
                  key: 'has_bu', coverKey: 'bu_coverage',
                  label: 'Berufsunfähigkeitsversicherung (BU)',
                  icon: '🛡️',
                  coverLabel: 'BU-Monatsrente (€)',
                  note: form.smoker ? 'Als Raucher/in können Prämien erhöht sein.' : undefined,
                },
                {
                  key: 'has_life', coverKey: 'life_coverage',
                  label: 'Risikolebensversicherung',
                  icon: '❤️',
                  coverLabel: 'Versicherungssumme (€)',
                  note: undefined,
                },
              ].map(({ key, coverKey, label, icon, coverLabel, note }) => (
                <Panel key={key} title={`${icon} ${label}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-m)' }}>
                    <div>
                      <div className="font-bold text-sm">{label} vorhanden</div>
                      <div className="text-xs text-grey">Bestehendes Produkt beim Partner</div>
                    </div>
                    <Toggle
                      checked={(form as Record<string, unknown>)[key] as boolean ?? false}
                      onChange={(v: boolean) => setForm((p) => ({ ...p, [key]: v }))}
                    />
                  </div>
                  {!!(form as Record<string, unknown>)[key] && (
                    <div className="grid-2">
                      <Input label={coverLabel} type="number"
                        value={String((form as Record<string, unknown>)[coverKey] ?? '')}
                        onChange={(v) => setForm((p) => ({ ...p, [coverKey]: parseFloat(v) || 0 }))} />
                    </div>
                  )}
                  {note && <Alert type="warning">{note}</Alert>}
                </Panel>
              ))}

              {/* Summary */}
              <Panel title="Zusammenfassung">
                <div style={{ display: 'grid', gap: 'var(--sp-s)' }}>
                  {[
                    { label: 'BU-Versicherung',          ok: form.has_bu,   miss: 'Nicht vorhanden — Absicherung prüfen!' },
                    { label: 'Risikolebensversicherung',  ok: form.has_life, miss: 'Nicht vorhanden' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between"
                      style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <span className="text-sm font-bold">{row.label}</span>
                      {row.ok
                        ? <span className="badge badge-success">✓ Vorhanden</span>
                        : <span className="badge badge-danger">✗ {row.miss}</span>
                      }
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between" style={{ marginTop: 'var(--sp-m)' }}>
        <button className="btn btn-secondary"
          disabled={TABS.findIndex((t) => t.id === activeTab) === 0}
          onClick={() => {
            const i = TABS.findIndex((t) => t.id === activeTab);
            if (i > 0) setActiveTab(TABS[i - 1].id);
          }}>
          ← Zurück
        </button>
        <div className="flex gap-s">
          <button className="btn btn-secondary" onClick={() => handleSave(true)} disabled={saving}>
            {saving ? 'Speichert…' : '💾 Speichern'}
          </button>
          <button className="btn btn-primary" onClick={handleNextTab} disabled={saving}>
            {TABS.findIndex((t) => t.id === activeTab) === TABS.length - 1
              ? '✓ Abschließen'
              : 'Weiter →'}
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <Modal title="Partner entfernen" onClose={() => setShowDeleteConfirm(false)}>
          <div style={{ padding: 'var(--sp-m)', display: 'grid', gap: 'var(--sp-m)' }}>
            <Alert type="danger">
              <strong>Achtung:</strong> Der virtuelle Datensatz von{' '}
              <strong>{partner.first_name} {partner.last_name}</strong> wird
              vollständig gelöscht. Alle erfassten Partnerdaten gehen verloren.
              Diese Aktion kann nicht rückgängig gemacht werden.
            </Alert>

            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)' }}>
              <div className="text-sm font-bold" style={{ marginBottom: 8 }}>Folgendes wird gelöscht:</div>
              <div style={{ display: 'grid', gap: 6, fontSize: 'var(--fs-s)', color: 'var(--text-muted)' }}>
                <div>✗ Persönliche Daten des Partners</div>
                <div>✗ Berufs- und Einkommensdaten</div>
                <div>✗ Versicherungsdaten des Partners</div>
                <div>✗ Beziehungsverknüpfung mit Hauptkunden</div>
                <div>✗ Virtueller Kundendatensatz ({partner.id})</div>
              </div>
            </div>

            <div className="flex gap-s justify-end">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Abbrechen
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Wird entfernt…' : '🗑 Endgültig entfernen'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
};
