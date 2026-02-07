import { useState, useMemo } from "react";

// ── Span Data Tables (based on IRC 2021 / NDS / AISC) ──
const WOOD_SPECIES = {
  "Douglas Fir-Larch #2": { Fb: 900, E: 1600000, Fv: 180, desc: "Strong & widely available — most common framing lumber" },
  "Southern Pine #2": { Fb: 1000, E: 1600000, Fv: 175, desc: "Very strong — common in the southeastern US" },
  "SPF (Spruce-Pine-Fir) #2": { Fb: 875, E: 1400000, Fv: 135, desc: "Budget-friendly — sold at most big box stores" },
  "Hem-Fir #2": { Fb: 850, E: 1300000, Fv: 150, desc: "Common on the west coast" },
};

const WOOD_SIZES = [
  { label: '2×6', depth: 5.5, width: 1.5 },
  { label: '2×8', depth: 7.25, width: 1.5 },
  { label: '2×10', depth: 9.25, width: 1.5 },
  { label: '2×12', depth: 11.25, width: 1.5 },
];

const SPACINGS = [
  { label: '12"', value: 12, desc: 'Strongest — joists every 12 inches' },
  { label: '16"', value: 16, desc: 'Standard — most common for floors' },
  { label: '24"', value: 24, desc: 'Economy — common for roofs & ceilings' },
];

const LVL_SIZES = [
  { label: '1¾" × 7¼"', depth: 7.25, width: 1.75, Fb: 2600, E: 2000000, note: 'Single' },
  { label: '1¾" × 9¼"', depth: 9.25, width: 1.75, Fb: 2600, E: 2000000, note: 'Single' },
  { label: '1¾" × 11¼"', depth: 11.25, width: 1.75, Fb: 2600, E: 2000000, note: 'Single' },
  { label: '1¾" × 14"', depth: 14, width: 1.75, Fb: 2600, E: 2000000, note: 'Single' },
  { label: '1¾" × 16"', depth: 16, width: 1.75, Fb: 2600, E: 2000000, note: 'Single' },
  { label: '1¾" × 18"', depth: 18, width: 1.75, Fb: 2600, E: 2000000, note: 'Single' },
  { label: '3½" × 9¼" (doubled)', depth: 9.25, width: 3.5, Fb: 2600, E: 2000000, note: 'Double' },
  { label: '3½" × 11¼" (doubled)', depth: 11.25, width: 3.5, Fb: 2600, E: 2000000, note: 'Double' },
  { label: '3½" × 14" (doubled)', depth: 14, width: 3.5, Fb: 2600, E: 2000000, note: 'Double' },
  { label: '3½" × 16" (doubled)', depth: 16, width: 3.5, Fb: 2600, E: 2000000, note: 'Double' },
];

const GLULAM_SIZES = [
  { label: '3⅛" × 9"', depth: 9, width: 3.125, Fb: 2400, E: 1800000 },
  { label: '3⅛" × 12"', depth: 12, width: 3.125, Fb: 2400, E: 1800000 },
  { label: '3⅛" × 15"', depth: 15, width: 3.125, Fb: 2400, E: 1800000 },
  { label: '3⅛" × 16½"', depth: 16.5, width: 3.125, Fb: 2400, E: 1800000 },
  { label: '5⅛" × 12"', depth: 12, width: 5.125, Fb: 2400, E: 1800000 },
  { label: '5⅛" × 15"', depth: 15, width: 5.125, Fb: 2400, E: 1800000 },
  { label: '5⅛" × 18"', depth: 18, width: 5.125, Fb: 2400, E: 1800000 },
];

const STEEL_SHAPES = [
  { label: 'W6×9', depth: 5.9, Ix: 16.4, Sx: 5.56, weight: 9, shape: 'I-beam' },
  { label: 'W8×10', depth: 7.89, Ix: 30.8, Sx: 7.81, weight: 10, shape: 'I-beam' },
  { label: 'W8×13', depth: 7.99, Ix: 39.6, Sx: 9.91, weight: 13, shape: 'I-beam' },
  { label: 'W8×18', depth: 8.14, Ix: 61.9, Sx: 15.2, weight: 18, shape: 'I-beam' },
  { label: 'W10×12', depth: 9.87, Ix: 53.8, Sx: 10.9, weight: 12, shape: 'I-beam' },
  { label: 'W10×15', depth: 9.99, Ix: 68.9, Sx: 13.8, weight: 15, shape: 'I-beam' },
  { label: 'W10×22', depth: 10.17, Ix: 118, Sx: 23.2, weight: 22, shape: 'I-beam' },
  { label: 'W12×14', depth: 11.91, Ix: 88.6, Sx: 14.9, weight: 14, shape: 'I-beam' },
  { label: 'W12×19', depth: 12.16, Ix: 130, Sx: 21.3, weight: 19, shape: 'I-beam' },
  { label: 'W12×26', depth: 12.22, Ix: 204, Sx: 33.4, weight: 26, shape: 'I-beam' },
  { label: 'C6×8.2', depth: 6, Ix: 13.1, Sx: 4.38, weight: 8.2, shape: 'C-channel' },
  { label: 'C8×11.5', depth: 8, Ix: 32.6, Sx: 8.14, weight: 11.5, shape: 'C-channel' },
  { label: 'C10×15.3', depth: 10, Ix: 67.4, Sx: 13.5, weight: 15.3, shape: 'C-channel' },
  { label: 'C12×20.7', depth: 12, Ix: 129, Sx: 21.5, weight: 20.7, shape: 'C-channel' },
  { label: 'HSS 4×4×¼"', depth: 4, Ix: 12.3, Sx: 6.13, weight: 12.21, shape: 'Square tube' },
  { label: 'HSS 6×4×¼"', depth: 6, Ix: 28.6, Sx: 9.52, weight: 15.62, shape: 'Rectangle tube' },
  { label: 'HSS 6×6×¼"', depth: 6, Ix: 40.7, Sx: 13.6, weight: 19.02, shape: 'Square tube' },
  { label: 'HSS 8×6×⅜"', depth: 8, Ix: 100, Sx: 25.1, weight: 31.84, shape: 'Rectangle tube' },
];

const I_JOISTS = [
  { label: '9½" I-Joist', series: 'TJI 210', depth: 9.5, EI: 240e6 },
  { label: '11⅞" I-Joist', series: 'TJI 210', depth: 11.875, EI: 400e6 },
  { label: '11⅞" I-Joist', series: 'TJI 230', depth: 11.875, EI: 468e6 },
  { label: '14" I-Joist', series: 'TJI 230', depth: 14, EI: 672e6 },
  { label: '16" I-Joist', series: 'TJI 360', depth: 16, EI: 1104e6 },
];

const SCENARIOS = [
  { id: "living", name: "Living Room / Kitchen Floor", icon: "🏠", live: 40, dead: 10, deflLimit: 360, desc: "Standard floors — walking, furniture, people gathering" },
  { id: "bedroom", name: "Bedroom / Office Floor", icon: "🛏️", live: 30, dead: 10, deflLimit: 360, desc: "Lighter use rooms — less foot traffic" },
  { id: "floor_heavy", name: "Floor with Tile or Stone", icon: "🪨", live: 40, dead: 20, deflLimit: 360, desc: "Heavy floor finishes like ceramic, stone, or thick hardwood" },
  { id: "deck", name: "Outdoor Deck", icon: "🌳", live: 40, dead: 10, deflLimit: 360, desc: "Exterior decks — standard residential use" },
  { id: "roof", name: "Roof (mild climate)", icon: "☀️", live: 20, dead: 10, deflLimit: 240, desc: "Roof rafters with little or no snow" },
  { id: "roof_heavy", name: "Roof (heavy tile/slate)", icon: "🏘️", live: 20, dead: 15, deflLimit: 240, desc: "Roof with heavier materials like clay tile" },
  { id: "ceiling", name: "Ceiling Only (no storage)", icon: "💡", live: 10, dead: 5, deflLimit: 240, desc: "Ceiling joists supporting only drywall" },
  { id: "snow_light", name: "Roof — Moderate Snow", icon: "🌨️", live: 30, dead: 15, deflLimit: 240, desc: "30-50 inches of snow per year" },
  { id: "snow_heavy", name: "Roof — Heavy Snow", icon: "❄️", live: 50, dead: 15, deflLimit: 240, desc: "Mountains, northern states, heavy snow regions" },
  { id: "beam", name: "Beam / Header over Opening", icon: "🚪", live: 40, dead: 10, deflLimit: 360, desc: "A beam carrying load from joists — use 'beam load width' below" },
];

// ── Engineering Calculations ──
function calcWoodSpan(size, species, spacingIn, scenario, doubled = false) {
  const { Fb, E } = WOOD_SPECIES[species];
  const wTotal = (scenario.live + scenario.dead) * (spacingIn / 12);
  const wLive = scenario.live * (spacingIn / 12);
  let b = size.width;
  if (doubled) b *= 2;
  const d = size.depth;
  const I = (b * Math.pow(d, 3)) / 12;
  const S = (b * Math.pow(d, 2)) / 6;
  const L_bending = Math.sqrt((8 * Fb * S) / (wTotal / 12));
  const L_defl = Math.pow((384 * E * I) / (5 * (wLive / 12) * scenario.deflLimit), 1/3);
  const L_max = Math.min(L_bending, L_defl) / 12;
  return { span: Math.floor(L_max * 10) / 10, limiting: L_bending < L_defl ? 'strength' : 'stiffness' };
}

function calcBeamSpan(beam, tribWidthFt, scenario) {
  const wTotal = (scenario.live + scenario.dead) * tribWidthFt;
  const wLive = scenario.live * tribWidthFt;
  if (beam.Fb) {
    const I = (beam.width * Math.pow(beam.depth, 3)) / 12;
    const S = (beam.width * Math.pow(beam.depth, 2)) / 6;
    const Lb = Math.sqrt((8 * beam.Fb * S) / (wTotal / 12));
    const Ld = Math.pow((384 * beam.E * I) / (5 * (wLive / 12) * scenario.deflLimit), 1/3);
    return { span: Math.floor(Math.min(Lb, Ld) / 12 * 10) / 10, limiting: Lb < Ld ? 'strength' : 'stiffness' };
  } else if (beam.Ix) {
    const Lb = Math.sqrt((8 * 33000 * beam.Sx) / (wTotal / 12));
    const Ld = Math.pow((384 * 29000000 * beam.Ix) / (5 * (wLive / 12) * scenario.deflLimit), 1/3);
    return { span: Math.floor(Math.min(Lb, Ld) / 12 * 10) / 10, limiting: Lb < Ld ? 'strength' : 'stiffness' };
  } else if (beam.EI) {
    const Ld = Math.pow((384 * beam.EI) / (5 * (wLive / 12) * scenario.deflLimit), 1/3);
    return { span: Math.floor(Ld / 12 * 10) / 10, limiting: 'stiffness' };
  }
  return { span: 0, limiting: 'unknown' };
}

function getBlockingNote(spanFt, depth) {
  if (spanFt > 16) return '⚠️ Add blocking at 2 points';
  if (spanFt > 8 && depth >= 9.25) return '⚠️ Add blocking at center';
  if (depth >= 11.25) return '💡 Blocking recommended';
  return '—';
}

function getStatus(span, target) {
  if (span >= target) return 'pass';
  if (span >= target * 0.85) return 'close';
  return 'short';
}

const STATUS = {
  pass: { bg: '#052e16', border: '#166534', color: '#4ade80', icon: '✓', label: 'Works!' },
  close: { bg: '#422006', border: '#854d0e', color: '#fbbf24', icon: '~', label: 'Almost' },
  short: { bg: '#2a0a0a', border: '#7f1d1d', color: '#f87171', icon: '✗', label: 'Too short' },
};

function Badge({ status }) {
  const s = STATUS[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '11px', fontWeight: 700,
      padding: '3px 10px', borderRadius: 12, background: s.bg, border: `1px solid ${s.border}`, color: s.color, whiteSpace: 'nowrap',
    }}>{s.icon} {s.label}</span>
  );
}

function HelpTip({ children }) {
  return <div style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', marginTop: 3, lineHeight: 1.4 }}>{children}</div>;
}

function InfoCard({ color = '#3b82f6', children }) {
  return (
    <div style={{
      background: `${color}11`, border: `1px solid ${color}33`, borderRadius: 10,
      padding: '12px 16px', marginBottom: 16, fontSize: '13px', color: '#d1d5db', lineHeight: 1.6,
    }}>{children}</div>
  );
}

const TH = ({ children }) => (
  <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', whiteSpace: 'nowrap', borderBottom: '2px solid #333840' }}>
    {children}
  </th>
);

const TD = ({ children, highlight, mono, bold, color, warn }) => (
  <td style={{
    padding: '8px 10px',
    fontWeight: bold ? 800 : highlight ? 700 : 400,
    fontSize: highlight ? '15px' : '13px',
    color: color || (warn ? '#fbbf24' : (highlight ? '#e8eaed' : '#9ca3af')),
    fontFamily: mono ? "'Georgia', serif" : 'inherit',
  }}>{children}</td>
);

export default function SpanCalculator() {
  const [targetSpan, setTargetSpan] = useState(14);
  const [scenarioId, setScenarioId] = useState("living");
  const [species, setSpecies] = useState("Douglas Fir-Larch #2");
  const [tribWidth, setTribWidth] = useState(8);
  const [activeTab, setActiveTab] = useState('wood');
  const [showDoubled, setShowDoubled] = useState(true);

  const scenario = SCENARIOS.find(s => s.id === scenarioId);

  const tabs = [
    { id: 'wood', label: '🪵 Standard Lumber' },
    { id: 'engineered', label: '🔧 LVL & Glulam' },
    { id: 'ijoist', label: '🏗️ I-Joists' },
    { id: 'steel', label: '⚙️ Steel Beams' },
    { id: 'compare', label: '📊 Compare All' },
  ];

  const woodResults = useMemo(() => {
    const r = [];
    WOOD_SIZES.forEach(size => {
      SPACINGS.forEach(spacing => {
        r.push({
          size: size.label, spacing, depth: size.depth,
          single: calcWoodSpan(size, species, spacing.value, scenario, false),
          doubled: calcWoodSpan(size, species, spacing.value, scenario, true),
          blocking: getBlockingNote(calcWoodSpan(size, species, spacing.value, scenario, false).span, size.depth),
        });
      });
    });
    return r;
  }, [species, scenario]);

  const lvlResults = useMemo(() => LVL_SIZES.map(b => ({ ...b, result: calcBeamSpan(b, tribWidth, scenario) })), [tribWidth, scenario]);
  const glulamResults = useMemo(() => GLULAM_SIZES.map(b => ({ ...b, result: calcBeamSpan(b, tribWidth, scenario) })), [tribWidth, scenario]);
  const steelResults = useMemo(() => STEEL_SHAPES.map(b => ({ ...b, result: calcBeamSpan(b, tribWidth, scenario) })), [tribWidth, scenario]);
  const iJoistResults = useMemo(() => {
    const r = [];
    I_JOISTS.forEach(j => SPACINGS.forEach(sp => r.push({ ...j, spacing: sp, result: calcBeamSpan(j, sp.value / 12, scenario) })));
    return r;
  }, [scenario]);

  const summaryData = useMemo(() => {
    const items = [];
    WOOD_SIZES.forEach(s => items.push({ cat: 'Lumber', cc: '#3b82f6', label: `${s.label} @ 16" apart`, span: calcWoodSpan(s, species, 16, scenario).span }));
    WOOD_SIZES.forEach(s => items.push({ cat: 'Doubled', cc: '#8b5cf6', label: `(2) ${s.label} @ 16"`, span: calcWoodSpan(s, species, 16, scenario, true).span }));
    LVL_SIZES.filter((_, i) => i < 6).forEach(b => items.push({ cat: 'LVL', cc: '#f59e0b', label: b.label, span: calcBeamSpan(b, tribWidth, scenario).span }));
    GLULAM_SIZES.filter((_, i) => i < 5).forEach(b => items.push({ cat: 'Glulam', cc: '#ec4899', label: b.label, span: calcBeamSpan(b, tribWidth, scenario).span }));
    I_JOISTS.forEach(j => items.push({ cat: 'I-Joist', cc: '#06b6d4', label: `${j.label} (${j.series}) @ 16"`, span: calcBeamSpan(j, 16/12, scenario).span }));
    STEEL_SHAPES.filter(s => s.shape === 'I-beam').slice(0, 6).forEach(b => items.push({ cat: 'Steel', cc: '#ef4444', label: b.label, span: calcBeamSpan(b, tribWidth, scenario).span }));
    return items.sort((a, b) => a.span - b.span);
  }, [species, scenario, tribWidth]);

  const fieldStyle = {
    background: '#1a1d23', border: '1px solid #2d3139', borderRadius: 8,
    color: '#e8eaed', padding: '10px 12px', fontSize: '14px', width: '100%', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#c9cdd4', fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1d24, #111418)', borderBottom: '3px solid #f59e0b', padding: '24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#f0f1f3' }}>
            🏠 How Far Can It Span?
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '15px', color: '#9ca3af', lineHeight: 1.5 }}>
            Tell us the distance you need to cover and what you're building. We'll show you which lumber, engineered beams, and steel options will work.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '20px 24px' }}>

        {/* ── STEP 1 ── */}
        <div style={{ background: '#161920', borderRadius: 12, padding: 20, border: '1px solid #1f2329', marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 2px', fontSize: '17px', fontWeight: 700, color: '#f0f1f3' }}>① What are you building?</h2>
          <HelpTip>Pick the closest match. This sets how much weight the structure needs to hold.</HelpTip>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 8, marginTop: 12 }}>
            {SCENARIOS.map(s => (
              <button key={s.id} onClick={() => setScenarioId(s.id)} style={{
                padding: '12px 14px', borderRadius: 10,
                border: scenarioId === s.id ? '2px solid #f59e0b' : '1px solid #2d3139',
                background: scenarioId === s.id ? '#f59e0b15' : '#1a1d23',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: scenarioId === s.id ? '#fbbf24' : '#d1d5db' }}>
                  {s.icon} {s.name}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: 3, lineHeight: 1.3 }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── STEP 2 ── */}
        <div style={{ background: '#161920', borderRadius: 12, padding: 20, border: '1px solid #1f2329', marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 2px', fontSize: '17px', fontWeight: 700, color: '#f0f1f3' }}>② How far apart are the supports?</h2>
          <HelpTip>Measure the open distance between walls, posts, or whatever holds up the ends.</HelpTip>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14 }}>
            <input type="range" min={4} max={40} step={0.5} value={targetSpan}
              onChange={e => setTargetSpan(+e.target.value)}
              style={{ flex: 1, accentColor: '#f59e0b', height: 8 }} />
            <div style={{
              background: '#0f1117', border: '2px solid #f59e0b', borderRadius: 10,
              padding: '10px 20px', minWidth: 90, textAlign: 'center',
            }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#fbbf24', fontFamily: "'Georgia', serif" }}>{targetSpan}</span>
              <span style={{ fontSize: '15px', color: '#9ca3af', marginLeft: 4 }}>feet</span>
            </div>
          </div>

          <div style={{ marginTop: 16, position: 'relative', height: 40 }}>
            <div style={{ position: 'absolute', left: 4, right: 4, top: 18, height: 4, background: '#f59e0b', borderRadius: 2 }} />
            <div style={{ position: 'absolute', left: 0, top: 6, width: 8, height: 32, background: '#6b7280', borderRadius: 3 }} />
            <div style={{ position: 'absolute', right: 0, top: 6, width: 8, height: 32, background: '#6b7280', borderRadius: 3 }} />
            <div style={{ position: 'absolute', left: 12, bottom: 0, fontSize: '11px', color: '#6b7280' }}>Wall / Post</div>
            <div style={{ position: 'absolute', right: 12, bottom: 0, fontSize: '11px', color: '#6b7280', textAlign: 'right' }}>Wall / Post</div>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 0, fontSize: '12px', color: '#fbbf24', fontWeight: 700 }}>← {targetSpan} ft →</div>
          </div>
        </div>

        {/* ── STEP 3 ── */}
        <div style={{ background: '#161920', borderRadius: 12, padding: 20, border: '1px solid #1f2329', marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <h2 style={{ margin: '0 0 2px', fontSize: '17px', fontWeight: 700, color: '#f0f1f3' }}>③ What wood are you using?</h2>
            <HelpTip>Look at the grade stamp on the lumber. If unsure, SPF is what most big box stores sell.</HelpTip>
            <select value={species} onChange={e => setSpecies(e.target.value)}
              style={{ ...fieldStyle, marginTop: 10, cursor: 'pointer', appearance: 'auto' }}>
              {Object.entries(WOOD_SPECIES).map(([name]) => <option key={name} value={name}>{name}</option>)}
            </select>
            <div style={{ marginTop: 4, fontSize: '12px', color: '#6b7280' }}>{WOOD_SPECIES[species].desc}</div>
          </div>
          <div>
            <h2 style={{ margin: '0 0 2px', fontSize: '17px', fontWeight: 700, color: '#f0f1f3' }}>④ Beam load width</h2>
            <HelpTip>Only matters for beams & headers: measure from the beam to the nearest parallel wall (or halfway to the next beam). Double it if the beam carries load from both sides.</HelpTip>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <input type="number" value={tribWidth} onChange={e => setTribWidth(+e.target.value)} min={2} max={30} step={0.5}
                style={{ ...fieldStyle, width: 80 }} />
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>feet</span>
            </div>
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '10px 20px', fontSize: '13px', fontWeight: 600,
              background: activeTab === t.id ? '#1e2230' : 'transparent',
              color: activeTab === t.id ? '#fbbf24' : '#6b7280',
              border: activeTab === t.id ? '1px solid #333840' : '1px solid transparent',
              borderBottom: activeTab === t.id ? '1px solid #1e2230' : '1px solid #333840',
              borderRadius: '10px 10px 0 0', cursor: 'pointer',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <div style={{ background: '#1e2230', border: '1px solid #333840', borderRadius: '0 10px 10px 10px', padding: 20, overflowX: 'auto' }}>

          {/* LUMBER */}
          {activeTab === 'wood' && (
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#f0f1f3' }}>🪵 Standard Lumber</h3>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>The boards you buy at any lumber yard or home improvement store.</p>

              <InfoCard>
                <strong>How to read this table:</strong> Find your board size on the left, then pick a spacing (how far apart each joist is).
                <strong> 16" apart is standard</strong> for most floors. The "Max Span" is the farthest that combo can safely reach.
                <br /><br />
                <strong>"Doubled up"</strong> means nailing two identical boards together side-by-side — it roughly doubles the strength.
              </InfoCard>

              <label style={{ fontSize: '13px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <input type="checkbox" checked={showDoubled} onChange={e => setShowDoubled(e.target.checked)} style={{ accentColor: '#f59e0b', width: 16, height: 16 }} />
                Show "doubled up" option
              </label>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <TH>Board</TH><TH>Spacing</TH><TH>Max Span</TH><TH></TH>
                  {showDoubled && <><TH>Doubled Up</TH><TH></TH></>}
                  <TH>What Limits It</TH><TH>Blocking Needed?</TH>
                </tr></thead>
                <tbody>
                  {woodResults.map((r, i) => {
                    const st = getStatus(r.single.span, targetSpan);
                    const dt = getStatus(r.doubled.span, targetSpan);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #272b38', background: i % 2 === 0 ? 'transparent' : '#1a1e2c' }}>
                        <TD highlight bold>{r.size}</TD>
                        <TD>{r.spacing.label} apart</TD>
                        <TD mono bold color={STATUS[st].color}>{r.single.span} ft</TD>
                        <td style={{ padding: '8px 6px' }}><Badge status={st} /></td>
                        {showDoubled && <>
                          <TD mono bold color={STATUS[dt].color}>{r.doubled.span} ft</TD>
                          <td style={{ padding: '8px 6px' }}><Badge status={dt} /></td>
                        </>}
                        <TD>{r.single.limiting === 'strength' ? '💪 Would snap/break' : '📐 Would sag/bounce'}</TD>
                        <TD warn={r.blocking.includes('⚠️')}>{r.blocking}</TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <InfoCard color="#f59e0b">
                💡 <strong>What's "blocking"?</strong> Short pieces of wood cut to fit snugly between joists.
                They stop the joists from twisting sideways under load. Building code requires them for taller boards and longer spans.
              </InfoCard>
            </div>
          )}

          {/* ENGINEERED */}
          {activeTab === 'engineered' && (
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#f0f1f3' }}>🔧 Engineered Wood Beams</h3>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>Factory-made beams that are much stronger than regular boards — used when you need to span farther.</p>

              <InfoCard>
                <strong>LVL (Laminated Veneer Lumber)</strong> — Thin sheets of wood glued together under pressure.
                Much stronger and straighter than regular lumber. The go-to for headers over doors/windows and floor beams. Special order at lumber yards.
                <br /><br />
                <strong>Glulam (Glued Laminated Timber)</strong> — Stacked layers of lumber glued into large beams.
                Often left exposed because they look great. Common for open-concept layouts and vaulted ceilings.
              </InfoCard>

              {[
                { title: 'LVL Beams', sub: 'Best strength-per-dollar for hidden beams', data: lvlResults },
                { title: 'Glulam Beams', sub: 'Great for exposed/visible applications', data: glulamResults },
              ].map(group => (
                <div key={group.title} style={{ marginBottom: 24 }}>
                  <h4 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: '#fbbf24' }}>{group.title}</h4>
                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#6b7280' }}>{group.sub}</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><TH>Size</TH><TH>Max Span</TH><TH></TH><TH>What Limits It</TH></tr></thead>
                    <tbody>
                      {group.data.map((r, i) => {
                        const st = getStatus(r.result.span, targetSpan);
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #272b38', background: i % 2 === 0 ? 'transparent' : '#1a1e2c' }}>
                            <TD highlight bold>{r.label}</TD>
                            <TD mono bold color={STATUS[st].color}>{r.result.span} ft</TD>
                            <td style={{ padding: '8px 6px' }}><Badge status={st} /></td>
                            <TD>{r.result.limiting === 'strength' ? '💪 Would break' : '📐 Would sag too much'}</TD>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* I-JOISTS */}
          {activeTab === 'ijoist' && (
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#f0f1f3' }}>🏗️ Engineered I-Joists</h3>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>Factory-made joists shaped like a tall letter "I" — lightweight but very strong.</p>

              <InfoCard>
                I-Joists have a thin plywood web (the tall middle piece) with solid wood on top and bottom (the flanges). They're lighter and straighter than regular lumber, don't warp or twist, and can span much farther. Most new home construction uses these for floors.
                <br /><br />
                <strong>Common brands:</strong> Weyerhaeuser TJI, LP SolidStart, Boise Cascade BCI.
                Higher series numbers (like TJI 360 vs TJI 210) mean stronger joists.
              </InfoCard>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><TH>Joist</TH><TH>Strength Level</TH><TH>Spacing</TH><TH>Max Span</TH><TH></TH><TH>Notes</TH></tr></thead>
                <tbody>
                  {iJoistResults.map((r, i) => {
                    const st = getStatus(r.result.span, targetSpan);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #272b38', background: i % 2 === 0 ? 'transparent' : '#1a1e2c' }}>
                        <TD highlight bold>{r.label}</TD>
                        <TD>{r.series}</TD>
                        <TD>{r.spacing.label} apart</TD>
                        <TD mono bold color={STATUS[st].color}>{r.result.span} ft</TD>
                        <td style={{ padding: '8px 6px' }}><Badge status={st} /></td>
                        <TD>{r.result.span > 20 ? '⚠️ Needs blocking at 2 spots' : r.result.span > 14 ? '💡 May need reinforcing at supports' : 'Standard install'}</TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <InfoCard color="#f59e0b">
                ⚠️ These are estimates. I-Joist spans vary by brand — always check the specific manufacturer's span table for exact numbers.
              </InfoCard>
            </div>
          )}

          {/* STEEL */}
          {activeTab === 'steel' && (
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#f0f1f3' }}>⚙️ Steel Beams</h3>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>The strongest option — used when nothing else can span far enough, or to replace a load-bearing wall.</p>

              <InfoCard>
                <strong>How to read steel names:</strong>
                <br />• <strong>"W8×18"</strong> = an I-beam that's 8 inches tall and weighs 18 pounds per foot
                <br />• <strong>"C10×15.3"</strong> = a C-shaped channel, 10 inches tall, 15.3 lbs/ft
                <br />• <strong>"HSS 6×4×¼"</strong> = a hollow rectangular tube, 6"×4" with ¼" thick walls
                <br /><br />
                <strong>I-Beams</strong> are the classic "H" shape — strongest per pound. <strong>C-Channels</strong> have one flat side — good for mounting against walls. <strong>Tube Steel</strong> is a clean, modern look — great for exposed applications.
              </InfoCard>

              {[
                { title: '🔩 I-Beams (W-Shapes)', sub: 'Classic structural beam — most common choice', data: steelResults.filter(s => s.shape === 'I-beam') },
                { title: '📐 C-Channels', sub: 'One flat side — easy to attach to walls or other beams', data: steelResults.filter(s => s.shape === 'C-channel') },
                { title: '⬜ Tube Steel (HSS)', sub: 'Hollow tubes — clean look, works well exposed', data: steelResults.filter(s => s.shape.includes('tube')) },
              ].map(group => (
                <div key={group.title} style={{ marginBottom: 24 }}>
                  <h4 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: '#fbbf24' }}>{group.title}</h4>
                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#6b7280' }}>{group.sub}</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><TH>Name</TH><TH>Weight</TH><TH>Height</TH><TH>Max Span</TH><TH></TH><TH>What Limits It</TH></tr></thead>
                    <tbody>
                      {group.data.map((r, i) => {
                        const st = getStatus(r.result.span, targetSpan);
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #272b38', background: i % 2 === 0 ? 'transparent' : '#1a1e2c' }}>
                            <TD highlight bold>{r.label}</TD>
                            <TD>{r.weight} lbs/ft</TD>
                            <TD>{r.depth} inches</TD>
                            <TD mono bold color={STATUS[st].color}>{r.result.span} ft</TD>
                            <td style={{ padding: '8px 6px' }}><Badge status={st} /></td>
                            <TD>{r.result.limiting === 'strength' ? '💪 Would bend too far' : '📐 Would sag too much'}</TD>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}

              <InfoCard color="#ef4444">
                🔴 <strong>Steel beams almost always need an engineer's stamp to get a permit.</strong> Use these numbers for planning — then hire a structural engineer to specify the final beam size, connections, and bearing plates.
              </InfoCard>
            </div>
          )}

          {/* COMPARE */}
          {activeTab === 'compare' && (
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#f0f1f3' }}>📊 Everything Side by Side</h3>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>
                Every option ranked from shortest to longest reach. The yellow line is your {targetSpan}-foot target.
              </p>

              <InfoCard>
                This compares standard lumber at 16" spacing, I-joists at 16" spacing, and beams assuming a {tribWidth}-foot load width. Green bars reach your target, red bars fall short.
              </InfoCard>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {summaryData.map((item, i) => {
                  const maxBar = targetSpan * 1.5;
                  const pct = Math.min((item.span / maxBar) * 100, 100);
                  const st = getStatus(item.span, targetSpan);
                  const barColors = { pass: '#166534', close: '#854d0e', short: '#7f1d1d' };
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                      <span style={{ width: 60, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: item.cc, textAlign: 'right', flexShrink: 0 }}>{item.cat}</span>
                      <span style={{ width: 180, fontSize: '12px', color: '#c9cdd4', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                      <div style={{ flex: 1, height: 22, background: '#111318', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: barColors[st], borderRadius: 4, transition: 'width 0.3s' }} />
                        <div style={{ position: 'absolute', left: `${(targetSpan / maxBar) * 100}%`, top: 0, bottom: 0, width: 2, background: '#f59e0b', opacity: 0.8 }} />
                      </div>
                      <span style={{ width: 55, fontSize: '14px', fontWeight: 800, color: STATUS[st].color, textAlign: 'right', flexShrink: 0, fontFamily: "'Georgia', serif" }}>{item.span}′</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 24, fontSize: '12px', color: '#6b7280', flexWrap: 'wrap' }}>
                <span>━ <span style={{ color: '#fbbf24' }}>Your target ({targetSpan} ft)</span></span>
                <span><span style={{ color: '#4ade80' }}>■</span> Works!</span>
                <span><span style={{ color: '#fbbf24' }}>■</span> Almost there</span>
                <span><span style={{ color: '#f87171' }}>■</span> Too short</span>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 20, padding: '18px 20px', background: '#161920', borderRadius: 12, border: '1px solid #1f2329', lineHeight: 1.7 }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fbbf24' }}>⚠️ Important — Please Read</p>
          <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#9ca3af' }}>
            This calculator gives <strong style={{ color: '#d1d5db' }}>estimates</strong> to help you plan and compare options.
            Real-world factors can change what's actually safe — things like heavy appliances in one spot, holes cut for plumbing and wiring, moisture conditions, and how the ends rest on supports.
          </p>
          <p style={{ margin: '10px 0 0', fontSize: '14px', fontWeight: 700, color: '#e8eaed' }}>
            🏗️ Always check your local building code and have a structural engineer verify before building anything structural.
          </p>
        </div>
      </div>
    </div>
  );
}
