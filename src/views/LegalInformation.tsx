import React, { useState } from 'react';
import { AppLayout } from '../components/Layout';
import { Tabs, Alert } from '../components/UI';

const TABS = [
  { id: 'impressum', label: 'Impressum' },
  { id: 'datenschutz', label: 'Datenschutz' },
  { id: 'agb', label: 'AGB' },
];

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <h3 style={{ marginBottom: '0.5rem', fontSize: 'var(--fs-md)' }}>{title}</h3>
    {children}
  </div>
);

export const LegalInformation: React.FC = () => {
  const [active, setActive] = useState('impressum');

  return (
    <AppLayout title="Rechtliche Informationen">
      <div className="card">
        <Tabs tabs={TABS} active={active} onChange={setActive} />
        <div className="tab-content" style={{ maxWidth: 800, lineHeight: 1.85, fontSize: 'var(--fs-sm)' }}>

          {active === 'impressum' && (
            <div>
              <h2 style={{ marginBottom: '1.25rem' }}>Impressum</h2>

              <Section title="Angaben gemäß § 5 TMG">
                <p>finExpert Beratungs GmbH<br />Maximilianstraße 12<br />80539 München<br />Deutschland</p>
              </Section>

              <Section title="Vertreten durch">
                <p>Geschäftsführer: Max Mustermann</p>
              </Section>

              <Section title="Kontakt">
                <p>Telefon: +49 89 1234 5678<br />E-Mail: info@finexpert.de<br />Web: www.finexpert.de</p>
              </Section>

              <Section title="Registereintrag">
                <p>
                  Eintragung im Handelsregister<br />
                  Registergericht: Amtsgericht München<br />
                  Registernummer: HRB 123456
                </p>
              </Section>

              <Section title="Berufsrechtliche Regelungen">
                <p>
                  Zulassung als Versicherungsmakler gemäß § 34d GewO<br />
                  Zuständige Aufsichtsbehörde: IHK für München und Oberbayern<br />
                  Registernummer (DIHK): D-12345-XY7890-12
                </p>
              </Section>

              <Section title="Umsatzsteuer-Identifikationsnummer">
                <p>DE 123 456 789</p>
              </Section>

              <Section title="Berufshaftpflichtversicherung">
                <p>
                  Versicherer: Allianz Versicherungs-AG<br />
                  Versicherungsnummer: AVN-987654321<br />
                  Geltungsraum: Deutschland und EU
                </p>
              </Section>

              <div className="text-xs text-grey" style={{ marginTop: '2rem', borderTop: '1px solid var(--gray-medium)', paddingTop: '1rem' }}>
                Stand: April 2026 · finExpert Beratungs GmbH
              </div>
            </div>
          )}

          {active === 'datenschutz' && (
            <div>
              <h2 style={{ marginBottom: '1.25rem' }}>Datenschutzerklärung</h2>

              <Alert type="info">
                Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst und behandeln Ihre Daten vertraulich gemäß DSGVO und BDSG.
              </Alert>

              <Section title="1. Verantwortliche Stelle">
                <p>Verantwortlich für die Datenverarbeitung: finExpert Beratungs GmbH, Maximilianstraße 12, 80539 München. Datenschutzbeauftragter: datenschutz@finexpert.de</p>
              </Section>

              <Section title="2. Erhebung und Verarbeitung personenbezogener Daten">
                <p>Wir verarbeiten personenbezogene Daten nur soweit dies zur Erbringung unserer Beratungsleistungen erforderlich ist. Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung), lit. c (rechtliche Verpflichtung) sowie lit. f (berechtigte Interessen).</p>
                <p>Folgende Datenkategorien werden verarbeitet:</p>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>Identifikationsdaten (Name, Geburtsdatum, Adresse)</li>
                  <li>Kontaktdaten (E-Mail, Telefon)</li>
                  <li>Finanzdaten (Einkommen, Vermögen, Verbindlichkeiten)</li>
                  <li>Gesundheitsdaten (nur soweit für Versicherungsanträge erforderlich)</li>
                  <li>Vertragsdaten (bestehende Versicherungen, Investitionen)</li>
                </ul>
              </Section>

              <Section title="3. Datenweitergabe an Dritte">
                <p>Eine Weitergabe personenbezogener Daten an Dritte erfolgt nur im Rahmen der Vertragserfüllung (z.B. Versicherungsgesellschaften bei Antragstellung) oder wenn Sie ausdrücklich eingewilligt haben. Eine Weitergabe in Drittstaaten außerhalb der EU findet nicht statt.</p>
              </Section>

              <Section title="4. Datenspeicherung und Löschung">
                <p>Personenbezogene Daten werden nur so lange gespeichert, wie es für die jeweiligen Verarbeitungszwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen dies verlangen (in der Regel 10 Jahre gemäß § 147 AO und § 257 HGB).</p>
              </Section>

              <Section title="5. Ihre Rechte nach DSGVO">
                <ul style={{ paddingLeft: '1.5rem' }}>
                  <li>Auskunft (Art. 15 DSGVO)</li>
                  <li>Berichtigung (Art. 16 DSGVO)</li>
                  <li>Löschung (Art. 17 DSGVO)</li>
                  <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                  <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                  <li>Widerspruch (Art. 21 DSGVO)</li>
                </ul>
                <p style={{ marginTop: '0.75rem' }}>Beschwerden richten Sie an: Bayerisches Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach.</p>
              </Section>

              <div className="text-xs text-grey" style={{ marginTop: '2rem', borderTop: '1px solid var(--gray-medium)', paddingTop: '1rem' }}>
                Stand: April 2026 · finExpert Beratungs GmbH
              </div>
            </div>
          )}

          {active === 'agb' && (
            <div>
              <h2 style={{ marginBottom: '1.25rem' }}>Allgemeine Geschäftsbedingungen (AGB)</h2>

              <Section title="§ 1 Geltungsbereich">
                <p>Diese AGB gelten für alle Beratungs- und Vermittlungsverträge zwischen der finExpert Beratungs GmbH und ihren Kunden.</p>
              </Section>

              <Section title="§ 2 Vertragsgegenstand">
                <p>Gegenstand des Vertrages ist die Vermittlung von Finanz- und Versicherungsprodukten sowie die Erbringung von Finanzberatungsleistungen gemäß § 34d GewO. Die Beratung erfolgt auf Basis der Angaben des Kunden und der am Markt verfügbaren Produkte.</p>
              </Section>

              <Section title="§ 3 Pflichten des Kunden">
                <p>Der Kunde ist verpflichtet, alle für die Beratung relevanten Informationen vollständig und wahrheitsgemäß mitzuteilen. Falsche oder unvollständige Angaben können zur Unwirksamkeit von Versicherungsverträgen führen.</p>
              </Section>

              <Section title="§ 4 Vergütung">
                <p>Die Vergütung für Vermittlungsleistungen erfolgt in der Regel durch Provisionen der Produktanbieter. Eine gesonderte Honorarvereinbarung gegenüber dem Kunden erfolgt nur nach schriftlicher Vereinbarung.</p>
              </Section>

              <Section title="§ 5 Haftung">
                <p>Die Haftung der finExpert Beratungs GmbH ist auf Vorsatz und grobe Fahrlässigkeit beschränkt, soweit nicht Personenschäden oder die Verletzung wesentlicher Vertragspflichten betroffen sind. Es gilt die gesetzlich vorgeschriebene Vermögensschadenhaftpflichtversicherung.</p>
              </Section>

              <Section title="§ 6 Widerrufsrecht">
                <p>Verbraucher haben das Recht, den Vertrag innerhalb von 14 Tagen ohne Angabe von Gründen zu widerrufen. Die Frist beginnt mit Vertragsabschluss. Zur Fristwahrung genügt die rechtzeitige Absendung des Widerrufs an info@finexpert.de.</p>
              </Section>

              <Section title="§ 7 Datenschutz">
                <p>Der Umgang mit personenbezogenen Daten richtet sich nach unserer Datenschutzerklärung sowie den gesetzlichen Vorschriften der DSGVO und des BDSG.</p>
              </Section>

              <Section title="§ 8 Gerichtsstand und anwendbares Recht">
                <p>Es gilt deutsches Recht. Gerichtsstand für Kaufleute ist München.</p>
              </Section>

              <Section title="§ 9 Salvatorische Klausel">
                <p>Sollten einzelne Bestimmungen unwirksam sein, berührt dies die Wirksamkeit der übrigen Bestimmungen nicht.</p>
              </Section>

              <div className="text-xs text-grey" style={{ marginTop: '2rem', borderTop: '1px solid var(--gray-medium)', paddingTop: '1rem' }}>
                Stand: April 2026 · finExpert Beratungs GmbH
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
