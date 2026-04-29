import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DOC_ITEMS = [
  {
    key: 'agb',
    title: 'Allgemeine Geschäftsbedingungen (AGB)',
    summary: 'Geltungsbereich, Vertragsgegenstand, Vergütung, Haftungsbeschränkung und Gerichtsstand.',
    icon: '📋',
  },
  {
    key: 'datenschutz',
    title: 'Datenschutzerklärung (DSGVO)',
    summary: 'Art der erhobenen Daten, Verarbeitungszwecke, Speicherdauer und Ihre Rechte nach Art. 15–21 DSGVO.',
    icon: '🔒',
  },
  {
    key: 'idd',
    title: 'IDD-Erstinformation',
    summary: 'Pflichtdokument gemäß Insurance Distribution Directive (EU 2016/97): Vermittleridentität, Vergütungsart und Beschwerdeverfahren.',
    icon: '📄',
  },
];

export const InitialLegalInformation: React.FC = () => {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const allAccepted = DOC_ITEMS.every((d) => accepted[d.key]);

  const handleAccept = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f3d50 0%, #125267 60%, #1a6b87 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          maxWidth: 660,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ background: '#125267', color: '#fff', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>📋</div>
          <h2 style={{ margin: '0 0 6px', color: '#fff', fontSize: 22 }}>Willkommen bei finExpert</h2>
          <p style={{ margin: 0, opacity: 0.8, fontSize: 14, lineHeight: 1.6 }}>
            Bevor Sie fortfahren, lesen und akzeptieren Sie bitte die folgenden Pflichtdokumente. Dies ist gesetzlich vorgeschrieben.
          </p>
        </div>

        {/* Progress indicator */}
        <div style={{ background: '#f0f7fa', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 13, color: '#666' }}>
          <div style={{ flex: 1, background: '#ddd', borderRadius: 4, height: 6 }}>
            <div
              style={{
                height: 6,
                borderRadius: 4,
                background: '#125267',
                width: `${(Object.values(accepted).filter(Boolean).length / DOC_ITEMS.length) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span>{Object.values(accepted).filter(Boolean).length} / {DOC_ITEMS.length} akzeptiert</span>
        </div>

        {/* Documents */}
        <div style={{ padding: '1.5rem 2rem', display: 'grid', gap: 12 }}>
          {DOC_ITEMS.map((doc) => {
            const isChecked = !!accepted[doc.key];
            const isOpen = expanded === doc.key;
            return (
              <div
                key={doc.key}
                style={{
                  border: `2px solid ${isChecked ? '#125267' : '#e0e0e0'}`,
                  borderRadius: 10,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '1rem',
                    background: isChecked ? '#e8f4f8' : '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpanded(isOpen ? null : doc.key)}
                >
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{doc.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{doc.title}</div>
                    <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{doc.summary}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: '#888' }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: '0.75rem 1rem', background: '#fafafa', borderTop: '1px solid #eee', fontSize: 12, color: '#555', lineHeight: 1.7 }}>
                    <p>
                      Durch die Nutzung unserer Plattform erklären Sie sich mit den Inhalten dieses Dokuments einverstanden.
                      Dieses Dokument wurde zuletzt im April 2026 aktualisiert.
                    </p>
                    <p>
                      Eine vollständige Version finden Sie jederzeit unter{' '}
                      <span style={{ color: '#125267', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={(e) => { e.stopPropagation(); }}>
                        Einstellungen → Rechtliches
                      </span>.
                    </p>
                  </div>
                )}

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '0.75rem 1rem',
                    borderTop: '1px solid #eee',
                    cursor: 'pointer',
                    background: '#fff',
                    fontSize: 13,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setAccepted((prev) => ({ ...prev, [doc.key]: e.target.checked }))}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span>
                    Ich habe die <strong>{doc.title}</strong> gelesen und stimme zu.
                  </span>
                  {isChecked && <span style={{ marginLeft: 'auto', color: '#125267', fontWeight: 700 }}>✓</span>}
                </label>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 2rem 2rem' }}>
          {!allAccepted && (
            <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: 14, fontSize: 12, color: '#7a5200', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>⚠️</span>
              <span>Bitte akzeptieren Sie alle {DOC_ITEMS.length} Dokumente, um mit finExpert fortzufahren.</span>
            </div>
          )}
          <button
            onClick={handleAccept}
            disabled={!allAccepted || loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: allAccepted ? '#125267' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
              cursor: allAccepted ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            {loading ? '⌛ Wird gespeichert...' : allAccepted ? '✓ Akzeptieren & Weiter zur App' : 'Alle Dokumente akzeptieren um fortzufahren'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 12, marginBottom: 0 }}>
            finExpert Beratungs GmbH · Maximilianstraße 12, 80539 München · info@finexpert.de
          </p>
        </div>
      </div>
    </div>
  );
};
