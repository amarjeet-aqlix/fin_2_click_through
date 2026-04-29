import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';

const STEPS = [
  { icon: '📞', title: 'Berater kontaktieren', desc: 'Rufen Sie Ihren zuständigen Berater direkt an.' },
  { icon: '✉️', title: 'Support schreiben', desc: 'Senden Sie eine E-Mail an support@finexpert.de.' },
  { icon: '🕐', title: 'Warten', desc: 'Ihr Berater wird sich in Kürze bei Ihnen melden.' },
];

export const DisabledCustomerDashboard: React.FC = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      {/* Logo bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem', color: '#125267', fontWeight: 700, fontSize: 20 }}>
        <span style={{ fontSize: 28 }}>💰</span>
        finExpert
      </div>

      {/* Main card */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          maxWidth: 540,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header stripe */}
        <div style={{ background: '#fef3cd', borderBottom: '1px solid #fde68a', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 40 }}>🔒</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#92400e' }}>Zugang vorübergehend gesperrt</div>
            <div style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>
              Hallo{user?.first_name ? ` ${user.first_name}` : ''} — Ihr Konto ist derzeit deaktiviert.
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem 2rem' }}>
          <p style={{ color: '#555', lineHeight: 1.75, fontSize: 14, marginTop: 0 }}>
            Ihr Kundenkonto wurde vorübergehend deaktiviert. Mögliche Gründe sind eine laufende Übertragung
            Ihrer Beraterdaten, eine ausstehende Dokumentenprüfung oder eine administrative Maßnahme.
          </p>

          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: '#333' }}>Was können Sie tun?</div>
          <div style={{ display: 'grid', gap: 10, marginBottom: '1.5rem' }}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  background: '#f8fafc',
                  borderRadius: 8,
                  padding: '0.75rem 1rem',
                  border: '1px solid #e8ecf0',
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact box */}
          <div
            style={{
              background: '#e8f4f8',
              border: '1px solid #b0d8e8',
              borderRadius: 8,
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6, color: '#125267' }}>📬 Direktkontakt Support</div>
            <div>E-Mail: <a href="mailto:support@finexpert.de" style={{ color: '#125267', fontWeight: 600 }}>support@finexpert.de</a></div>
            <div style={{ marginTop: 4 }}>Telefon: <a href="tel:+498912345678" style={{ color: '#125267', fontWeight: 600 }}>+49 89 1234 5678</a></div>
            <div style={{ color: '#666', marginTop: 4, fontSize: 12 }}>Mo – Fr, 9:00 – 18:00 Uhr</div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <a
              href="mailto:support@finexpert.de"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '0.75rem',
                background: '#125267',
                color: '#fff',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              ✉️ Support kontaktieren
            </a>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.75rem',
                background: '#fff',
                color: '#555',
                border: '1px solid #ddd',
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              🚪 Abmelden
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#f8fafc', borderTop: '1px solid #e8ecf0', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#aaa' }}>
          <span>finExpert Beratungs GmbH</span>
          <span>Ref: FE-{user?.id?.slice(-5).toUpperCase() ?? '00000'}</span>
        </div>
      </div>
    </div>
  );
};
