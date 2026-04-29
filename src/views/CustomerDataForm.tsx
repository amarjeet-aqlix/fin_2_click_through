import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Tabs, Panel, Input, Select, Alert, Badge, Toggle, EmptyState, LoadingCenter, Modal, Avatar, SectionHeader } from '../components/UI';
import { useApp } from '../context';
import { CUSTOMERS, WISHES_OPTIONS } from '../mock';
import type { Customer } from '../types';

// ── Mock form data ───────────────────────────────────────────
const INITIAL_FORM = {
  // Stammdaten
  title: '',
  nationality: 'deutsch',
  marital_status: 'verheiratet',
  employment: 'angestellt',
  employer: 'Musterfirma GmbH',
  profession: 'Ingenieur',
  income_type: 'brutto',

  // Familie
  has_partner: true,
  partner_first_name: 'Anna',
  partner_last_name: 'Hoffmann',
  partner_birth_date: '1980-06-20',
  partner_employment: 'angestellt',
  partner_profession: 'Lehrerin',
  partner_income: '2200',

  children: [
    { id: 'ch1', first_name: 'Lena', last_name: 'Hoffmann', birth_date: '2010-03-15', in_household: true },
    { id: 'ch2', first_name: 'Max', last_name: 'Hoffmann', birth_date: '2013-08-22', in_household: true },
  ],

  // Einkommen & Ausgaben
  gross_salary: '6800',
  net_salary: '4800',
  rental_income: '0',
  other_income: '200',
  rent: '1450',
  insurance_expenses: '380',
  loan_payments: '520',
  living_costs: '1800',
  other_expenses: '300',
  savings_total: '28000',
  checking_balance: '4500',

  // Altersvorsorge
  retirement_age: '65',
  monthly_retirement_need: '3500',
  pension_type: 'gesetzlich',
  state_pension: '1820',
  company_pension: '0',
  private_pension_monthly: '150',
  riester_contract: true,
  ruerup_contract: false,
  bav_contract: false,

  // Versicherungen
  has_bu: true,
  bu_coverage: '2500',
  bu_provider: 'Allianz',
  has_life: true,
  life_coverage: '300000',
  life_provider: 'HUK-Coburg',
  has_liability: true,
  liability_coverage: '5000000',
  has_accident: false,
  has_dread: false,
  has_legal: false,

  // Gesundheit & KV
  kv_type: 'gesetzlich',
  kv_provider: 'TK',
  kv_monthly: '350',
  smoker: false,
  bmi: '24',
  pre_existing: false,
  pre_existing_details: '',

  // Immobilien
  housing_situation: 'mieter',
  house_value: '',
  house_debt: '',
  house_monthly_rate: '',
  house_year_built: '',
  house_sqm: '',
  has_second_property: false,

  // Fahrzeuge
  vehicles: [
    { id: 'v1', type: 'PKW', brand: 'VW', model: 'Golf', year: '2020', value: '18000', insured: true },
  ],

  // Ziele
  wishes: ['Eigenheim', 'Altersvorsorge', 'Reisen'],
  risk_profile: 'ausgewogen',
  investment_horizon: '20',
};

const EMPLOYMENT_OPTIONS = [
  { value: 'angestellt', label: 'Angestellt' },
  { value: 'selbststaendig', label: 'Selbständig' },
  { value: 'beamter', label: 'Beamter/in' },
  { value: 'rentner', label: 'Rentner/in' },
  { value: 'student', label: 'Student/in' },
  { value: 'arbeitslos', label: 'Nicht berufstätig' },
];

const MARITAL_OPTIONS = [
  { value: 'ledig', label: 'Ledig' },
  { value: 'verheiratet', label: 'Verheiratet' },
  { value: 'geschieden', label: 'Geschieden' },
  { value: 'verwitwet', label: 'Verwitwet' },
  { value: 'lebenspartnerschaft', label: 'Eingetragene Lebenspartnerschaft' },
];

const KV_OPTIONS = [
  { value: 'gesetzlich', label: 'Gesetzlich versichert (GKV)' },
  { value: 'privat', label: 'Privat versichert (PKV)' },
  { value: 'beihilfe', label: 'Beihilfe + PKV' },
];

const TABS = [
  { id: 'stammdaten', label: 'Stammdaten', icon: '👤' },
  { id: 'familie', label: 'Familie', icon: '👨‍👩‍👧' },
  { id: 'einkommen', label: 'Einkommen & Ausgaben', icon: '💶' },
  { id: 'altersvorsorge', label: 'Altersvorsorge', icon: '🎯' },
  { id: 'versicherungen', label: 'Versicherungen', icon: '🛡️' },
  { id: 'gesundheit', label: 'Gesundheit & KV', icon: '🏥' },
  { id: 'immobilien', label: 'Immobilien', icon: '🏠' },
  { id: 'fahrzeuge', label: 'Fahrzeuge', icon: '🚗' },
  { id: 'ziele', label: 'Ziele & Wünsche', icon: '🎯' },
];

export const CustomerDataForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState('stammdaten');
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newChild, setNewChild] = useState({ first_name: '', last_name: '', birth_date: '', in_household: true });
  const [newVehicle, setNewVehicle] = useState({ type: 'PKW', brand: '', model: '', year: '', value: '', insured: true });
  const [completedTabs, setCompletedTabs] = useState<string[]>(['stammdaten', 'familie']);

  const upd = (key: string) => (v: string | boolean) => setForm((p) => ({ ...p, [key]: v }));

  useEffect(() => {
    setTimeout(() => {
      const c = CUSTOMERS.find((x) => x.id === id);
      setCustomer(c ?? null);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleSave = async (showToast = true) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    if (!completedTabs.includes(activeTab)) setCompletedTabs((p) => [...p, activeTab]);
    if (showToast) addToast('success', 'Änderungen wurden gespeichert.');
  };

  const handleNextTab = async () => {
    await handleSave(false);
    const idx = TABS.findIndex((t) => t.id === activeTab);
    if (idx < TABS.length - 1) {
      setActiveTab(TABS[idx + 1].id);
      addToast('success', `"${TABS[idx].label}" gespeichert.`);
    } else {
      addToast('success', 'Alle Daten gespeichert! Beratungsdaten sind vollständig.');
      navigate(`/customers/${id}`);
    }
  };

  const handleAddChild = () => {
    const child = { id: `ch${Date.now()}`, ...newChild };
    setForm((p) => ({ ...p, children: [...p.children, child] }));
    setShowAddChild(false);
    setNewChild({ first_name: '', last_name: '', birth_date: '', in_household: true });
    addToast('success', 'Kind wurde hinzugefügt.');
  };

  const handleAddVehicle = () => {
    const v = { id: `v${Date.now()}`, ...newVehicle };
    setForm((p) => ({ ...p, vehicles: [...p.vehicles, v] }));
    setShowAddVehicle(false);
    setNewVehicle({ type: 'PKW', brand: '', model: '', year: '', value: '', insured: true });
    addToast('success', 'Fahrzeug wurde hinzugefügt.');
  };

  const progress = Math.round((completedTabs.length / TABS.length) * 100);

  const tabsWithStatus = TABS.map((t) => ({
    ...t,
    label: completedTabs.includes(t.id) ? `✓ ${t.label}` : t.label,
  }));

  if (loading) return <AppLayout title="Kundendaten"><LoadingCenter text="Formulardaten werden geladen..." /></AppLayout>;
  if (!customer) return <AppLayout title="Fehler"><EmptyState icon="❓" text="Kunde nicht gefunden" action={<button className="btn btn-primary" onClick={() => navigate('/customers')}>← Zurück</button>} /></AppLayout>;

  return (
    <AppLayout title={`Datenerfassung – ${customer.first_name} ${customer.last_name}`}>
      {/* Header */}
      <div className="breadcrumb">
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/customers')}>Kunden</span>
        <span className="breadcrumb-sep">›</span>
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate(`/customers/${id}`)}>{customer.first_name} {customer.last_name}</span>
        <span className="breadcrumb-sep">›</span>
        <span>Datenerfassung</span>
      </div>

      {/* Progress bar */}
      <div className="card" style={{ marginBottom: 'var(--sp-m)', padding: 'var(--sp-m)' }}>
        <div className="flex justify-between items-center mb-s">
          <span className="text-sm font-bold">Formularfortschritt</span>
          <span className="text-sm text-grey">{completedTabs.length} / {TABS.length} Abschnitte abgeschlossen</span>
        </div>
        <div className="progress-bar" style={{ height: 10 }}>
          <div className="progress-fill progress-success" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-s mt-s" style={{ flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <div key={t.id} className="flex items-center gap-xs" style={{ fontSize: 'var(--fs-xs)' }}>
              <span style={{ color: completedTabs.includes(t.id) ? 'var(--color-green)' : 'var(--gray-dark)' }}>
                {completedTabs.includes(t.id) ? '✓' : '○'}
              </span>
              <span className={completedTabs.includes(t.id) ? 'text-success' : 'text-grey'}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="card">
        <Tabs tabs={tabsWithStatus} active={activeTab} onChange={setActiveTab} />
        <div className="tab-content">

          {/* ── Stammdaten ─────────────────────────────────────── */}
          {activeTab === 'stammdaten' && (
            <div>
              <Alert type="info">Bitte erfassen Sie alle persönlichen Grunddaten des Kunden.</Alert>
              <Panel title="Persönliche Daten">
                <div className="form-row">
                  <Select label="Anrede" value={customer.sex} onChange={() => {}} options={[{ value: 'm', label: 'Herr' }, { value: 'f', label: 'Frau' }, { value: 'd', label: 'Divers' }]} />
                  <Input label="Titel (optional)" value={form.title} onChange={upd('title')} placeholder="Dr., Prof., etc." />
                </div>
                <div className="form-row">
                  <Input label="Vorname" value={customer.first_name} onChange={() => {}} />
                  <Input label="Nachname" value={customer.last_name} onChange={() => {}} />
                </div>
                <div className="form-row">
                  <Input label="Geburtsdatum" type="date" value={customer.birth_date} onChange={() => {}} />
                  <Input label="Geburtsort" value="München" onChange={() => {}} />
                </div>
                <div className="form-row">
                  <Select label="Staatsangehörigkeit" value={form.nationality} onChange={upd('nationality')} options={[{ value: 'deutsch', label: 'Deutsch' }, { value: 'eu', label: 'EU-Bürger' }, { value: 'sonstig', label: 'Sonstige' }]} />
                  <Select label="Familienstand" value={form.marital_status} onChange={upd('marital_status')} options={MARITAL_OPTIONS} />
                </div>
              </Panel>

              <Panel title="Kontaktdaten">
                <Input label="E-Mail" type="email" value={customer.email} onChange={() => {}} />
                <Input label="Telefon" value={customer.phone} onChange={() => {}} />
                <Input label="Mobilnummer" value="+49 170 9876543" onChange={() => {}} />
                <div className="form-row">
                  <Input label="Straße & Hausnummer" value={customer.address.street || 'Musterstraße 42'} onChange={() => {}} />
                </div>
                <div className="form-row">
                  <Input label="PLZ" value={customer.address.zip || '80331'} onChange={() => {}} />
                  <Input label="Stadt" value={customer.address.city || 'München'} onChange={() => {}} />
                </div>
              </Panel>

              <Panel title="Berufliche Situation">
                <div className="form-row">
                  <Select label="Beschäftigungsstatus" value={form.employment} onChange={upd('employment')} options={EMPLOYMENT_OPTIONS} />
                  <Input label="Berufsbezeichnung" value={form.profession} onChange={upd('profession')} placeholder="Ingenieur" />
                </div>
                <Input label="Arbeitgeber / Unternehmen" value={form.employer} onChange={upd('employer')} placeholder="Musterfirma GmbH" />
                <div className="form-row">
                  <Input label="Beschäftigt seit" type="date" value="2015-04-01" onChange={() => {}} />
                  <Select label="Einkommensart" value={form.income_type} onChange={upd('income_type')} options={[{ value: 'brutto', label: 'Brutto' }, { value: 'netto', label: 'Netto' }]} />
                </div>
              </Panel>
            </div>
          )}

          {/* ── Familie ────────────────────────────────────────── */}
          {activeTab === 'familie' && (
            <div>
              <Panel title="Partnerdaten" action={<Toggle checked={form.has_partner} onChange={upd('has_partner')} label="Partner vorhanden" />}>
                {form.has_partner ? (
                  <>
                    <div className="form-row">
                      <Input label="Vorname Partner/in" value={form.partner_first_name} onChange={upd('partner_first_name')} />
                      <Input label="Nachname Partner/in" value={form.partner_last_name} onChange={upd('partner_last_name')} />
                    </div>
                    <div className="form-row">
                      <Input label="Geburtsdatum" type="date" value={form.partner_birth_date} onChange={upd('partner_birth_date')} />
                      <Select label="Beschäftigung" value={form.partner_employment} onChange={upd('partner_employment')} options={EMPLOYMENT_OPTIONS} />
                    </div>
                    <div className="form-row">
                      <Input label="Beruf" value={form.partner_profession} onChange={upd('partner_profession')} />
                      <Input label="Nettoeinkommen (€/Monat)" type="number" value={form.partner_income} onChange={upd('partner_income')} />
                    </div>
                    <Select label="Krankenversicherung Partner" value="gesetzlich" onChange={() => {}} options={KV_OPTIONS} />
                  </>
                ) : (
                  <div className="text-sm text-grey" style={{ padding: 'var(--sp-m) 0' }}>Kein Partner vorhanden.</div>
                )}
              </Panel>

              <Panel title="Kinder" action={<button className="btn btn-primary btn-sm" onClick={() => setShowAddChild(true)}>+ Kind hinzufügen</button>}>
                {form.children.length === 0 ? (
                  <EmptyState icon="👶" text="Keine Kinder erfasst" sub="Fügen Sie Kinder hinzu falls vorhanden." />
                ) : (
                  <table>
                    <thead><tr><th>Name</th><th>Geburtsdatum</th><th>Im Haushalt</th><th></th></tr></thead>
                    <tbody>
                      {form.children.map((c, i) => (
                        <tr key={c.id}>
                          <td className="font-bold text-sm">{c.first_name} {c.last_name}</td>
                          <td className="text-sm">{c.birth_date ? new Date(c.birth_date).toLocaleDateString('de-DE') : '—'}</td>
                          <td><Badge type={c.in_household ? 'success' : 'neutral'}>{c.in_household ? 'Ja' : 'Nein'}</Badge></td>
                          <td>
                            <button className="btn btn-danger btn-sm" onClick={() => setForm((p) => ({ ...p, children: p.children.filter((_, j) => j !== i) }))}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Panel>

              <Panel title="Unterhaltsverpflichtungen">
                <Toggle checked={false} onChange={() => {}} label="Unterhaltspflichten vorhanden" />
                <div className="text-xs text-grey mt-s">Bei Ja: Monatliche Unterhaltsbeträge erfassen</div>
              </Panel>
            </div>
          )}

          {/* ── Einkommen & Ausgaben ───────────────────────────── */}
          {activeTab === 'einkommen' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)' }}>
              <div>
                <Panel title="Einnahmen (monatlich)">
                  <Input label="Bruttogehalt (€)" type="number" value={form.gross_salary} onChange={upd('gross_salary')} hint="Ohne Sonderzahlungen" />
                  <Input label="Nettogehalt (€)" type="number" value={form.net_salary} onChange={upd('net_salary')} />
                  <Input label="Mieteinnahmen (€)" type="number" value={form.rental_income} onChange={upd('rental_income')} />
                  <Input label="Sonstige Einnahmen (€)" type="number" value={form.other_income} onChange={upd('other_income')} hint="Kindergeld, Kapitalerträge, etc." />
                  {form.has_partner && (
                    <Input label="Nettoeinkommen Partner (€)" type="number" value={form.partner_income} onChange={upd('partner_income')} />
                  )}
                  <div style={{ background: 'var(--gray-light)', padding: 'var(--sp-m)', borderRadius: 'var(--radius)', marginTop: 'var(--sp-m)' }}>
                    <div className="flex justify-between text-sm">
                      <span>Haushaltsnetto gesamt:</span>
                      <strong style={{ color: 'var(--color-green)' }}>
                        {(parseFloat(form.net_salary || '0') + parseFloat(form.partner_income || '0') + parseFloat(form.rental_income || '0') + parseFloat(form.other_income || '0')).toLocaleString('de-DE')} €
                      </strong>
                    </div>
                  </div>
                </Panel>

                <Panel title="Vermögen & Rücklagen">
                  <Input label="Gesamtersparnisse (€)" type="number" value={form.savings_total} onChange={upd('savings_total')} hint="Tagesgeld, Sparbuch, etc." />
                  <Input label="Girokontostand (€)" type="number" value={form.checking_balance} onChange={upd('checking_balance')} />
                  <Input label="Wertpapierdepot (€)" type="number" value="18500" onChange={() => {}} />
                </Panel>
              </div>

              <div>
                <Panel title="Ausgaben (monatlich)">
                  <Input label="Miete / Hypothek (€)" type="number" value={form.rent} onChange={upd('rent')} />
                  <Input label="Nebenkosten (€)" type="number" value="280" onChange={() => {}} />
                  <Input label="Versicherungsprämien (€)" type="number" value={form.insurance_expenses} onChange={upd('insurance_expenses')} />
                  <Input label="Kreditraten (€)" type="number" value={form.loan_payments} onChange={upd('loan_payments')} />
                  <Input label="Lebenshaltungskosten (€)" type="number" value={form.living_costs} onChange={upd('living_costs')} hint="Lebensmittel, Kleidung, Freizeit" />
                  <Input label="Sonstige Ausgaben (€)" type="number" value={form.other_expenses} onChange={upd('other_expenses')} />
                  <div style={{ background: 'var(--gray-light)', padding: 'var(--sp-m)', borderRadius: 'var(--radius)', marginTop: 'var(--sp-m)' }}>
                    <div className="flex justify-between text-sm">
                      <span>Gesamtausgaben:</span>
                      <strong style={{ color: 'var(--color-red)' }}>
                        {(parseFloat(form.rent) + parseFloat(form.insurance_expenses) + parseFloat(form.loan_payments) + parseFloat(form.living_costs) + parseFloat(form.other_expenses) + 280).toLocaleString('de-DE')} €
                      </strong>
                    </div>
                    <div className="flex justify-between text-sm mt-s">
                      <span className="font-bold">Frei verfügbar:</span>
                      <strong style={{ color: 'var(--primary)' }}>
                        {(parseFloat(form.net_salary || '0') + parseFloat(form.partner_income || '0') - parseFloat(form.rent) - parseFloat(form.insurance_expenses) - parseFloat(form.loan_payments) - parseFloat(form.living_costs) - parseFloat(form.other_expenses) - 280).toLocaleString('de-DE')} €
                      </strong>
                    </div>
                  </div>
                </Panel>

                <Panel title="Schulden & Verbindlichkeiten">
                  <Input label="Konsumentenkredit (€)" type="number" value="0" onChange={() => {}} />
                  <Input label="Autokredit (€)" type="number" value="0" onChange={() => {}} />
                  <Input label="Immobilienfinanzierung (€)" type="number" value="0" onChange={() => {}} />
                  <Input label="Sonstige Schulden (€)" type="number" value="0" onChange={() => {}} />
                </Panel>
              </div>
            </div>
          )}

          {/* ── Altersvorsorge ─────────────────────────────────── */}
          {activeTab === 'altersvorsorge' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)' }}>
              <div>
                <Panel title="Rentenwünsche">
                  <Input label="Gewünschtes Rentenalter" type="number" value={form.retirement_age} onChange={upd('retirement_age')} hint="Reguläres Renteneintrittsalter: 67 Jahre" />
                  <Input label="Gewünschtes Monatseinkommen im Ruhestand (€)" type="number" value={form.monthly_retirement_need} onChange={upd('monthly_retirement_need')} hint="Nettobedarf im Ruhestand" />
                  <Select label="Primäre Rentenart" value={form.pension_type} onChange={upd('pension_type')} options={[
                    { value: 'gesetzlich', label: 'Gesetzliche Rente' },
                    { value: 'beamten', label: 'Beamtenversorgung' },
                    { value: 'selbststaendig', label: 'Selbständig (keine GRV)' },
                  ]} />
                  <Select label="Risikoprofil für Altersvorsorge" value={form.risk_profile} onChange={upd('risk_profile')} options={[
                    { value: 'konservativ', label: 'Konservativ (Kapitalerhalt)' },
                    { value: 'ausgewogen', label: 'Ausgewogen (Wachstum & Sicherheit)' },
                    { value: 'wachstum', label: 'Wachstumsorientiert' },
                    { value: 'spekulativ', label: 'Spekulativ (max. Rendite)' },
                  ]} />
                </Panel>

                <Panel title="Bestehende Vorsorge">
                  <Input label="Gesetzliche Rente (Rentenbescheid) (€)" type="number" value={form.state_pension} onChange={upd('state_pension')} hint="Aus aktuellem Rentenbescheid" />
                  <Input label="Betriebliche Altersvorsorge (€/Monat)" type="number" value={form.company_pension} onChange={upd('company_pension')} />
                  <Input label="Private Rentenversicherung (€/Monat)" type="number" value={form.private_pension_monthly} onChange={upd('private_pension_monthly')} />
                </Panel>
              </div>

              <div>
                <Panel title="Vorsorgeprodukte">
                  {[
                    { key: 'riester_contract', label: 'Riester-Rente', desc: 'Staatlich geförderter Rentenvertrag' },
                    { key: 'ruerup_contract', label: 'Rürup-Rente (Basis-Rente)', desc: 'Steuerlich begünstigt, besonders für Selbständige' },
                    { key: 'bav_contract', label: 'Betriebliche Altersversorgung (bAV)', desc: 'Über Arbeitgeber geführter Vertrag' },
                  ].map((item) => (
                    <div key={item.key} className="flex justify-between items-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-light)' }}>
                      <div>
                        <div className="text-sm font-bold">{item.label}</div>
                        <div className="text-xs text-grey">{item.desc}</div>
                      </div>
                      <Toggle checked={(form as any)[item.key]} onChange={(v) => setForm((p) => ({ ...p, [item.key]: v }))} />
                    </div>
                  ))}
                </Panel>

                <Panel title="Investitionshorizont">
                  <Input label="Anlagehorizont (Jahre)" type="number" value={form.investment_horizon} onChange={upd('investment_horizon')} hint="Wie viele Jahre bis zur Rente?" />
                  <div style={{ background: 'var(--gray-light)', padding: 'var(--sp-m)', borderRadius: 'var(--radius)', marginTop: 'var(--sp-m)' }}>
                    <div className="text-sm font-bold mb-s">Rentenlücke (Schätzung)</div>
                    <div className="flex justify-between text-sm">
                      <span>Rentenbedarf:</span><strong>{parseInt(form.monthly_retirement_need || '0').toLocaleString('de-DE')} €</strong>
                    </div>
                    <div className="flex justify-between text-sm mt-s">
                      <span>Abgesichert:</span><strong style={{ color: 'var(--color-green)' }}>{(parseInt(form.state_pension || '0') + parseInt(form.private_pension_monthly || '0')).toLocaleString('de-DE')} €</strong>
                    </div>
                    <div className="flex justify-between text-sm mt-s font-bold">
                      <span>Lücke:</span>
                      <strong style={{ color: 'var(--color-red)' }}>
                        {Math.max(0, parseInt(form.monthly_retirement_need || '0') - parseInt(form.state_pension || '0') - parseInt(form.private_pension_monthly || '0')).toLocaleString('de-DE')} €
                      </strong>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {/* ── Versicherungen ─────────────────────────────────── */}
          {activeTab === 'versicherungen' && (
            <div>
              <Alert type="info">Erfassen Sie alle bestehenden Versicherungsverträge des Kunden.</Alert>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)' }}>
                {[
                  { key: 'has_bu', label: 'Berufsunfähigkeitsversicherung (BU)', provKey: 'bu_provider', covKey: 'bu_coverage', covLabel: 'Monatliche BU-Rente (€)', icon: '💼' },
                  { key: 'has_life', label: 'Risikolebensversicherung', provKey: 'life_provider', covKey: 'life_coverage', covLabel: 'Versicherungssumme (€)', icon: '💙' },
                  { key: 'has_liability', label: 'Haftpflichtversicherung', provKey: null, covKey: 'liability_coverage', covLabel: 'Deckungssumme (€)', icon: '🛡️' },
                  { key: 'has_accident', label: 'Unfallversicherung', provKey: null, covKey: null, covLabel: null, icon: '🩹' },
                  { key: 'has_dread', label: 'Schwere-Krankheiten-Versicherung (Dread Disease)', provKey: null, covKey: null, covLabel: null, icon: '❤️' },
                  { key: 'has_legal', label: 'Rechtsschutzversicherung', provKey: null, covKey: null, covLabel: null, icon: '⚖️' },
                ].map((ins) => (
                  <Panel key={ins.key} title={`${ins.icon} ${ins.label}`} action={<Toggle checked={(form as any)[ins.key]} onChange={(v) => setForm((p) => ({ ...p, [ins.key]: v }))} />}>
                    {(form as any)[ins.key] ? (
                      <div>
                        {ins.provKey && <Input label="Anbieter" value={(form as any)[ins.provKey]} onChange={(v) => setForm((p) => ({ ...p, [ins.provKey!]: v }))} placeholder="Versicherungsgesellschaft" />}
                        {ins.covKey && ins.covLabel && <Input label={ins.covLabel} type="number" value={(form as any)[ins.covKey]} onChange={(v) => setForm((p) => ({ ...p, [ins.covKey!]: v }))} />}
                        <Input label="Vertragsbeginn" type="date" value="" onChange={() => {}} />
                        <Input label="Monatsprämie (€)" type="number" value="" onChange={() => {}} placeholder="0" />
                      </div>
                    ) : (
                      <div className="text-sm text-grey" style={{ padding: '8px 0' }}>Nicht vorhanden → Empfehlung prüfen</div>
                    )}
                  </Panel>
                ))}
              </div>
            </div>
          )}

          {/* ── Gesundheit & KV ────────────────────────────────── */}
          {activeTab === 'gesundheit' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)' }}>
              <Panel title="Krankenversicherung (Hauptperson)">
                <Select label="Versicherungsart" value={form.kv_type} onChange={upd('kv_type')} options={KV_OPTIONS} />
                <Input label="Krankenkasse / Versicherer" value={form.kv_provider} onChange={upd('kv_provider')} placeholder="z.B. TK, AOK, Barmer" />
                <Input label="Monatlicher Beitrag (€)" type="number" value={form.kv_monthly} onChange={upd('kv_monthly')} />
                {form.kv_type === 'privat' && (
                  <Select label="PKV-Tarif" value="standard" onChange={() => {}} options={[{ value: 'basic', label: 'Basis-Tarif' }, { value: 'standard', label: 'Standard-Tarif' }, { value: 'premium', label: 'Premium-Tarif' }]} />
                )}
                <Select label="Zahnarzt-Zusatz" value="nein" onChange={() => {}} options={[{ value: 'nein', label: 'Nein' }, { value: 'ja', label: 'Ja (Tarif angeben)' }]} />
              </Panel>

              <Panel title="Gesundheitliche Angaben (für Risikoprüfung)">
                <Alert type="warning">Diese Angaben sind für Versicherungsanträge relevant und werden vertraulich behandelt.</Alert>
                <div className="form-row">
                  <Input label="Körpergröße (cm)" type="number" value="178" onChange={() => {}} />
                  <Input label="Körpergewicht (kg)" type="number" value="78" onChange={() => {}} />
                </div>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-m)' }}>
                  <div>
                    <div className="text-sm font-bold">Raucher/in</div>
                    <div className="text-xs text-grey">Aktuell oder in den letzten 5 Jahren</div>
                  </div>
                  <Toggle checked={form.smoker} onChange={upd('smoker')} />
                </div>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-m)' }}>
                  <div>
                    <div className="text-sm font-bold">Vorerkrankungen vorhanden</div>
                    <div className="text-xs text-grey">Chronische Erkrankungen, Operationen etc.</div>
                  </div>
                  <Toggle checked={form.pre_existing} onChange={upd('pre_existing')} />
                </div>
                {form.pre_existing && (
                  <div className="form-group">
                    <label className="form-label">Beschreibung der Vorerkrankungen</label>
                    <textarea className="form-control" rows={3} value={form.pre_existing_details} onChange={(e) => upd('pre_existing_details')(e.target.value)} placeholder="Diagnose, Zeitraum, Behandlung..." />
                  </div>
                )}
                <Input label="Berufliche Risikoklasse" value="normal" onChange={() => {}} hint="Für BU-Antrag relevant" />
              </Panel>

              {form.has_partner && (
                <Panel title="Krankenversicherung (Partner/in)">
                  <Select label="Versicherungsart" value="gesetzlich" onChange={() => {}} options={KV_OPTIONS} />
                  <Input label="Krankenkasse / Versicherer" value="AOK" onChange={() => {}} />
                  <Input label="Monatlicher Beitrag (€)" type="number" value="320" onChange={() => {}} />
                </Panel>
              )}
            </div>
          )}

          {/* ── Immobilien ─────────────────────────────────────── */}
          {activeTab === 'immobilien' && (
            <div>
              <Panel title="Wohnsituation">
                <Select label="Aktuelle Wohnsituation" value={form.housing_situation} onChange={upd('housing_situation')} options={[
                  { value: 'mieter', label: 'Mieter' },
                  { value: 'eigentuemer', label: 'Eigentümer (abbezahlt)' },
                  { value: 'eigentuemer_finanziert', label: 'Eigentümer (finanziert)' },
                  { value: 'eltern', label: 'Bei Eltern wohnend' },
                ]} />
                {form.housing_situation === 'mieter' && (
                  <Alert type="info">
                    Eigenheimerwerb als Wunsch/Ziel: <strong>{form.wishes.includes('Eigenheim') ? 'Ja ✓' : 'Nein'}</strong>
                  </Alert>
                )}
              </Panel>

              {(form.housing_situation === 'eigentuemer' || form.housing_situation === 'eigentuemer_finanziert') && (
                <Panel title="Immobiliendetails">
                  <div className="form-row">
                    <Input label="Geschätzter Immobilienwert (€)" type="number" value={form.house_value} onChange={upd('house_value')} />
                    <Input label="Wohnfläche (m²)" type="number" value={form.house_sqm} onChange={upd('house_sqm')} />
                  </div>
                  <div className="form-row">
                    <Input label="Baujahr" type="number" value={form.house_year_built} onChange={upd('house_year_built')} placeholder="z.B. 2005" />
                    <Select label="Immobilientyp" value="einfamilienhaus" onChange={() => {}} options={[
                      { value: 'einfamilienhaus', label: 'Einfamilienhaus' },
                      { value: 'reihenhaus', label: 'Reihenhaus' },
                      { value: 'eigentumswohnung', label: 'Eigentumswohnung' },
                      { value: 'mehrfamilienhaus', label: 'Mehrfamilienhaus' },
                    ]} />
                  </div>
                  {form.housing_situation === 'eigentuemer_finanziert' && (
                    <>
                      <div className="form-row">
                        <Input label="Restschuld (€)" type="number" value={form.house_debt} onChange={upd('house_debt')} />
                        <Input label="Monatliche Rate (€)" type="number" value={form.house_monthly_rate} onChange={upd('house_monthly_rate')} />
                      </div>
                      <Input label="Finanzierungsende (Jahr)" type="number" value="2038" onChange={() => {}} />
                    </>
                  )}
                </Panel>
              )}

              <Panel title="Weiteres Immobilienvermögen" action={<Toggle checked={form.has_second_property} onChange={upd('has_second_property')} />}>
                {form.has_second_property ? (
                  <>
                    <Input label="Art der Immobilie" value="Ferienwohnung" onChange={() => {}} />
                    <Input label="Geschätzter Wert (€)" type="number" value="" onChange={() => {}} />
                    <Input label="Monatliche Mieteinnahmen (€)" type="number" value="" onChange={() => {}} />
                  </>
                ) : (
                  <div className="text-sm text-grey">Kein weiteres Immobilienvermögen vorhanden.</div>
                )}
              </Panel>
            </div>
          )}

          {/* ── Fahrzeuge ──────────────────────────────────────── */}
          {activeTab === 'fahrzeuge' && (
            <div>
              <SectionHeader title="Fahrzeuge" action={<button className="btn btn-primary btn-sm" onClick={() => setShowAddVehicle(true)}>+ Fahrzeug hinzufügen</button>} />
              {form.vehicles.length === 0 ? (
                <EmptyState icon="🚗" text="Keine Fahrzeuge erfasst" sub="Fügen Sie Fahrzeuge des Kunden hinzu." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-m)' }}>
                  {form.vehicles.map((v, i) => (
                    <Panel key={v.id} title={`${v.type}: ${v.brand} ${v.model}`} action={
                      <button className="btn btn-danger btn-sm" onClick={() => setForm((p) => ({ ...p, vehicles: p.vehicles.filter((_, j) => j !== i) }))}>🗑 Entfernen</button>
                    }>
                      <div className="form-row">
                        <Select label="Fahrzeugtyp" value={v.type} onChange={() => {}} options={[{ value: 'PKW', label: 'PKW' }, { value: 'Motorrad', label: 'Motorrad' }, { value: 'Wohnmobil', label: 'Wohnmobil' }]} />
                        <Input label="Marke" value={v.brand} onChange={() => {}} />
                      </div>
                      <div className="form-row">
                        <Input label="Modell" value={v.model} onChange={() => {}} />
                        <Input label="Baujahr" value={v.year} onChange={() => {}} />
                      </div>
                      <div className="form-row">
                        <Input label="Zeitwert (€)" type="number" value={v.value} onChange={() => {}} />
                        <div className="form-group">
                          <label className="form-label">Vollkasko versichert</label>
                          <div className="mt-s"><Toggle checked={v.insured} onChange={() => {}} /></div>
                        </div>
                      </div>
                    </Panel>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Ziele & Wünsche ────────────────────────────────── */}
          {activeTab === 'ziele' && (
            <div>
              <Panel title="Persönliche Finanzziele">
                <p className="text-sm text-grey" style={{ marginBottom: 'var(--sp-m)' }}>
                  Wählen Sie die Finanzziele des Kunden aus. Diese bilden die Grundlage der Beratungsempfehlungen.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-s)', marginBottom: 'var(--sp-m)' }}>
                  {WISHES_OPTIONS.map((w) => {
                    const sel = form.wishes.includes(w);
                    return (
                      <button
                        key={w}
                        className={`btn ${sel ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setForm((p) => ({ ...p, wishes: sel ? p.wishes.filter((x) => x !== w) : [...p.wishes, w] }))}
                      >
                        {sel ? '✓ ' : '+ '}{w}
                      </button>
                    );
                  })}
                </div>
                {form.wishes.length > 0 && (
                  <Alert type="success">Ausgewählt: <strong>{form.wishes.join(', ')}</strong></Alert>
                )}
              </Panel>

              <Panel title="Risikobereitschaft">
                <p className="text-sm text-grey" style={{ marginBottom: 'var(--sp-m)' }}>Wie risikobereit ist der Kunde bei Geldanlagen?</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--sp-s)' }}>
                  {[
                    { value: 'konservativ', label: 'Konservativ', desc: 'Kapitalschutz Priorität', color: '#e8f5e1' },
                    { value: 'ausgewogen', label: 'Ausgewogen', desc: 'Rendite & Sicherheit', color: '#e3f0ff' },
                    { value: 'wachstum', label: 'Wachstum', desc: 'Renditeorientiert', color: '#fff3e0' },
                    { value: 'spekulativ', label: 'Spekulativ', desc: 'Maximale Rendite', color: '#fdf0f0' },
                  ].map((r) => (
                    <div
                      key={r.value}
                      onClick={() => setForm((p) => ({ ...p, risk_profile: r.value }))}
                      style={{
                        border: `2px solid ${form.risk_profile === r.value ? 'var(--primary)' : 'var(--gray-border)'}`,
                        borderRadius: 'var(--radius)', padding: 'var(--sp-m)', cursor: 'pointer',
                        background: form.risk_profile === r.value ? r.color : '#fff', textAlign: 'center',
                      }}
                    >
                      <div className="font-bold text-sm">{r.label}</div>
                      <div className="text-xs text-grey mt-s">{r.desc}</div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Anmerkungen & Besonderheiten">
                <div className="form-group">
                  <label className="form-label">Individuelle Notizen zu Wünschen und Zielen</label>
                  <textarea className="form-control" rows={4} placeholder="Besondere Lebensumstände, spezifische Wünsche, Einschränkungen..." />
                </div>
              </Panel>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div style={{ padding: 'var(--sp-m) var(--sp-l)', borderTop: '1px solid var(--gray-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-light)' }}>
          <div className="flex gap-s">
            <button
              className="btn btn-secondary"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.id === activeTab);
                if (idx > 0) setActiveTab(TABS[idx - 1].id);
              }}
              disabled={activeTab === TABS[0].id}
            >
              ← Zurück
            </button>
          </div>
          <div className="flex gap-s">
            <button className="btn btn-secondary" onClick={() => handleSave()} disabled={saving}>
              {saving ? '⌛ Speichern...' : '💾 Speichern'}
            </button>
            <button className="btn btn-primary" onClick={handleNextTab} disabled={saving}>
              {activeTab === TABS[TABS.length - 1].id ? '✓ Abschließen' : 'Weiter →'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddChild && (
        <Modal title="Kind hinzufügen" onClose={() => setShowAddChild(false)} footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAddChild(false)}>Abbrechen</button>
            <button className="btn btn-primary" onClick={handleAddChild} disabled={!newChild.first_name}>Hinzufügen</button>
          </>
        }>
          <div className="form-row">
            <Input label="Vorname" value={newChild.first_name} onChange={(v) => setNewChild((p) => ({ ...p, first_name: v }))} required />
            <Input label="Nachname" value={newChild.last_name} onChange={(v) => setNewChild((p) => ({ ...p, last_name: v }))} />
          </div>
          <Input label="Geburtsdatum" type="date" value={newChild.birth_date} onChange={(v) => setNewChild((p) => ({ ...p, birth_date: v }))} />
          <Toggle checked={newChild.in_household} onChange={(v) => setNewChild((p) => ({ ...p, in_household: v }))} label="Im Haushalt wohnhaft" />
        </Modal>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <Modal title="Fahrzeug hinzufügen" onClose={() => setShowAddVehicle(false)} footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAddVehicle(false)}>Abbrechen</button>
            <button className="btn btn-primary" onClick={handleAddVehicle} disabled={!newVehicle.brand}>Hinzufügen</button>
          </>
        }>
          <div className="form-row">
            <Select label="Typ" value={newVehicle.type} onChange={(v) => setNewVehicle((p) => ({ ...p, type: v }))} options={[{ value: 'PKW', label: 'PKW' }, { value: 'Motorrad', label: 'Motorrad' }, { value: 'Wohnmobil', label: 'Wohnmobil' }]} />
            <Input label="Marke" value={newVehicle.brand} onChange={(v) => setNewVehicle((p) => ({ ...p, brand: v }))} placeholder="VW, BMW, etc." required />
          </div>
          <div className="form-row">
            <Input label="Modell" value={newVehicle.model} onChange={(v) => setNewVehicle((p) => ({ ...p, model: v }))} placeholder="Golf, 3er, etc." />
            <Input label="Baujahr" value={newVehicle.year} onChange={(v) => setNewVehicle((p) => ({ ...p, year: v }))} placeholder="2020" />
          </div>
          <Input label="Zeitwert (€)" type="number" value={newVehicle.value} onChange={(v) => setNewVehicle((p) => ({ ...p, value: v }))} />
          <Toggle checked={newVehicle.insured} onChange={(v) => setNewVehicle((p) => ({ ...p, insured: v }))} label="Vollkasko-versichert" />
        </Modal>
      )}
    </AppLayout>
  );
};
