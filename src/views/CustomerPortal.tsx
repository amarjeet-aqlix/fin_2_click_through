import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Tabs, Panel, Badge, Alert, EmptyState, SectionHeader, Progress, Input, Toggle } from '../components/UI';
import { useApp } from '../context';
import { FINANCIAL_DATA, DOCUMENTS, WISHES_OPTIONS, COMPANY_INFO, CUSTOMER_CONSULTATIONS } from '../mock';
import { FinancialHouse } from '../components/FinancialHouse';

const PORTAL_TABS = [
  { id: 'overview', label: 'Übersicht', icon: '🏠' },
  { id: 'documents', label: 'Meine Dokumente', icon: '📄' },
  { id: 'goals', label: 'Wünsche & Ziele', icon: '🎯' },
  { id: 'account', label: 'Mein Konto', icon: '⚙️' },
];

export const CustomerPortal: React.FC = () => {
  const { user, addToast } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') ?? 'overview');

  const fin = FINANCIAL_DATA['cust1'];
  const docs = DOCUMENTS['cust1'] ?? [];

  const [selectedWishes, setSelectedWishes] = useState(['Altersvorsorge', 'Eigenheim', 'Reisen']);
  const [notifications, setNotifications] = useState({ email: true, sms: false, newsletter: false });
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const handleToggleWish = (w: string) => {
    setSelectedWishes((prev) => prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]);
    addToast('success', `Ziel "${w}" ${selectedWishes.includes(w) ? 'entfernt' : 'hinzugefügt'}.`);
  };

  const handleSaveAccount = async () => {
    await new Promise((r) => setTimeout(r, 600));
    addToast('success', 'Einstellungen wurden gespeichert.');
  };

  const fmtCur = (n: number) => `${n.toLocaleString('de-DE')} €`;

  return (
    <AppLayout title="Mein Bereich">
      {/* Welcome banner */}
      <div style={{ background: `linear-gradient(135deg, var(--primary), var(--accent-dark))`, borderRadius: 12, padding: 'var(--sp-l)', color: '#fff', marginBottom: 'var(--sp-l)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: '#fff', marginBottom: 4 }}>Willkommen, {user?.first_name}! 👋</h2>
          <p style={{ opacity: 0.85, fontSize: 'var(--fs-s)' }}>Ihr persönlicher Finanzbereich bei {COMPANY_INFO.name}</p>
        </div>
        <div style={{ opacity: 0.9, fontSize: 50 }}>💰</div>
      </div>

      <div className="card">
        <Tabs tabs={PORTAL_TABS} active={activeTab} onChange={setActiveTab} />
        <div className="tab-content">

          {/* ── Übersicht ──────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div>
              {fin ? (
                <>
                  {/* Financial snapshot */}
                  <SectionHeader title="Meine Finanzen" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--sp-m)', marginBottom: 'var(--sp-l)' }}>
                    {[
                      { label: 'Nettoeinkommen', value: fmtCur(fin.income.net_salary), icon: '💶', sub: 'monatlich' },
                      { label: 'Ersparnisse', value: fmtCur(fin.savings), icon: '🏦', sub: 'gesamt' },
                      { label: 'Versicherungen', value: fin.insurances.length, icon: '🛡️', sub: 'aktive Verträge' },
                      { label: 'Investments', value: fin.investments.length, icon: '📈', sub: 'Positionen' },
                    ].map((s) => (
                      <div key={s.label} className="stat-card">
                        <div className="stat-card-icon">{s.icon}</div>
                        <div className="stat-card-value">{s.value}</div>
                        <div className="stat-card-label">{s.label}</div>
                        <div className="text-xs text-grey">{s.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Retirement progress */}
                  <Panel title="Meine Altersvorsorge">
                    <div className="insight-row">
                      <div className="insight-box">
                        <div className="insight-label">Rentenwunsch / Monat</div>
                        <div className="insight-value">{fmtCur(fin.retirement.monthly_need)}</div>
                      </div>
                      <div className="insight-box">
                        <div className="insight-label">Bereits abgesichert</div>
                        <div className="insight-value" style={{ color: 'var(--color-green)' }}>{fmtCur(fin.retirement.state_pension + fin.retirement.private_pension)}</div>
                      </div>
                      <div className="insight-box">
                        <div className="insight-label">Noch zu schließen</div>
                        <div className="insight-value" style={{ color: 'var(--color-red)' }}>{fmtCur(fin.retirement.gap)}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 'var(--sp-m)' }}>
                      <div className="flex justify-between text-sm mb-s">
                        <span>Abdeckungsgrad</span>
                        <strong>{Math.round(((fin.retirement.state_pension + fin.retirement.private_pension) / fin.retirement.monthly_need) * 100)}%</strong>
                      </div>
                      <Progress value={fin.retirement.state_pension + fin.retirement.private_pension} max={fin.retirement.monthly_need} type="warning" />
                    </div>
                  </Panel>

                  {/* My insurance */}
                  <Panel title="Meine Versicherungen" action={<Badge type="success">{fin.insurances.filter((i) => i.status === 'active').length} aktiv</Badge>}>
                    {fin.insurances.map((ins) => (
                      <div key={ins.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-light)' }}>
                        <div>
                          <div className="text-sm font-bold">{ins.name}</div>
                          <div className="text-xs text-grey">{ins.provider} · {fmtCur(ins.monthly_premium)}/Monat</div>
                        </div>
                        <Badge type={ins.status === 'active' ? 'success' : 'neutral'}>{ins.status === 'active' ? 'Aktiv' : 'Inaktiv'}</Badge>
                      </div>
                    ))}
                  </Panel>

                  {/* Financial House */}
                  {CUSTOMER_CONSULTATIONS['cust1'] && (
                    <div style={{ marginTop: 'var(--sp-l)' }}>
                      <FinancialHouse
                        precautions={CUSTOMER_CONSULTATIONS['cust1'].precautions}
                        current_state={CUSTOMER_CONSULTATIONS['cust1'].current_state}
                        suggested_state={CUSTOMER_CONSULTATIONS['cust1'].suggested_state}
                        isConsultant={false}
                      />
                    </div>
                  )}

                  {/* Contact advisor */}
                  <Alert type="info">
                    <strong>Ihr Berater:</strong> Sarah Berger ·
                    <a href="tel:+4989123456" style={{ marginLeft: 8 }}>📞 +49 89 12345678</a> ·
                    <button className="btn btn-sm btn-primary" style={{ marginLeft: 8 }} onClick={() => addToast('success', 'Anfrage wurde gesendet.')}>
                      Termin anfragen
                    </button>
                  </Alert>
                </>
              ) : (
                <EmptyState icon="📊" text="Noch keine Daten vorhanden" sub="Ihr Berater wird Ihre Daten bald eintragen." />
              )}
            </div>
          )}

          {/* ── Dokumente ──────────────────────────────────────── */}
          {activeTab === 'documents' && (
            <div>
              <SectionHeader title="Meine Dokumente" />
              {docs.length === 0 ? (
                <EmptyState icon="📄" text="Noch keine Dokumente" sub="Ihr Berater wird Dokumente für Sie bereitstellen." />
              ) : (
                <div className="card">
                  <table>
                    <thead><tr><th>Dokument</th><th>Größe</th><th>Datum</th><th></th></tr></thead>
                    <tbody>
                      {docs.map((doc) => (
                        <tr key={doc.id}>
                          <td>
                            <div className="flex items-center gap-s">
                              <span style={{ fontSize: 20 }}>📄</span>
                              <span className="text-sm font-bold">{doc.name}</span>
                            </div>
                          </td>
                          <td className="text-sm text-grey">{doc.size}</td>
                          <td className="text-sm text-grey">{new Date(doc.created_at).toLocaleDateString('de-DE')}</td>
                          <td>
                            <button className="btn btn-primary btn-sm" onClick={() => addToast('success', `"${doc.name}" wird heruntergeladen...`)}>
                              ⬇️ Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Wünsche & Ziele ────────────────────────────────── */}
          {activeTab === 'goals' && (
            <div>
              <SectionHeader title="Meine Wünsche & Ziele" />
              <Alert type="info">
                Wählen Sie Ihre persönlichen Finanzziele. Diese helfen Ihrem Berater, die passende Strategie zu entwickeln.
              </Alert>

              <Panel title="Meine Ziele auswählen">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-s)', marginBottom: 'var(--sp-m)' }}>
                  {WISHES_OPTIONS.map((w) => {
                    const selected = selectedWishes.includes(w);
                    return (
                      <button
                        key={w}
                        className={`btn ${selected ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleToggleWish(w)}
                        style={{ transition: 'all 0.2s' }}
                      >
                        {selected ? '✓ ' : '+ '}{w}
                      </button>
                    );
                  })}
                </div>
                {selectedWishes.length > 0 && (
                  <div>
                    <div className="text-sm font-bold" style={{ marginBottom: 'var(--sp-s)' }}>Ausgewählt ({selectedWishes.length}):</div>
                    <div className="flex gap-s flex-wrap">
                      {selectedWishes.map((w) => <Badge key={w} type="primary">{w}</Badge>)}
                    </div>
                  </div>
                )}
              </Panel>

              <button className="btn btn-primary" onClick={() => addToast('success', 'Ihre Ziele wurden gespeichert und Ihrem Berater mitgeteilt.')}>
                💾 Ziele speichern
              </button>
            </div>
          )}

          {/* ── Konto ──────────────────────────────────────────── */}
          {activeTab === 'account' && (
            <div>
              <SectionHeader title="Mein Konto" />

              <Panel title="Benachrichtigungen">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-m)' }}>
                  {[
                    { key: 'email', label: 'E-Mail Benachrichtigungen', desc: 'Dokumente, Termine, Erinnerungen' },
                    { key: 'sms', label: 'SMS Benachrichtigungen', desc: 'Nur wichtige Ereignisse' },
                    { key: 'newsletter', label: 'Newsletter', desc: 'Finanz-News und Tipps' },
                  ].map((n) => (
                    <div key={n.key} className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-bold">{n.label}</div>
                        <div className="text-xs text-grey">{n.desc}</div>
                      </div>
                      <Toggle
                        checked={(notifications as any)[n.key]}
                        onChange={(v) => setNotifications((p) => ({ ...p, [n.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Passwort ändern">
                <Input label="Aktuelles Passwort" type="password" value={currentPw} onChange={setCurrentPw} />
                <Input label="Neues Passwort" type="password" value={newPw} onChange={setNewPw} hint="Mindestens 8 Zeichen" />
                <button className="btn btn-primary btn-sm" onClick={() => { addToast('success', 'Passwort wurde geändert.'); setCurrentPw(''); setNewPw(''); }}>Passwort ändern</button>
              </Panel>

              <Panel title="Datenschutz & Rechtliches">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-m)' }}>
                  {[
                    { label: 'Datenschutzerklärung', icon: '🔒' },
                    { label: 'Allgemeine Geschäftsbedingungen', icon: '📜' },
                    { label: 'Cookie-Richtlinie', icon: '🍪' },
                    { label: 'Erstinformation (IDD)', icon: '📋' },
                  ].map((d) => (
                    <button key={d.label} className="btn btn-secondary" onClick={() => addToast('info', `"${d.label}" wird geöffnet...`)}>
                      {d.icon} {d.label}
                    </button>
                  ))}
                </div>
              </Panel>

              <Alert type="warning">
                Möchten Sie Ihr Konto löschen?{' '}
                <button className="btn btn-sm btn-danger" onClick={() => addToast('info', 'Bitte kontaktieren Sie Ihren Berater für die Kontolöschung.')}>
                  Konto löschen
                </button>
              </Alert>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
