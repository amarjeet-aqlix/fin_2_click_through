import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Alert } from '../components/UI';
import { CUSTOMERS } from '../mock';

const PROPERTY_TYPES = [
  { id: 'haus', icon: '🏠', label: 'Einfamilienhaus', desc: 'Freistehend oder Reihenhaus' },
  { id: 'wohnung', icon: '🏢', label: 'Eigentumswohnung', desc: 'ETW inkl. Sondernutzungsrecht' },
  { id: 'pkw', icon: '🚗', label: 'PKW', desc: 'Personenkraftfahrzeug' },
  { id: 'motorrad', icon: '🏍️', label: 'Motorrad / Roller', desc: 'Zweiräder aller Art' },
  { id: 'wohnmobil', icon: '🚌', label: 'Wohnmobil / Caravan', desc: 'Reisemobil und Anhänger' },
  { id: 'boot', icon: '⛵', label: 'Boot / Wasserfahrzeug', desc: 'Segelboot, Motorboot' },
  { id: 'hund', icon: '🐶', label: 'Hund', desc: 'Hundehalterhaftpflicht' },
  { id: 'pferd', icon: '🐴', label: 'Pferd', desc: 'Pferdehalterhaftpflicht' },
];

export const PropertyInsuranceSelection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const customer = CUSTOMERS.find((c) => c.id === id);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (pId: string) =>
    setSelected((prev) => prev.includes(pId) ? prev.filter((x) => x !== pId) : [...prev, pId]);

  const completedCount = selected.length;

  return (
    <AppLayout title="Eigentumsabfrage">
      <div className="breadcrumb">
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/customers')}>Kunden</span>
        <span className="breadcrumb-sep">›</span>
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate(`/customers/${id}`)}>
          {customer ? `${customer.first_name} ${customer.last_name}` : 'Kunde'}
        </span>
        <span className="breadcrumb-sep">›</span>
        <span>Eigentumsabfrage</span>
      </div>

      {/* Step header */}
      <div className="card" style={{ marginBottom: 'var(--sp-m)', padding: 'var(--sp-l)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-l)', marginBottom: 'var(--sp-m)' }}>
          <div style={{ fontSize: 36 }}>🏡</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px' }}>Eigentumsabfrage</h3>
            <div className="text-sm text-grey">Schritt 1 von 2: Eigentumsarten auswählen</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', color: 'var(--primary)' }}>{completedCount}</div>
            <div className="text-xs text-grey">ausgewählt</div>
          </div>
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div className="progress-fill" style={{ width: '50%' }} />
        </div>
        <div className="flex justify-between text-xs text-grey mt-s">
          <span>Schritt 1: Eigentumsarten</span>
          <span>Schritt 2: Optionale Zusätze</span>
        </div>
      </div>

      <Alert type="info">
        Wählen Sie alle zutreffenden Eigentumsarten aus. Auf Basis dieser Auswahl werden im nächsten Schritt passende Versicherungsoptionen und Zusatzleistungen vorgeschlagen.
      </Alert>

      {/* Selection grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--sp-m)', margin: 'var(--sp-l) 0' }}>
        {PROPERTY_TYPES.map((pt) => {
          const sel = selected.includes(pt.id);
          return (
            <div
              key={pt.id}
              onClick={() => toggle(pt.id)}
              style={{
                border: `2px solid ${sel ? 'var(--primary)' : 'var(--gray-border)'}`,
                borderRadius: 'var(--radius)',
                padding: 'var(--sp-l)',
                cursor: 'pointer',
                textAlign: 'center',
                background: sel ? '#e8f4f8' : '#fff',
                transition: 'all 0.15s',
                position: 'relative',
                userSelect: 'none',
              }}
            >
              {sel && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
              )}
              <div style={{ fontSize: 38, marginBottom: 10 }}>{pt.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)', marginBottom: 4, color: sel ? 'var(--primary)' : 'var(--text)' }}>
                {pt.label}
              </div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-grey)' }}>{pt.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Selection summary */}
      {selected.length > 0 && (
        <div
          className="card"
          style={{ padding: 'var(--sp-m)', marginBottom: 'var(--sp-m)', background: '#e8f4f8', border: '1px solid #b0d8e8' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--primary)', marginBottom: 4 }}>
                {selected.length} Eigentumsart{selected.length > 1 ? 'en' : ''} ausgewählt
              </div>
              <div className="flex gap-s flex-wrap">
                {selected.map((s) => {
                  const pt = PROPERTY_TYPES.find((p) => p.id === s)!;
                  return (
                    <span key={s} style={{ background: 'var(--primary)', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 'var(--fs-xs)', fontWeight: 500 }}>
                      {pt.icon} {pt.label}
                    </span>
                  );
                })}
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelected([])}
            >
              Alle abwählen
            </button>
          </div>
        </div>
      )}

      {/* Footer nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-s)' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/customers/${id}`)}>
          ← Abbrechen
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/property-insurance/${id}/optional`, { state: { selected } })}
          disabled={selected.length === 0}
        >
          Weiter: Optionen wählen →
        </button>
      </div>
    </AppLayout>
  );
};
