import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Alert, Panel } from '../components/UI';
import { CUSTOMERS } from '../mock';
import { useApp } from '../context';

const OPTIONS_MAP: Record<string, { id: string; label: string; desc: string; price: string; recommended?: boolean }[]> = {
  haus: [
    { id: 'elementar', label: 'Elementarschadenversicherung', desc: 'Überschwemmung, Rückstau, Erdrutsch, Erdbeben', price: '~8 €/Mon.', recommended: true },
    { id: 'glas', label: 'Glasversicherung', desc: 'Alle Scheiben inkl. Spiegelglas und Solarpanele', price: '~3 €/Mon.' },
    { id: 'photovoltaik', label: 'Photovoltaik-Anlage', desc: 'Ertragsausfall, Schäden, Diebstahl', price: '~12 €/Mon.' },
    { id: 'assistenz', label: 'Haushalts-Assistenz 24/7', desc: 'Notfallhandwerker rund um die Uhr', price: '~2 €/Mon.' },
  ],
  wohnung: [
    { id: 'elementar', label: 'Elementarschadenversicherung', desc: 'Überschwemmung, Rückstau und Naturkatastrophen', price: '~5 €/Mon.', recommended: true },
    { id: 'glas', label: 'Glasversicherung', desc: 'Alle Scheiben inkl. Einbauschränke und Dusche', price: '~2 €/Mon.' },
    { id: 'wasserschaden', label: 'Rohwasserschaden-Erweiterung', desc: 'Leitungswasser aus Nachbarwohnungen', price: '~3 €/Mon.' },
  ],
  pkw: [
    { id: 'vollkasko', label: 'Vollkaskoversicherung', desc: 'Inkl. selbstverschuldete Unfälle und Vandalismus', price: '~45 €/Mon.', recommended: true },
    { id: 'schutzbrief', label: 'Schutzbrief / Pannenhilfe', desc: 'Europaweit Pannenhilfe, Abschleppen, Mietwagen', price: '~3 €/Mon.' },
    { id: 'fahrerschutz', label: 'Fahrerschutzversicherung', desc: 'Eigene Unfallabsicherung des Fahrers', price: '~4 €/Mon.' },
    { id: 'rabattschutz', label: 'Rabattschutz', desc: 'SF-Klasse bleibt nach einem Schaden erhalten', price: '~6 €/Mon.' },
    { id: 'ausland', label: 'Auslandsschadenersatz', desc: 'Schadensregulierung im EU-Ausland', price: '~2 €/Mon.' },
  ],
  motorrad: [
    { id: 'vollkasko', label: 'Vollkasko (Saisonal)', desc: 'Ganzjährig oder April – Oktober', price: '~28 €/Mon.' },
    { id: 'schutzbrief', label: 'Pannenhilfe Motorrad', desc: 'Europaweit Abschleppen und Pannenhilfe', price: '~2 €/Mon.' },
    { id: 'zubehör', label: 'Zubehör- und Bekleidungsschutz', desc: 'Helm, Jacke, Schuhe bis 3.000 €', price: '~4 €/Mon.' },
  ],
  wohnmobil: [
    { id: 'innen', label: 'Innenraum-Versicherung', desc: 'Einrichtung, Gepäck und persönliche Gegenstände', price: '~12 €/Mon.', recommended: true },
    { id: 'camping', label: 'Camping-Haftpflicht', desc: 'Schäden am Stellplatz und an Infrastruktur', price: '~3 €/Mon.' },
    { id: 'reiseabbruch', label: 'Reiseabbruchversicherung', desc: 'Kosten bei Unfällen, Krankheit oder Pannen', price: '~5 €/Mon.' },
  ],
  boot: [
    { id: 'kasko', label: 'Bootskasko', desc: 'Kollision, Sturm, Diebstahl und Totalverlust', price: '~18 €/Mon.', recommended: true },
    { id: 'charter', label: 'Charter-Haftpflicht', desc: 'Deckung für den Zeitraum von Charterverträgen', price: '~5 €/Mon.' },
    { id: 'skipperhaft', label: 'Skipper-Haftpflicht', desc: 'Erhöhte Deckungssumme für Bootsführer', price: '~8 €/Mon.' },
  ],
  hund: [
    { id: 'op', label: 'OP-Kostenversicherung', desc: 'Tierarztkosten bei Operationen und Anästhesie', price: '~22 €/Mon.' },
    { id: 'kranken', label: 'Tierkrankenversicherung', desc: 'Ambulant und stationäre Behandlungen', price: '~38 €/Mon.', recommended: true },
    { id: 'pension', label: 'Tierpension bei Krankenhausaufenthalt', desc: 'Unterbringungskosten wenn Halter hospitalisiert', price: '~4 €/Mon.' },
  ],
  pferd: [
    { id: 'op', label: 'Pferde-OP-Versicherung', desc: 'Chirurgische Eingriffe bis 10.000 €', price: '~32 €/Mon.', recommended: true },
    { id: 'lebens', label: 'Pferde-Lebensversicherung', desc: 'Tierwertersatz bei Tod oder notwendiger Tötung', price: '~25 €/Mon.' },
    { id: 'transport', label: 'Transportversicherung', desc: 'Unfälle beim Transport auf Hänger oder LKW', price: '~8 €/Mon.' },
  ],
};

const PROPERTY_LABELS: Record<string, string> = {
  haus: '🏠 Einfamilienhaus',
  wohnung: '🏢 Eigentumswohnung',
  pkw: '🚗 PKW',
  motorrad: '🏍️ Motorrad',
  wohnmobil: '🚌 Wohnmobil',
  boot: '⛵ Boot',
  hund: '🐶 Hund',
  pferd: '🐴 Pferd',
};

export const PropertyInsuranceSelectionOptional: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useApp();

  const customer = CUSTOMERS.find((c) => c.id === id);
  const selected: string[] = (location.state as any)?.selected ?? [];
  const [extras, setExtras] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const toggleExtra = (prop: string, optId: string) => {
    setExtras((prev) => {
      const cur = prev[prop] ?? [];
      return { ...prev, [prop]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] };
    });
  };

  const totalSelected = Object.values(extras).reduce((sum, arr) => sum + arr.length, 0);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    addToast('success', 'Eigentumsabfrage abgeschlossen. Angebote werden vorbereitet.');
    navigate(`/customers/${id}`);
  };

  if (selected.length === 0) {
    return (
      <AppLayout title="Eigentumsabfrage – Optionen">
        <Alert type="warning">
          Keine Eigentumsarten ausgewählt.{' '}
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/property-insurance/${id}`)}>
            ← Zurück zu Schritt 1
          </button>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Eigentumsabfrage – Optionen">
      <div className="breadcrumb">
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/customers')}>Kunden</span>
        <span className="breadcrumb-sep">›</span>
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate(`/customers/${id}`)}>
          {customer ? `${customer.first_name} ${customer.last_name}` : 'Kunde'}
        </span>
        <span className="breadcrumb-sep">›</span>
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate(`/property-insurance/${id}`)}>Eigentumsabfrage</span>
        <span className="breadcrumb-sep">›</span>
        <span>Optionale Leistungen</span>
      </div>

      {/* Step header */}
      <div className="card" style={{ marginBottom: 'var(--sp-m)', padding: 'var(--sp-l)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-l)', marginBottom: 'var(--sp-m)' }}>
          <div style={{ fontSize: 36 }}>⚙️</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px' }}>Optionale Zusatzleistungen</h3>
            <div className="text-sm text-grey">
              Schritt 2 von 2: Wählen Sie Zusätze für {selected.length} Eigentumsart{selected.length > 1 ? 'en' : ''}
            </div>
          </div>
          {totalSelected > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', color: 'var(--primary)' }}>{totalSelected}</div>
              <div className="text-xs text-grey">Zusatz{totalSelected > 1 ? 'leistungen' : 'leistung'}</div>
            </div>
          )}
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div className="progress-fill progress-success" style={{ width: '100%' }} />
        </div>
        <div className="flex justify-between text-xs text-grey mt-s">
          <span style={{ color: 'var(--color-green)', fontWeight: 500 }}>✓ Schritt 1: Eigentumsarten</span>
          <span style={{ fontWeight: 600 }}>Schritt 2: Optionale Zusätze</span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
        {selected.map((propId) => {
          const opts = OPTIONS_MAP[propId] ?? [];
          const cur = extras[propId] ?? [];
          return (
            <Panel key={propId} title={PROPERTY_LABELS[propId] ?? propId}>
              {opts.length === 0 ? (
                <div className="text-sm text-grey">Keine zusätzlichen Optionen für diese Eigentumsart verfügbar.</div>
              ) : (
                <div style={{ display: 'grid', gap: 'var(--sp-s)' }}>
                  {opts.map((opt) => {
                    const checked = cur.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 'var(--sp-m)',
                          cursor: 'pointer',
                          padding: 'var(--sp-m)',
                          borderRadius: 'var(--radius)',
                          border: `1px solid ${checked ? 'var(--primary)' : 'var(--gray-border)'}`,
                          background: checked ? '#e8f4f8' : '#fff',
                          transition: 'all 0.15s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExtra(propId, opt.id)}
                          style={{ marginTop: 2, width: 16, height: 16, cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div className="flex items-center gap-s">
                            <span className="font-bold text-sm">{opt.label}</span>
                            {opt.recommended && (
                              <span style={{ background: 'var(--color-green)', color: '#fff', padding: '1px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                                Empfohlen
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-grey" style={{ marginTop: 2 }}>{opt.desc}</div>
                        </div>
                        <span style={{ background: '#f0f7fa', border: '1px solid #b0d8e8', color: 'var(--primary)', padding: '2px 10px', borderRadius: 12, fontSize: 'var(--fs-xs)', fontWeight: 600, flexShrink: 0 }}>
                          {opt.price}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </Panel>
          );
        })}
      </div>

      {/* Summary and submit */}
      {totalSelected > 0 && (
        <div className="card" style={{ padding: 'var(--sp-m)', marginTop: 'var(--sp-m)', background: '#e8f4f8', border: '1px solid #b0d8e8' }}>
          <div className="font-bold text-sm" style={{ color: 'var(--primary)', marginBottom: 8 }}>
            Zusammenfassung: {totalSelected} zusätzliche Leistung{totalSelected > 1 ? 'en' : ''} ausgewählt
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selected.map((propId) =>
              (extras[propId] ?? []).map((optId) => {
                const opt = OPTIONS_MAP[propId]?.find((o) => o.id === optId);
                return opt ? (
                  <span key={`${propId}-${optId}`} style={{ background: 'var(--primary)', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11 }}>
                    {opt.label}
                  </span>
                ) : null;
              })
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-l)' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/property-insurance/${id}`, { state: { selected } })}>
          ← Zurück zu Schritt 1
        </button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? '⌛ Wird gespeichert...' : '✓ Anfrage abschließen & Angebote anfordern'}
        </button>
      </div>
    </AppLayout>
  );
};
