import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { Spinner, Alert } from '../components/UI';
import { DEMO_USERS } from '../mock';

export const Login: React.FC = () => {
  const { login, addToast } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Bitte alle Felder ausfüllen.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const ok = login(email, password);
    setLoading(false);
    if (ok) {
      addToast('success', 'Erfolgreich angemeldet!');
      navigate('/dashboard');
    } else {
      setError('E-Mail oder Passwort ungültig. Bitte versuchen Sie es erneut.');
    }
  };

  const demoLogin = async (role: 'admin' | 'consultant' | 'customer') => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const u = DEMO_USERS[role];
    login(u.email, u.password);
    setLoading(false);
    addToast('success', `Als ${role === 'admin' ? 'Administrator' : role === 'consultant' ? 'Berater' : 'Kunde'} angemeldet`);
    navigate(role === 'customer' ? '/portal' : '/dashboard');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setResetSent(true);
  };

  if (showReset) {
    return (
      <div className="login-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 40, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: 8 }}>Passwort zurücksetzen</h2>
          <p className="text-grey text-sm" style={{ marginBottom: 24 }}>
            Geben Sie Ihre E-Mail-Adresse ein. Sie erhalten einen Link zum Zurücksetzen.
          </p>

          {resetSent ? (
            <>
              <Alert type="success">
                <strong>E-Mail gesendet!</strong> Bitte überprüfen Sie Ihren Posteingang und folgen Sie dem Link.
              </Alert>
              <button className="btn btn-primary btn-full mt-m" onClick={() => { setShowReset(false); setResetSent(false); }}>
                Zurück zur Anmeldung
              </button>
            </>
          ) : (
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label className="form-label">E-Mail-Adresse</label>
                <input className="form-control" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="ihre@email.de" required />
              </div>
              <div className="flex gap-s mt-m">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReset(false)}>Abbrechen</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Spinner small /> : 'Link senden'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div>
          <div className="login-left-title">finExpert</div>
          <p className="login-left-sub">
            Die professionelle Finanzberatungs-Plattform für Berater und ihre Kunden.
          </p>
          <div className="login-features">
            {[
              '✓ Vollständige Kundenberatung & Analyse',
              '✓ Altersvorsorge & Investitionsplanung',
              '✓ Automatische Protokollierung',
              '✓ Unternehmensdesign & Branding',
              '✓ Sichere Datenspeicherung (DSGVO)',
            ].map((f) => (
              <div key={f} className="login-feature-item">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-logo">💰 finExpert</div>

        <div className="login-form">
          <h1 className="login-title">Willkommen zurück</h1>
          <p className="login-subtitle">Melden Sie sich mit Ihren Zugangsdaten an.</p>

          {/* Demo shortcuts */}
          <div className="demo-buttons">
            <p>Demo-Zugänge (klicken zum Anmelden):</p>
            <div className="demo-btns">
              <button className="demo-btn" onClick={() => demoLogin('admin')} disabled={loading}>
                👑 Administrator
                <br /><span style={{ opacity: 0.6 }}>Alle Rechte</span>
              </button>
              <button className="demo-btn" onClick={() => demoLogin('consultant')} disabled={loading}>
                💼 Berater
                <br /><span style={{ opacity: 0.6 }}>Standardzugang</span>
              </button>
              <button className="demo-btn" onClick={() => demoLogin('customer')} disabled={loading}>
                👤 Kunde
                <br /><span style={{ opacity: 0.6 }}>Kundenportal</span>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-grey)', fontSize: 'var(--fs-xs)', marginBottom: 'var(--sp-m)' }}>
            — oder manuell anmelden —
          </div>

          {error && <div style={{ marginBottom: 16 }}><Alert type="danger">{error}</Alert></div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">E-Mail-Adresse *</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passwort *</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-m)' }}>
              <label className="flex items-center gap-s text-sm" style={{ cursor: 'pointer' }}>
                <input type="checkbox" /> Angemeldet bleiben
              </label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowReset(true)}>
                Passwort vergessen?
              </button>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><Spinner small /> Wird angemeldet...</> : 'Anmelden'}
            </button>
          </form>

          <p className="text-xs text-grey mt-l" style={{ textAlign: 'center' }}>
            Noch kein Konto?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); addToast('info', 'Bitte kontaktieren Sie Ihren Administrator.'); }}>
              Zugang anfordern
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
