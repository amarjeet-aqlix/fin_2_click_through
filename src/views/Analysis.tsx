import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Tabs, Panel, Input, Select, Alert, Badge, Progress, LoadingCenter, EmptyState, SectionHeader, Avatar } from '../components/UI';
import { useApp } from '../context';
import { CUSTOMERS, FINANCIAL_DATA } from '../mock';
import type { Customer, FinancialData } from '../types';

// ── Customer picker shown when no ID in URL ──────────────────
const CustomerPicker: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = CUSTOMERS.filter((c) =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <AppLayout title="Analyse">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header"><h3>Kunden für Analyse auswählen</h3></div>
          <div className="card-body">
            <div className="search-input-wrap" style={{ marginBottom: 'var(--sp-m)' }}>
              <span className="search-input-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Kunden suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            {filtered.length === 0 ? (
              <div className="empty-state"><div className="empty-state-text">Kein Kunde gefunden</div></div>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/analysis/${c.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-m)', padding: '12px', borderRadius: 'var(--radius)', cursor: 'pointer', borderBottom: '1px solid var(--gray-medium)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gray-light)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <Avatar first={c.first_name} last={c.last_name} />
                  <div style={{ flex: 1 }}>
                    <div className="font-bold text-sm">{c.first_name} {c.last_name}</div>
                    <div className="text-xs text-grey">{c.email} · {c.consultant_name}</div>
                  </div>
                  <span className="text-grey" style={{ fontSize: 18 }}>›</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const TABS = [
  { id: 'overview', label: 'Übersicht', icon: '📊' },
  { id: 'income', label: 'Einkommen', icon: '💶' },
  { id: 'retirement', label: 'Altersvorsorge', icon: '🎯' },
  { id: 'investment', label: 'Investitionen', icon: '📈' },
  { id: 'nestegg', label: 'Sparplan', icon: '🥚' },
  { id: 'insurances', label: 'Versicherungen', icon: '🛡️' },
  { id: 'house', label: 'Immobilien', icon: '🏠' },
  { id: 'decease', label: 'Todesfall', icon: '🌿' },
  { id: 'tariff', label: 'Tariffvergleich', icon: '⚖️' },
  { id: 'missing', label: 'Fehlende Felder', icon: '⚠️' },
  { id: 'idd', label: 'IDD-Formular', icon: '📄' },
  { id: 'download', label: 'Download', icon: '⬇️' },
];

// Simple bar chart using CSS
const BarChart: React.FC<{ items: { label: string; value: number; max: number; color?: string }[] }> = ({ items }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {items.map((item) => (
      <div key={item.label}>
        <div className="flex justify-between text-xs text-grey mb-s">
          <span>{item.label}</span>
          <span className="font-bold">{item.value.toLocaleString('de-DE')} €</span>
        </div>
        <div className="progress-bar" style={{ height: 12 }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(100, (item.value / item.max) * 100)}%`,
              background: item.color ?? 'var(--primary)',
              transition: 'width 0.8s ease',
            }}
          />
        </div>
      </div>
    ))}
  </div>
);

// Donut chart placeholder
const DonutChart: React.FC<{ segments: { label: string; value: number; color: string }[] }> = ({ segments }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;
  const r = 60;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-l flex-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--gray-medium)" strokeWidth="24" />
        {segments.map((seg) => {
          const pct = seg.value / total;
          const dash = pct * circ;
          const gap = circ - dash;
          const rotate = (offset / total) * 360 - 90;
          offset += seg.value;
          return (
            <circle
              key={seg.label}
              cx="80" cy="80" r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="24"
              strokeDasharray={`${dash} ${gap}`}
              strokeLinecap="butt"
              style={{ transform: `rotate(${rotate}deg)`, transformOrigin: '80px 80px', transition: 'stroke-dasharray 0.8s ease' }}
            />
          );
        })}
        <text x="80" y="76" textAnchor="middle" fontSize="13" fill="var(--text-grey)">Gesamt</text>
        <text x="80" y="94" textAnchor="middle" fontSize="14" fontWeight="bold" fill="var(--text)">{total.toLocaleString('de-DE')} €</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-s text-sm">
            <div style={{ width: 12, height: 12, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
            <span>{seg.label}</span>
            <span className="font-bold">{seg.value.toLocaleString('de-DE')} €</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Analysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [fin, setFin] = useState<FinancialData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [saved, setSaved] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Editable state for income tab
  const [incomeData, setIncomeData] = useState({ gross: '', net: '', other: '', rental: '' });
  const [retirementData, setRetirementData] = useState({ desired_age: '', monthly_need: '', state_pension: '' });
  const [newInsurance, setNewInsurance] = useState({ name: '', provider: '', type: '', premium: '' });
  const [showAddInsurance, setShowAddInsurance] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setTimeout(() => {
      const c = CUSTOMERS.find((x) => x.id === id);
      const f = FINANCIAL_DATA[id] ?? null;
      setCustomer(c ?? null);
      setFin(f);
      if (c) setIncomeData({ gross: String(f?.income.gross_salary ?? ''), net: String(f?.income.net_salary ?? ''), other: String(f?.income.other_income ?? ''), rental: String(f?.income.rental_income ?? '') });
      if (f) setRetirementData({ desired_age: String(f.retirement.desired_age), monthly_need: String(f.retirement.monthly_need), state_pension: String(f.retirement.state_pension) });
      setLoading(false);
    }, 600);
  }, [id]);

  // No customer selected — show picker (after all hooks)
  if (!id) return <CustomerPicker />;

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    addToast('success', 'Analysedaten wurden gespeichert.');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownload = async (type: string) => {
    setDownloadLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setDownloadLoading(false);
    addToast('success', `"${type}" wurde erfolgreich erstellt und steht zum Download bereit.`);
  };

  const fmtCur = (n: number) => `${n.toLocaleString('de-DE')} €`;

  if (loading) return <AppLayout title="Analyse"><LoadingCenter text="Analyse wird geladen..." /></AppLayout>;

  if (!customer) return (
    <AppLayout title="Analyse">
      <EmptyState icon="❓" text="Kunde nicht gefunden" action={<button className="btn btn-primary" onClick={() => navigate('/customers')}>← Zurück</button>} />
    </AppLayout>
  );

  const isMissingData = !fin;

  return (
    <AppLayout title={`Analyse – ${customer.first_name} ${customer.last_name}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-m">
        <div className="breadcrumb">
          <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/customers')}>Kunden</span>
          <span className="breadcrumb-sep">›</span>
          <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate(`/customers/${customer.id}`)}>{customer.first_name} {customer.last_name}</span>
          <span className="breadcrumb-sep">›</span>
          <span>Analyse</span>
        </div>
        <div className="flex gap-s">
          {saved && <Badge type="success">✓ Gespeichert</Badge>}
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/customers/${customer.id}`)}>← Zurück</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>💾 Speichern</button>
        </div>
      </div>

      {isMissingData && (
        <Alert type="warning">
          Für diesen Kunden sind noch keine Finanzdaten hinterlegt. Füllen Sie die Tabs aus, um eine vollständige Analyse zu erstellen.
        </Alert>
      )}

      <div className="card">
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        <div className="tab-content">

          {/* ── Übersicht ─────────────────────────────────────── */}
          {activeTab === 'overview' && fin && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)' }}>
                {/* Income vs. Expenses */}
                <Panel title="Einnahmen vs. Ausgaben">
                  <BarChart items={[
                    { label: 'Nettoeinkommen', value: fin.income.net_salary + (fin.income.partner_net ?? 0), max: 8000, color: 'var(--color-green)' },
                    { label: 'Lebenshaltung', value: fin.expenses.living, max: 8000, color: 'var(--primary)' },
                    { label: 'Miete/Wohnen', value: fin.expenses.rent, max: 8000, color: 'var(--secondary)' },
                    { label: 'Versicherungen', value: fin.expenses.insurance, max: 8000, color: 'var(--color-orange)' },
                    { label: 'Kredite', value: fin.expenses.loans, max: 8000, color: 'var(--color-red)' },
                  ]} />
                  <div className="divider" />
                  <div className="flex justify-between text-sm">
                    <span>Verfügbares Einkommen</span>
                    <strong style={{ color: 'var(--color-green)' }}>
                      {fmtCur(fin.income.net_salary + (fin.income.partner_net ?? 0) - fin.expenses.rent - fin.expenses.insurance - fin.expenses.loans - fin.expenses.living - fin.expenses.other)}
                    </strong>
                  </div>
                </Panel>

                {/* Investment breakdown */}
                <Panel title="Vermögensaufteilung">
                  {fin.investments.length > 0 ? (
                    <DonutChart segments={[
                      ...fin.investments.map((inv, i) => ({
                        label: inv.name,
                        value: inv.value,
                        color: ['var(--primary)', 'var(--secondary)', 'var(--color-green)', 'var(--color-orange)'][i % 4],
                      })),
                      { label: 'Barvermögen', value: fin.savings - fin.investments.reduce((s, i) => s + i.value, 0), color: 'var(--gray-dark)' },
                    ].filter((s) => s.value > 0)} />
                  ) : (
                    <EmptyState icon="📈" text="Keine Investments erfasst" />
                  )}
                </Panel>

                {/* Retirement overview */}
                <Panel title="Altersvorsorge-Status">
                  <div className="insight-row" style={{ marginBottom: 'var(--sp-m)' }}>
                    <div className="insight-box" style={{ flex: 'none', minWidth: 120 }}>
                      <div className="insight-label">Rentenlücke</div>
                      <div className="insight-value" style={{ color: 'var(--color-red)' }}>{fmtCur(fin.retirement.gap)}</div>
                      <div className="text-xs text-grey">pro Monat</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="text-sm mb-s" style={{ color: 'var(--text-grey)' }}>Gewünschtes Rentenalter: <strong>{fin.retirement.desired_age} Jahre</strong></div>
                      <div className="text-xs mb-s text-grey">Abdeckungsgrad</div>
                      <Progress
                        value={fin.retirement.state_pension + fin.retirement.private_pension}
                        max={fin.retirement.monthly_need}
                        type={(fin.retirement.state_pension + fin.retirement.private_pension) / fin.retirement.monthly_need > 0.7 ? 'success' : 'warning'}
                      />
                      <div className="flex justify-between text-xs text-grey mt-s">
                        <span>0 €</span>
                        <span>{fmtCur(fin.retirement.monthly_need)}</span>
                      </div>
                    </div>
                  </div>
                </Panel>

                {/* Quick stats */}
                <Panel title="Kennzahlen auf einen Blick">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-m)' }}>
                    {[
                      { label: 'Bruttoeinkommen', value: fmtCur(fin.income.gross_salary), icon: '💶' },
                      { label: 'Ersparnisse gesamt', value: fmtCur(fin.savings), icon: '🏦' },
                      { label: 'Versicherungen', value: fin.insurances.length, icon: '🛡️' },
                      { label: 'Investments', value: fin.investments.length, icon: '📈' },
                    ].map((k) => (
                      <div key={k.label} style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)' }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{k.icon}</div>
                        <div className="font-bold">{k.value}</div>
                        <div className="text-xs text-grey">{k.label}</div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {activeTab === 'overview' && !fin && (
            <EmptyState icon="📊" text="Keine Daten vorhanden" sub="Füllen Sie die anderen Tabs aus." />
          )}

          {/* ── Einkommen ─────────────────────────────────────── */}
          {activeTab === 'income' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)' }}>
              <div>
                <Panel title="Einkommen (Hauptperson)">
                  <Input label="Bruttogehalt / Monat (€)" type="number" value={incomeData.gross} onChange={(v) => setIncomeData((p) => ({ ...p, gross: v }))} placeholder="0" />
                  <Input label="Nettogehalt / Monat (€)" type="number" value={incomeData.net} onChange={(v) => setIncomeData((p) => ({ ...p, net: v }))} placeholder="0" />
                  <Input label="Mieteinnahmen / Monat (€)" type="number" value={incomeData.rental} onChange={(v) => setIncomeData((p) => ({ ...p, rental: v }))} placeholder="0" />
                  <Input label="Sonstige Einnahmen / Monat (€)" type="number" value={incomeData.other} onChange={(v) => setIncomeData((p) => ({ ...p, other: v }))} placeholder="0" />
                </Panel>

                <Panel title="Ausgaben">
                  {fin && (
                    <>
                      <Input label="Miete / Monat (€)" type="number" value={String(fin.expenses.rent)} onChange={() => {}} placeholder="0" />
                      <Input label="Versicherungen / Monat (€)" type="number" value={String(fin.expenses.insurance)} onChange={() => {}} placeholder="0" />
                      <Input label="Kredite / Monat (€)" type="number" value={String(fin.expenses.loans)} onChange={() => {}} placeholder="0" />
                      <Input label="Lebenshaltung / Monat (€)" type="number" value={String(fin.expenses.living)} onChange={() => {}} placeholder="0" />
                      <Input label="Sonstiges / Monat (€)" type="number" value={String(fin.expenses.other)} onChange={() => {}} placeholder="0" />
                    </>
                  )}
                </Panel>
              </div>

              <div>
                {fin && (
                  <Panel title="Einkommensübersicht">
                    <BarChart items={[
                      { label: 'Bruttogehalt', value: fin.income.gross_salary, max: fin.income.gross_salary, color: 'var(--primary)' },
                      { label: 'Nettogehalt', value: fin.income.net_salary, max: fin.income.gross_salary, color: 'var(--color-green)' },
                      { label: 'Gesamtausgaben', value: fin.expenses.rent + fin.expenses.insurance + fin.expenses.loans + fin.expenses.living + fin.expenses.other, max: fin.income.gross_salary, color: 'var(--color-red)' },
                    ]} />
                    <div className="divider" />
                    <Alert type="success">
                      Freies Einkommen: <strong>{fmtCur(fin.income.net_salary - fin.expenses.rent - fin.expenses.insurance - fin.expenses.loans - fin.expenses.living - fin.expenses.other)}</strong> / Monat
                    </Alert>
                  </Panel>
                )}
              </div>
            </div>
          )}

          {/* ── Altersvorsorge ────────────────────────────────── */}
          {activeTab === 'retirement' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)' }}>
              <Panel title="Rentenwünsche & Daten">
                <Input label="Gewünschtes Rentenalter" type="number" value={retirementData.desired_age} onChange={(v) => setRetirementData((p) => ({ ...p, desired_age: v }))} placeholder="65" />
                <Input label="Monatlicher Bedarf im Ruhestand (€)" type="number" value={retirementData.monthly_need} onChange={(v) => setRetirementData((p) => ({ ...p, monthly_need: v }))} placeholder="3000" />
                <Input label="Erwartete gesetzliche Rente (€)" type="number" value={retirementData.state_pension} onChange={(v) => setRetirementData((p) => ({ ...p, state_pension: v }))} hint="Aus dem Rentenbescheid" placeholder="1500" />

                <Select label="Inflationsannahme" value="2" onChange={() => {}} options={[
                  { value: '1', label: '1% p.a.' },
                  { value: '2', label: '2% p.a. (Standard)' },
                  { value: '3', label: '3% p.a.' },
                ]} />
                <Select label="Kapitalmarktrendite" value="5" onChange={() => {}} options={[
                  { value: '3', label: '3% (konservativ)' },
                  { value: '5', label: '5% (ausgewogen)' },
                  { value: '7', label: '7% (wachstumsorientiert)' },
                ]} />

                <button className="btn btn-primary btn-sm" onClick={handleSave}>Berechnung aktualisieren</button>
              </Panel>

              {fin && (
                <div>
                  <Panel title="Versorgungsanalyse">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-m)' }}>
                      {[
                        { label: 'Monatlicher Bedarf', value: fin.retirement.monthly_need, color: 'var(--text)', desc: 'Gewünschte Rente' },
                        { label: 'Gesetzliche Rente', value: fin.retirement.state_pension, color: 'var(--color-green)', desc: 'Aus Rentenbescheid' },
                        { label: 'Private Vorsorge', value: fin.retirement.private_pension, color: 'var(--primary)', desc: 'Bestehende Verträge' },
                        { label: 'Rentenlücke', value: fin.retirement.gap, color: 'var(--color-red)', desc: 'Zu schließende Lücke' },
                      ].map((row) => (
                        <div key={row.label}>
                          <div className="flex justify-between text-sm mb-s">
                            <span>{row.label}<span className="text-xs text-grey" style={{ marginLeft: 6 }}>({row.desc})</span></span>
                            <strong style={{ color: row.color }}>{fmtCur(row.value)}</strong>
                          </div>
                          <div className="progress-bar" style={{ height: 10 }}>
                            <div className="progress-fill" style={{ width: `${Math.min(100, (row.value / fin.retirement.monthly_need) * 100)}%`, background: row.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>

                  <Panel title="Empfehlung">
                    <Alert type={fin.retirement.gap > 1000 ? 'danger' : 'warning'}>
                      <strong>Handlungsbedarf:</strong> Zur Schließung der Rentenlücke von{' '}
                      <strong>{fmtCur(fin.retirement.gap)}/Monat</strong> wird eine zusätzliche Sparrate von ca.{' '}
                      <strong>{fmtCur(Math.round(fin.retirement.gap * 0.4))}/Monat</strong> empfohlen (bei 5% Rendite über 20 Jahre).
                    </Alert>
                    <button className="btn btn-primary btn-sm mt-m" onClick={() => setActiveTab('investment')}>
                      → Investment-Möglichkeiten ansehen
                    </button>
                  </Panel>
                </div>
              )}
            </div>
          )}

          {/* ── Investitionen ─────────────────────────────────── */}
          {activeTab === 'investment' && (
            <div>
              <SectionHeader title="Investments & Geldanlagen" action={
                <button className="btn btn-primary btn-sm" onClick={() => addToast('info', 'Neues Investment wird hinzugefügt...')}>+ Anlage hinzufügen</button>
              } />
              {fin?.investments && fin.investments.length > 0 ? (
                <div className="card">
                  <table>
                    <thead>
                      <tr>
                        <th>Bezeichnung</th><th>Typ</th><th>Aktueller Wert</th>
                        <th>Monatl. Beitrag</th><th>Rendite p.a.</th><th>Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fin.investments.map((inv) => (
                        <tr key={inv.id}>
                          <td className="font-bold text-sm">{inv.name}</td>
                          <td><Badge type="info">{inv.type}</Badge></td>
                          <td className="text-sm">{fmtCur(inv.value)}</td>
                          <td className="text-sm">{fmtCur(inv.monthly_contribution)}</td>
                          <td className="text-sm text-success font-bold">{inv.return_rate}%</td>
                          <td>
                            <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', 'Investment wird bearbeitet...')}>✏️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon="📈" text="Keine Investments" sub="Fügen Sie das erste Investment hinzu." />
              )}

              <Panel title="Simulationsrechner" action={<Badge type="info">Einfach</Badge>}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--sp-m)' }}>
                  <Input label="Monatlicher Beitrag (€)" type="number" value="300" onChange={() => {}} />
                  <Input label="Laufzeit (Jahre)" type="number" value="20" onChange={() => {}} />
                  <Select label="Rendite p.a." value="5" onChange={() => {}} options={[{ value: '3', label: '3%' }, { value: '5', label: '5%' }, { value: '7', label: '7%' }]} />
                </div>
                <div style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)', marginTop: 'var(--sp-m)' }}>
                  <div className="flex justify-between text-sm">
                    <span>Eingezahltes Kapital:</span><strong>72.000 €</strong>
                  </div>
                  <div className="flex justify-between text-sm mt-s">
                    <span>Zinsgewinne:</span><strong style={{ color: 'var(--color-green)' }}>52.436 €</strong>
                  </div>
                  <div className="flex justify-between text-sm mt-s">
                    <span className="font-bold text-primary">Endkapital:</span><strong style={{ color: 'var(--primary)', fontSize: 'var(--fs-ml)' }}>124.436 €</strong>
                  </div>
                </div>
              </Panel>
            </div>
          )}

          {/* ── Versicherungen ────────────────────────────────── */}
          {activeTab === 'insurances' && (
            <div>
              <SectionHeader title="Versicherungsübersicht" action={
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddInsurance(true)}>+ Versicherung hinzufügen</button>
              } />
              {showAddInsurance && (
                <Panel title="Neue Versicherung erfassen">
                  <div className="form-row">
                    <Input label="Bezeichnung" value={newInsurance.name} onChange={(v) => setNewInsurance((p) => ({ ...p, name: v }))} placeholder="Berufsunfähigkeitsversicherung" />
                    <Input label="Anbieter" value={newInsurance.provider} onChange={(v) => setNewInsurance((p) => ({ ...p, provider: v }))} placeholder="Allianz" />
                  </div>
                  <div className="form-row">
                    <Select label="Typ" value={newInsurance.type} onChange={(v) => setNewInsurance((p) => ({ ...p, type: v }))} options={[
                      { value: 'BU', label: 'Berufsunfähigkeit' },
                      { value: 'Leben', label: 'Risikolebens' },
                      { value: 'Haftpflicht', label: 'Haftpflicht' },
                      { value: 'Kranken', label: 'Kranken' },
                      { value: 'Sonstige', label: 'Sonstige' },
                    ]} />
                    <Input label="Monatsprämie (€)" type="number" value={newInsurance.premium} onChange={(v) => setNewInsurance((p) => ({ ...p, premium: v }))} placeholder="0" />
                  </div>
                  <div className="flex gap-s">
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowAddInsurance(false)}>Abbrechen</button>
                    <button className="btn btn-primary btn-sm" onClick={() => { setShowAddInsurance(false); addToast('success', 'Versicherung wurde hinzugefügt.'); }}>Speichern</button>
                  </div>
                </Panel>
              )}

              {fin?.insurances && fin.insurances.length > 0 ? (
                <div className="card">
                  <table>
                    <thead><tr><th>Versicherung</th><th>Typ</th><th>Anbieter</th><th>Prämie/Monat</th><th>Absicherung</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {fin.insurances.map((ins) => (
                        <tr key={ins.id}>
                          <td className="font-bold text-sm">{ins.name}</td>
                          <td><Badge type="neutral">{ins.type}</Badge></td>
                          <td className="text-sm">{ins.provider}</td>
                          <td className="text-sm">{fmtCur(ins.monthly_premium)}</td>
                          <td className="text-sm">{fmtCur(ins.coverage)}</td>
                          <td><Badge type={ins.status === 'active' ? 'success' : 'neutral'}>{ins.status === 'active' ? 'Aktiv' : 'Inaktiv'}</Badge></td>
                          <td>
                            <div className="flex gap-s">
                              <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', 'Wird bearbeitet...')}>✏️</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/analysis/${customer?.id}/precaution/${ins.type.toLowerCase()}`)}>Detail →</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon="🛡️" text="Keine Versicherungen erfasst" />
              )}
            </div>
          )}

          {/* ── Sparplan / NestEgg ────────────────────────────── */}
          {activeTab === 'nestegg' && (
            <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
              <SectionHeader title="Sparplan & Vermögensaufbau" subtitle="Zielbasiertes Sparen und Kapitalaufbau" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)' }}>
                <Panel title="Sparparameter">
                  <Input label="Monatliche Sparrate (€)" type="number" value="500" onChange={() => {}} />
                  <Input label="Einmalinvestition (€)" type="number" value="5000" onChange={() => {}} />
                  <Input label="Anlagehorizont (Jahre)" type="number" value="25" onChange={() => {}} />
                  <Select label="Anlagestrategie" value="balanced" onChange={() => {}} options={[
                    { value: 'conservative', label: 'Konservativ (3% p.a.)' },
                    { value: 'balanced', label: 'Ausgewogen (5% p.a.)' },
                    { value: 'growth', label: 'Wachstum (7% p.a.)' },
                    { value: 'aggressive', label: 'Offensiv (9% p.a.)' },
                  ]} />
                  <Select label="Inflationsbereinigung" value="yes" onChange={() => {}} options={[
                    { value: 'yes', label: 'Ja (2% p.a.)' },
                    { value: 'no', label: 'Nein' },
                  ]} />
                  <button className="btn btn-primary btn-sm" onClick={() => addToast('info', 'Berechnung aktualisiert.')}>Neu berechnen</button>
                </Panel>

                <div style={{ display: 'grid', gap: 'var(--sp-m)', alignContent: 'start' }}>
                  {[
                    { label: 'Eingezahltes Kapital', value: '155.000 €', color: 'var(--primary)', icon: '💶' },
                    { label: 'Zinsgewinne (nominal)', value: '189.320 €', color: 'var(--color-green)', icon: '📈' },
                    { label: 'Endkapital (nominal)', value: '344.320 €', color: 'var(--color-green)', icon: '🏆' },
                    { label: 'Endkapital (real, inflationsbereinigt)', value: '215.800 €', color: 'var(--secondary)', icon: '💰' },
                  ].map((item) => (
                    <div key={item.label} style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)', display: 'flex', alignItems: 'center', gap: 'var(--sp-m)' }}>
                      <span style={{ fontSize: 28 }}>{item.icon}</span>
                      <div>
                        <div className="text-xs text-grey">{item.label}</div>
                        <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: item.color }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Panel title="Kapitalentwicklung über die Zeit">
                <div style={{ position: 'relative', height: 140, background: 'var(--gray-light)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: '0 8px 8px' }}>
                  {[12, 18, 28, 42, 58, 78, 102, 130, 165, 210, 260, 310, 344].map((v, i) => (
                    <div key={i} style={{ flex: 1, marginRight: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <div style={{ width: '100%', height: `${(v / 344) * 120}px`, background: 'var(--primary)', borderRadius: '3px 3px 0 0', opacity: 0.7 + i * 0.025 }} />
                      {i % 4 === 0 && <div style={{ fontSize: 9, color: 'var(--text-grey)', marginTop: 2 }}>J{(i + 1) * 2}</div>}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-grey mt-s">
                  <span>Heute</span><span>Jahr 13</span><span>Jahr 25</span>
                </div>
              </Panel>

              <Panel title="Sparszenarien im Vergleich">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--sp-m)' }}>
                  {[
                    { rate: '300 €/Monat', result: '185.540 €', color: 'var(--color-orange)' },
                    { rate: '500 €/Monat', result: '344.320 €', color: 'var(--primary)', highlight: true },
                    { rate: '800 €/Monat', result: '533.710 €', color: 'var(--color-green)' },
                  ].map((s) => (
                    <div key={s.rate} style={{ textAlign: 'center', padding: 'var(--sp-m)', background: s.highlight ? 'var(--primary-light)' : 'var(--gray-light)', borderRadius: 'var(--radius)', border: s.highlight ? `2px solid var(--primary)` : '2px solid transparent' }}>
                      <div className="text-sm text-grey">{s.rate}</div>
                      <div style={{ fontSize: 'var(--fs-ml)', fontWeight: 700, color: s.color, marginTop: 8 }}>{s.result}</div>
                      <div className="text-xs text-grey">nach 25 Jahren</div>
                      {s.highlight && <span className="badge badge-info" style={{ marginTop: 6 }}>Aktuell</span>}
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {/* ── Immobilien / Haus ─────────────────────────────── */}
          {activeTab === 'house' && (
            <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
              <SectionHeader title="Immobilien & Wohnsituation" subtitle="Analyse der Immobiliensituation und Finanzierbarkeit" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)' }}>
                <Panel title="Aktuelle Wohnsituation">
                  <Select label="Wohnsituation" value="miete" onChange={() => {}} options={[
                    { value: 'miete', label: 'Zur Miete' },
                    { value: 'eigentum', label: 'Eigenheim (abbezahlt)' },
                    { value: 'finanziert', label: 'Eigenheim (finanziert)' },
                    { value: 'eltern', label: 'Bei Eltern/Verwandten' },
                  ]} />
                  <Input label="Aktuelle Kaltmiete (€/Monat)" type="number" value="1450" onChange={() => {}} />
                  <Input label="Wohnfläche (m²)" type="number" value="95" onChange={() => {}} />
                  <Input label="Wohnort / PLZ" value="München 80331" onChange={() => {}} />

                  <div className="divider" />
                  <div className="font-bold text-sm" style={{ marginBottom: 'var(--sp-s)' }}>Immobilienwunsch</div>
                  <Select label="Kaufabsicht" value="ja_5j" onChange={() => {}} options={[
                    { value: 'kein', label: 'Kein Immobilienwunsch' },
                    { value: 'ja_2j', label: 'Ja, in 2 Jahren' },
                    { value: 'ja_5j', label: 'Ja, in 5 Jahren' },
                    { value: 'ja_10j', label: 'Ja, in 10+ Jahren' },
                  ]} />
                  <Input label="Zielprojekt / Budget (€)" type="number" value="550000" onChange={() => {}} />
                </Panel>

                <div style={{ display: 'grid', gap: 'var(--sp-m)', alignContent: 'start' }}>
                  <Panel title="Finanzierbarkeitsanalyse">
                    <div style={{ display: 'grid', gap: 'var(--sp-m)' }}>
                      {[
                        { label: 'Eigenkapital verfügbar', value: '82.500 €', ok: true },
                        { label: 'Eigenkapitalquote', value: '15%', ok: true },
                        { label: 'Empfohlene Quote', value: '20%+', ok: false },
                        { label: 'Finanzierungsbedarf', value: '467.500 €', ok: null },
                        { label: 'Monatliche Rate (est.)', value: '~1.980 €', ok: null },
                        { label: 'Tragbarkeit (max. 35% Eink.)', value: '✓ Grenzwertig', ok: false },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between text-sm">
                          <span className="text-grey">{row.label}</span>
                          <strong style={{ color: row.ok === true ? 'var(--color-green)' : row.ok === false ? 'var(--color-orange)' : 'var(--text)' }}>{row.value}</strong>
                        </div>
                      ))}
                    </div>
                  </Panel>

                  <Panel title="Eigenkapital-Aufbauplan">
                    <div className="text-sm text-grey" style={{ marginBottom: 'var(--sp-m)' }}>
                      Für 20% Eigenkapital (110.000 €) fehlen noch <strong style={{ color: 'var(--color-orange)' }}>27.500 €</strong>.
                    </div>
                    <BarChart items={[
                      { label: 'Vorhanden', value: 82500, max: 110000, color: 'var(--color-green)' },
                      { label: 'Benötigt', value: 110000, max: 110000, color: 'var(--gray-dark)' },
                    ]} />
                    <div className="text-xs text-grey mt-m">
                      Bei 500 €/Monat Sparrate: Ziel in ca. <strong>4,6 Jahren</strong> erreicht.
                    </div>
                  </Panel>
                </div>
              </div>

              <Panel title="Empfehlung">
                <Alert type="warning">
                  <strong>Handlungsbedarf:</strong> Die Eigenkapitalquote von 15% liegt unter dem empfohlenen Wert von 20%. Es wird empfohlen, die Sparrate für weitere 2–3 Jahre aufzustocken, bevor eine Finanzierung beantragt wird. Alternativ können staatliche Förderprogramme (KfW, Baukindergeld) die Finanzierungslücke schließen.
                </Alert>
              </Panel>
            </div>
          )}

          {/* ── Todesfallplanung ──────────────────────────────── */}
          {activeTab === 'decease' && (
            <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
              <SectionHeader title="Todesfallplanung" subtitle="Absicherung der Familie im Todesfall" />

              <Alert type="info">
                Die Todesfallanalyse zeigt, wie gut Ihre Familie im schlimmsten Fall finanziell abgesichert ist und welche Lücken bestehen.
              </Alert>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)' }}>
                <Panel title="Situation der Hinterbliebenen">
                  <Select label="Familienstand" value="verheiratet" onChange={() => {}} options={[
                    { value: 'ledig', label: 'Ledig' },
                    { value: 'verheiratet', label: 'Verheiratet' },
                    { value: 'getrennt', label: 'Getrennt lebend' },
                    { value: 'verwitwet', label: 'Verwitwet' },
                  ]} />
                  <Input label="Anzahl unterhaltsberechtigte Kinder" type="number" value="2" onChange={() => {}} />
                  <Input label="Monatlicher Unterhaltsbedarf (€)" type="number" value="3200" onChange={() => {}} />
                  <Input label="Restschuld / Verbindlichkeiten (€)" type="number" value="0" onChange={() => {}} />
                  <Input label="Absicherungszeitraum (Jahre)" type="number" value="20" onChange={() => {}} />
                </Panel>

                <div style={{ display: 'grid', gap: 'var(--sp-m)', alignContent: 'start' }}>
                  <Panel title="Absicherungsanalyse">
                    <div style={{ display: 'grid', gap: 12 }}>
                      {[
                        { label: 'Benötigte Absicherung', value: '768.000 €', color: 'var(--text)', desc: '20 Jahre × 3.200 €/Monat' },
                        { label: 'Gesetzliche Hinterbliebenenrente', value: '~980 €/Monat', color: 'var(--color-green)', desc: 'Ca. 55% der Rentenansprüche' },
                        { label: 'Vorhandene Risikolebensversicherung', value: '0 €', color: 'var(--color-red)', desc: 'Keine vorhanden' },
                        { label: 'Absicherungslücke', value: '~384.000 €', color: 'var(--color-red)', desc: 'Dringender Handlungsbedarf' },
                      ].map((row) => (
                        <div key={row.label} style={{ padding: 12, background: 'var(--gray-light)', borderRadius: 'var(--radius)' }}>
                          <div className="flex justify-between text-sm">
                            <span className="font-bold">{row.label}</span>
                            <strong style={{ color: row.color }}>{row.value}</strong>
                          </div>
                          <div className="text-xs text-grey">{row.desc}</div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)' }}>
                <Panel title="Empfohlene Maßnahmen">
                  <div style={{ display: 'grid', gap: 12 }}>
                    {[
                      { icon: '🛡️', title: 'Risikolebensversicherung', desc: 'Versicherungssumme: 400.000 €, Laufzeit: 20 Jahre. Geschätzte Prämie: ~35–55 €/Monat.', priority: 'hoch' },
                      { icon: '📋', title: 'Testament / Erbvertrag', desc: 'Klärung der Erbfolge und Regelung der Vermögensverteilung empfohlen.', priority: 'mittel' },
                      { icon: '👨‍👩‍👧', title: 'Vorsorgevollmacht', desc: 'Regelung der Handlungsfähigkeit im Pflegefall oder bei Geschäftsunfähigkeit.', priority: 'mittel' },
                    ].map((item) => (
                      <div key={item.title} style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--gray-light)', borderRadius: 'var(--radius)' }}>
                        <span style={{ fontSize: 22 }}>{item.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div className="flex items-center gap-s" style={{ marginBottom: 4 }}>
                            <span className="font-bold text-sm">{item.title}</span>
                            <span className={`badge ${item.priority === 'hoch' ? 'badge-danger' : 'badge-warning'}`}>
                              {item.priority === 'hoch' ? 'Hohe Priorität' : 'Mittlere Priorität'}
                            </span>
                          </div>
                          <div className="text-xs text-grey">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Prämienrechner Risikoleben">
                  <Input label="Versicherungssumme (€)" type="number" value="400000" onChange={() => {}} />
                  <Input label="Laufzeit (Jahre)" type="number" value="20" onChange={() => {}} />
                  <Select label="Raucherstatus" value="nein" onChange={() => {}} options={[
                    { value: 'nein', label: 'Nichtraucher' },
                    { value: 'ja', label: 'Raucher' },
                  ]} />
                  <div style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)', marginTop: 'var(--sp-s)' }}>
                    <div className="flex justify-between text-sm"><span>Geschätzte Monatsprämie:</span><strong style={{ color: 'var(--color-green)' }}>~38 €</strong></div>
                    <div className="flex justify-between text-sm mt-s"><span>Günstigster Anbieter:</span><strong>Hannover Rück</strong></div>
                  </div>
                  <button className="btn btn-primary btn-sm mt-m" onClick={() => addToast('info', 'Tarifvergleich wird geladen...')}>Angebote vergleichen →</button>
                </Panel>
              </div>
            </div>
          )}

          {/* ── Tariffvergleich ───────────────────────────────── */}
          {activeTab === 'tariff' && (
            <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
              <SectionHeader title="Tariffvergleich" subtitle="Marktvergleich nach Vorsorgebereich" />

              <Alert type="info">
                Wählen Sie eine Vorsorge-Kategorie um aktuelle Marktangebote zu vergleichen. Klicken Sie auf „Detail" für eine vollständige Analyse inkl. Qualitätscheckliste.
              </Alert>

              {/* Category selector */}
              {[
                {
                  type: 'bu', icon: '💼', label: 'Berufsunfähigkeit', status: 'covered',
                  tariffs: [
                    { provider: 'Allianz', product: 'BU Premium', premium: '89 €/Mon.', rating: 5, highlight: true },
                    { provider: 'Swiss Life', product: 'SLR BU Protect', premium: '92 €/Mon.', rating: 5 },
                    { provider: 'Nürnberger', product: 'BU Invest', premium: '82 €/Mon.', rating: 4 },
                  ],
                },
                {
                  type: 'leben', icon: '💙', label: 'Risikoleben', status: 'gap',
                  tariffs: [
                    { provider: 'Hannoversche', product: 'Risikolife Plus', premium: '35 €/Mon.', rating: 5, highlight: true },
                    { provider: 'HUK-Coburg', product: 'RLV Premium', premium: '38 €/Mon.', rating: 5 },
                    { provider: 'Cosmos Direkt', product: 'Risiko direkt', premium: '32 €/Mon.', rating: 4 },
                  ],
                },
                {
                  type: 'haftpflicht', icon: '🛡️', label: 'Haftpflicht', status: 'covered',
                  tariffs: [
                    { provider: 'DEVK', product: 'PHV Komfort Plus', premium: '8 €/Mon.', rating: 5, highlight: true },
                    { provider: 'HUK-Coburg', product: 'Privat-Haftpflicht', premium: '7 €/Mon.', rating: 5 },
                    { provider: 'ERGO', product: 'PHV Basis', premium: '9 €/Mon.', rating: 4 },
                  ],
                },
                {
                  type: 'unfall', icon: '🩹', label: 'Unfallversicherung', status: 'missing',
                  tariffs: [
                    { provider: 'ARAG', product: 'Komfort UV', premium: '18 €/Mon.', rating: 4, highlight: true },
                    { provider: 'Allianz', product: 'Unfall Komfort', premium: '22 €/Mon.', rating: 5 },
                    { provider: 'Signal Iduna', product: 'UV Smart', premium: '16 €/Mon.', rating: 4 },
                  ],
                },
              ].map((cat) => (
                <Panel
                  key={cat.type}
                  title={`${cat.icon} ${cat.label}`}
                  action={
                    <div className="flex gap-s">
                      <span className={`badge ${cat.status === 'covered' ? 'badge-success' : cat.status === 'gap' ? 'badge-warning' : 'badge-danger'}`}>
                        {cat.status === 'covered' ? '✓ Abgesichert' : cat.status === 'gap' ? '⚠ Lücke' : '✗ Fehlt'}
                      </span>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/analysis/${customer?.id}/precaution/${cat.type}`)}>
                        Detail →
                      </button>
                    </div>
                  }
                >
                  <table>
                    <thead>
                      <tr><th>Anbieter</th><th>Produkt</th><th>Prämie/Monat</th><th>Bewertung</th><th></th></tr>
                    </thead>
                    <tbody>
                      {cat.tariffs.map((t, i) => (
                        <tr key={i} style={t.highlight ? { background: '#e8f4f8' } : {}}>
                          <td>
                            <div className="flex items-center gap-s">
                              <span className="font-bold text-sm">{t.provider}</span>
                              {t.highlight && <Badge type="success">Empfohlen</Badge>}
                            </div>
                          </td>
                          <td className="text-sm">{t.product}</td>
                          <td><span className="font-bold text-sm" style={{ color: 'var(--color-green)' }}>{t.premium}</span></td>
                          <td><span style={{ color: '#fbbf24' }}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span></td>
                          <td>
                            <button className="btn btn-primary btn-sm" onClick={() => addToast('success', `Angebot von ${t.provider} angefordert.`)}>
                              Angebot
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Panel>
              ))}
            </div>
          )}

          {/* ── Fehlende Felder ───────────────────────────────── */}
          {activeTab === 'missing' && (
            <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
              <SectionHeader title="Fehlende Felder" subtitle="Übersicht über Datenlücken und offene Pflichtfelder" />

              {(() => {
                const sections = [
                  {
                    label: 'Stammdaten & Kontakt', icon: '👤', link: `/consultation/${customer?.id}`,
                    fields: [
                      { label: 'Vorname / Nachname', ok: !!customer?.first_name },
                      { label: 'Geburtsdatum', ok: !!customer?.birth_date },
                      { label: 'E-Mail-Adresse', ok: !!customer?.email },
                      { label: 'Telefonnummer', ok: !!customer?.phone },
                      { label: 'Adresse vollständig', ok: !!(customer?.address?.street && customer?.address?.zip) },
                    ],
                  },
                  {
                    label: 'Einkommensdaten', icon: '💶', link: `/consultation/${customer?.id}`,
                    fields: [
                      { label: 'Bruttogehalt', ok: !!(fin?.income.gross_salary) },
                      { label: 'Nettogehalt', ok: !!(fin?.income.net_salary) },
                      { label: 'Partner-Einkommen (falls vorhanden)', ok: !customer?.has_partner || !!(fin?.income.partner_net) },
                      { label: 'Monatliche Ausgaben', ok: !!(fin?.expenses.rent) },
                    ],
                  },
                  {
                    label: 'Altersvorsorge', icon: '🎯', link: `/consultation/${customer?.id}`,
                    fields: [
                      { label: 'Gewünschtes Rentenalter', ok: !!(fin?.retirement.desired_age) },
                      { label: 'Monatlicher Bedarf im Ruhestand', ok: !!(fin?.retirement.monthly_need) },
                      { label: 'Gesetzliche Rente (Rentenbescheid)', ok: !!(fin?.retirement.state_pension) },
                      { label: 'Private Vorsorgebeiträge', ok: !!(fin?.retirement.private_pension) },
                    ],
                  },
                  {
                    label: 'Versicherungen', icon: '🛡️', link: `/consultation/${customer?.id}`,
                    fields: [
                      { label: 'Berufsunfähigkeitsversicherung geprüft', ok: !!(fin?.insurances.length) },
                      { label: 'Haftpflichtversicherung geprüft', ok: !!(fin?.insurances.length) },
                      { label: 'Krankenversicherungsdetails', ok: false },
                      { label: 'Risikolebensversicherung geprüft', ok: !!(fin?.insurances.some(i => i.type === 'Leben')) },
                    ],
                  },
                  {
                    label: 'Investments & Vermögen', icon: '📈', link: `/consultation/${customer?.id}`,
                    fields: [
                      { label: 'Gesamtersparnisse erfasst', ok: !!(fin?.savings) },
                      { label: 'Investitionen / Depot', ok: !!(fin?.investments.length) },
                      { label: 'Immobilienbesitz geprüft', ok: false },
                      { label: 'Verbindlichkeiten vollständig', ok: !!(fin?.expenses.loans !== undefined) },
                    ],
                  },
                  {
                    label: 'Persönliche Wünsche & Ziele', icon: '🎯', link: `/consultation/${customer?.id}`,
                    fields: [
                      { label: 'Persönliche Wünsche erfasst', ok: !!(customer?.personal_wishes?.length) },
                      { label: 'Risikoprofil festgelegt', ok: false },
                      { label: 'Anlagehorizont definiert', ok: false },
                    ],
                  },
                  {
                    label: 'Dokumentation & IDD', icon: '📋', link: `/documentation/${customer?.id}`,
                    fields: [
                      { label: 'IDD-Erstinformation übermittelt', ok: false },
                      { label: 'Beratungsprotokoll erstellt', ok: false },
                      { label: 'Datenschutzerklärung unterzeichnet', ok: false },
                    ],
                  },
                ];

                const totalFields = sections.reduce((s, sec) => s + sec.fields.length, 0);
                const okFields = sections.reduce((s, sec) => s + sec.fields.filter((f) => f.ok).length, 0);
                const pct = Math.round((okFields / totalFields) * 100);

                return (
                  <>
                    {/* Overall score */}
                    <div className="card" style={{ padding: 'var(--sp-l)' }}>
                      <div className="flex justify-between items-center mb-m">
                        <div>
                          <div className="font-bold">Datenvollständigkeit</div>
                          <div className="text-xs text-grey">{okFields} von {totalFields} Feldern ausgefüllt</div>
                        </div>
                        <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: pct >= 80 ? 'var(--color-green)' : pct >= 50 ? 'var(--color-orange)' : 'var(--color-red)' }}>
                          {pct}%
                        </div>
                      </div>
                      <div className="progress-bar" style={{ height: 12 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 80 ? 'var(--color-green)' : pct >= 50 ? 'var(--color-orange)' : 'var(--color-red)',
                          }}
                        />
                      </div>
                    </div>

                    {sections.map((sec) => {
                      const secOk = sec.fields.filter((f) => f.ok).length;
                      const secAll = sec.fields.length;
                      const complete = secOk === secAll;
                      return (
                        <Panel
                          key={sec.label}
                          title={`${sec.icon} ${sec.label} (${secOk}/${secAll})`}
                          action={
                            !complete ? (
                              <button className="btn btn-primary btn-sm" onClick={() => navigate(sec.link)}>
                                Ausfüllen →
                              </button>
                            ) : (
                              <span className="badge badge-success">✓ Vollständig</span>
                            )
                          }
                        >
                          <div style={{ display: 'grid', gap: 8 }}>
                            {sec.fields.map((f, i) => (
                              <div key={i} className="flex items-center gap-s text-sm">
                                <span style={{ color: f.ok ? 'var(--color-green)' : 'var(--color-red)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                                  {f.ok ? '✓' : '✗'}
                                </span>
                                <span style={{ color: f.ok ? 'var(--text)' : 'var(--text-grey)' }}>{f.label}</span>
                                {!f.ok && <span style={{ marginLeft: 'auto', fontSize: 'var(--fs-xs)', color: 'var(--color-red)' }}>Ausstehend</span>}
                              </div>
                            ))}
                          </div>
                        </Panel>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          )}

          {/* ── IDD-Formular ──────────────────────────────────── */}
          {activeTab === 'idd' && (
            <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
              <SectionHeader title="IDD-Erstinformation" subtitle="Pflichtdokument gemäß Insurance Distribution Directive (EU 2016/97)" />

              <Alert type="info">
                Das IDD-Formular ist gesetzlich vorgeschrieben und muss dem Kunden <strong>vor</strong> der Beratung ausgehändigt werden. Es informiert über Identität, Vergütung und Beschwerdeverfahren des Vermittlers.
              </Alert>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)' }}>
                <Panel title="Angaben zum Vermittler">
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[
                      { label: 'Name / Firma', value: 'finExpert Beratungs GmbH' },
                      { label: 'Anschrift', value: 'Musterstraße 1, 80331 München' },
                      { label: 'Telefon', value: '+49 89 1234 5678' },
                      { label: 'E-Mail', value: 'info@finexpert.de' },
                      { label: 'Registernummer (DIHK)', value: 'D-12345-XY7890-12' },
                      { label: 'Registerbehörde', value: 'IHK für München und Oberbayern' },
                      { label: 'Zulassungsart', value: 'Unabhängiger Makler (§34d GewO)' },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm" style={{ borderBottom: '1px solid var(--gray-medium)', paddingBottom: 6 }}>
                        <span className="text-grey">{row.label}</span>
                        <span className="font-bold">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Vergütung & Interessenkonflikte">
                  <div style={{ display: 'grid', gap: 'var(--sp-m)' }}>
                    <div style={{ padding: 12, background: 'var(--gray-light)', borderRadius: 'var(--radius)' }}>
                      <div className="font-bold text-sm" style={{ marginBottom: 4 }}>Vergütungsart</div>
                      <div className="text-sm">
                        Der Vermittler erhält für die Vermittlung von Versicherungsverträgen eine <strong>Provision vom Versicherungsunternehmen</strong>. Die Provision ist im Versicherungsbeitrag enthalten und wird nicht separat in Rechnung gestellt.
                      </div>
                    </div>
                    <div style={{ padding: 12, background: 'var(--gray-light)', borderRadius: 'var(--radius)' }}>
                      <div className="font-bold text-sm" style={{ marginBottom: 4 }}>Interessenkonflikte</div>
                      <div className="text-sm">Es bestehen keine wesentlichen Interessenkonflikte, die die Interessen des Kunden beeinträchtigen könnten.</div>
                    </div>
                    <div style={{ padding: 12, background: 'var(--gray-light)', borderRadius: 'var(--radius)' }}>
                      <div className="font-bold text-sm" style={{ marginBottom: 4 }}>Beschwerdemanagement</div>
                      <div className="text-sm">Bei Beschwerden wenden Sie sich an: <strong>beschwerden@finexpert.de</strong>. Alternativ: Ombudsmann für Versicherungen, Kronenstraße 13, 10117 Berlin.</div>
                    </div>
                  </div>
                </Panel>
              </div>

              <Panel title="Kundenbestätigung">
                <div style={{ display: 'grid', gap: 'var(--sp-m)' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-s)', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ marginTop: 2 }} />
                    <span className="text-sm">
                      Ich, <strong>{customer?.first_name} {customer?.last_name}</strong>, bestätige, dass ich das IDD-Erstinformationsblatt erhalten und gelesen habe.
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-s)', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ marginTop: 2 }} />
                    <span className="text-sm">
                      Ich wurde über die Vergütungsart und mögliche Interessenkonflikte informiert.
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-s)', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ marginTop: 2 }} />
                    <span className="text-sm">
                      Ich wurde über das Beschwerdeverfahren informiert.
                    </span>
                  </label>
                </div>
                <div style={{ marginTop: 'var(--sp-m)', display: 'flex', gap: 'var(--sp-s)' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => addToast('success', 'IDD-Bestätigung gespeichert.')}>
                    ✓ Bestätigung speichern
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', 'PDF wird erstellt...')}>
                    ⬇️ Als PDF herunterladen
                  </button>
                </div>
              </Panel>
            </div>
          )}

          {/* ── Download ──────────────────────────────────────── */}
          {activeTab === 'download' && (
            <div>
              <SectionHeader title="Berichte & Downloads" />
              <Alert type="info">Die folgenden Berichte werden als PDF generiert und können direkt an den Kunden weitergeleitet werden.</Alert>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--sp-m)', marginTop: 'var(--sp-m)' }}>
                {[
                  { name: 'Beratungsprotokoll', desc: 'Vollständiges Protokoll des aktuellen Beratungsgesprächs', icon: '📋', type: 'Beratungsprotokoll' },
                  { name: 'Vermögensübersicht', desc: 'Zusammenfassung aller Assets und Verbindlichkeiten', icon: '💰', type: 'Vermögensübersicht' },
                  { name: 'Altersvorsorgeanalyse', desc: 'Detaillierte Rentenlückenanalyse mit Empfehlungen', icon: '🎯', type: 'Altersvorsorgeanalyse' },
                  { name: 'Versicherungsübersicht', desc: 'Alle aktiven Versicherungen mit Konditionen', icon: '🛡️', type: 'Versicherungsübersicht' },
                  { name: 'Investmentreport', desc: 'Portfolio-Übersicht mit Renditeberechnungen', icon: '📈', type: 'Investmentreport' },
                  { name: 'Erstinformation', desc: 'Pflichtdokument gemäß IDD für Erstkontakt', icon: '📄', type: 'Erstinformation' },
                ].map((doc) => (
                  <div key={doc.name} className="card">
                    <div className="card-body" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 36, marginBottom: 'var(--sp-s)' }}>{doc.icon}</div>
                      <div className="font-bold" style={{ marginBottom: 4 }}>{doc.name}</div>
                      <div className="text-xs text-grey" style={{ marginBottom: 'var(--sp-m)', lineHeight: 1.5 }}>{doc.desc}</div>
                      <button
                        className="btn btn-primary btn-sm btn-full"
                        onClick={() => handleDownload(doc.type)}
                        disabled={downloadLoading}
                      >
                        {downloadLoading ? '⌛ Wird erstellt...' : '⬇️ PDF erstellen'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Panel title="E-Mail versenden" action={<Badge type="info">Optional</Badge>}>
                <Input label="Empfänger" type="email" value={customer.email} onChange={() => {}} />
                <Select label="Anhänge" value="" onChange={() => {}} options={[{ value: '', label: 'Bericht auswählen...' }]} />
                <button className="btn btn-primary btn-sm" onClick={() => addToast('success', 'E-Mail wurde erfolgreich versandt.')}>
                  ✉️ Versenden
                </button>
              </Panel>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
