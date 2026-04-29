import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout';
import { Panel, Alert, Badge, SectionHeader } from '../components/UI';
import { CUSTOMERS, FINANCIAL_DATA } from '../mock';
import { useApp } from '../context';

type PrecautionStatus = 'covered' | 'gap' | 'missing';

interface TariffEntry {
  provider: string;
  product: string;
  premium: string;
  coverage: string;
  rating: number;
  highlight?: boolean;
}

interface PrecautionMeta {
  label: string;
  icon: string;
  description: string;
  status: PrecautionStatus;
  recommendation: string;
  tariffs: TariffEntry[];
  checkItems: { label: string; ok: boolean }[];
}

const PRECAUTION_META: Record<string, PrecautionMeta> = {
  bu: {
    label: 'Berufsunfähigkeitsversicherung',
    icon: '💼',
    description: 'Die BU-Versicherung sichert Ihr Einkommen ab, falls Sie durch Krankheit oder Unfall dauerhaft nicht mehr arbeiten können. Sie ist die wichtigste Einkommensabsicherung für Arbeitnehmer.',
    status: 'covered',
    recommendation: 'Die bestehende BU-Absicherung von 2.500 €/Monat ist ausreichend für das aktuelle Einkommensniveau. Bei einer Gehaltserhöhung sollte die versicherte Rente auf 60–70 % des Nettoeinkommens angepasst werden.',
    checkItems: [
      { label: 'BU-Rente mind. 60 % des Nettoeinkommens', ok: true },
      { label: 'Laufzeit bis zum Rentenalter (67)', ok: true },
      { label: 'Abstrakte Verweisung ausgeschlossen', ok: true },
      { label: 'Nachversicherungsgarantie vorhanden', ok: false },
      { label: 'Infektionsklausel (für medizinische Berufe)', ok: false },
    ],
    tariffs: [
      { provider: 'Allianz', product: 'BU Premium', premium: '89 €/Mon.', coverage: '2.500 € Monatsrente', rating: 5, highlight: true },
      { provider: 'Swiss Life', product: 'SLR BU Protect', premium: '92 €/Mon.', coverage: '2.500 € Monatsrente', rating: 5 },
      { provider: 'Nürnberger', product: 'BU Invest', premium: '82 €/Mon.', coverage: '2.500 € Monatsrente', rating: 4 },
      { provider: 'Zurich', product: 'BU Schutz Komfort', premium: '95 €/Mon.', coverage: '2.500 € Monatsrente', rating: 4 },
      { provider: 'Generali', product: 'BU Select', premium: '78 €/Mon.', coverage: '2.500 € Monatsrente', rating: 3 },
    ],
  },
  leben: {
    label: 'Risikolebensversicherung',
    icon: '💙',
    description: 'Sichert Familie und Hinterbliebene im Todesfall finanziell ab. Die Versicherungssumme deckt offene Kredite, laufende Kosten und den Lebensunterhalt der Familie.',
    status: 'gap',
    recommendation: 'Die aktuelle Versicherungssumme von 300.000 € deckt den ermittelten Bedarf von ~384.000 € nicht vollständig. Eine Aufstockung auf 400.000 € wird empfohlen. Alternative: verbundene Risikolebensversicherung für beide Partner.',
    checkItems: [
      { label: 'Versicherungssumme deckt Bedarf vollständig', ok: false },
      { label: 'Laufzeit bis jüngstes Kind 25 Jahre alt', ok: true },
      { label: 'Infektionsklausel ausgeschlossen', ok: true },
      { label: 'Partner mitversichert', ok: false },
      { label: 'Nachversicherungsoption vorhanden', ok: false },
    ],
    tariffs: [
      { provider: 'Hannoversche', product: 'Risikolife Plus', premium: '35 €/Mon.', coverage: '400.000 €', rating: 5, highlight: true },
      { provider: 'HUK-Coburg', product: 'RLV Premium', premium: '38 €/Mon.', coverage: '400.000 €', rating: 5 },
      { provider: 'Cosmos Direkt', product: 'Risiko direkt', premium: '32 €/Mon.', coverage: '400.000 €', rating: 4 },
      { provider: 'DA Direkt', product: 'RLV Schutz', premium: '41 €/Mon.', coverage: '400.000 €', rating: 4 },
      { provider: 'Zurich', product: 'RLV Select', premium: '44 €/Mon.', coverage: '400.000 €', rating: 3 },
    ],
  },
  haftpflicht: {
    label: 'Haftpflichtversicherung',
    icon: '🛡️',
    description: 'Schützt vor den finanziellen Folgen von Schäden, die Sie unbeabsichtigt Dritten zufügen – ob Personen-, Sach- oder Vermögensschäden. Gilt als unentbehrliche Basisabsicherung.',
    status: 'covered',
    recommendation: 'Bestehende Haftpflicht mit 5 Mio. € Deckungssumme ist für den Privatbereich ausreichend. Bei Wohneigentum: separate Haus- und Grundbesitzerhaftpflicht prüfen.',
    checkItems: [
      { label: 'Deckungssumme mind. 5 Mio. € (Personen + Sachen)', ok: true },
      { label: 'Gefälligkeitsschäden mitversichert', ok: true },
      { label: 'Schlüsselverlust mitversichert', ok: true },
      { label: 'Mietsachschäden mitversichert', ok: true },
      { label: 'Haus- und Grundbesitzerhaftpflicht', ok: false },
    ],
    tariffs: [
      { provider: 'DEVK', product: 'PHV Komfort Plus', premium: '8 €/Mon.', coverage: '5.000.000 €', rating: 5, highlight: true },
      { provider: 'HUK-Coburg', product: 'Privat-Haftpflicht', premium: '7 €/Mon.', coverage: '5.000.000 €', rating: 5 },
      { provider: 'ERGO', product: 'PHV Basis', premium: '9 €/Mon.', coverage: '5.000.000 €', rating: 4 },
      { provider: 'AXA', product: 'Haftpflicht Smart', premium: '10 €/Mon.', coverage: '10.000.000 €', rating: 4 },
      { provider: 'Allianz', product: 'ModularSchutz', premium: '12 €/Mon.', coverage: '10.000.000 €', rating: 4 },
    ],
  },
  kranken: {
    label: 'Krankenversicherung',
    icon: '🏥',
    description: 'Absicherung aller Gesundheitskosten. Der Wechsel von der GKV in die PKV kann je nach Einkommens-, Alters- und Familiensituation erhebliche Leistungs- und Steuervorteile bieten.',
    status: 'covered',
    recommendation: 'GKV-Absicherung ist für die aktuelle Lebenssituation ausreichend. Bei steigendem Einkommen über der Jahresarbeitsentgeltgrenze (69.300 € in 2024) bietet die PKV Leistungs- und Steuervorteile.',
    checkItems: [
      { label: 'Krankentagegeld ab dem 43. Tag (GKV-Anspruch)', ok: true },
      { label: 'Zusatzversicherung Zahn vorhanden', ok: false },
      { label: 'Zusatzversicherung stationär / Einzelzimmer', ok: false },
      { label: 'Krankenhaustagegeld vorhanden', ok: false },
      { label: 'Auslandskrankenversicherung', ok: false },
    ],
    tariffs: [
      { provider: 'Techniker Krankenkasse', product: 'GKV Standard', premium: '350 €/Mon.', coverage: 'Vollständige GKV-Leistungen', rating: 5, highlight: true },
      { provider: 'Barmer', product: 'GKV', premium: '348 €/Mon.', coverage: 'Vollständige GKV-Leistungen', rating: 5 },
      { provider: 'Allianz PKV', product: 'PrivatSelect', premium: '380 €/Mon.', coverage: 'PKV Komfort-Leistungen', rating: 5 },
      { provider: 'DKV', product: 'KombiMed', premium: '410 €/Mon.', coverage: 'PKV Premium-Leistungen', rating: 4 },
    ],
  },
  unfall: {
    label: 'Unfallversicherung',
    icon: '🩹',
    description: 'Zahlt eine Einmalleistung oder Rente bei dauerhafter Invalidität durch Unfall. Besonders relevant für Personen ohne oder mit geringer BU-Absicherung sowie für Kinder.',
    status: 'missing',
    recommendation: 'Keine Unfallversicherung vorhanden. Da eine BU-Versicherung besteht, ist die private Unfallversicherung optional. Als Ergänzung sinnvoll für private Unfälle (z.B. Sport, Freizeit), die von der BU nicht abgedeckt werden.',
    checkItems: [
      { label: 'Unfallversicherung vorhanden', ok: false },
      { label: 'Progression 225/350 % vereinbart', ok: false },
      { label: 'Invaliditätsleistung ausreichend', ok: false },
      { label: 'Kinder mitversichert', ok: false },
    ],
    tariffs: [
      { provider: 'ARAG', product: 'Komfort UV', premium: '18 €/Mon.', coverage: '100.000 € Grundsumme', rating: 4, highlight: true },
      { provider: 'Allianz', product: 'Unfall Komfort', premium: '22 €/Mon.', coverage: '100.000 € Grundsumme', rating: 5 },
      { provider: 'Signal Iduna', product: 'UV Smart', premium: '16 €/Mon.', coverage: '100.000 € Grundsumme', rating: 4 },
      { provider: 'Generali', product: 'Unfallschutz', premium: '14 €/Mon.', coverage: '80.000 € Grundsumme', rating: 3 },
    ],
  },
  rechtsschutz: {
    label: 'Rechtsschutzversicherung',
    icon: '⚖️',
    description: 'Übernimmt Anwalts-, Gerichts- und Sachverständigenkosten bei Rechtsstreitigkeiten. Besonders wichtig als Mieter, Arbeitnehmer, Verkehrsteilnehmer oder bei Verbraucherstreitigkeiten.',
    status: 'missing',
    recommendation: 'Keine Rechtsschutzversicherung vorhanden. Bei bestehender Mietsituation und regelmäßiger Nutzung von Fahrzeugen wird ein Privat-, Berufs- und Verkehrs-Rechtsschutz empfohlen.',
    checkItems: [
      { label: 'Privat-Rechtsschutz vorhanden', ok: false },
      { label: 'Berufs-Rechtsschutz vorhanden', ok: false },
      { label: 'Verkehrs-Rechtsschutz vorhanden', ok: false },
      { label: 'Mieter-Rechtsschutz vorhanden', ok: false },
    ],
    tariffs: [
      { provider: 'ARAG', product: 'PowerRecht', premium: '28 €/Mon.', coverage: 'Privat + Beruf + Verkehr', rating: 5, highlight: true },
      { provider: 'Roland', product: 'KompaktSchutz', premium: '24 €/Mon.', coverage: 'Privat + Beruf + Verkehr', rating: 4 },
      { provider: 'DEURAG', product: 'RechtSchutz', premium: '22 €/Mon.', coverage: 'Privat + Beruf + Verkehr', rating: 4 },
      { provider: 'Advocard', product: 'Allrecht', premium: '26 €/Mon.', coverage: 'Privat + Beruf + Verkehr', rating: 4 },
    ],
  },
};

const Stars: React.FC<{ n: number }> = ({ n }) => (
  <span style={{ color: '#fbbf24', letterSpacing: 1 }}>
    {'★'.repeat(n)}{'☆'.repeat(5 - n)}
  </span>
);

export const PrecautionDetail: React.FC = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const customer = CUSTOMERS.find((c) => c.id === id);
  const fin = FINANCIAL_DATA[id ?? ''] ?? null;
  const meta = PRECAUTION_META[type ?? ''];
  const [showTariff, setShowTariff] = useState(true);

  if (!meta) {
    return (
      <AppLayout title="Vorsorgedetail">
        <Alert type="warning">Unbekannter Vorsorgtyp: „{type}"</Alert>
        <button className="btn btn-secondary mt-m" onClick={() => navigate(-1)}>← Zurück</button>
      </AppLayout>
    );
  }

  const statusColor = meta.status === 'covered' ? 'var(--color-green)' : meta.status === 'gap' ? 'var(--color-orange)' : 'var(--color-red)';
  const statusLabel = meta.status === 'covered' ? '✓ Ausreichend abgesichert' : meta.status === 'gap' ? '⚠ Absicherungslücke vorhanden' : '✗ Nicht vorhanden – Handlungsbedarf';
  const statusBadgeType = meta.status === 'covered' ? 'success' : meta.status === 'gap' ? 'warning' : 'danger';

  const existingIns = fin?.insurances.filter((ins) =>
    ins.type.toLowerCase().startsWith((type ?? '').slice(0, 2))
  ) ?? [];

  const checkedCount = meta.checkItems.filter((c) => c.ok).length;

  return (
    <AppLayout title={`${meta.icon} ${meta.label}`}>
      <div className="breadcrumb">
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/customers')}>Kunden</span>
        <span className="breadcrumb-sep">›</span>
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate(`/customers/${id}`)}>
          {customer ? `${customer.first_name} ${customer.last_name}` : 'Analyse'}
        </span>
        <span className="breadcrumb-sep">›</span>
        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate(`/analysis/${id}`)}>Analyse</span>
        <span className="breadcrumb-sep">›</span>
        <span>{meta.label}</span>
      </div>

      {/* Status header card */}
      <div className="card" style={{ marginBottom: 'var(--sp-l)', padding: 'var(--sp-l)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-l)', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 52 }}>{meta.icon}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, marginBottom: 4 }}>{meta.label}</div>
            <div style={{ marginBottom: 8 }}>
              <Badge type={statusBadgeType}>{statusLabel}</Badge>
            </div>
            <div className="text-sm text-grey" style={{ lineHeight: 1.65 }}>{meta.description}</div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-s)', flexShrink: 0, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/analysis/${id}`)}>← Zurück zur Analyse</button>
            <button className="btn btn-primary btn-sm" onClick={() => addToast('info', `Angebot für ${meta.label} wird angefordert...`)}>
              Angebot anfordern
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-l)', marginBottom: 'var(--sp-l)' }}>
        {/* Recommendation */}
        <Panel title="Beratungsempfehlung">
          <Alert type={statusBadgeType as any}>
            <strong>Fazit:</strong> {meta.recommendation}
          </Alert>
          {existingIns.length > 0 && (
            <div style={{ marginTop: 'var(--sp-m)' }}>
              <div className="font-bold text-sm" style={{ marginBottom: 'var(--sp-s)' }}>Bestehende Verträge:</div>
              {existingIns.map((ins) => (
                <div key={ins.id} style={{ padding: 'var(--sp-s) var(--sp-m)', background: 'var(--gray-light)', borderRadius: 'var(--radius)', marginBottom: 'var(--sp-s)', border: '1px solid var(--gray-border)' }}>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold">{ins.name}</span>
                    <Badge type="success">Aktiv</Badge>
                  </div>
                  <div className="text-xs text-grey mt-s">
                    {ins.provider} · {ins.monthly_premium} €/Monat · {ins.coverage.toLocaleString('de-DE')} € Absicherung
                  </div>
                </div>
              ))}
            </div>
          )}
          {existingIns.length === 0 && (
            <div className="text-sm text-grey mt-m" style={{ padding: 'var(--sp-m)', background: 'var(--gray-light)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>📭</div>
              Kein bestehender Vertrag erfasst
            </div>
          )}
        </Panel>

        {/* Checklist */}
        <Panel title={`Qualitätscheckliste (${checkedCount}/${meta.checkItems.length})`}>
          <div style={{ marginBottom: 'var(--sp-m)' }}>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(checkedCount / meta.checkItems.length) * 100}%`,
                  background: checkedCount === meta.checkItems.length ? 'var(--color-green)' : checkedCount >= meta.checkItems.length / 2 ? 'var(--color-orange)' : 'var(--color-red)',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {meta.checkItems.map((item, i) => (
              <div key={i} className="flex items-center gap-s text-sm">
                <span style={{ color: item.ok ? 'var(--color-green)' : 'var(--color-red)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {item.ok ? '✓' : '✗'}
                </span>
                <span style={{ color: item.ok ? 'var(--text)' : 'var(--text-grey)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Tariff comparison */}
      <div>
        <SectionHeader
          title="Tariffvergleich"
          subtitle={`${meta.tariffs.length} Anbieter verglichen`}
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => setShowTariff(!showTariff)}>
              {showTariff ? '▲ Ausblenden' : '▼ Anzeigen'}
            </button>
          }
        />

        {showTariff && (
          <>
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Anbieter</th>
                    <th>Produkt</th>
                    <th>Prämie/Monat</th>
                    <th>Leistung / Absicherung</th>
                    <th>Bewertung</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {meta.tariffs.map((t, i) => (
                    <tr key={i} style={t.highlight ? { background: '#e8f4f8' } : {}}>
                      <td>
                        <div className="flex items-center gap-s">
                          <span className="font-bold text-sm">{t.provider}</span>
                          {t.highlight && <Badge type="success">Empfohlen</Badge>}
                        </div>
                      </td>
                      <td className="text-sm">{t.product}</td>
                      <td>
                        <span className="font-bold text-sm" style={{ color: 'var(--color-green)' }}>{t.premium}</span>
                      </td>
                      <td className="text-sm">{t.coverage}</td>
                      <td><Stars n={t.rating} /></td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => addToast('success', `Angebot von ${t.provider} wird angefordert...`)}
                        >
                          Angebot
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-grey mt-s" style={{ textAlign: 'right' }}>
              Preise sind Richtwerte für 40-jährige Nichtraucher ohne Vorerkrankungen. Individuelle Angebote können abweichen. Stand: April 2026.
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};
