import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { Alert, Spinner } from '../components/UI';

const STRENGTH_LABELS = ['', 'Sehr schwach', 'Schwach', 'Mittel', 'Stark', 'Sehr stark'];
const STRENGTH_COLORS = ['', '#e53e3e', '#ed8936', '#ecc94b', '#48bb78', '#276749'];

function calcStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export const FirstLogin: React.FC = () => {
  const navigate = useNavigate();
  const { user, addToast } = useApp();

  const [step, setStep] = useState<'welcome' | 'password' | 'profile' | 'done'>('welcome');
  const [loading, setLoading] = useState(false);

  // Password step
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState('');

  // Profile step
  const [phone, setPhone] = useState('');
  const [birth, setBirth] = useState('');
  const [newsletter, setNewsletter] = useState(true);

  const strength = calcStrength(password);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (password.length < 8) { setPwError('Das Passwort muss mindestens 8 Zeichen lang sein.'); return; }
    if (password !== confirmPassword) { setPwError('Die Passwörter stimmen nicht überein.'); return; }
    if (strength < 3) { setPwError('Bitte wählen Sie ein stärkeres Passwort.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep('profile');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep('done');
  };

  const handleFinish = () => {
    addToast('success', 'Willkommen bei finExpert! Ihr Konto ist eingerichtet.');
    navigate(user?.role === 'customer' ? '/portal' : '/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--gray-light)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-l)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, boxShadow: 'var(--shadow-lg)',
        width: '100%', maxWidth: 480, overflow: 'hidden',
      }}>
        {/* Header bar */}
        <div style={{ background: 'var(--primary)', padding: '24px 32px', color: '#fff' }}>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Poppins, sans-serif', marginBottom: 4 }}>
            💰 finExpert
          </div>
          <div style={{ opacity: 0.85, fontSize: 'var(--fs-sm)' }}>
            {step === 'welcome' && 'Willkommen — Konto einrichten'}
            {step === 'password' && 'Sicheres Passwort festlegen'}
            {step === 'profile' && 'Profil vervollständigen'}
            {step === 'done' && 'Alles bereit!'}
          </div>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div style={{ display: 'flex', background: 'var(--primary-light)', padding: '12px 32px', gap: 8, alignItems: 'center' }}>
            {(['welcome', 'password', 'profile'] as const).map((s, i) => (
              <React.Fragment key={s}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                  background: step === s ? 'var(--primary)' : ['welcome', 'password', 'profile'].indexOf(step) > i ? 'var(--success)' : '#fff',
                  color: step === s || ['welcome', 'password', 'profile'].indexOf(step) > i ? '#fff' : 'var(--text-grey)',
                  border: '2px solid',
                  borderColor: step === s ? 'var(--primary)' : ['welcome', 'password', 'profile'].indexOf(step) > i ? 'var(--success)' : 'var(--gray-dark)',
                  transition: 'all 0.2s',
                }}>
                  {['welcome', 'password', 'profile'].indexOf(step) > i ? '✓' : i + 1}
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: ['welcome', 'password', 'profile'].indexOf(step) > i ? 'var(--success)' : 'var(--gray-dark)' }} />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div style={{ padding: 32 }}>
          {/* ── Welcome ── */}
          {step === 'welcome' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>👋</div>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--primary)', marginBottom: 12 }}>
                Herzlich willkommen{user?.first_name ? `, ${user.first_name}` : ''}!
              </h2>
              <p style={{ color: 'var(--text-grey)', lineHeight: 1.6, marginBottom: 24 }}>
                Sie melden sich zum ersten Mal bei <strong>finExpert</strong> an. Um Ihr Konto einzurichten, führen wir Sie durch wenige kurze Schritte:
              </p>
              <div style={{ textAlign: 'left', display: 'grid', gap: 12, marginBottom: 32 }}>
                {[
                  { icon: '🔒', title: 'Passwort festlegen', desc: 'Erstellen Sie ein sicheres persönliches Passwort.' },
                  { icon: '👤', title: 'Profil vervollständigen', desc: 'Optionale Angaben für bessere Erreichbarkeit.' },
                  { icon: '✅', title: 'Fertig!', desc: 'Ihr Konto ist einsatzbereit.' },
                ].map((item) => (
                  <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, background: 'var(--gray-light)', borderRadius: 'var(--radius)' }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{item.title}</div>
                      <div style={{ color: 'var(--text-grey)', fontSize: 'var(--fs-xs)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep('password')}>
                Jetzt einrichten →
              </button>
            </div>
          )}

          {/* ── Password ── */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: 'var(--sp-m)' }}>
              <div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--primary)', marginBottom: 8 }}>
                  Sicheres Passwort erstellen
                </h3>
                <p className="text-sm text-grey">
                  Wählen Sie ein persönliches Passwort. Es muss mindestens 8 Zeichen lang sein.
                </p>
              </div>

              {pwError && <Alert type="danger">{pwError}</Alert>}

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Neues Passwort *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-control"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Neues Passwort"
                    autoFocus
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                  >
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Strength bar */}
                {password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: strength >= i ? STRENGTH_COLORS[strength] : 'var(--gray-dark)',
                          transition: 'background 0.2s',
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: STRENGTH_COLORS[strength], fontWeight: 600 }}>
                      {STRENGTH_LABELS[strength]}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Passwort bestätigen *</label>
                <input
                  className="form-control"
                  type={showPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                />
                {confirmPassword && password !== confirmPassword && (
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--danger)', marginTop: 4 }}>
                    Passwörter stimmen nicht überein
                  </div>
                )}
                {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--success)', marginTop: 4 }}>
                    ✓ Passwörter stimmen überein
                  </div>
                )}
              </div>

              <div style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 12 }}>
                <div className="text-xs text-grey font-bold" style={{ marginBottom: 4 }}>Passwort-Anforderungen:</div>
                {[
                  { check: password.length >= 8, label: 'Mindestens 8 Zeichen' },
                  { check: /[A-Z]/.test(password), label: 'Mindestens ein Großbuchstabe' },
                  { check: /[0-9]/.test(password), label: 'Mindestens eine Zahl' },
                  { check: /[^A-Za-z0-9]/.test(password), label: 'Mindestens ein Sonderzeichen' },
                ].map((req) => (
                  <div key={req.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-xs)', marginTop: 4 }}>
                    <span style={{ color: req.check ? 'var(--success)' : 'var(--gray-dark)' }}>
                      {req.check ? '✓' : '○'}
                    </span>
                    <span style={{ color: req.check ? 'var(--text)' : 'var(--text-grey)' }}>{req.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-s">
                <button type="button" className="btn btn-secondary" onClick={() => setStep('welcome')}>← Zurück</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? <Spinner small /> : 'Passwort festlegen →'}
                </button>
              </div>
            </form>
          )}

          {/* ── Profile ── */}
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gap: 'var(--sp-m)' }}>
              <div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--primary)', marginBottom: 8 }}>
                  Profil vervollständigen
                </h3>
                <p className="text-sm text-grey">
                  Diese Angaben sind optional, helfen uns aber, Sie besser zu erreichen.
                </p>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Telefonnummer (optional)</label>
                <input
                  className="form-control"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 123 456789"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Geburtsdatum (optional)</label>
                <input
                  className="form-control"
                  type="date"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-s)', cursor: 'pointer', padding: 12, background: 'var(--gray-light)', borderRadius: 'var(--radius)' }}>
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <div className="text-sm font-bold">Produktneuigkeiten erhalten</div>
                  <div className="text-xs text-grey">Ich möchte über neue Funktionen und Updates informiert werden. Jederzeit abmeldbar.</div>
                </div>
              </label>

              <div className="flex gap-s">
                <button type="button" className="btn btn-secondary" onClick={() => setStep('password')}>← Zurück</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? <Spinner small /> : 'Weiter →'}
                </button>
              </div>

              <button type="button" className="btn btn-ghost btn-sm" style={{ textAlign: 'center' }}
                onClick={handleProfileSubmit}>
                Überspringen
              </button>
            </form>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--primary)', marginBottom: 12 }}>
                Konto erfolgreich eingerichtet!
              </h2>
              <p style={{ color: 'var(--text-grey)', lineHeight: 1.6, marginBottom: 32 }}>
                Ihr finExpert-Konto ist bereit. Sie können jetzt alle Funktionen der Plattform nutzen.
              </p>

              <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
                {[
                  '✓ Sicheres Passwort festgelegt',
                  phone ? `✓ Telefonnummer hinterlegt: ${phone}` : null,
                  birth ? `✓ Geburtsdatum hinterlegt` : null,
                  '✓ Datenschutzeinstellungen gespeichert',
                ].filter(Boolean).map((item) => (
                  <div key={item} style={{ padding: 10, background: 'var(--success)', color: '#fff', borderRadius: 'var(--radius)', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                    {item}
                  </div>
                ))}
              </div>

              <button className="btn btn-primary btn-full btn-lg" onClick={handleFinish}>
                Zur Plattform →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
