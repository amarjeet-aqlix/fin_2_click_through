import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Tabs, Panel, Input, Select, Alert, Toggle, Modal, SectionHeader } from '../components/UI';
import { useApp } from '../context';
import { CUSTOMERS } from '../mock';

const OCCASION_OPTIONS = [
  { value: 'erstberatung', label: 'Erstberatung' },
  { value: 'folgeberatung', label: 'Folgeberatung' },
  { value: 'produktabschluss', label: 'Produktabschluss' },
  { value: 'kundenwunsch', label: 'Kundenwunsch' },
  { value: 'jährliche_überprüfung', label: 'Jährliche Überprüfung' },
  { value: 'anlassberatung', label: 'Anlassberatung' },
];

const RECOMMENDATION_TEMPLATES = [
  'Abschluss einer Berufsunfähigkeitsversicherung',
  'Aufstockung der Altersvorsorge',
  'Optimierung der Krankenversicherung',
  'Abschluss einer Risikolebensversicherung',
  'Aufbau eines Notgroschens (3–6 Monatsgehälter)',
  'Investition in ETF-Sparplan',
  'Immobilienfinanzierung prüfen',
  'Riester-Rente abschließen',
  'Betriebliche Altersvorsorge prüfen',
  'Pflegeversicherung abschließen',
];

const CHANGE_REASONS = [
  { value: 'bessere_konditionen', label: 'Bessere Konditionen beim neuen Anbieter' },
  { value: 'unzufriedenheit', label: 'Unzufriedenheit mit bisherigem Anbieter' },
  { value: 'leistungslücken', label: 'Leistungslücken beim alten Produkt' },
  { value: 'preis_leistung', label: 'Besseres Preis-Leistungs-Verhältnis' },
  { value: 'lebensveraenderung', label: 'Veränderung der Lebenssituation' },
  { value: 'beratungsempfehlung', label: 'Empfehlung des Beraters' },
];

const INFO_SOURCES = [
  { id: 'src1', label: 'Kundenselbstauskunft', key: 'selfDeclaration' },
  { id: 'src2', label: 'Bestehende Unterlagen', key: 'existingDocs' },
  { id: 'src3', label: 'Online-Portal/App', key: 'onlinePortal' },
  { id: 'src4', label: 'Dritte (Steuerberater, etc.)', key: 'thirdParty' },
  { id: 'src5', label: 'Bonitätsauskunft', key: 'creditCheck' },
  { id: 'src6', label: 'Telefonische Auskunft', key: 'phoneInfo' },
];

export const ConsultationDoc: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const customer = CUSTOMERS.find((c) => c.id === id);
  const [activeTab, setActiveTab] = useState('occasion');
  const [saving, setSaving] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signed, setSigned] = useState(false);

  // Form state
  const [form, setForm] = useState({
    // Gesprächsanlass
    occasion: 'erstberatung',
    meeting_date: new Date().toISOString().split('T')[0],
    meeting_duration: '60',
    meeting_type: 'persönlich',
    occasion_notes: 'Kunde wünscht eine umfassende Finanzberatung zu den Themen Altersvorsorge und Absicherung.',

    // IDD
    idd_confirmed: true,
    idd_date: new Date().toISOString().split('T')[0],
    distribution_channel: 'persönliche_beratung',
    remuneration_type: 'provision',
    remuneration_amount: '0',
    conflicts_of_interest: false,
    conflicts_notes: '',
    product_category: 'lebens_und_rentenversicherung',

    // Informationsquellen
    selfDeclaration: true,
    existingDocs: true,
    onlinePortal: false,
    thirdParty: false,
    creditCheck: false,
    phoneInfo: false,
    info_notes: 'Der Kunde hat alle relevanten Unterlagen mitgebracht und vollständige Auskunft erteilt.',

    // Empfehlungen
    recommendations: [
      { id: 'rec1', text: 'Abschluss einer Berufsunfähigkeitsversicherung', priority: 'hoch', reason: 'Aktuell keine Absicherung vorhanden; Berufsrisiko als Ingenieur ist erhöht.' },
      { id: 'rec2', text: 'Aufstockung der Altersvorsorge', priority: 'mittel', reason: 'Aktuelle Rentenlücke beträgt ca. €1.200/Monat.' },
    ] as Array<{ id: string; text: string; priority: string; reason: string }>,
    general_recommendation: 'Auf Basis der Beratung empfehle ich dem Kunden prioritär eine BU-Absicherung sowie die Aufstockung der Altersvorsorge. Die Liquiditätsreserve sollte auf mindestens 3 Monatsgehälter aufgebaut werden.',

    // Wechselgründe
    has_replacement: false,
    replaced_product: '',
    replaced_insurer: '',
    change_reasons: [] as string[],
    change_notes: '',
    customer_confirmed_change: false,

    // Abschluss
    customer_questions: 'Der Kunde hatte keine weiteren Fragen.',
    follow_up_date: '',
    follow_up_notes: '',
    disclaimer_read: true,
    customer_copy: true,
  });

  const [newRec, setNewRec] = useState({ text: '', priority: 'mittel', reason: '' });
  const [showAddRec, setShowAddRec] = useState(false);

  const set = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    addToast('success', 'Beratungsprotokoll gespeichert');
  };

  const handleFinalize = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSigned(true);
    setShowSignatureModal(false);
    addToast('success', 'Protokoll abgeschlossen und signiert');
  };

  const addRecommendation = () => {
    if (!newRec.text) return;
    set('recommendations', [
      ...form.recommendations,
      { id: `rec${Date.now()}`, ...newRec },
    ]);
    setNewRec({ text: '', priority: 'mittel', reason: '' });
    setShowAddRec(false);
  };

  const removeRecommendation = (id: string) => {
    set('recommendations', form.recommendations.filter((r) => r.id !== id));
  };

  const toggleChangeReason = (val: string) => {
    const list = form.change_reasons.includes(val)
      ? form.change_reasons.filter((r) => r !== val)
      : [...form.change_reasons, val];
    set('change_reasons', list);
  };

  if (!customer) {
    return (
      <AppLayout title="Beratungsprotokoll">
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h3>Kunde nicht gefunden</h3>
          <p className="text-grey" style={{ marginBottom: 24 }}>Der angegebene Kunde existiert nicht.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Zurück zur Übersicht</button>
        </div>
      </AppLayout>
    );
  }

  const tabs = [
    { id: 'occasion', label: 'Gesprächsanlass' },
    { id: 'idd', label: 'IDD-Informationen' },
    { id: 'sources', label: 'Informationsquellen' },
    { id: 'recommendations', label: 'Empfehlungen' },
    { id: 'replacement', label: 'Wechselgründe' },
    { id: 'closing', label: 'Abschluss' },
  ];

  const completedTabs = [
    form.occasion && form.meeting_date,
    form.idd_confirmed,
    form.selfDeclaration || form.existingDocs || form.onlinePortal,
    form.recommendations.length > 0,
    !form.has_replacement || (form.replaced_product && form.replaced_insurer),
    form.disclaimer_read,
  ].filter(Boolean).length;

  return (
    <AppLayout title="Beratungsprotokoll">
      {/* Header */}
      <div className="card" style={{ marginBottom: 'var(--sp-m)' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-m)', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Zurück</button>
          <div style={{ flex: 1 }}>
            <div className="text-xs text-grey">Beratungsprotokoll für</div>
            <div className="font-bold" style={{ fontSize: 'var(--fs-lg)' }}>
              {customer.first_name} {customer.last_name}
            </div>
            <div className="text-xs text-grey">{customer.email}</div>
          </div>

          {signed && (
            <span className="badge badge-success" style={{ fontSize: 'var(--fs-sm)', padding: '6px 14px' }}>
              ✓ Signiert &amp; Abgeschlossen
            </span>
          )}

          <div style={{ display: 'flex', gap: 'var(--sp-s)' }}>
            <button className="btn btn-secondary" onClick={handleSave} disabled={saving}>
              {saving ? 'Speichert…' : '💾 Speichern'}
            </button>
            {!signed && (
              <button className="btn btn-primary" onClick={() => setShowSignatureModal(true)}>
                ✍️ Abschließen &amp; Signieren
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div style={{ padding: '0 var(--sp-l) var(--sp-m)' }}>
          <div className="flex justify-between text-xs text-grey" style={{ marginBottom: 6 }}>
            <span>Protokoll-Vollständigkeit</span>
            <span>{completedTabs}/6 Abschnitte</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(completedTabs / 6) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="card-header" style={{ padding: '0 var(--sp-l)' }}>
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        <div className="card-body">
          {/* ── Gesprächsanlass ── */}
          {activeTab === 'occasion' && (
            <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
              <SectionHeader title="Gesprächsanlass" subtitle="Art und Datum des Beratungsgesprächs" />

              <div className="grid-2">
                <Select label="Anlass des Gesprächs *" value={form.occasion}
                  onChange={(v) => set('occasion', v)}
                  options={OCCASION_OPTIONS} />
                <Select label="Art der Beratung" value={form.meeting_type}
                  onChange={(v) => set('meeting_type', v)}
                  options={[
                    { value: 'persönlich', label: 'Persönlich vor Ort' },
                    { value: 'telefon', label: 'Telefonisch' },
                    { value: 'video', label: 'Videokonferenz' },
                    { value: 'schriftlich', label: 'Schriftlich/Digital' },
                  ]} />
              </div>

              <div className="grid-2">
                <Input label="Datum des Gesprächs *" type="date" value={form.meeting_date}
                  onChange={(v) => set('meeting_date', v)} />
                <Input label="Dauer (Minuten)" type="number" value={form.meeting_duration}
                  onChange={(v) => set('meeting_duration', v)} />
              </div>

              <div>
                <label className="form-label">Anlass-Beschreibung / Notizen</label>
                <textarea className="form-control" rows={4}
                  value={form.occasion_notes}
                  onChange={(e) => set('occasion_notes', e.target.value)}
                  placeholder="Beschreiben Sie den Anlass des Gesprächs und die Ausgangssituation des Kunden..." />
              </div>

              <Alert type="info">
                Das Beratungsprotokoll ist gemäß §18 VersVermV verpflichtend für alle Versicherungsprodukte und muss dem Kunden ausgehändigt werden.
              </Alert>
            </div>
          )}

          {/* ── IDD-Informationen ── */}
          {activeTab === 'idd' && (
            <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
              <SectionHeader title="IDD-Informationen" subtitle="Insurance Distribution Directive — Pflichtangaben gemäß EU-Richtlinie" />

              <Panel>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--sp-m)' }}>
                  <div>
                    <div className="font-bold">IDD-Informationen bereitgestellt</div>
                    <div className="text-xs text-grey">Dem Kunden wurden alle erforderlichen IDD-Vorabinformationen übermittelt</div>
                  </div>
                  <Toggle checked={form.idd_confirmed} onChange={(v) => set('idd_confirmed', v)} />
                </div>

                {form.idd_confirmed && (
                  <Input label="Datum der IDD-Übermittlung" type="date" value={form.idd_date}
                    onChange={(v) => set('idd_date', v)} />
                )}
              </Panel>

              <div className="grid-2">
                <Select label="Vertriebskanal" value={form.distribution_channel}
                  onChange={(v) => set('distribution_channel', v)}
                  options={[
                    { value: 'persönliche_beratung', label: 'Persönliche Beratung' },
                    { value: 'fernabsatz', label: 'Fernabsatz (Online/Telefon)' },
                    { value: 'makler', label: 'Versicherungsmakler' },
                    { value: 'agent', label: 'Gebundener Vermittler' },
                  ]} />
                <Select label="Vergütungsart" value={form.remuneration_type}
                  onChange={(v) => set('remuneration_type', v)}
                  options={[
                    { value: 'provision', label: 'Provision (vom Versicherer)' },
                    { value: 'honorar', label: 'Honorar (vom Kunden)' },
                    { value: 'gemischt', label: 'Gemischt' },
                  ]} />
              </div>

              <Select label="Produktkategorie" value={form.product_category}
                onChange={(v) => set('product_category', v)}
                options={[
                  { value: 'lebens_und_rentenversicherung', label: 'Lebens- und Rentenversicherung' },
                  { value: 'berufsunfähigkeit', label: 'Berufsunfähigkeitsversicherung' },
                  { value: 'krankenversicherung', label: 'Krankenversicherung' },
                  { value: 'sach_und_haftpflicht', label: 'Sach- und Haftpflichtversicherung' },
                  { value: 'anlageprodukte', label: 'Anlageprodukte / Investment' },
                  { value: 'mehrere', label: 'Mehrere Produktkategorien' },
                ]} />

              <Panel>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">Interessenkonflikte vorhanden</div>
                    <div className="text-xs text-grey">Bestehen mögliche Interessenkonflikte bei dieser Beratung?</div>
                  </div>
                  <Toggle checked={form.conflicts_of_interest} onChange={(v) => set('conflicts_of_interest', v)} />
                </div>
                {form.conflicts_of_interest && (
                  <div style={{ marginTop: 'var(--sp-m)' }}>
                    <label className="form-label">Beschreibung der Interessenkonflikte</label>
                    <textarea className="form-control" rows={3}
                      value={form.conflicts_notes}
                      onChange={(e) => set('conflicts_notes', e.target.value)}
                      placeholder="Beschreiben Sie die Interessenkonflikte..." />
                  </div>
                )}
              </Panel>

              <Alert type="success">
                Die IDD-Richtlinie (Insurance Distribution Directive) gilt EU-weit seit 01.10.2018 und verpflichtet alle Versicherungsvermittler zur transparenten Offenlegung von Vergütung, Vertriebsweg und möglichen Interessenkonflikten.
              </Alert>
            </div>
          )}

          {/* ── Informationsquellen ── */}
          {activeTab === 'sources' && (
            <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
              <SectionHeader title="Informationsquellen" subtitle="Basis der Beratungsgrundlage" />

              <Panel>
                <div className="font-bold" style={{ marginBottom: 'var(--sp-m)' }}>
                  Welche Informationsquellen wurden verwendet?
                </div>
                <div style={{ display: 'grid', gap: 'var(--sp-m)' }}>
                  {INFO_SOURCES.map((src) => (
                    <div key={src.id} className="flex items-center justify-between">
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--sp-s)' }}>
                        <input
                          type="checkbox"
                          checked={(form as Record<string, unknown>)[src.key] as boolean}
                          onChange={(e) => set(src.key, e.target.checked)}
                        />
                        <span>{src.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </Panel>

              <div>
                <label className="form-label">Ergänzende Anmerkungen zu den Informationsquellen</label>
                <textarea className="form-control" rows={4}
                  value={form.info_notes}
                  onChange={(e) => set('info_notes', e.target.value)}
                  placeholder="Weitere Anmerkungen zu den verwendeten Informationsquellen..." />
              </div>

              {!form.selfDeclaration && !form.existingDocs && !form.onlinePortal && !form.thirdParty && (
                <Alert type="warning">
                  Bitte wählen Sie mindestens eine Informationsquelle aus.
                </Alert>
              )}
            </div>
          )}

          {/* ── Empfehlungen ── */}
          {activeTab === 'recommendations' && (
            <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
              <div className="flex items-center justify-between">
                <SectionHeader title="Empfehlungen" subtitle="Beratungsempfehlungen und Begründungen" />
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddRec(true)}>+ Empfehlung</button>
              </div>

              {form.recommendations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-text">Noch keine Empfehlungen</div>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddRec(true)}>Erste Empfehlung hinzufügen</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 'var(--sp-m)' }}>
                  {form.recommendations.map((rec, i) => (
                    <Panel key={rec.id}>
                      <div className="flex items-start justify-between" style={{ gap: 'var(--sp-m)' }}>
                        <div style={{ flex: 1 }}>
                          <div className="flex items-center gap-s" style={{ marginBottom: 'var(--sp-xs)' }}>
                            <span className="font-bold text-sm">{i + 1}. {rec.text}</span>
                            <span className={`badge ${rec.priority === 'hoch' ? 'badge-danger' : rec.priority === 'mittel' ? 'badge-warning' : 'badge-info'}`}>
                              {rec.priority === 'hoch' ? 'Hohe Priorität' : rec.priority === 'mittel' ? 'Mittlere Priorität' : 'Niedrige Priorität'}
                            </span>
                          </div>
                          <div className="text-sm text-grey">{rec.reason}</div>
                        </div>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                          onClick={() => removeRecommendation(rec.id)}>✕</button>
                      </div>
                    </Panel>
                  ))}
                </div>
              )}

              <div>
                <label className="form-label">Allgemeine Beratungsempfehlung (Zusammenfassung)</label>
                <textarea className="form-control" rows={5}
                  value={form.general_recommendation}
                  onChange={(e) => set('general_recommendation', e.target.value)}
                  placeholder="Fassen Sie die Beratungsempfehlungen zusammen..." />
              </div>
            </div>
          )}

          {/* ── Wechselgründe ── */}
          {activeTab === 'replacement' && (
            <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
              <SectionHeader title="Wechselgründe" subtitle="Bei Produktwechsel oder Ablösung bestehender Verträge" />

              <Panel>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">Ablösung eines bestehenden Produkts</div>
                    <div className="text-xs text-grey">Wird ein bestehendes Produkt durch ein neues ersetzt?</div>
                  </div>
                  <Toggle checked={form.has_replacement} onChange={(v) => set('has_replacement', v)} />
                </div>
              </Panel>

              {form.has_replacement && (
                <>
                  <div className="grid-2">
                    <Input label="Abzulösendes Produkt" value={form.replaced_product}
                      onChange={(v) => set('replaced_product', v)}
                      placeholder="z.B. Risikolebensversicherung XY" />
                    <Input label="Bisheriger Versicherer" value={form.replaced_insurer}
                      onChange={(v) => set('replaced_insurer', v)}
                      placeholder="z.B. Allianz AG" />
                  </div>

                  <Panel>
                    <div className="font-bold" style={{ marginBottom: 'var(--sp-m)' }}>Gründe für den Wechsel</div>
                    <div style={{ display: 'grid', gap: 'var(--sp-m)' }}>
                      {CHANGE_REASONS.map((r) => (
                        <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-s)', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={form.change_reasons.includes(r.value)}
                            onChange={() => toggleChangeReason(r.value)}
                          />
                          <span className="text-sm">{r.label}</span>
                        </label>
                      ))}
                    </div>
                  </Panel>

                  <div>
                    <label className="form-label">Weitere Wechselbegründung</label>
                    <textarea className="form-control" rows={3}
                      value={form.change_notes}
                      onChange={(e) => set('change_notes', e.target.value)}
                      placeholder="Weitere Begründung für den Produktwechsel..." />
                  </div>

                  <Panel>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">Kundenbestätigung</div>
                        <div className="text-xs text-grey">Der Kunde bestätigt, die Wechselgründe verstanden zu haben</div>
                      </div>
                      <Toggle checked={form.customer_confirmed_change} onChange={(v) => set('customer_confirmed_change', v)} />
                    </div>
                  </Panel>
                </>
              )}

              {!form.has_replacement && (
                <Alert type="info">
                  Kein Produktwechsel vorgesehen. Falls ein bestehendes Produkt abgelöst wird, aktivieren Sie die Option oben.
                </Alert>
              )}
            </div>
          )}

          {/* ── Abschluss ── */}
          {activeTab === 'closing' && (
            <div style={{ display: 'grid', gap: 'var(--sp-l)' }}>
              <SectionHeader title="Abschluss" subtitle="Gesprächsabschluss, Folgetermin und Signatur" />

              <div>
                <label className="form-label">Fragen und Anmerkungen des Kunden</label>
                <textarea className="form-control" rows={3}
                  value={form.customer_questions}
                  onChange={(e) => set('customer_questions', e.target.value)}
                  placeholder="Hatte der Kunde weitere Fragen oder Anmerkungen?" />
              </div>

              <div className="grid-2">
                <Input label="Folgetermin (optional)" type="date" value={form.follow_up_date}
                  onChange={(v) => set('follow_up_date', v)} />
                <div />
              </div>

              <div>
                <label className="form-label">Notizen zum Folgetermin</label>
                <textarea className="form-control" rows={2}
                  value={form.follow_up_notes}
                  onChange={(e) => set('follow_up_notes', e.target.value)}
                  placeholder="Was soll beim nächsten Termin besprochen werden?" />
              </div>

              <Panel>
                <div className="font-bold" style={{ marginBottom: 'var(--sp-m)' }}>Pflichtbestätigungen</div>
                <div style={{ display: 'grid', gap: 'var(--sp-m)' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-s)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.disclaimer_read}
                      onChange={(e) => set('disclaimer_read', e.target.checked)}
                      style={{ marginTop: 2 }} />
                    <span className="text-sm">
                      Dem Kunden wurde das Beratungsprotokoll vorgelesen / zur Durchsicht übergeben. Der Kunde hatte ausreichend Zeit, den Inhalt zu prüfen.
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-s)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.customer_copy}
                      onChange={(e) => set('customer_copy', e.target.checked)}
                      style={{ marginTop: 2 }} />
                    <span className="text-sm">
                      Der Kunde erhält eine Kopie des Beratungsprotokolls (gemäß §18 Abs. 3 VersVermV).
                    </span>
                  </label>
                </div>
              </Panel>

              {signed ? (
                <Alert type="success">
                  ✓ Dieses Beratungsprotokoll wurde bereits signiert und abgeschlossen am {new Date().toLocaleDateString('de-DE')}.
                </Alert>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--sp-l)', background: 'var(--gray-light)', borderRadius: 'var(--radius)', border: '2px dashed var(--gray-dark)' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>✍️</div>
                  <div className="font-bold" style={{ marginBottom: 8 }}>Protokoll noch nicht signiert</div>
                  <div className="text-sm text-grey" style={{ marginBottom: 16 }}>
                    Schließen Sie das Protokoll ab, sobald das Gespräch beendet ist und alle Angaben vollständig sind.
                  </div>
                  <button className="btn btn-primary" onClick={() => setShowSignatureModal(true)}
                    disabled={!form.disclaimer_read}>
                    ✍️ Jetzt abschließen &amp; signieren
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between" style={{ marginTop: 'var(--sp-m)' }}>
        <button className="btn btn-secondary"
          disabled={tabs.findIndex((t) => t.id === activeTab) === 0}
          onClick={() => {
            const i = tabs.findIndex((t) => t.id === activeTab);
            if (i > 0) setActiveTab(tabs[i - 1].id);
          }}>
          ← Zurück
        </button>
        <button className="btn btn-primary"
          disabled={tabs.findIndex((t) => t.id === activeTab) === tabs.length - 1}
          onClick={() => {
            const i = tabs.findIndex((t) => t.id === activeTab);
            if (i < tabs.length - 1) setActiveTab(tabs[i + 1].id);
          }}>
          Weiter →
        </button>
      </div>

      {/* Add Recommendation Modal */}
      {showAddRec && (
        <Modal title="Empfehlung hinzufügen" onClose={() => setShowAddRec(false)}>
          <div style={{ display: 'grid', gap: 'var(--sp-m)', padding: 'var(--sp-m)' }}>
            <div>
              <label className="form-label">Empfehlung auswählen oder eingeben</label>
              <select className="form-control" value={newRec.text}
                onChange={(e) => setNewRec((r) => ({ ...r, text: e.target.value }))}>
                <option value="">-- Vorlage auswählen --</option>
                {RECOMMENDATION_TEMPLATES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <Input label="Oder eigene Empfehlung eingeben" value={newRec.text}
              onChange={(v) => setNewRec((r) => ({ ...r, text: v }))}
              placeholder="Empfehlung..." />
            <Select label="Priorität" value={newRec.priority}
              onChange={(v) => setNewRec((r) => ({ ...r, priority: v }))}
              options={[
                { value: 'hoch', label: 'Hohe Priorität' },
                { value: 'mittel', label: 'Mittlere Priorität' },
                { value: 'niedrig', label: 'Niedrige Priorität' },
              ]} />
            <div>
              <label className="form-label">Begründung</label>
              <textarea className="form-control" rows={3}
                value={newRec.reason}
                onChange={(e) => setNewRec((r) => ({ ...r, reason: e.target.value }))}
                placeholder="Warum wird diese Empfehlung ausgesprochen?" />
            </div>
            <div className="flex gap-s justify-end">
              <button className="btn btn-secondary" onClick={() => setShowAddRec(false)}>Abbrechen</button>
              <button className="btn btn-primary" onClick={addRecommendation} disabled={!newRec.text}>Hinzufügen</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <Modal title="Protokoll abschließen" onClose={() => setShowSignatureModal(false)}>
          <div style={{ padding: 'var(--sp-m)', display: 'grid', gap: 'var(--sp-m)' }}>
            <Alert type="warning">
              Nach dem Abschließen kann das Protokoll nicht mehr bearbeitet werden. Stellen Sie sicher, dass alle Angaben korrekt sind.
            </Alert>

            <div style={{ background: 'var(--gray-light)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)' }}>
              <div className="font-bold text-sm" style={{ marginBottom: 'var(--sp-s)' }}>Zusammenfassung:</div>
              <div className="text-sm" style={{ display: 'grid', gap: 4 }}>
                <div>📅 Gesprächsdatum: {new Date(form.meeting_date).toLocaleDateString('de-DE')}</div>
                <div>🕐 Dauer: {form.meeting_duration} Minuten</div>
                <div>📋 Empfehlungen: {form.recommendations.length}</div>
                <div>👤 Kunde: {customer.first_name} {customer.last_name}</div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--gray-dark)', borderRadius: 'var(--radius)', padding: 'var(--sp-m)', textAlign: 'center', minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-grey)', fontStyle: 'italic' }}>
              [Unterschriftenfeld — In der Produktivversion digital oder handschriftlich]
            </div>

            <div className="flex gap-s justify-end">
              <button className="btn btn-secondary" onClick={() => setShowSignatureModal(false)}>Abbrechen</button>
              <button className="btn btn-primary" onClick={handleFinalize} disabled={saving}>
                {saving ? 'Wird abgeschlossen…' : '✓ Jetzt abschließen'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
};
