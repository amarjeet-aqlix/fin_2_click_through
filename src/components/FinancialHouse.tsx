import React, { useState } from 'react';
import { Precaution, PrecautionContract, PrecautionStatus, PropertyTimespan } from '../types';

interface FinancialHouseProps {
  precautions: Precaution[];
  current_state: PrecautionContract[];
  suggested_state: PrecautionContract[];
  isConsultant?: boolean;
  onUpdatePrecaution?: (id: string, changes: Partial<Precaution>) => void;
}

const STATUS_CYCLE: PrecautionStatus[] = [
  'UNDECIDED',
  'CONSULTATION_WANTED',
  'NO_CONSULTATION_WANTED',
  'CONSULTED_BUT_NO_TERMINATION',
];

const STATUS_ICONS: Record<PrecautionStatus, string> = {
  UNDECIDED: '○',
  CONSULTATION_WANTED: '!',
  NO_CONSULTATION_WANTED: '✕',
  CONSULTED_BUT_NO_TERMINATION: '✓',
};

const STATUS_COLORS: Record<PrecautionStatus, string> = {
  UNDECIDED: '#94a3b8',
  CONSULTATION_WANTED: '#f59e0b',
  NO_CONSULTATION_WANTED: '#ef4444',
  CONSULTED_BUT_NO_TERMINATION: '#22c55e',
};

const STATUS_LABELS: Record<PrecautionStatus, string> = {
  UNDECIDED: 'Offen',
  CONSULTATION_WANTED: 'Beratung gewünscht',
  NO_CONSULTATION_WANTED: 'Keine Beratung',
  CONSULTED_BUT_NO_TERMINATION: 'Beraten',
};

function progressColor(pct: number): string {
  if (pct < 30) return '#ef4444';
  if (pct < 70) return '#f59e0b';
  return '#22c55e';
}

interface ProgressBarProps {
  value: number;
  isConsultant?: boolean;
  onChange?: (v: number) => void;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, isConsultant, onChange, label }) => {
  const color = progressColor(value);
  return (
    <div style={{ width: '100%' }}>
      {label && <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>{label}</div>}
      <div style={{ position: 'relative', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'visible' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
        {isConsultant && onChange && (
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            style={{
              position: 'absolute', top: -4, left: 0, width: '100%', height: 16,
              opacity: 0, cursor: 'pointer', margin: 0,
            }}
          />
        )}
      </div>
      <div style={{ fontSize: 10, color, fontWeight: 600, textAlign: 'right', marginTop: 1 }}>{value}%</div>
    </div>
  );
};

interface RoomCardProps {
  precaution: Precaution;
  progress: number;
  isConsultant?: boolean;
  onProgressChange?: (v: number) => void;
  onStatusCycle?: () => void;
  compact?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ precaution, progress, isConsultant, onProgressChange, onStatusCycle, compact }) => {
  const statusColor = STATUS_COLORS[precaution.status];
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      padding: compact ? '6px 8px' : '8px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
          <span style={{ fontSize: compact ? 14 : 16 }}>{precaution.precaution_type.icon}</span>
          <span style={{ fontSize: compact ? 10 : 11, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {precaution.precaution_type.name}
          </span>
        </div>
        {isConsultant && onStatusCycle ? (
          <button
            onClick={onStatusCycle}
            title={STATUS_LABELS[precaution.status]}
            style={{
              border: 'none', cursor: 'pointer',
              width: 20, height: 20, borderRadius: '50%',
              background: statusColor, color: '#fff',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, padding: 0,
            }}
          >
            {STATUS_ICONS[precaution.status]}
          </button>
        ) : (
          <span style={{ fontSize: 9, color: statusColor, fontWeight: 600, flexShrink: 0 }}>
            {STATUS_ICONS[precaution.status]}
          </span>
        )}
      </div>
      <ProgressBar value={progress} isConsultant={isConsultant} onChange={onProgressChange} />
    </div>
  );
};

const WEIGHTING_LABELS: Record<string, string> = {
  VERRY_IMPORTANT: 'BESONDERS WICHTIG',
  IMPORTANT: 'WICHTIG',
  NICE_TO_HAVE: 'EMPFEHLENSWERT',
};

const WEIGHTING_COLORS: Record<string, string> = {
  VERRY_IMPORTANT: '#125267',
  IMPORTANT: '#1e6d8a',
  NICE_TO_HAVE: '#2d8fb3',
};

interface HouseSectionProps {
  label: string;
  color: string;
  precautions: Precaution[];
  progress: (p: Precaution) => number;
  isConsultant?: boolean;
  onProgressChange?: (id: string, v: number) => void;
  onStatusCycle?: (id: string) => void;
}

const HouseSection: React.FC<HouseSectionProps> = ({ label, color, precautions, progress, isConsultant, onProgressChange, onStatusCycle }) => (
  <div style={{ display: 'flex', borderTop: `2px solid ${color}` }}>
    <div style={{
      width: 28, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{
        color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: 1,
        writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
    <div style={{
      flex: 1, display: 'grid', padding: 8, gap: 6,
      gridTemplateColumns: `repeat(${Math.min(precautions.length, 3)}, 1fr)`,
    }}>
      {precautions.map(p => (
        <RoomCard
          key={p.id}
          precaution={p}
          progress={progress(p)}
          isConsultant={isConsultant}
          onProgressChange={onProgressChange ? v => onProgressChange(p.id, v) : undefined}
          onStatusCycle={onStatusCycle ? () => onStatusCycle(p.id) : undefined}
          compact
        />
      ))}
    </div>
  </div>
);

// SVG pyramid zones
const TIP_Y = 10;
const BASE_Y = 190;
const BASE_LEFT = 30;
const BASE_RIGHT = 470;
const TOTAL_H = BASE_Y - TIP_Y; // 180
const DIV1_Y = TIP_Y + TOTAL_H / 3; // ~70
const DIV2_Y = TIP_Y + (2 * TOTAL_H) / 3; // ~130

function xAtY(y: number): { left: number; right: number } {
  const t = (y - TIP_Y) / TOTAL_H;
  const left = 250 - (250 - BASE_LEFT) * t;
  const right = 250 + (BASE_RIGHT - 250) * t;
  return { left, right };
}

interface PyramidZoneProps {
  timespan: PropertyTimespan;
  precautions: Precaution[];
  progress: (p: Precaution) => number;
  isConsultant?: boolean;
  onProgressChange?: (id: string, v: number) => void;
  onStatusCycle?: (id: string) => void;
}

const PyramidZone: React.FC<PyramidZoneProps> = ({ timespan, precautions, progress, isConsultant, onProgressChange, onStatusCycle }) => {
  if (precautions.length === 0) return null;

  const zoneConfig = {
    SHORT: { topY: TIP_Y, botY: DIV1_Y },
    MEDIUM: { topY: DIV1_Y, botY: DIV2_Y },
    LONG: { topY: DIV2_Y, botY: BASE_Y },
  }[timespan];

  const midY = (zoneConfig.topY + zoneConfig.botY) / 2;
  const { left: midLeft, right: midRight } = xAtY(midY);
  const zoneW = midRight - midLeft;
  const zoneH = zoneConfig.botY - zoneConfig.topY;

  if (timespan === 'LONG' && precautions.length >= 2) {
    const halfW = zoneW / 2 - 4;
    const foH = Math.min(zoneH - 10, 80);
    const foY = zoneConfig.topY + (zoneH - foH) / 2;
    return (
      <>
        <foreignObject x={midLeft} y={foY} width={halfW} height={foH} style={{ overflow: 'visible' }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
            <RoomCard precaution={precautions[0]} progress={progress(precautions[0])} isConsultant={isConsultant}
              onProgressChange={onProgressChange ? v => onProgressChange(precautions[0].id, v) : undefined}
              onStatusCycle={onStatusCycle ? () => onStatusCycle(precautions[0].id) : undefined} compact />
          </div>
        </foreignObject>
        <foreignObject x={midLeft + halfW + 8} y={foY} width={halfW} height={foH} style={{ overflow: 'visible' }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
            <RoomCard precaution={precautions[1]} progress={progress(precautions[1])} isConsultant={isConsultant}
              onProgressChange={onProgressChange ? v => onProgressChange(precautions[1].id, v) : undefined}
              onStatusCycle={onStatusCycle ? () => onStatusCycle(precautions[1].id) : undefined} compact />
          </div>
        </foreignObject>
      </>
    );
  }

  const foW = Math.min(zoneW - 16, 160);
  const foH = Math.min(zoneH - 8, 80);
  const foX = 250 - foW / 2;
  const foY = zoneConfig.topY + (zoneH - foH) / 2;

  return (
    <foreignObject x={foX} y={foY} width={foW} height={foH} style={{ overflow: 'visible' }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
        <RoomCard precaution={precautions[0]} progress={progress(precautions[0])} isConsultant={isConsultant}
          onProgressChange={onProgressChange ? v => onProgressChange(precautions[0].id, v) : undefined}
          onStatusCycle={onStatusCycle ? () => onStatusCycle(precautions[0].id) : undefined} compact />
      </div>
    </foreignObject>
  );
};

export const FinancialHouse: React.FC<FinancialHouseProps> = ({
  precautions,
  isConsultant,
  onUpdatePrecaution,
}) => {
  const [viewSuggested, setViewSuggested] = useState(false);
  const [localPrecautions, setLocalPrecautions] = useState<Precaution[]>(precautions);

  const getProgress = (p: Precaution) =>
    viewSuggested ? (p.progress_suggested_state ?? 0) : (p.progress_current_state ?? 0);

  const handleProgressChange = (id: string, v: number) => {
    setLocalPrecautions(prev => prev.map(p =>
      p.id === id
        ? { ...p, [viewSuggested ? 'progress_suggested_state' : 'progress_current_state']: v }
        : p
    ));
    onUpdatePrecaution?.(id, { [viewSuggested ? 'progress_suggested_state' : 'progress_current_state']: v });
  };

  const handleStatusCycle = (id: string) => {
    setLocalPrecautions(prev => prev.map(p => {
      if (p.id !== id) return p;
      const idx = STATUS_CYCLE.indexOf(p.status);
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
      onUpdatePrecaution?.(id, { status: next });
      return { ...p, status: next };
    }));
  };

  const propertyPrecautions = localPrecautions.filter(p => p.weighting === 'PROPERTY');
  const shortPrecautions = propertyPrecautions.filter(p => p.property_timespan === 'SHORT');
  const mediumPrecautions = propertyPrecautions.filter(p => p.property_timespan === 'MEDIUM');
  const longPrecautions = propertyPrecautions.filter(p => p.property_timespan === 'LONG');

  const veryImportant = localPrecautions.filter(p => p.weighting === 'VERRY_IMPORTANT');
  const important = localPrecautions.filter(p => p.weighting === 'IMPORTANT');
  const niceToHave = localPrecautions.filter(p => p.weighting === 'NICE_TO_HAVE');

  const overallProgress = localPrecautions.length > 0
    ? Math.round(localPrecautions.reduce((s, p) => s + getProgress(p), 0) / localPrecautions.length)
    : 0;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 760, margin: '0 auto' }}>
      {/* Header controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>Finanzhaus</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Gesamtabdeckung: <span style={{ color: progressColor(overallProgress), fontWeight: 700 }}>{overallProgress}%</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isConsultant && (
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 2 }}>
              <button
                onClick={() => setViewSuggested(false)}
                style={{
                  padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: !viewSuggested ? '#125267' : 'transparent',
                  color: !viewSuggested ? '#fff' : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                Ist-Zustand
              </button>
              <button
                onClick={() => setViewSuggested(true)}
                style={{
                  padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: viewSuggested ? '#125267' : 'transparent',
                  color: viewSuggested ? '#fff' : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                Soll-Zustand
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#64748b' }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: STATUS_COLORS[k as PrecautionStatus], display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 700 }}>
              {STATUS_ICONS[k as PrecautionStatus]}
            </span>
            {v}
          </div>
        ))}
        {isConsultant && <span style={{ fontSize: 10, color: '#94a3b8' }}>— Status klicken zum Ändern · Balken ziehen</span>}
      </div>

      {/* Pyramid (VERMÖGENSAUFBAU) */}
      <div style={{ marginBottom: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textAlign: 'center', letterSpacing: 1, color: '#125267', textTransform: 'uppercase', marginBottom: 4 }}>
          Vermögensaufbau
        </div>
        <svg viewBox="0 0 500 200" style={{ width: '100%', display: 'block', overflow: 'visible' }}>
          {/* Pyramid fill */}
          <polygon
            points={`250,${TIP_Y} ${BASE_LEFT},${BASE_Y} ${BASE_RIGHT},${BASE_Y}`}
            fill="#e8f4f8"
            stroke="#125267"
            strokeWidth="1.5"
          />
          {/* Zone dividers */}
          <line
            x1={xAtY(DIV1_Y).left} y1={DIV1_Y}
            x2={xAtY(DIV1_Y).right} y2={DIV1_Y}
            stroke="#125267" strokeWidth="1" strokeDasharray="4,3"
          />
          <line
            x1={xAtY(DIV2_Y).left} y1={DIV2_Y}
            x2={xAtY(DIV2_Y).right} y2={DIV2_Y}
            stroke="#125267" strokeWidth="1" strokeDasharray="4,3"
          />
          {/* Zone labels */}
          <text x={20} y={DIV1_Y - 4} fontSize="8" fill="#64748b" textAnchor="start">KURZ</text>
          <text x={20} y={(DIV1_Y + DIV2_Y) / 2 + 4} fontSize="8" fill="#64748b" textAnchor="start">MITTEL</text>
          <text x={20} y={(DIV2_Y + BASE_Y) / 2 + 4} fontSize="8" fill="#64748b" textAnchor="start">LANG</text>

          {/* SHORT room */}
          <PyramidZone timespan="SHORT" precautions={shortPrecautions} progress={getProgress}
            isConsultant={isConsultant} onProgressChange={handleProgressChange} onStatusCycle={handleStatusCycle} />
          {/* MEDIUM room */}
          <PyramidZone timespan="MEDIUM" precautions={mediumPrecautions} progress={getProgress}
            isConsultant={isConsultant} onProgressChange={handleProgressChange} onStatusCycle={handleStatusCycle} />
          {/* LONG rooms */}
          <PyramidZone timespan="LONG" precautions={longPrecautions} progress={getProgress}
            isConsultant={isConsultant} onProgressChange={handleProgressChange} onStatusCycle={handleStatusCycle} />
        </svg>
      </div>

      {/* House body (ABSICHERUNG) */}
      <div style={{
        border: '1.5px solid #125267',
        borderTop: 'none',
        borderRadius: '0 0 8px 8px',
        overflow: 'hidden',
        background: '#f8fafc',
      }}>
        <div style={{ background: '#125267', padding: '4px 12px', textAlign: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: 1, textTransform: 'uppercase' }}>
            Absicherung
          </span>
        </div>

        {veryImportant.length > 0 && (
          <HouseSection
            label={WEIGHTING_LABELS.VERRY_IMPORTANT}
            color={WEIGHTING_COLORS.VERRY_IMPORTANT}
            precautions={veryImportant}
            progress={getProgress}
            isConsultant={isConsultant}
            onProgressChange={handleProgressChange}
            onStatusCycle={handleStatusCycle}
          />
        )}
        {important.length > 0 && (
          <HouseSection
            label={WEIGHTING_LABELS.IMPORTANT}
            color={WEIGHTING_COLORS.IMPORTANT}
            precautions={important}
            progress={getProgress}
            isConsultant={isConsultant}
            onProgressChange={handleProgressChange}
            onStatusCycle={handleStatusCycle}
          />
        )}
        {niceToHave.length > 0 && (
          <HouseSection
            label={WEIGHTING_LABELS.NICE_TO_HAVE}
            color={WEIGHTING_COLORS.NICE_TO_HAVE}
            precautions={niceToHave}
            progress={getProgress}
            isConsultant={isConsultant}
            onProgressChange={handleProgressChange}
            onStatusCycle={handleStatusCycle}
          />
        )}
      </div>
    </div>
  );
};
