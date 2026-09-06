const { useState, useEffect, useRef, useMemo } = React;

/* ============================== THEME ============================== */

const colors = {
  bgTop: "#161b22",
  bgMid: "#0d1117",
  bgBottom: "#08090b",
  ink: "#EDEFF3",
  inkSoft: "#A7AFBB",
  inkFaint: "#7C8592",
  blue: "#4C8DFF",
  blueDark: "#2F6FE0",
  blueSoft: "rgba(76,141,255,0.14)",
  amber: "#E0A840",
  amberSoft: "rgba(224,168,64,0.14)",
  green: "#4CC38A",
  brick: "#FF6B6B",
  glass: "rgba(255,255,255,0.045)",
  glassStrong: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
};

const fontHead = "'Space Grotesk', sans-serif";
const fontSans = "'Inter', sans-serif";

const glass = (extra = {}) => ({
  background: colors.glass,
  border: `1px solid ${colors.border}`,
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  borderRadius: "16px",
  ...extra,
});

let uidCounter = 1;
const uid = () => `id-${uidCounter++}-${Math.random().toString(36).slice(2, 7)}`;
const clamp10 = (n) => Math.max(0, Math.min(10, n));
const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const hashCode = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function useCountUp(target, durationMs = 1200, start = true) {
  const [value, setValue] = useState(0);
  const raf = useRef();
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [start, target, durationMs]);
  return value;
}

function StatusPill({ level, label }) {
  const map = {
    strong: { color: colors.green, text: "Strong" },
    competitive: { color: colors.amber, text: "Competitive" },
    reach: { color: colors.brick, text: "Reach" },
  };
  const s = map[level];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: fontSans,
        fontSize: "12.5px", fontWeight: 600, color: s.color, background: `${s.color}22`,
        border: `1px solid ${s.color}44`, borderRadius: "999px", padding: "3px 10px 3px 8px",
      }}
    >
      <span style={{ fontSize: "8px" }}>●</span>
      {label ?? s.text}
    </span>
  );
}

/* ============================== FORM PRIMITIVES ============================== */

function Field({ label, hint, error, children }) {
  return (
    <label style={{ display: "block", marginBottom: "16px" }}>
      <span style={{ display: "block", fontSize: "13px", fontWeight: 600, color: colors.ink, marginBottom: "6px" }}>{label}</span>
      {children}
      {error ? (
        <span style={{ display: "block", fontSize: "12px", color: colors.brick, marginTop: "4px" }}>{error}</span>
      ) : hint ? (
        <span style={{ display: "block", fontSize: "12px", color: colors.inkFaint, marginTop: "4px" }}>{hint}</span>
      ) : null}
    </label>
  );
}

const inputBase = {
  width: "100%", fontFamily: fontSans, fontSize: "14px", color: colors.ink,
  background: "rgba(255,255,255,0.04)", border: `1px solid ${colors.border}`,
  borderRadius: "9px", padding: "9px 12px", outline: "none",
};

function TextInput(props) {
  const { style, error, ...rest } = props;
  return <input {...rest} style={{ ...inputBase, ...(error ? { border: `1px solid ${colors.brick}` } : {}), ...(style || {}) }} />;
}

function Select({ value, onChange, options, style }) {
  return (
    <select value={value} onChange={onChange} style={{ ...inputBase, ...style }}>
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: "#161b22", color: colors.ink }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SegmentedControl({ value, onChange, options }) {
  return (
    <div style={{ display: "inline-flex", border: `1px solid ${colors.border}`, borderRadius: "9px", padding: "3px", background: "rgba(255,255,255,0.03)" }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value} type="button" onClick={() => onChange(o.value)}
            style={{
              border: "none", background: active ? colors.blue : "transparent", color: active ? "#fff" : colors.inkSoft,
              fontFamily: fontSans, fontSize: "12.5px", fontWeight: 600, borderRadius: "6px", padding: "6px 12px",
              cursor: "pointer", transition: "background 0.15s ease",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function GhostButton({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="rc-btn-ghost" style={{
      background: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: disabled ? colors.inkFaint : colors.ink,
      fontFamily: fontSans, fontSize: "14px", fontWeight: 600, borderRadius: "9px", padding: "11px 18px",
      cursor: disabled ? "not-allowed" : "pointer",
    }}>
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="rc-btn-primary" style={{
      background: disabled ? "rgba(255,255,255,0.08)" : `linear-gradient(135deg, ${colors.blue}, ${colors.blueDark})`,
      color: disabled ? colors.inkFaint : "#fff", border: "none", borderRadius: "9px", padding: "11px 20px",
      fontFamily: fontSans, fontSize: "14px", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 4px 18px rgba(76,141,255,0.35)",
    }}>
      {children}
    </button>
  );
}

function SmallIconButton({ onClick, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      background: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, color: colors.inkSoft,
      borderRadius: "7px", width: "28px", height: "28px", cursor: "pointer", fontSize: "14px", lineHeight: 1,
    }}>
      ×
    </button>
  );
}

/* ============================== REFERENCE DATA ============================== */

const SUBJECT_LIST = [
  "Mathematics", "Additional Mathematics", "Further Mathematics", "Statistics",
  "Physics", "Chemistry", "Biology", "Combined Science", "Environmental Management",
  "Computer Science", "Information Technology", "English Language", "English Literature",
  "History", "Geography", "Economics", "Business Studies", "Accounting", "Psychology",
  "Sociology", "Religious Studies", "Islamiyat", "Pakistan Studies", "Global Perspectives",
  "French", "Spanish", "German", "Urdu", "Arabic", "Art & Design", "Design & Technology",
  "Music", "Drama", "Physical Education", "Law", "Media Studies", "Government & Politics",
  "Travel & Tourism", "Food Preparation & Nutrition", "Textiles",
];

const O_LEVEL_GRADES = ["A*", "A", "B", "C", "D", "E", "F", "G", "U"];
const A_LEVEL_GRADES = ["A*", "A", "B", "C", "D", "E", "U"];
const GRADE_POINTS_OLEVEL = { "A*": 10, A: 8.7, B: 7.3, C: 6, D: 4.7, E: 3.3, F: 2, G: 1, U: 0 };
const GRADE_POINTS_ALEVEL = { "A*": 10, A: 8.7, B: 7.3, C: 6, D: 4.7, E: 3.3, U: 0 };
const QUAL_STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "predicted", label: "Predicted" },
  { value: "not_taken", label: "Not yet taken" },
];
const O_LEVEL_MIN = 8, O_LEVEL_MAX = 16;
const A_LEVEL_MIN = 3, A_LEVEL_MAX = 10;

function academicRequirementsMet(profile) {
  const oOk = profile.oLevels.length >= O_LEVEL_MIN && profile.oLevels.length <= O_LEVEL_MAX;
  const aOk = profile.aLevelStatus === "not_started" || (profile.aLevels.length >= A_LEVEL_MIN && profile.aLevels.length <= A_LEVEL_MAX);
  return oOk && aOk;
}

const TEST_DEFS = {
  SAT: { label: "SAT", fields: [
    { key: "total", min: 400, max: 1600, step: 10, label: "Total" },
    { key: "math", min: 200, max: 800, step: 10, label: "Math (optional)" },
    { key: "verbal", min: 200, max: 800, step: 10, label: "Reading & Writing (optional)" },
  ], primaryKey: "total", scaleMin: 400, scaleMax: 1600 },
  ACT: { label: "ACT", fields: [{ key: "composite", min: 1, max: 36, step: 1, label: "Composite" }], primaryKey: "composite", scaleMin: 0, scaleMax: 36 },
  IELTS: { label: "IELTS", fields: [
    { key: "overall", min: 0, max: 9, step: 0.5, label: "Overall" },
    { key: "listening", min: 0, max: 9, step: 0.5, label: "Listening" },
    { key: "reading", min: 0, max: 9, step: 0.5, label: "Reading" },
    { key: "writing", min: 0, max: 9, step: 0.5, label: "Writing" },
    { key: "speaking", min: 0, max: 9, step: 0.5, label: "Speaking" },
  ], primaryKey: "overall", scaleMin: 0, scaleMax: 9 },
  TOEFL: { label: "TOEFL iBT", fields: [{ key: "total", min: 0, max: 120, step: 1, label: "Total" }], primaryKey: "total", scaleMin: 0, scaleMax: 120 },
  DUOLINGO: { label: "Duolingo English Test", fields: [{ key: "total", min: 10, max: 160, step: 5, label: "Score" }], primaryKey: "total", scaleMin: 10, scaleMax: 160 },
  MCAT: { label: "MCAT", fields: [{ key: "total", min: 472, max: 528, step: 1, label: "Total" }], primaryKey: "total", scaleMin: 472, scaleMax: 528 },
  GRE: { label: "GRE", fields: [{ key: "total", min: 260, max: 340, step: 1, label: "Total" }], primaryKey: "total", scaleMin: 260, scaleMax: 340 },
  GMAT: { label: "GMAT", fields: [{ key: "total", min: 200, max: 800, step: 10, label: "Total" }], primaryKey: "total", scaleMin: 200, scaleMax: 800 },
};
const TEST_TYPES = Object.keys(TEST_DEFS);
const TEST_STATUS_OPTIONS = [
  { value: "not_taken", label: "Not taken yet" },
  { value: "planned", label: "Planned" },
  { value: "available", label: "Score available" },
];

/* ---- University directory ---- */

const RAW_UNIVERSITIES = [
  ["Harvard University", "United States"], ["Massachusetts Institute of Technology", "United States"],
  ["Stanford University", "United States"], ["Princeton University", "United States"],
  ["Yale University", "United States"], ["Columbia University", "United States"],
  ["University of Pennsylvania", "United States"], ["California Institute of Technology", "United States"],
  ["Duke University", "United States"], ["Northwestern University", "United States"],
  ["Cornell University", "United States"], ["Johns Hopkins University", "United States"],
  ["University of Chicago", "United States"], ["Brown University", "United States"],
  ["Dartmouth College", "United States"], ["University of California, Berkeley", "United States"],
  ["University of California, Los Angeles", "United States"], ["University of Michigan", "United States"],
  ["New York University", "United States"], ["Georgetown University", "United States"],
  ["Carnegie Mellon University", "United States"], ["University of Illinois Urbana-Champaign", "United States"],
  ["Purdue University", "United States"], ["Northeastern University", "United States"],
  ["Boston University", "United States"], ["University of Washington", "United States"],
  ["University of Texas at Austin", "United States"], ["Ohio State University", "United States"],
  ["Pennsylvania State University", "United States"], ["Drake University", "United States"],
  ["University of Oxford", "United Kingdom"], ["University of Cambridge", "United Kingdom"],
  ["Imperial College London", "United Kingdom"], ["University College London", "United Kingdom"],
  ["London School of Economics and Political Science", "United Kingdom"], ["King's College London", "United Kingdom"],
  ["University of Edinburgh", "United Kingdom"], ["University of Manchester", "United Kingdom"],
  ["University of Warwick", "United Kingdom"], ["University of Bristol", "United Kingdom"],
  ["University of Glasgow", "United Kingdom"], ["University of Birmingham", "United Kingdom"],
  ["University of Leeds", "United Kingdom"], ["University of Sheffield", "United Kingdom"],
  ["University of Nottingham", "United Kingdom"], ["Durham University", "United Kingdom"],
  ["University of Southampton", "United Kingdom"], ["University of St Andrews", "United Kingdom"],
  ["University of Exeter", "United Kingdom"], ["Queen Mary University of London", "United Kingdom"],
  ["University of Toronto", "Canada"], ["University of British Columbia", "Canada"],
  ["McGill University", "Canada"], ["University of Waterloo", "Canada"],
  ["University of Alberta", "Canada"], ["McMaster University", "Canada"],
  ["Queen's University", "Canada"], ["Western University", "Canada"],
  ["Université de Montréal", "Canada"], ["University of Calgary", "Canada"],
  ["Simon Fraser University", "Canada"], ["University of Ottawa", "Canada"],
  ["Tsinghua University", "China"], ["Peking University", "China"],
  ["Fudan University", "China"], ["Shanghai Jiao Tong University", "China"],
  ["Zhejiang University", "China"], ["University of Science and Technology of China", "China"],
  ["Nanjing University", "China"], ["Sun Yat-sen University", "China"],
  ["Wuhan University", "China"], ["Xi'an Jiaotong University", "China"],
  ["University of Tokyo", "Japan"], ["Kyoto University", "Japan"],
  ["Osaka University", "Japan"], ["Tohoku University", "Japan"],
  ["Nagoya University", "Japan"], ["Tokyo Institute of Technology", "Japan"],
  ["Keio University", "Japan"], ["Waseda University", "Japan"],
  ["Hokkaido University", "Japan"], ["Kyushu University", "Japan"],
  ["ETH Zurich", "Switzerland"], ["EPFL", "Switzerland"],
  ["University of Amsterdam", "Netherlands"], ["Delft University of Technology", "Netherlands"],
  ["Sorbonne University", "France"], ["Sciences Po", "France"],
  ["Technical University of Munich", "Germany"], ["LMU Munich", "Germany"],
  ["University of Copenhagen", "Denmark"], ["KTH Royal Institute of Technology", "Sweden"],
  ["Trinity College Dublin", "Ireland"], ["KU Leuven", "Belgium"],
  ["University of Bologna", "Italy"], ["Bocconi University", "Italy"],
  ["University of Barcelona", "Spain"], ["Uppsala University", "Sweden"],
];

const TIER_VERY_HIGH = new Set(["Harvard University", "Massachusetts Institute of Technology", "Stanford University", "Princeton University", "Yale University", "University of Oxford", "University of Cambridge", "Imperial College London", "ETH Zurich", "University of Tokyo", "Tsinghua University", "Peking University", "University of Toronto", "McGill University", "Columbia University"]);
const TIER_HIGH = new Set(["University of Pennsylvania", "California Institute of Technology", "Duke University", "Northwestern University", "Cornell University", "Johns Hopkins University", "University of Chicago", "Brown University", "Dartmouth College", "University of California, Berkeley", "University of California, Los Angeles", "University of Michigan", "New York University", "Georgetown University", "Carnegie Mellon University", "University College London", "London School of Economics and Political Science", "King's College London", "University of Edinburgh", "University of Manchester", "University of Warwick", "University of Bristol", "University of Waterloo", "University of British Columbia", "Fudan University", "Shanghai Jiao Tong University", "Zhejiang University", "Kyoto University", "Osaka University", "Keio University", "Waseda University", "Sciences Po", "Technical University of Munich", "Delft University of Technology", "EPFL", "Bocconi University", "Trinity College Dublin", "KU Leuven", "Uppsala University", "University of Amsterdam"]);

const TIER_SELECTIVITY = { "very-high": 9.0, high: 7.2, moderate: 5.6 };
const TIER_TEXT = {
  "very-high": { academic: "Top-tier academic performance expected (A*A*A / IB 40–42+ equivalent)", test: "Where tests are considered, scores in the top few percent nationally are typical", english: "IELTS 7.0+ / TOEFL 100+ typically expected" },
  high: { academic: "Strong academic performance expected (AAA–AAB / IB 36–38 equivalent)", test: "Competitive scores typically expected where tests are required or submitted", english: "IELTS 6.5+ / TOEFL 90+ typically expected" },
  moderate: { academic: "Solid academic performance expected (BBB–ABB / IB 30–34 equivalent)", test: "Tests are often optional; moderate scores are typically sufficient", english: "IELTS 6.0+ / TOEFL 80+ typically expected" },
};
const SCHOLARSHIP_TEXT = {
  "very-high": "Highly competitive merit scholarships exist but cover a small fraction of admits — need-based aid, where offered, is usually the bigger lever.",
  high: "Merit scholarships are fairly common for strong applicants, often with automatic consideration on admission.",
  moderate: "Merit scholarships are often generously available and moderately competitive for a well-prepared applicant.",
};
const TUITION_RANGE = {
  "United States": "$35,000–65,000/yr (est.)", "United Kingdom": "£22,000–38,000/yr (est.)",
  Canada: "CAD $30,000–60,000/yr (est.)", China: "$4,000–12,000/yr (est.)", Japan: "$6,000–12,000/yr (est.)",
  Germany: "€0–1,500/yr (public, est.)", France: "€2,900–15,000/yr (est.)", Netherlands: "€8,000–20,000/yr (est.)",
  Switzerland: "CHF 1,000–30,000/yr (est.)", Italy: "€1,000–4,000/yr (public, est.)", Spain: "€1,000–4,500/yr (public, est.)",
  Sweden: "€0 (EU) / €10,000–20,000/yr (non-EU, est.)", Denmark: "€0 (EU) / €12,000–18,000/yr (non-EU, est.)",
  Ireland: "€10,000–25,000/yr (est.)", Belgium: "€900–4,000/yr (est.)", Austria: "€1,500–5,000/yr (est.)",
  Portugal: "€1,000–7,000/yr (est.)", Other: "Varies — check the university's official site (est.)",
};
const CUSTOM_COUNTRIES = [...new Set(RAW_UNIVERSITIES.map((u) => u[1]))].sort().concat(["Austria", "Portugal", "Other"]);

/* ============================== AI DETAILED OVERVIEW (Gemini) ============================== */

const FUN_FACTS = [
  "Harvard's acceptance rate dropped below 5% for the first time in 2018 — and it's stayed there since.",
  "The SAT was originally called the 'Scholastic Aptitude Test' when it launched in 1926.",
  "Some universities receive more scholarship applications than actual admission applications.",
  "The word 'alumnus' comes from Latin for 'nourished' — as in nourished by one's alma mater.",
  "Stanford was founded in memory of a 15-year-old boy who died of typhoid fever.",
  "The Common Application now serves over 1,000 member colleges worldwide.",
  "IELTS was first introduced in 1989 and is now taken by over 3.5 million people a year.",
  "MIT's motto, 'Mens et Manus,' means 'Mind and Hand' — reflecting its hands-on approach.",
  "The University of Bologna, founded in 1088, is considered the oldest university in continuous operation.",
  "Some Ivy League schools didn't admit women as undergraduates until the 1970s.",
  "A 'legacy' applicant is someone whose parent or relative attended the same university.",
  "The ACT was introduced in 1959 as a competitor to the SAT.",
  "Oxford University is older than the Aztec Empire.",
  "The Duolingo English Test can be completed from home in under an hour.",
  "The average college essay gets read in under 3–8 minutes by an admissions officer.",
  "Need-blind admission means your ability to pay doesn't affect your acceptance chances.",
  "The term 'sophomore' comes from Greek words roughly meaning 'wise fool.'",
  "Some universities superscore the SAT, combining your best section scores across attempts.",
  "The first standardized college entrance exam in the US dates back to 1901.",
  "Full-ride scholarships often cover tuition, room, board, and even books.",
  "Early Decision is typically binding, while Early Action usually isn't.",
  "The UK's UCAS system lets you apply to up to 5 universities with one application.",
  "Some admissions offices read applications holistically, weighing essays and activities as much as grades.",
  "The Fulbright Program has funded students and scholars in over 160 countries since 1946.",
  "A 'safety school' is one where your profile significantly exceeds the typical admitted student.",
  "The world's first MBA program was created at Harvard Business School in 1908.",
  "Some scholarship committees spend less than 2 minutes per application in the first screening round.",
  "The GRE was introduced in 1949 to help standardize graduate admissions decisions.",
  "Many highly selective universities interview fewer than 10% of applicants who apply.",
  "Waitlists at highly selective schools can sometimes number in the thousands for a handful of spots.",
];

function buildOverviewPrompt(profile, analysis, universities) {
  const testsSummary = analysis.dims.testing.collected.length
    ? analysis.dims.testing.collected.map((c) => `${TEST_DEFS[c.type].label} ${c.raw}`).join(", ")
    : "no recorded test scores";
  const activitiesSummary = profile.activities.length
    ? profile.activities.map((a) => `${a.name} (${a.category}, ${a.leadershipLevel}${a.outcome ? `: ${a.outcome}` : ""})`).join("; ")
    : "no activities listed yet";
  const uniSummary = universities.map((u) => {
    const r = analysis.perUniversity.find((x) => x.universityId === u.id);
    return `${u.name} (${u.country}) — admission: ${r.admissionStatus}, scholarship: ${r.scholarshipStatus}`;
  }).join("\n");

  return `You are an experienced, honest university admissions advisor. Write a detailed but concise (250-350 word) overview of this student's profile and their chances at their shortlisted universities. Be specific, constructive, and honest — never fake precision like exact percentages, and never say "you have no chance" — frame reach schools as high-reach options instead. Do not use markdown headers.

PROFILE
Overall competitiveness score: ${analysis.overallScore}/10
Academic: ${analysis.dims.academic.score.toFixed(1)}/10 ${analysis.stillInDevelopment ? "(A-Levels not yet finalized)" : ""}
Testing: ${analysis.dims.testing.score.toFixed(1)}/10 (${testsSummary})
Extracurriculars: ${analysis.dims.activities.score.toFixed(1)}/10 — ${activitiesSummary}
Leadership: ${analysis.dims.leadership.score.toFixed(1)}/10
Intended field: ${profile.goals.intendedField || "not specified"}
Scholarship priority: ${profile.goals.scholarshipPriority}

SHORTLISTED UNIVERSITIES
${uniSummary || "none selected"}

Write the overview now, addressing the student directly as "you".`;
}

// Set your own Gemini API key here before deploying so visitors don't need to enter one.
// If you restrict this key by HTTP referrer (Google Cloud Console → Credentials) to your
// deployed domain, it's reasonably safe to ship embedded in a client-side site like this.
// Leaving the placeholder below means visitors will be asked to paste their own key instead.
const GEMINI_API_KEY = "AQ.Ab8RN6LMTdN-wTlLBlmmdEMCi_EgNobzdCq3NySaaVGZVZDhaA";

async function callGeminiOverview(apiKey, prompt) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Request failed (${res.status})`);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response text returned — the model may have blocked this prompt.");
  return text.trim();
}

function AIOverviewPanel({ profile, analysis, universities }) {
  const apiKey = GEMINI_API_KEY && GEMINI_API_KEY !== "PASTE_YOUR_GEMINI_API_KEY_HERE" ? GEMINI_API_KEY : "";
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [overview, setOverview] = useState("");
  const [error, setError] = useState("");
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * FUN_FACTS.length));
  const [cooldown, setCooldown] = useState(0);
  const factTimerRef = useRef(null);
  const cooldownRef = useRef(null);

  useEffect(() => () => { clearInterval(factTimerRef.current); clearInterval(cooldownRef.current); }, []);

  const startCooldown = () => {
    setCooldown(10);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const runOverview = async () => {
    setStatus("loading");
    setError("");
    factTimerRef.current = setInterval(() => setFactIndex((i) => (i + 1) % FUN_FACTS.length), 5500);
    const minDelay = new Promise((r) => setTimeout(r, 1400));
    try {
      const prompt = buildOverviewPrompt(profile, analysis, universities);
      const [text] = await Promise.all([callGeminiOverview(apiKey, prompt), minDelay]);
      clearInterval(factTimerRef.current);
      setOverview(text);
      setStatus("done");
    } catch (e) {
      clearInterval(factTimerRef.current);
      setError(e.message || "Something went wrong.");
      setStatus("error");
    }
    startCooldown();
  };

  if (!apiKey) {
    return (
      <div style={{ ...glass({ padding: "24px" }), marginBottom: "28px" }}>
        <div style={{ fontFamily: fontHead, fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: colors.ink }}>Detailed Review</div>
        <p style={{ fontSize: "13px", color: colors.inkFaint, lineHeight: 1.55, margin: 0 }}>This feature isn't available in this preview yet.</p>
      </div>
    );
  }

  return (
    <div style={{ ...glass({ padding: "24px" }), marginBottom: "28px" }}>
      <div style={{ fontFamily: fontHead, fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: colors.ink }}>Detailed Review</div>

      {status !== "done" && (
        <>
          <p style={{ fontSize: "13px", color: colors.inkSoft, lineHeight: 1.55, margin: "0 0 14px" }}>
            Generate a full written review of your profile and shortlist, powered by AI.
          </p>
          <PrimaryButton onClick={runOverview} disabled={status === "loading" || cooldown > 0}>
            {status === "loading" ? "Generating…" : cooldown > 0 ? `Wait ${cooldown}s` : "Get Detailed Review"}
          </PrimaryButton>
        </>
      )}

      {status === "loading" && (
        <div className="rc-fade-in" key={factIndex} style={{ marginTop: "18px", padding: "16px 18px", background: colors.blueSoft, border: `1px solid ${colors.blue}33`, borderRadius: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: colors.blue, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>Fun fact while you wait</div>
          <p style={{ fontSize: "13.5px", color: colors.ink, lineHeight: 1.55, margin: 0 }}>{FUN_FACTS[factIndex]}</p>
        </div>
      )}

      {status === "error" && (
        <div style={{ marginTop: "14px", padding: "14px 16px", background: "rgba(255,107,107,0.1)", border: `1px solid ${colors.brick}55`, borderRadius: "10px" }}>
          <p style={{ fontSize: "13px", color: colors.ink, margin: 0 }}>Couldn't generate a review: {error}</p>
        </div>
      )}

      {status === "done" && (
        <div className="rc-fade-in">
          <div className="rc-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: "16px" }}>
            <DimensionBar label="Academic" score={analysis.dims.academic.score} />
            <DimensionBar label="Testing" score={analysis.dims.testing.score} />
            <DimensionBar label="Extracurricular activity" score={analysis.dims.activities.score} />
            <DimensionBar label="Leadership" score={analysis.dims.leadership.score} />
          </div>
          {universities.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
              {universities.map((u) => {
                const r = analysis.perUniversity.find((x) => x.universityId === u.id);
                return (
                  <span key={u.id} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.04)", border: `1px solid ${colors.border}`, borderRadius: "999px", padding: "5px 12px 5px 12px" }}>
                    <span style={{ fontSize: "12.5px", color: colors.ink }}>{u.name}</span>
                    <StatusPill level={r.admissionStatus} />
                  </span>
                );
              })}
            </div>
          )}
          <p style={{ fontSize: "14px", color: colors.ink, lineHeight: 1.65, whiteSpace: "pre-wrap", margin: "0 0 14px" }}>{overview}</p>
          <GhostButton onClick={runOverview} disabled={cooldown > 0}>{cooldown > 0 ? `Regenerate in ${cooldown}s` : "Regenerate"}</GhostButton>
        </div>
      )}
    </div>
  );
}


function tierOf(name, estimated) {
  if (estimated) {
    const h = hashCode(name) % 10;
    if (h === 0) return "very-high";
    if (h <= 3) return "high";
    return "moderate";
  }
  if (TIER_VERY_HIGH.has(name)) return "very-high";
  if (TIER_HIGH.has(name)) return "high";
  return "moderate";
}

function makeUniversityRecord(name, country, estimated = false) {
  const tier = tierOf(name, estimated);
  const selectivity = TIER_SELECTIVITY[tier];
  return {
    id: slugify(name) + (estimated ? "-custom" : ""),
    name, country, tier, estimated,
    selectivity, scholarshipBar: Math.min(10, selectivity + 1),
  };
}

const UNIVERSITY_DIRECTORY = RAW_UNIVERSITIES.map(([name, country]) => makeUniversityRecord(name, country));

/* ============================== ANALYSIS ENGINE ============================== */

const DIM_WEIGHTS = { academic: 0.3, testing: 0.2, activities: 0.3, leadership: 0.2 };
const DIM_LABELS = { academic: "academic profile", testing: "testing", activities: "extracurricular impact", leadership: "leadership" };
const LEADERSHIP_POINTS = { participant: 3, member: 5, lead: 7.5, founder: 9.5 };

function computeAcademicScore(profile) {
  const oPts = profile.oLevels.filter((q) => q.status !== "not_taken" && q.grade).map((q) => GRADE_POINTS_OLEVEL[q.grade]).filter((v) => v != null);
  const prevAvg = oPts.length ? avg(oPts) : null;

  const subjectPoints = profile.aLevels.map((q) => {
    const asPts = q.asStatus !== "not_taken" && q.asGrade ? GRADE_POINTS_ALEVEL[q.asGrade] : null;
    const a2Pts = q.a2Status !== "not_taken" && q.a2Grade ? GRADE_POINTS_ALEVEL[q.a2Grade] : null;
    if (a2Pts != null && asPts != null) return asPts * 0.35 + a2Pts * 0.65;
    if (a2Pts != null) return a2Pts;
    if (asPts != null) return asPts;
    return null;
  }).filter((v) => v != null);
  const currAvg = subjectPoints.length ? avg(subjectPoints) : null;

  let score;
  if (currAvg != null && prevAvg != null) score = prevAvg * 0.35 + currAvg * 0.65;
  else if (currAvg != null) score = currAvg;
  else if (prevAvg != null) score = prevAvg;
  else score = 5;

  return { score: clamp10(score), stillInDevelopment: currAvg == null };
}

function computeTestingScore(tests) {
  const collected = [];
  tests.forEach((t) => {
    if (t.status !== "available") return;
    const def = TEST_DEFS[t.type];
    const raw = t.values[def.primaryKey];
    if (raw === undefined || raw === "") return;
    const num = Number(raw);
    if (isNaN(num) || num < def.scaleMin || num > def.scaleMax) return;
    const scaled = clamp10(((num - def.scaleMin) / (def.scaleMax - def.scaleMin)) * 10);
    collected.push({ type: t.type, raw: num, scaled });
  });
  return { score: collected.length ? avg(collected.map((c) => c.scaled)) : 5, known: collected.length > 0, collected };
}

function computeActivitiesScore(activities) {
  if (activities.length === 0) return { score: 2, meaningfulCount: 0 };
  const leadershipAvg = avg(activities.map((a) => LEADERSHIP_POINTS[a.leadershipLevel] ?? 3));
  const meaningful = activities.filter((a) => a.outcome && a.outcome.trim().length > 15);
  const countBonus = Math.min(activities.length, 5) * 0.5;
  const outcomeBonus = Math.min(meaningful.length, 4) * 0.7;
  return { score: clamp10(2 + leadershipAvg * 0.35 + countBonus + outcomeBonus), meaningfulCount: meaningful.length };
}

function computeLeadershipScore(activities) {
  if (activities.length === 0) return 2;
  return avg(activities.map((a) => LEADERSHIP_POINTS[a.leadershipLevel] ?? 3));
}

function statusFromDiff(diff) {
  if (diff >= 0.5) return "strong";
  if (diff >= -1.5) return "competitive";
  return "reach";
}

function testSummaryText(collected) {
  if (collected.length === 0) return null;
  if (collected.length === 1) return `${TEST_DEFS[collected[0].type].label} ${collected[0].raw}`;
  return "your recorded test scores";
}

function buildUniversityNarrative(profile, dims, uni) {
  const strengths = [];
  const gaps = [];

  if (dims.academic.score >= 7) {
    strengths.push(dims.academic.stillInDevelopment ? "Your O-Level/Matric foundation is strong, which sets a solid base even before A-Level results are in." : "Your academic average is one of your strongest assets for this program.");
  } else {
    gaps.push(dims.academic.stillInDevelopment ? "Your AS/A2 results aren't available yet, so academic competitiveness here is partly based on predicted trajectory." : "Your academic average is a step below what this program typically looks for — this is your biggest area to work on for this one.");
  }

  if (dims.testing.score >= 7) {
    strengths.push("Your test scores align well with this university's typical range.");
  } else if (!dims.testing.known) {
    gaps.push("You haven't recorded a test score yet, so testing competitiveness is currently unknown here.");
  } else {
    gaps.push("Your current test scores are a bit behind this university's typical competitive range.");
  }

  if (dims.activities.score >= 7) {
    strengths.push("Your extracurricular profile shows real depth, not just participation.");
  } else {
    gaps.push(profile.activities.length > 0 ? "You have some activities, but few currently show sustained ownership or measurable impact." : "Your extracurricular profile is currently thin — this is one of the biggest levers you can pull.");
  }

  if (dims.leadership.score < 5) gaps.push("Limited demonstrated leadership across your activities so far.");
  else if (dims.leadership.score >= 7.5) strengths.push("You've taken on real leadership or founder-level roles, not just membership.");

  const ranked = [
    { key: "testing", score: dims.testing.score }, { key: "activities", score: dims.activities.score }, { key: "leadership", score: dims.leadership.score },
  ].sort((a, b) => a.score - b.score);
  const weakest = ranked[0].key;

  let opportunity;
  if (weakest === "testing" && !dims.testing.known) {
    opportunity = `Taking a recognized test (SAT, ACT, IELTS, or TOEFL depending on the program) and getting a documented score would remove the biggest unknown in your ${uni.name} profile.`;
  } else if (weakest === "activities") {
    const founderish = profile.activities.find((a) => a.leadershipLevel === "founder" || a.leadershipLevel === "lead");
    opportunity = founderish ? `Take "${founderish.name}" further — a measurable outcome would strengthen it significantly.` : "Developing one activity into something with a real, measurable outcome would strengthen your profile more than adding several smaller certificates.";
  } else if (weakest === "leadership") {
    opportunity = "Seeking a leadership or founding role in one of your existing activities would be the highest-leverage move right now.";
  } else {
    opportunity = "Raising your test score further would help, but it isn't your biggest lever right now.";
  }

  return { strengths: strengths.slice(0, 3), gaps: gaps.slice(0, 3), opportunity };
}

/* ---- Subject/program fit checking ---- */

const FIELD_REQUIREMENTS = {
  "computer science": { required: ["Mathematics"], recommended: ["Further Mathematics", "Physics", "Computer Science"] },
  engineering: { required: ["Mathematics", "Physics"], recommended: ["Further Mathematics", "Chemistry"] },
  medicine: { required: ["Biology", "Chemistry"], recommended: ["Mathematics", "Physics"] },
  law: { required: [], recommended: ["History", "English Literature", "Government & Politics", "Sociology"] },
  business: { required: [], recommended: ["Business Studies", "Economics", "Accounting", "Mathematics"] },
  economics: { required: ["Mathematics"], recommended: ["Economics", "Business Studies"] },
  psychology: { required: [], recommended: ["Psychology", "Biology", "Sociology"] },
  architecture: { required: ["Mathematics"], recommended: ["Art & Design", "Physics"] },
};
const FIELD_ALIASES = {
  cs: "computer science", "computer science": "computer science", "software engineering": "computer science", software: "computer science",
  medicine: "medicine", "pre-med": "medicine", "pre med": "medicine",
  engineering: "engineering", "mechanical engineering": "engineering", "electrical engineering": "engineering", "civil engineering": "engineering",
  law: "law", business: "business", "business administration": "business",
  economics: "economics", psychology: "psychology", architecture: "architecture",
};

function matchField(intendedField) {
  if (!intendedField) return null;
  const norm = intendedField.trim().toLowerCase();
  if (!norm) return null;
  for (const [alias, key] of Object.entries(FIELD_ALIASES)) {
    if (norm.includes(alias)) return key;
  }
  return null;
}

function computeSubjectFit(intendedField, subjects) {
  const key = matchField(intendedField);
  if (!key || subjects.length === 0) return null;
  const req = FIELD_REQUIREMENTS[key];
  const missing = req.required.filter((r) => !subjects.includes(r));
  if (missing.length === 0) return { fit: "good", key };
  const alternatives = Object.entries(FIELD_REQUIREMENTS)
    .filter(([k, v]) => k !== key && v.required.every((r) => subjects.includes(r)))
    .map(([k]) => k.replace(/\b\w/g, (c) => c.toUpperCase()));
  return { fit: "mismatch", key, missing, alternatives };
}

/* ---- Pre-A-Level two-year roadmap ---- */

function generatePreALevelPlan(profile) {
  const key = matchField(profile.goals.intendedField);
  const req = key ? FIELD_REQUIREMENTS[key] : null;
  const subjectAdvice = req
    ? `Prioritize ${[...req.required, ...req.recommended].slice(0, 4).join(", ")} when you pick your A-Level subjects — these carry the most weight for ${profile.goals.intendedField}.`
    : "Choose A-Level subjects that are directly relevant to the field you want to study — admissions officers look for subject relevance, not just strong grades.";

  const countries = profile.goals.targetCountries.toLowerCase();
  const wantsUS = countries.includes("us") || countries.includes("united states") || countries.includes("america");
  const testAdvice = wantsUS
    ? "Start SAT or ACT prep about a year before you apply (typically the summer after Year 1), and take IELTS or TOEFL 6–9 months before applications are due."
    : "IELTS or TOEFL is usually enough outside the US — plan to take it 6–9 months before applications, and only add the SAT/ACT if a specific university asks for it.";

  return [
    { phase: "Right now — choosing subjects", items: [subjectAdvice, "Pick 3–4 A-Level subjects rather than spreading thin — depth matters more than breadth here."] },
    { phase: "Year 1 of A-Levels", items: ["Explore 2–3 extracurriculars related to your intended field and see which one you actually want to go deep on.", "Don't rush into standardized tests yet — focus on building a strong AS foundation first."] },
    { phase: "Year 2 of A-Levels", items: [testAdvice, "Take the one activity that clicked in Year 1 and push it toward a measurable outcome — a project, competition result, or leadership role.", "Finalize your university list and start drafting applications in the first term."] },
  ];
}

function computeAnalysis(profile, universities) {
  const academic = computeAcademicScore(profile);
  const testing = computeTestingScore(profile.tests);
  const activities = computeActivitiesScore(profile.activities);
  const leadership = { score: computeLeadershipScore(profile.activities) };
  const dims = { academic, testing, activities, leadership };
  const overallScore = clamp10(academic.score * DIM_WEIGHTS.academic + testing.score * DIM_WEIGHTS.testing + activities.score * DIM_WEIGHTS.activities + leadership.score * DIM_WEIGHTS.leadership);

  const perUniversity = universities.map((uni) => {
    const admissionStatus = statusFromDiff(overallScore - uni.selectivity);
    const scholarshipRaw = overallScore * 0.4 + academic.score * 0.35 + testing.score * 0.25;
    const scholarshipStatus = statusFromDiff(scholarshipRaw - uni.scholarshipBar);
    return { universityId: uni.id, dims, admissionStatus, scholarshipStatus, ...buildUniversityNarrative(profile, dims, uni) };
  });

  return { overallScore: Math.round(overallScore * 10) / 10, dims, stillInDevelopment: academic.stillInDevelopment, perUniversity };
}

function buildPriorities(profile, analysis) {
  const { dims } = analysis;
  const priorities = [];

  if (!dims.testing.known) {
    priorities.push({ id: "test-score", title: "Get a documented test score (SAT, ACT, IELTS, or TOEFL)", impact: "Very High", impactScore: 4, why: "Without a recorded score, universities can't properly evaluate your testing profile — right now it's the biggest unknown in your applications.", difficulty: "Medium", timeframe: "Next 2–3 months" });
  } else if (dims.testing.score < 7.5) {
    const summary = testSummaryText(dims.testing.collected);
    priorities.push({ id: "improve-test", title: "Raise your test score", impact: dims.testing.score < 6 ? "High" : "Medium", impactScore: dims.testing.score < 6 ? 3 : 2, why: `${summary ? `Your current ${summary}. ` : ""}A stronger score would help at your more selective picks, though it isn't your only lever.`, difficulty: "Medium", timeframe: "Next 2–4 months" });
  }

  const totalActivities = profile.activities.length;
  const meaningful = dims.activities.meaningfulCount;
  if (dims.activities.score < 7) {
    const bestActivity = profile.activities.find((a) => a.leadershipLevel === "founder" || a.leadershipLevel === "lead");
    priorities.push({ id: "strengthen-activities", title: "Strengthen extracurricular depth", impact: dims.activities.score < 5 ? "Very High" : "High", impactScore: dims.activities.score < 5 ? 4 : 3, why: totalActivities === 0 ? "You haven't added any activities yet — this is currently the thinnest part of your profile." : `You have ${totalActivities} activit${totalActivities === 1 ? "y" : "ies"}, but only ${meaningful} currently show a measurable, sustained outcome.${bestActivity ? ` Taking "${bestActivity.name}" further would beat starting something new.` : ""}`, difficulty: "Medium", timeframe: "Next 3–6 months" });
  }

  if (dims.leadership.score < 6) {
    priorities.push({ id: "leadership", title: "Seek a leadership role", impact: "High", impactScore: 3, why: "Most of your activities currently show participation rather than ownership — a leadership or founding role would change that.", difficulty: "Medium", timeframe: "This term" });
  }

  const intendedField = profile.goals.intendedField.trim();
  if (dims.academic.stillInDevelopment) {
    priorities.push({ id: "as-grades", title: intendedField ? `Maintain strong A-Level grades, especially subjects relevant to ${intendedField}` : "Maintain strong A-Level grades", impact: "High", impactScore: 3, why: "Your AS/A2 results aren't locked in yet — they're still one of the most controllable parts of your profile.", difficulty: "Ongoing", timeframe: "This academic year" });
  } else if (dims.academic.score < 7) {
    priorities.push({ id: "academic-improve", title: "Focus on raising your academic average", impact: "High", impactScore: 3, why: "Your academic average is currently the biggest lever across your shortlist — raising it would open up more of your list.", difficulty: "High", timeframe: "Ongoing" });
  }

  const noEvidenceStrong = profile.activities.find((a) => (a.leadershipLevel === "founder" || a.leadershipLevel === "lead") && !a.evidence.trim());
  if (noEvidenceStrong) {
    priorities.push({ id: "evidence", title: `Document evidence for "${noEvidenceStrong.name}"`, impact: "Medium", impactScore: 2, why: "A strong activity without evidence is harder for admissions or scholarship reviewers to verify and weigh.", difficulty: "Low", timeframe: "Next few weeks" });
  }

  const allReach = analysis.perUniversity.length > 0 && analysis.perUniversity.every((r) => r.admissionStatus === "reach");
  if (allReach) {
    priorities.push({ id: "broaden-list", title: "Add at least one competitive or strong-fit option to your list", impact: "Medium", impactScore: 2, why: "Every university on your current shortlist is currently a reach — balancing it protects your outcome.", difficulty: "Low", timeframe: "Before you finalize applications" });
  }

  if (profile.goals.scholarshipPriority === "essential" && analysis.perUniversity.some((r) => r.scholarshipStatus === "reach")) {
    priorities.push({ id: "scholarship-focus", title: "Prioritize scholarship-specific requirements", impact: "Medium", impactScore: 2, why: "Since a scholarship is essential for you, treat scholarship essays and eligibility criteria as their own task — not an afterthought.", difficulty: "Medium", timeframe: "Alongside applications" });
  }

  priorities.sort((a, b) => b.impactScore - a.impactScore);
  return priorities.slice(0, 5);
}

function generatePersonalFeedback(profile, analysis) {
  const { dims, stillInDevelopment } = analysis;
  const dimEntries = [
    { key: "academic", label: "academic profile", score: dims.academic.score },
    { key: "testing", label: "testing", score: dims.testing.known ? dims.testing.score : null },
    { key: "activities", label: "extracurricular depth", score: dims.activities.score },
    { key: "leadership", label: "leadership", score: dims.leadership.score },
  ];
  const known = dimEntries.filter((d) => d.score != null);
  const strongest = known.reduce((a, b) => (b.score > a.score ? b : a));
  const weakest = known.reduce((a, b) => (b.score < a.score ? b : a));
  const paragraphs = [];

  const subjectNames = profile.aLevels.map((a) => a.subject);
  const fit = profile.aLevelStatus === "not_started" ? null : computeSubjectFit(profile.goals.intendedField, subjectNames);
  if (fit && fit.fit === "mismatch") {
    paragraphs.push(
      `Before anything else: your A-Level combination (${subjectNames.join(", ")}) doesn't include ${fit.missing.join(" or ")}, which is essentially required for ${profile.goals.intendedField}. This combination is typically not accepted for that program` +
      (fit.alternatives.length ? `, though it fits fields like ${fit.alternatives.join(" or ")} well.` : ".")
    );
  }

  paragraphs.push(`Your ${strongest.label} is currently one of your strongest assets` + (strongest.key === "academic" && stillInDevelopment ? ", even before your A-Level results are confirmed." : ".") + " If you're deciding where to spend the next few months, I wouldn't put more time into that area right now.");

  if (weakest.key === "activities") {
    const meaningful = dims.activities.meaningfulCount;
    const total = profile.activities.length;
    paragraphs.push(total === 0 ? "Your bigger gap right now is extracurricular depth — you haven't added any activities yet, and this is one of the most controllable parts of your profile." : `Your bigger weakness is depth. You have ${total} activit${total === 1 ? "y" : "ies"} listed, but only ${meaningful} currently show sustained ownership and a measurable outcome.`);
    const bestActivity = profile.activities.find((a) => a.leadershipLevel === "founder" || a.leadershipLevel === "lead");
    paragraphs.push(bestActivity ? `I'd recommend taking "${bestActivity.name}" further rather than adding new activities — a small number of real users, a documented result, or a competition outcome would make it significantly stronger.` : "Rather than collecting more certificates, pick one activity and push it toward a real, measurable outcome — that will read as far stronger than breadth alone.");
  } else if (weakest.key === "testing") {
    paragraphs.push(dims.testing.known ? "Your test scores are currently a bit behind where your shortlist typically sits." : "You haven't recorded a test score yet — that's currently the single biggest unknown in your profile, and it's worth resolving before anything else.");
  } else if (weakest.key === "leadership") {
    paragraphs.push("Your activities currently lean toward participation rather than ownership — seeking a leadership or founding role would do more for your profile than adding another activity.");
  } else if (weakest.key === "academic") {
    paragraphs.push(stillInDevelopment ? "Your A-Level results aren't locked in yet, so academic competitiveness is still very much in your hands — this is worth treating as a priority." : "Your academic average is currently a limiting factor across your shortlist.");
  }

  if (weakest.key !== "testing") {
    if (!dims.testing.known) paragraphs.push("A recorded test score would also help, but I'd prioritize the work above over treating testing as your only problem.");
    else if (dims.testing.score < 8) paragraphs.push("Raising your test score further would help, but I wouldn't treat it as the main lever right now.");
  }
  return paragraphs;
}

/* ============================== LANDING ============================== */

function HeroPreviewCard() {
  const score = useCountUp(8.1, 1300, true);
  const rows = [
    { name: "University of Waterloo", level: "strong" },
    { name: "University of Edinburgh", level: "competitive" },
    { name: "Drake University", level: "strong" },
  ];
  const ringDeg = (score / 10) * 360;
  return (
    <div style={glass({ padding: "28px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" })}>
      <div style={{ fontFamily: fontSans, fontSize: "13px", color: colors.inkSoft, marginBottom: "18px" }}>Your Reality Check</div>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "22px" }}>
        <div style={{ width: "84px", height: "84px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `conic-gradient(${colors.blue} ${ringDeg}deg, rgba(255,255,255,0.08) 0deg)`, flexShrink: 0 }}>
          <div style={{ width: "66px", height: "66px", borderRadius: "50%", background: "#11151b", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <span style={{ fontFamily: fontHead, fontSize: "20px", color: colors.ink, fontWeight: 600 }}>{score.toFixed(1)}</span>
            <span style={{ fontFamily: fontSans, fontSize: "9px", color: colors.inkSoft }}>/ 10</span>
          </div>
        </div>
        <div style={{ fontFamily: fontSans, fontSize: "13px", color: colors.inkSoft, lineHeight: 1.5 }}>Profile competitiveness —<br />not an admission probability.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {rows.map((r) => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${colors.border}`, borderRadius: "10px" }}>
            <span style={{ fontFamily: fontSans, fontSize: "13px", color: colors.ink }}>{r.name}</span>
            <StatusPill level={r.level} />
          </div>
        ))}
      </div>
    </div>
  );
}

const HOW_STEPS = [
  { n: "1", title: "Build your profile", body: "Grades, tests, and activities — entered the way admissions actually reads them, not a generic form." },
  { n: "2", title: "Choose your universities", body: "Search any university worldwide and shortlist the ones you're actually considering." },
  { n: "3", title: "Get your Reality Check", body: "See exactly where you stand for admission and scholarships — honestly, not optimistically." },
  { n: "4", title: "Improve strategically", body: "A short, ordered list of what to work on next, and why it actually moves the needle." },
];
const FEATURES = [
  { title: "Admission analysis", body: "Where you're strong, where you're a reach, and why — per university." },
  { title: "Scholarship analysis", body: "What you're eligible for, and what would make you more competitive for it." },
  { title: "Profile strengths", body: "The parts of your application that are already working in your favor." },
  { title: "Personalized recommendations", body: "Specific, ordered next steps — not generic advice everyone gets." },
  { title: "What-if simulator", body: "See how a stronger test score or activity would actually change your standing." },
  { title: "Global university search", body: "Search universities across the US, UK, Canada, China, Japan, and Europe." },
];

function Landing({ onStart }) {
  const howRef = useRef(null);
  const scrollToHow = () => howRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="rc-fade-in">
      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "24px 24px 0" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: fontHead, fontSize: "20px", fontWeight: 600, color: colors.ink }}>Reality Check</span>
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <button onClick={scrollToHow} style={{ background: "none", border: "none", color: colors.inkSoft, fontSize: "14px", cursor: "pointer", padding: 0 }}>How it works</button>
            <button onClick={onStart} className="rc-btn-primary" style={{ background: `linear-gradient(135deg, ${colors.blue}, ${colors.blueDark})`, color: "#fff", border: "none", borderRadius: "9px", padding: "10px 18px", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 18px rgba(76,141,255,0.35)" }}>Build My Profile</button>
          </div>
        </nav>
      </div>

      <div className="hero-grid" style={{ maxWidth: "1120px", margin: "0 auto", padding: "72px 24px 96px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "48px", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: fontHead, fontWeight: 600, fontSize: "44px", lineHeight: 1.15, margin: "0 0 20px", letterSpacing: "-0.01em", color: colors.ink }}>
            You don't need another chance calculator.
          </h1>
          <p style={{ fontSize: "16.5px", lineHeight: 1.65, color: colors.inkSoft, maxWidth: "480px", margin: "0 0 32px" }}>
            Reality Check reads your actual academic and extracurricular profile against the universities you're aiming for, and tells you honestly what's working, what isn't, and exactly what to do next.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button onClick={onStart} className="rc-btn-primary" style={{ background: `linear-gradient(135deg, ${colors.blue}, ${colors.blueDark})`, color: "#fff", border: "none", borderRadius: "10px", padding: "13px 22px", fontSize: "15px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 18px rgba(76,141,255,0.35)" }}>Build My Profile</button>
            <button onClick={scrollToHow} style={{ background: "none", border: "none", borderBottom: `1px solid ${colors.ink}`, color: colors.ink, fontSize: "15px", cursor: "pointer", padding: "4px 0" }}>See how it works</button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}><HeroPreviewCard /></div>
      </div>

      <div ref={howRef} style={{ maxWidth: "1120px", margin: "0 auto", padding: "0 24px 96px" }}>
        <h2 style={{ fontFamily: fontHead, fontWeight: 600, fontSize: "28px", margin: "0 0 40px", color: colors.ink }}>How it works</h2>
        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "28px" }}>
          {HOW_STEPS.map((s) => (
            <div key={s.n}>
              <div style={{ fontFamily: fontHead, fontSize: "22px", color: colors.blue, marginBottom: "10px" }}>{s.n}</div>
              <div style={{ fontSize: "15.5px", fontWeight: 600, marginBottom: "8px", color: colors.ink }}>{s.title}</div>
              <div style={{ fontSize: "14px", color: colors.inkSoft, lineHeight: 1.55 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "0 24px 100px" }}>
        <h2 style={{ fontFamily: fontHead, fontWeight: 600, fontSize: "28px", margin: "0 0 40px", color: colors.ink }}>What you actually get</h2>
        <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="rc-card-hover" style={{ ...glass({ padding: "22px" }), borderLeft: `3px solid ${colors.blue}` }}>
              <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: colors.ink }}>{f.title}</div>
              <div style={{ fontSize: "13.5px", color: colors.inkSoft, lineHeight: 1.55 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ borderTop: `1px solid ${colors.border}`, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "40px 24px 28px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "32px" }} className="rc-grid-2">
          <div>
            <span style={{ fontFamily: fontHead, fontSize: "17px", fontWeight: 600, color: colors.ink }}>Reality Check</span>
            <p style={{ fontSize: "13px", color: colors.inkSoft, lineHeight: 1.6, margin: "10px 0 0", maxWidth: "360px" }}>
              Know where you stand. Know what to do next. Every result here is an estimate, not a guarantee — a starting point for a conversation, not a verdict.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
            <button onClick={scrollToHow} style={{ background: "none", border: "none", color: colors.inkSoft, fontSize: "13px", cursor: "pointer", padding: 0 }}>How it works</button>
            <div style={{ ...glass({ padding: "10px 14px" }), display: "inline-flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "11px", color: colors.inkFaint, textTransform: "uppercase", letterSpacing: "0.04em" }}>Created & designed by</span>
              <span style={{ fontSize: "13.5px", fontWeight: 600, color: colors.blue }}>Haris Waheed</span>
              <span style={{ fontSize: "11.5px", color: colors.inkSoft }}>Innovation and Invention Society, BCP Sargodha</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${colors.border}`, textAlign: "center", padding: "14px 24px", fontSize: "11.5px", color: colors.inkFaint }}>
          © {new Date().getFullYear()} Reality Check — a student prototype, not a live product.
        </div>
      </footer>

    </div>
  );
}

/* ============================== ONBOARDING: ACADEMIC ============================== */

const ONBOARD_STEPS = ["Academic", "Tests", "Activities", "Goals", "Universities"];

function StepProgress({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "36px", flexWrap: "wrap" }}>
      {ONBOARD_STEPS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "upcoming";
        return (
          <React.Fragment key={label}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, fontFamily: fontSans, background: state === "upcoming" ? "rgba(255,255,255,0.06)" : colors.blue, color: state === "upcoming" ? colors.inkFaint : "#fff", transition: "background 0.3s ease" }}>
                {state === "done" ? "✓" : i + 1}
              </div>
              <span style={{ fontFamily: fontSans, fontSize: "13px", fontWeight: state === "active" ? 600 : 500, color: state === "upcoming" ? colors.inkFaint : colors.ink }}>{label}</span>
            </div>
            {i < ONBOARD_STEPS.length - 1 && <div style={{ width: "20px", height: "1px", background: colors.border }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StepShell({ title, subtitle, children }) {
  return (
    <div style={glass({ padding: "32px" })}>
      <h2 style={{ fontFamily: fontHead, fontWeight: 600, fontSize: "22px", margin: "0 0 6px", color: colors.ink }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "13.5px", color: colors.inkSoft, margin: "0 0 26px", lineHeight: 1.5 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function OLevelRow({ q, onChange, onRemove }) {
  return (
    <div className="rc-grid-2" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr auto", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
      <Select value={q.subject} onChange={(e) => onChange({ ...q, subject: e.target.value })} options={SUBJECT_LIST.map((s) => ({ value: s, label: s }))} />
      <Select value={q.status} onChange={(e) => onChange({ ...q, status: e.target.value, grade: e.target.value === "not_taken" ? "" : q.grade })} options={QUAL_STATUS_OPTIONS} />
      <Select value={q.grade} onChange={(e) => onChange({ ...q, grade: e.target.value })} options={[{ value: "", label: "Grade…" }, ...O_LEVEL_GRADES.map((g) => ({ value: g, label: g }))]} style={q.status === "not_taken" ? { opacity: 0.5, pointerEvents: "none" } : {}} />
      <SmallIconButton onClick={onRemove} title="Remove" />
    </div>
  );
}

function ALevelRow({ q, onChange, onRemove }) {
  return (
    <div style={{ border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "12px 14px", marginBottom: "10px" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
        <Select value={q.subject} onChange={(e) => onChange({ ...q, subject: e.target.value })} options={SUBJECT_LIST.map((s) => ({ value: s, label: s }))} style={{ flex: 1 }} />
        <SmallIconButton onClick={onRemove} title="Remove" />
      </div>
      <div className="rc-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <div style={{ fontSize: "11px", color: colors.inkFaint, marginBottom: "4px" }}>AS-Level</div>
          <div style={{ display: "flex", gap: "6px" }}>
            <Select value={q.asStatus} onChange={(e) => onChange({ ...q, asStatus: e.target.value, asGrade: e.target.value === "not_taken" ? "" : q.asGrade })} options={QUAL_STATUS_OPTIONS} style={{ flex: 1.3 }} />
            <Select value={q.asGrade} onChange={(e) => onChange({ ...q, asGrade: e.target.value })} options={[{ value: "", label: "Grade…" }, ...A_LEVEL_GRADES.map((g) => ({ value: g, label: g }))]} style={{ flex: 1, opacity: q.asStatus === "not_taken" ? 0.5 : 1, pointerEvents: q.asStatus === "not_taken" ? "none" : "auto" }} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: colors.inkFaint, marginBottom: "4px" }}>A2 (final)</div>
          <div style={{ display: "flex", gap: "6px" }}>
            <Select value={q.a2Status} onChange={(e) => onChange({ ...q, a2Status: e.target.value, a2Grade: e.target.value === "not_taken" ? "" : q.a2Grade })} options={QUAL_STATUS_OPTIONS} style={{ flex: 1.3 }} />
            <Select value={q.a2Grade} onChange={(e) => onChange({ ...q, a2Grade: e.target.value })} options={[{ value: "", label: "Grade…" }, ...A_LEVEL_GRADES.map((g) => ({ value: g, label: g }))]} style={{ flex: 1, opacity: q.a2Status === "not_taken" ? 0.5 : 1, pointerEvents: q.a2Status === "not_taken" ? "none" : "auto" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AcademicStep({ profile, setProfile }) {
  const updateO = (id, u) => setProfile((p) => ({ ...p, oLevels: p.oLevels.map((q) => (q.id === id ? u : q)) }));
  const removeO = (id) => setProfile((p) => ({ ...p, oLevels: p.oLevels.filter((q) => q.id !== id) }));
  const addO = () => setProfile((p) => (p.oLevels.length >= O_LEVEL_MAX ? p : { ...p, oLevels: [...p.oLevels, { id: uid(), subject: SUBJECT_LIST[0], grade: "", status: "completed" }] }));

  const updateA = (id, u) => setProfile((p) => ({ ...p, aLevels: p.aLevels.map((q) => (q.id === id ? u : q)) }));
  const removeA = (id) => setProfile((p) => ({ ...p, aLevels: p.aLevels.filter((q) => q.id !== id) }));
  const addA = () => setProfile((p) => (p.aLevels.length >= A_LEVEL_MAX ? p : { ...p, aLevels: [...p.aLevels, { id: uid(), subject: SUBJECT_LIST[0], asGrade: "", asStatus: "predicted", a2Grade: "", a2Status: "not_taken" }] }));

  const oCount = profile.oLevels.length;
  const aCount = profile.aLevels.length;
  const oOk = oCount >= O_LEVEL_MIN && oCount <= O_LEVEL_MAX;
  const aNotStarted = profile.aLevelStatus === "not_started";
  const aOk = aNotStarted || (aCount >= A_LEVEL_MIN && aCount <= A_LEVEL_MAX);

  return (
    <StepShell title="Academic profile" subtitle="Subjects are drawn from the common Cambridge / Edexcel / AQA specifications. AS and A2 are tracked separately.">
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: colors.ink }}>O-Level / IGCSE / Matric</span>
          <span style={{ fontSize: "12px", color: oOk ? colors.green : colors.inkFaint }}>{oCount} of {O_LEVEL_MIN}–{O_LEVEL_MAX} subjects</span>
        </div>
        {profile.oLevels.map((q) => <OLevelRow key={q.id} q={q} onChange={(u) => updateO(q.id, u)} onRemove={() => removeO(q.id)} />)}
        <button onClick={addO} disabled={oCount >= O_LEVEL_MAX} style={{ background: "none", border: "none", color: oCount >= O_LEVEL_MAX ? colors.inkFaint : colors.blue, fontFamily: fontSans, fontSize: "13.5px", fontWeight: 600, cursor: oCount >= O_LEVEL_MAX ? "not-allowed" : "pointer", padding: "6px 0" }}>+ Add subject</button>
        {!oOk && <p style={{ fontSize: "12px", color: colors.brick, margin: "4px 0 0" }}>Select at least {O_LEVEL_MIN} O-Level subjects (up to {O_LEVEL_MAX}) to continue.</p>}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: colors.ink }}>A-Level (AS + A2)</span>
          {!aNotStarted && <span style={{ fontSize: "12px", color: aOk ? colors.green : colors.inkFaint }}>{aCount} of {A_LEVEL_MIN}–{A_LEVEL_MAX} subjects</span>}
        </div>
        <div style={{ marginBottom: "14px" }}>
          <SegmentedControl
            value={profile.aLevelStatus}
            onChange={(v) => setProfile((p) => ({ ...p, aLevelStatus: v }))}
            options={[{ value: "in_progress", label: "Choosing / studying A-Levels" }, { value: "not_started", label: "Haven't started yet" }]}
          />
        </div>
        {aNotStarted ? (
          <div style={{ border: `1px dashed ${colors.border}`, borderRadius: "10px", padding: "16px", fontSize: "13px", color: colors.inkSoft, lineHeight: 1.55 }}>
            No problem — once you've set your intended field and target universities, Reality Check will build you a two-year roadmap instead of a grade-based score.
          </div>
        ) : (
          <>
            {profile.aLevels.map((q) => <ALevelRow key={q.id} q={q} onChange={(u) => updateA(q.id, u)} onRemove={() => removeA(q.id)} />)}
            <button onClick={addA} disabled={aCount >= A_LEVEL_MAX} style={{ background: "none", border: "none", color: aCount >= A_LEVEL_MAX ? colors.inkFaint : colors.blue, fontFamily: fontSans, fontSize: "13.5px", fontWeight: 600, cursor: aCount >= A_LEVEL_MAX ? "not-allowed" : "pointer", padding: "6px 0" }}>+ Add subject</button>
            {!aOk && <p style={{ fontSize: "12px", color: colors.brick, margin: "4px 0 0" }}>Select at least {A_LEVEL_MIN} A-Level subjects (up to {A_LEVEL_MAX}), or mark A-Levels as not started.</p>}
          </>
        )}
      </div>
    </StepShell>
  );
}

/* ============================== ONBOARDING: TESTS ============================== */

function TestFieldInput({ field, value, onChange }) {
  const num = value === "" ? null : Number(value);
  const invalid = value !== "" && (isNaN(num) || num < field.min || num > field.max);
  return (
    <Field label={field.label} error={invalid ? `Must be between ${field.min} and ${field.max}` : null}>
      <TextInput type="number" step={field.step} value={value} error={invalid} onChange={(e) => onChange(e.target.value)} placeholder={`${field.min}–${field.max}`} />
    </Field>
  );
}

function TestCard({ test, onChange, onRemove }) {
  const def = TEST_DEFS[test.type];
  const setStatus = (status) => onChange({ ...test, status });
  const setValue = (key, v) => onChange({ ...test, values: { ...test.values, [key]: v } });
  return (
    <div style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "20px", marginBottom: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: test.status === "available" ? "16px" : 0, flexWrap: "wrap", gap: "10px" }}>
        <span style={{ fontFamily: fontSans, fontSize: "15px", fontWeight: 600, color: colors.ink }}>{def.label}</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <SegmentedControl value={test.status} onChange={setStatus} options={TEST_STATUS_OPTIONS} />
          <SmallIconButton onClick={onRemove} title="Remove test" />
        </div>
      </div>
      {test.status === "available" && (
        <div className="rc-grid-5" style={{ display: "grid", gridTemplateColumns: `repeat(${def.fields.length}, 1fr)`, gap: "12px" }}>
          {def.fields.map((f) => <TestFieldInput key={f.key} field={f} value={test.values[f.key] ?? ""} onChange={(v) => setValue(f.key, v)} />)}
        </div>
      )}
    </div>
  );
}

function TestsStep({ profile, setProfile }) {
  const [adding, setAdding] = useState(false);
  const updateTest = (id, u) => setProfile((p) => ({ ...p, tests: p.tests.map((t) => (t.id === id ? u : t)) }));
  const removeTest = (id) => setProfile((p) => ({ ...p, tests: p.tests.filter((t) => t.id !== id) }));
  const addTest = (type) => {
    setProfile((p) => ({ ...p, tests: [...p.tests, { id: uid(), type, status: "not_taken", values: {} }] }));
    setAdding(false);
  };
  const availableTypes = TEST_TYPES.filter((t) => !profile.tests.some((existing) => existing.type === t));

  return (
    <StepShell title="Standardized tests" subtitle="Add every test you've taken, planned, or are considering — SAT/ACT for general admission, IELTS/TOEFL for English, or MCAT/GRE/GMAT for specific programs. If you haven't taken one yet, mark it planned or not taken.">
      {profile.tests.map((t) => <TestCard key={t.id} test={t} onChange={(u) => updateTest(t.id, u)} onRemove={() => removeTest(t.id)} />)}

      {profile.tests.length === 0 && !adding && <p style={{ fontSize: "13px", color: colors.inkFaint, marginBottom: "14px" }}>No tests added yet.</p>}

      {adding ? (
        <div style={{ border: `1px dashed ${colors.border}`, borderRadius: "10px", padding: "14px" }}>
          <div style={{ fontSize: "12.5px", color: colors.inkSoft, marginBottom: "10px" }}>Choose a test to add:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {availableTypes.map((t) => (
              <button key={t} onClick={() => addTest(t)} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${colors.border}`, color: colors.ink, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontFamily: fontSans, cursor: "pointer" }}>
                {TEST_DEFS[t].label}
              </button>
            ))}
          </div>
          <button onClick={() => setAdding(false)} style={{ background: "none", border: "none", color: colors.inkFaint, fontSize: "12.5px", cursor: "pointer", marginTop: "10px", padding: 0 }}>Cancel</button>
        </div>
      ) : (
        availableTypes.length > 0 && (
          <button onClick={() => setAdding(true)} style={{ background: "none", border: `1px dashed ${colors.border}`, borderRadius: "10px", padding: "14px", width: "100%", color: colors.blue, fontFamily: fontSans, fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
            + Add a test
          </button>
        )
      )}
    </StepShell>
  );
}

/* ============================== ONBOARDING: ACTIVITIES ============================== */

const ACTIVITY_CATEGORIES = ["Research", "Technology", "Leadership", "Competition", "Volunteering", "Sports", "Arts", "Entrepreneurship", "Community", "Other"];
const LEADERSHIP_LEVELS = [
  { value: "participant", label: "Participant" }, { value: "member", label: "Active member" },
  { value: "lead", label: "Leadership role" }, { value: "founder", label: "Founder / initiator" },
];
const emptyActivity = () => ({ id: uid(), name: "", category: "Technology", role: "", duration: "", hoursPerWeek: "", outcome: "", evidence: "", leadershipLevel: "participant" });

function ActivityEditor({ activity, onChange, onCancel, onSave }) {
  const set = (patch) => onChange({ ...activity, ...patch });
  return (
    <div style={{ border: `1px solid ${colors.blue}55`, background: colors.blueSoft, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
      <div className="rc-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <Field label="Activity name"><TextInput placeholder="Machine Learning Project" value={activity.name} maxLength={100} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="Category"><Select value={activity.category} onChange={(e) => set({ category: e.target.value })} options={ACTIVITY_CATEGORIES.map((c) => ({ value: c, label: c }))} /></Field>
        <Field label="Role"><TextInput placeholder="Founder / Developer" value={activity.role} maxLength={80} onChange={(e) => set({ role: e.target.value })} /></Field>
        <Field label="Leadership level"><Select value={activity.leadershipLevel} onChange={(e) => set({ leadershipLevel: e.target.value })} options={LEADERSHIP_LEVELS} /></Field>
        <Field label="Duration"><TextInput placeholder="8 months" value={activity.duration} onChange={(e) => set({ duration: e.target.value })} /></Field>
        <Field label="Hours per week"><TextInput type="number" placeholder="6" value={activity.hoursPerWeek} onChange={(e) => set({ hoursPerWeek: e.target.value })} /></Field>
      </div>
      <Field label="Achievement / measurable outcome" hint="Be specific — this is what separates participation from impact.">
        <textarea value={activity.outcome} onChange={(e) => set({ outcome: e.target.value })} placeholder="Developed a fake-news detection system used by 120 students." rows={2} maxLength={300} style={{ ...inputBase, resize: "vertical" }} />
      </Field>
      <Field label="Evidence (optional)" hint="A link, certificate, or contact who can verify this.">
        <TextInput placeholder="github.com/... or certificate reference" value={activity.evidence} maxLength={150} onChange={(e) => set({ evidence: e.target.value })} />
      </Field>
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <PrimaryButton onClick={onSave} disabled={!activity.name.trim()}>Save activity</PrimaryButton>
        <GhostButton onClick={onCancel}>Cancel</GhostButton>
      </div>
    </div>
  );
}

function ActivityCard({ activity, onEdit, onRemove }) {
  return (
    <div className="rc-card-hover" style={{ border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "16px 18px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <span style={{ fontFamily: fontSans, fontWeight: 600, fontSize: "14.5px", color: colors.ink }}>{activity.name}</span>
          <span style={{ fontSize: "11.5px", fontWeight: 600, color: colors.amber, background: colors.amberSoft, borderRadius: "999px", padding: "2px 9px" }}>{activity.category}</span>
        </div>
        <div style={{ fontSize: "13px", color: colors.inkSoft, marginBottom: "4px" }}>
          {activity.role || "Role not specified"} · {activity.duration || "duration n/a"}{activity.hoursPerWeek ? ` · ${activity.hoursPerWeek} hrs/wk` : ""}
        </div>
        {activity.outcome && <div style={{ fontSize: "13px", color: colors.ink, lineHeight: 1.5 }}>{activity.outcome}</div>}
      </div>
      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <button onClick={onEdit} style={{ background: "none", border: `1px solid ${colors.border}`, borderRadius: "7px", padding: "5px 10px", fontSize: "12.5px", fontFamily: fontSans, cursor: "pointer", color: colors.inkSoft }}>Edit</button>
        <SmallIconButton onClick={onRemove} title="Remove" />
      </div>
    </div>
  );
}

function ActivitiesStep({ profile, setProfile }) {
  const [draft, setDraft] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const startNew = () => { const a = emptyActivity(); setDraft(a); setEditingId(a.id); };
  const startEdit = (activity) => { setDraft({ ...activity }); setEditingId(activity.id); };
  const cancelEdit = () => { setDraft(null); setEditingId(null); };
  const saveDraft = () => {
    setProfile((p) => {
      const exists = p.activities.some((a) => a.id === draft.id);
      return { ...p, activities: exists ? p.activities.map((a) => (a.id === draft.id ? draft : a)) : [...p.activities, draft] };
    });
    setDraft(null); setEditingId(null);
  };
  const removeActivity = (id) => setProfile((p) => ({ ...p, activities: p.activities.filter((a) => a.id !== id) }));

  return (
    <StepShell title="Extracurricular profile" subtitle="Add each activity as its own entry — this lets Reality Check tell the difference between participation and real, measurable impact.">
      {profile.activities.filter((a) => a.id !== editingId).map((a) => <ActivityCard key={a.id} activity={a} onEdit={() => startEdit(a)} onRemove={() => removeActivity(a.id)} />)}
      {draft && <ActivityEditor activity={draft} onChange={setDraft} onCancel={cancelEdit} onSave={saveDraft} />}
      {!draft && (
        <button onClick={startNew} style={{ background: "none", border: `1px dashed ${colors.border}`, borderRadius: "10px", padding: "14px", width: "100%", color: colors.blue, fontFamily: fontSans, fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>+ Add an activity</button>
      )}
      {profile.activities.length === 0 && !draft && <p style={{ fontSize: "13px", color: colors.inkFaint, marginTop: "10px" }}>No activities added yet.</p>}
    </StepShell>
  );
}

/* ============================== ONBOARDING: GOALS ============================== */

function GoalsStep({ profile, setProfile }) {
  const g = profile.goals;
  const set = (patch) => setProfile((p) => ({ ...p, goals: { ...p.goals, ...patch } }));
  const subjectNames = profile.aLevels.map((a) => a.subject);
  const fit = profile.aLevelStatus === "not_started" ? null : computeSubjectFit(g.intendedField, subjectNames);

  return (
    <StepShell title="Your goals" subtitle="This helps Reality Check weigh recommendations toward what actually matters to you.">
      <Field label="Intended field of study"><TextInput placeholder="Computer Science" value={g.intendedField} maxLength={60} onChange={(e) => set({ intendedField: e.target.value })} /></Field>

      {fit && fit.fit === "mismatch" && (
        <div style={{ background: "rgba(255,107,107,0.1)", border: `1px solid ${colors.brick}55`, borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
          <p style={{ fontSize: "13.5px", color: colors.ink, lineHeight: 1.55, margin: "0 0 6px" }}>
            Your current A-Level combination ({subjectNames.join(", ")}) doesn't include {fit.missing.join(" or ")}, which is essentially required for {g.intendedField} admissions at most universities — this combination is typically not accepted for that program.
          </p>
          {fit.alternatives.length > 0 && (
            <p style={{ fontSize: "13px", color: colors.inkSoft, lineHeight: 1.5, margin: 0 }}>
              As-is, your subjects fit fields like {fit.alternatives.join(" or ")} better. If {g.intendedField} is the goal, consider swapping in {fit.missing.join(" or ")} before locking in your subjects.
            </p>
          )}
        </div>
      )}

      <Field label="Target countries" hint="Separate multiple with commas."><TextInput placeholder="Canada, UK, USA" value={g.targetCountries} maxLength={100} onChange={(e) => set({ targetCountries: e.target.value })} /></Field>
      <Field label="Is a scholarship a priority?">
        <SegmentedControl value={g.scholarshipPriority} onChange={(v) => set({ scholarshipPriority: v })} options={[{ value: "essential", label: "Essential" }, { value: "important", label: "Important" }, { value: "flexible", label: "Flexible" }]} />
      </Field>
      <Field label="Anything else Reality Check should know?">
        <textarea value={g.notes} onChange={(e) => set({ notes: e.target.value })} rows={3} placeholder="Optional" maxLength={500} style={{ ...inputBase, resize: "vertical" }} />
      </Field>
    </StepShell>
  );
}

/* ============================== ONBOARDING: UNIVERSITY SEARCH ============================== */

function UniversityDetailPanel({ uni }) {
  const t = TIER_TEXT[uni.tier];
  return (
    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${colors.border}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="rc-grid-2">
      <div>
        <div style={{ fontSize: "11.5px", fontWeight: 600, color: colors.inkFaint, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "6px" }}>Admissions</div>
        <div style={{ fontSize: "13px", color: colors.ink, lineHeight: 1.6 }}>{t.academic}<br />{t.test}<br />{t.english}</div>
      </div>
      <div>
        <div style={{ fontSize: "11.5px", fontWeight: 600, color: colors.inkFaint, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "6px" }}>Cost & scholarships</div>
        <div style={{ fontSize: "13px", color: colors.ink, lineHeight: 1.6, marginBottom: "8px" }}>{TUITION_RANGE[uni.country] || TUITION_RANGE.Other} (tuition)</div>
        <div style={{ fontSize: "13px", color: colors.inkSoft, lineHeight: 1.6 }}>{SCHOLARSHIP_TEXT[uni.tier]}</div>
      </div>
      <div style={{ gridColumn: "1 / -1", fontSize: "11px", color: colors.inkFaint }}>
        {uni.estimated ? "Auto-generated placeholder for this prototype — this university isn't in our reference set, so figures are indicative only. Verify on the official site." : "Indicative reference data for this prototype, not official figures — verify current requirements on the university's official site."}
      </div>
    </div>
  );
}

function UniversityRow({ uni, selected, onToggle, expanded, onToggleExpand }) {
  return (
    <div className="rc-card-hover" style={{ border: `1px solid ${selected ? colors.blue : colors.border}`, borderRadius: "12px", padding: "16px 18px", marginBottom: "10px", background: selected ? colors.blueSoft : "rgba(255,255,255,0.02)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div>
          <div style={{ fontFamily: fontSans, fontWeight: 600, fontSize: "15px", color: colors.ink, marginBottom: "3px" }}>
            {uni.name} {uni.estimated && <span style={{ fontSize: "10.5px", fontWeight: 600, color: colors.amber, background: colors.amberSoft, borderRadius: "999px", padding: "2px 8px", marginLeft: "6px" }}>Estimated</span>}
          </div>
          <div style={{ fontSize: "12.5px", color: colors.inkSoft }}>{uni.country}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end", flexShrink: 0 }}>
          <button onClick={onToggle} style={{ background: selected ? colors.blue : "none", color: selected ? "#fff" : colors.blue, border: `1px solid ${colors.blue}`, borderRadius: "8px", padding: "6px 14px", fontSize: "12.5px", fontWeight: 600, fontFamily: fontSans, cursor: "pointer", whiteSpace: "nowrap" }}>
            {selected ? "✓ Added" : "+ Add to list"}
          </button>
          <button onClick={onToggleExpand} style={{ background: "none", border: "none", color: colors.inkFaint, fontSize: "12px", cursor: "pointer", padding: 0 }}>{expanded ? "Hide details" : "View details"}</button>
        </div>
      </div>
      {expanded && <UniversityDetailPanel uni={uni} />}
    </div>
  );
}

function CompareTable({ universities }) {
  const rows = [
    { label: "Country", get: (u) => u.country },
    { label: "Academic requirement", get: (u) => TIER_TEXT[u.tier].academic },
    { label: "English requirement", get: (u) => TIER_TEXT[u.tier].english },
    { label: "Tuition (est.)", get: (u) => TUITION_RANGE[u.country] || TUITION_RANGE.Other },
    { label: "Scholarship outlook", get: (u) => SCHOLARSHIP_TEXT[u.tier] },
  ];
  return (
    <div style={{ overflowX: "auto", border: `1px solid ${colors.border}`, borderRadius: "12px", marginBottom: "20px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", fontFamily: fontSans }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${colors.border}`, fontSize: "11.5px", color: colors.inkFaint, textTransform: "uppercase" }}> </th>
            {universities.map((u) => (
              <th key={u.id} style={{ textAlign: "left", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${colors.border}`, fontWeight: 600, whiteSpace: "nowrap", color: colors.ink }}>{u.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td style={{ padding: "10px 14px", color: colors.inkFaint, fontSize: "12px", fontWeight: 600, borderBottom: `1px solid ${colors.border}`, whiteSpace: "nowrap" }}>{r.label}</td>
              {universities.map((u) => <td key={u.id} style={{ padding: "10px 14px", borderBottom: `1px solid ${colors.border}`, color: colors.ink, maxWidth: "220px" }}>{r.get(u)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const MAX_UNIVERSITIES = 8;

function UniversitySelectionStep({ selectedIds, setSelectedIds, customUniversities, setCustomUniversities }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [addCountry, setAddCountry] = useState(CUSTOM_COUNTRIES[0]);

  const allUniversities = useMemo(() => [...UNIVERSITY_DIRECTORY, ...customUniversities], [customUniversities]);
  const q = query.trim().toLowerCase();
  const suggestions = q.length >= 1 ? allUniversities.filter((u) => u.name.toLowerCase().includes(q)).slice(0, 8) : [];
  const exactMatch = q.length > 0 && allUniversities.some((u) => u.name.toLowerCase() === q);
  const canOfferCustom = q.length >= 3 && !exactMatch;
  const atMax = selectedIds.length >= MAX_UNIVERSITIES;

  const toggle = (id) => setSelectedIds((ids) => {
    if (ids.includes(id)) return ids.filter((i) => i !== id);
    if (ids.length >= MAX_UNIVERSITIES) return ids;
    return [...ids, id];
  });
  const selectedUnis = allUniversities.filter((u) => selectedIds.includes(u.id));

  const addCustom = () => {
    if (atMax) return;
    const record = makeUniversityRecord(query.trim(), addCountry, true);
    setCustomUniversities((c) => [...c, record]);
    setSelectedIds((ids) => [...ids, record.id]);
    setQuery("");
  };

  return (
    <StepShell title="Select your universities" subtitle="Search any university worldwide — US, UK, Canada, China, Japan, or Europe. If it's not in our reference set, we'll build an estimated profile for it on the fly.">
      <div style={{ position: "relative", marginBottom: "16px", zIndex: 30 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: colors.inkFaint, fontSize: "14px" }}>⌕</span>
          <TextInput placeholder="Search universities worldwide…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: "36px" }} />
        </div>
        {query.trim().length > 0 && (
          <div style={{ background: "#12161c", border: `1px solid ${colors.borderStrong}`, borderRadius: "14px", padding: "6px", boxShadow: "0 16px 40px rgba(0,0,0,0.55)", position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 30, maxHeight: "320px", overflowY: "auto" }}>
            {atMax && (
              <div style={{ padding: "10px 12px", fontSize: "12.5px", color: colors.amber }}>
                You've reached the {MAX_UNIVERSITIES}-university limit — remove one below to add another.
              </div>
            )}
            {suggestions.map((u) => (
              <button key={u.id} onClick={() => toggle(u.id)} disabled={atMax && !selectedIds.includes(u.id)} style={{ display: "flex", justifyContent: "space-between", width: "100%", textAlign: "left", background: "none", border: "none", padding: "10px 12px", borderRadius: "8px", cursor: atMax && !selectedIds.includes(u.id) ? "not-allowed" : "pointer", color: atMax && !selectedIds.includes(u.id) ? colors.inkFaint : colors.ink, fontFamily: fontSans, fontSize: "13.5px" }} onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = "rgba(255,255,255,0.06)")} onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                <span>{u.name}</span>
                <span style={{ color: colors.inkFaint, fontSize: "12px" }}>{u.country}{selectedIds.includes(u.id) ? " · Added" : ""}</span>
              </button>
            ))}
            {suggestions.length === 0 && !canOfferCustom && <div style={{ padding: "10px 12px", fontSize: "13px", color: colors.inkFaint }}>No matches — try a shorter search.</div>}
            {canOfferCustom && !atMax && (
              <div style={{ borderTop: suggestions.length ? `1px solid ${colors.border}` : "none", marginTop: suggestions.length ? "6px" : 0, padding: "10px 12px" }}>
                <div style={{ fontSize: "12.5px", color: colors.inkSoft, marginBottom: "8px" }}>Not in our reference set — add "{query.trim()}" as a custom university:</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Select value={addCountry} onChange={(e) => setAddCountry(e.target.value)} options={CUSTOM_COUNTRIES.map((c) => ({ value: c, label: c }))} style={{ flex: 1 }} />
                  <PrimaryButton onClick={addCustom}>Add</PrimaryButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedUnis.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", marginBottom: "18px", padding: "12px 14px", background: colors.blueSoft, borderRadius: "10px" }}>
          <span style={{ fontSize: "12.5px", fontWeight: 600, color: colors.blue, marginRight: "4px" }}>{selectedUnis.length} of {MAX_UNIVERSITIES} selected:</span>
          {selectedUnis.map((u) => (
            <span key={u.id} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.06)", border: `1px solid ${colors.border}`, borderRadius: "999px", padding: "4px 6px 4px 12px", fontSize: "12.5px", color: colors.ink }}>
              {u.name}
              <button onClick={() => toggle(u.id)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.inkFaint, fontSize: "13px", padding: "0 4px" }}>×</button>
            </span>
          ))}
          {selectedUnis.length >= 2 && (
            <button onClick={() => setCompareOpen((v) => !v)} style={{ marginLeft: "auto", background: "none", border: `1px solid ${colors.blue}`, color: colors.blue, borderRadius: "8px", padding: "6px 12px", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}>
              {compareOpen ? "Hide comparison" : "Compare selected"}
            </button>
          )}
        </div>
      )}

      {compareOpen && selectedUnis.length >= 2 && <CompareTable universities={selectedUnis} />}

      {selectedUnis.length === 0 && <p style={{ fontSize: "13px", color: colors.inkFaint }}>Search above to add universities to your shortlist.</p>}
      {selectedUnis.map((u) => (
        <UniversityRow key={u.id} uni={u} selected={true} onToggle={() => toggle(u.id)} expanded={expandedId === u.id} onToggleExpand={() => setExpandedId(expandedId === u.id ? null : u.id)} />
      ))}
    </StepShell>
  );
}

/* ============================== ONBOARDING WRAPPER ============================== */

const initialProfile = {
  oLevels: [
    { id: uid(), subject: "Mathematics", grade: "A*", status: "completed" },
    { id: uid(), subject: "Computer Science", grade: "A*", status: "completed" },
  ],
  aLevels: [],
  aLevelStatus: "in_progress",
  tests: [],
  activities: [],
  goals: { intendedField: "", targetCountries: "", scholarshipPriority: "important", notes: "" },
};

function Onboarding({ profile, setProfile, selectedUniversityIds, setSelectedUniversityIds, customUniversities, setCustomUniversities, onExit, onFinish }) {
  const [step, setStep] = useState(0);
  const isLast = step === ONBOARD_STEPS.length - 1;
  const next = () => (isLast ? onFinish() : setStep(step + 1));
  const back = () => (step === 0 ? onExit() : setStep(step - 1));

  const blocked = (step === 0 && !academicRequirementsMet(profile)) || (isLast && selectedUniversityIds.length === 0);

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px 96px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <span style={{ fontFamily: fontHead, fontSize: "18px", fontWeight: 600, color: colors.ink }}>Reality Check</span>
        <button onClick={onExit} style={{ background: "none", border: "none", color: colors.inkFaint, fontSize: "13px", cursor: "pointer" }}>Save & exit</button>
      </div>
      <StepProgress current={step} />
      <div key={step} className="rc-fade-in">
        {step === 0 && <AcademicStep profile={profile} setProfile={setProfile} />}
        {step === 1 && <TestsStep profile={profile} setProfile={setProfile} />}
        {step === 2 && <ActivitiesStep profile={profile} setProfile={setProfile} />}
        {step === 3 && <GoalsStep profile={profile} setProfile={setProfile} />}
        {step === 4 && <UniversitySelectionStep selectedIds={selectedUniversityIds} setSelectedIds={setSelectedUniversityIds} customUniversities={customUniversities} setCustomUniversities={setCustomUniversities} />}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", gap: "16px" }}>
        <GhostButton onClick={back}>{step === 0 ? "Back to landing" : "Back"}</GhostButton>
        {step === 0 && !academicRequirementsMet(profile) && (
          <span style={{ fontSize: "12px", color: colors.inkFaint, textAlign: "right", flex: 1 }}>Meet the subject-count requirements above to continue.</span>
        )}
        <PrimaryButton onClick={next} disabled={blocked}>{isLast ? "Run My Reality Check" : "Continue"}</PrimaryButton>
      </div>
    </div>
  );
}

/* ============================== ANALYZING SCREEN ============================== */

const ANALYSIS_CHECKLIST = ["Academic profile", "Test scores", "Extracurriculars", "University requirements", "Scholarship competitiveness", "Profile gaps"];

function AnalyzingScreen({ onDone }) {
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    if (visibleCount >= ANALYSIS_CHECKLIST.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisibleCount((c) => c + 1), 380);
    return () => clearTimeout(t);
  }, [visibleCount, onDone]);

  return (
    <div style={{ maxWidth: "420px", margin: "0 auto", padding: "140px 24px", textAlign: "center" }}>
      <h2 style={{ fontFamily: fontHead, fontSize: "22px", marginBottom: "28px", color: colors.ink }}>Analyzing your profile…</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
        {ANALYSIS_CHECKLIST.map((item, i) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", opacity: i < visibleCount ? 1 : 0.25, transition: "opacity 0.3s" }}>
            <span style={{ color: colors.blue, fontWeight: 700, width: "16px" }}>{i < visibleCount ? "✓" : ""}</span>
            <span style={{ fontFamily: fontSans, fontSize: "14px", color: colors.ink }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== DASHBOARD ============================== */

function DimensionBar({ label, score }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);
  const width = mounted ? score : 0;
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "5px" }}>
        <span style={{ fontFamily: fontSans, fontWeight: 600, color: colors.ink }}>{label}</span>
        <span style={{ fontFamily: fontSans, color: colors.inkSoft }}>{score.toFixed(1)} / 10</span>
      </div>
      <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(width / 10) * 100}%`, background: `linear-gradient(90deg, ${colors.blue}, ${colors.blueDark})`, borderRadius: "999px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function scoreTier(score) {
  if (score >= 7.5) return { color: colors.green, label: "Strong overall position" };
  if (score >= 5.5) return { color: colors.amber, label: "Competitive overall position" };
  return { color: colors.brick, label: "Developing overall position" };
}

function OverallScoreCard({ overallScore, dims }) {
  const score = useCountUp(overallScore, 1000, true);
  const tier = scoreTier(overallScore);
  const ringDeg = (score / 10) * 360;
  return (
    <div className="rc-score-card" style={{ ...glass({ padding: "28px" }), display: "grid", gridTemplateColumns: "auto 1fr", gap: "32px", alignItems: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 12% 20%, ${tier.color}22, transparent 55%)`, pointerEvents: "none" }} />
      <div style={{ textAlign: "center", position: "relative" }}>
        <div style={{ width: "104px", height: "104px", borderRadius: "50%", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", background: `conic-gradient(${tier.color} ${ringDeg}deg, rgba(255,255,255,0.08) 0deg)` }}>
          <div style={{ width: "84px", height: "84px", borderRadius: "50%", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <div style={{ fontFamily: fontHead, fontSize: "34px", fontWeight: 700, color: tier.color, lineHeight: 1 }}>{score.toFixed(1)}</div>
            <div style={{ fontSize: "10.5px", color: colors.inkSoft }}>/ 10</div>
          </div>
        </div>
        <div style={{ fontSize: "12.5px", fontWeight: 600, color: tier.color, marginBottom: "6px" }}>{tier.label}</div>
        <div style={{ fontSize: "11px", color: colors.inkFaint, maxWidth: "150px", lineHeight: 1.4, margin: "0 auto" }}>Profile competitiveness indicator — not an admission probability.</div>
      </div>
      <div style={{ position: "relative" }}>
        <DimensionBar label="Academic" score={dims.academic.score} />
        <DimensionBar label="Testing" score={dims.testing.score} />
        <DimensionBar label="Extracurricular activity" score={dims.activities.score} />
        <DimensionBar label="Leadership" score={dims.leadership.score} />
      </div>
    </div>
  );
}

function DevelopmentBanner() {
  const influenceable = ["A-Level grades", "SAT / ACT / IELTS / TOEFL", "Leadership roles", "Projects", "Competitions", "Volunteering"];
  return (
    <div style={{ background: colors.amberSoft, border: `1px solid ${colors.amber}55`, borderRadius: "12px", padding: "18px 22px", marginBottom: "24px" }}>
      <div style={{ fontFamily: fontSans, fontWeight: 600, fontSize: "14px", marginBottom: "6px", color: colors.ink }}>Your profile is still in development.</div>
      <p style={{ fontSize: "13px", color: colors.inkSoft, margin: "0 0 10px", lineHeight: 1.55 }}>Your AS/A2 results aren't available yet, so academic competitiveness is partly based on your O-Level/Matric performance and predicted trajectory.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {influenceable.map((i) => <span key={i} style={{ fontSize: "11.5px", fontWeight: 600, color: colors.blue, background: "rgba(255,255,255,0.05)", border: `1px solid ${colors.border}`, borderRadius: "999px", padding: "3px 10px" }}>{i}</span>)}
      </div>
    </div>
  );
}

function TwoYearRoadmap({ plan }) {
  return (
    <div style={{ ...glass({ padding: "26px 28px" }), marginBottom: "28px" }}>
      <div style={{ fontFamily: fontHead, fontSize: "18px", fontWeight: 600, marginBottom: "6px", color: colors.ink }}>Your Two-Year Roadmap</div>
      <p style={{ fontSize: "13px", color: colors.inkSoft, margin: "0 0 18px", lineHeight: 1.5 }}>
        You haven't started A-Levels yet, so there's no grade-based score to show — instead, here's how to use the next two years.
      </p>
      {plan.map((phase) => (
        <div key={phase.phase} style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "13.5px", fontWeight: 600, color: colors.blue, marginBottom: "6px" }}>{phase.phase}</div>
          {phase.items.map((item, i) => <p key={i} style={{ fontSize: "13.5px", color: colors.ink, lineHeight: 1.55, margin: "0 0 6px" }}>{item}</p>)}
        </div>
      ))}
    </div>
  );
}

function UniversityResultCard({ uni, result, expanded, onToggle }) {
  const accent = { strong: colors.green, competitive: colors.amber, reach: colors.brick }[result.admissionStatus];
  return (
    <div className="rc-card-hover" style={{ ...glass({ padding: "18px 20px" }), marginBottom: "10px", borderLeft: `3px solid ${accent}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={onToggle}>
        <div>
          <div style={{ fontFamily: fontSans, fontWeight: 600, fontSize: "15px", color: colors.ink }}>{uni.name}</div>
          <div style={{ fontSize: "12px", color: colors.inkSoft }}>{uni.country}</div>
        </div>
        <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: "10.5px", color: colors.inkFaint, marginBottom: "3px" }}>Admission</div><StatusPill level={result.admissionStatus} /></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: "10.5px", color: colors.inkFaint, marginBottom: "3px" }}>Scholarship</div><StatusPill level={result.scholarshipStatus} label={result.scholarshipStatus === "reach" ? "Highly competitive" : undefined} /></div>
          <span style={{ color: colors.inkFaint, fontSize: "13px" }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: "18px", paddingTop: "18px", borderTop: `1px solid ${colors.border}` }}>
          <div className="rc-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: "18px" }}>
            <DimensionBar label="Academic" score={result.dims.academic.score} />
            <DimensionBar label="Testing" score={result.dims.testing.score} />
            <DimensionBar label="Activities" score={result.dims.activities.score} />
            <DimensionBar label="Leadership" score={result.dims.leadership.score} />
          </div>
          {result.strengths.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 600, color: colors.green, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "6px" }}>What's working</div>
              {result.strengths.map((s, i) => <p key={i} style={{ fontSize: "13.5px", color: colors.ink, lineHeight: 1.55, margin: "0 0 4px" }}>{s}</p>)}
            </div>
          )}
          {result.gaps.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 600, color: colors.brick, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "6px" }}>What's holding you back</div>
              {result.gaps.map((g, i) => <p key={i} style={{ fontSize: "13.5px", color: colors.ink, lineHeight: 1.55, margin: "0 0 4px" }}>{g}</p>)}
            </div>
          )}
          <div style={{ background: colors.amberSoft, border: `1px solid ${colors.amber}55`, borderRadius: "10px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 600, color: colors.amber, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "6px" }}>Biggest opportunity</div>
            <p style={{ fontSize: "13.5px", color: colors.ink, lineHeight: 1.55, margin: 0 }}>{result.opportunity}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PersonalFeedbackPanel({ paragraphs }) {
  return (
    <div style={{ background: colors.blueSoft, border: `1px solid ${colors.blue}33`, borderRadius: "14px", padding: "26px 28px", marginBottom: "28px" }}>
      <div style={{ fontFamily: fontHead, fontSize: "18px", fontWeight: 600, marginBottom: "14px", color: colors.blue }}>Your Personal Reality Check</div>
      {paragraphs.map((p, i) => <p key={i} style={{ fontSize: "14px", color: colors.ink, lineHeight: 1.65, margin: "0 0 12px" }}>{p}</p>)}
    </div>
  );
}

const IMPACT_COLOR = { "Very High": colors.brick, High: colors.amber, Medium: colors.blue };

function PriorityCard({ index, priority }) {
  const color = IMPACT_COLOR[priority.impact] ?? colors.blue;
  return (
    <div className="rc-card-hover" style={{ border: `1px solid ${colors.border}`, borderLeft: `3px solid ${color}`, borderRadius: "10px", padding: "16px 18px", marginBottom: "10px", background: "rgba(255,255,255,0.02)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
        <div style={{ fontFamily: fontSans, fontWeight: 600, fontSize: "14.5px", color: colors.ink }}>{index}. {priority.title}</div>
        <span style={{ fontSize: "11px", fontWeight: 700, color, whiteSpace: "nowrap" }}>{priority.impact} impact</span>
      </div>
      <p style={{ fontSize: "13px", color: colors.inkSoft, lineHeight: 1.55, margin: "0 0 10px" }}>{priority.why}</p>
      <div style={{ display: "flex", gap: "14px", fontSize: "11.5px", color: colors.inkFaint }}>
        <span>Difficulty: {priority.difficulty}</span><span>Timeframe: {priority.timeframe}</span>
      </div>
    </div>
  );
}

function PriorityList({ priorities }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h2 style={{ fontFamily: fontHead, fontSize: "18px", fontWeight: 600, margin: "0 0 14px", color: colors.ink }}>Your top priorities</h2>
      {priorities.length === 0 ? <p style={{ fontSize: "13px", color: colors.inkFaint }}>No urgent gaps detected — keep doing what you're doing.</p> : priorities.map((p, i) => <PriorityCard key={p.id} index={i + 1} priority={p} />)}
    </div>
  );
}

function Dashboard({ profile, universities, onEditProfile, onBackToLanding, onOpenWhatIf }) {
  const notStarted = profile.aLevelStatus === "not_started";
  const analysis = useMemo(() => computeAnalysis(profile, universities), [profile, universities]);
  const feedback = useMemo(() => generatePersonalFeedback(profile, analysis), [profile, analysis]);
  const priorities = useMemo(() => buildPriorities(profile, analysis), [profile, analysis]);
  const roadmap = useMemo(() => generatePreALevelPlan(profile), [profile]);
  const [expandedUniId, setExpandedUniId] = useState(universities[0]?.id ?? null);

  if (notStarted) {
    return (
      <div className="rc-fade-in" style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px 100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontFamily: fontHead, fontSize: "18px", fontWeight: 600, color: colors.ink }}>Reality Check</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <button onClick={onEditProfile} style={{ background: "none", border: "none", color: colors.inkSoft, fontSize: "13px", cursor: "pointer" }}>Edit profile</button>
            <button onClick={onBackToLanding} style={{ background: "none", border: "none", color: colors.inkFaint, fontSize: "13px", cursor: "pointer" }}>Exit</button>
          </div>
        </div>
        <h1 style={{ fontFamily: fontHead, fontSize: "26px", fontWeight: 600, margin: "18px 0 24px", color: colors.ink }}>Your Reality Check</h1>
        <TwoYearRoadmap plan={roadmap} />
        <AIOverviewPanel profile={profile} analysis={analysis} universities={universities} />
        {universities.length > 0 && (
          <div>
            <h2 style={{ fontFamily: fontHead, fontSize: "16px", fontWeight: 600, margin: "0 0 12px", color: colors.ink }}>Your target universities</h2>
            <p style={{ fontSize: "12.5px", color: colors.inkFaint, marginBottom: "12px" }}>Competitiveness scoring isn't meaningful yet without A-Level subjects — this list is just to keep them in view as you plan.</p>
            {universities.map((u) => (
              <div key={u.id} style={{ padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "10px", marginBottom: "8px", fontSize: "13.5px", color: colors.ink }}>
                {u.name} <span style={{ color: colors.inkFaint }}>· {u.country}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rc-fade-in" style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontFamily: fontHead, fontSize: "18px", fontWeight: 600, color: colors.ink }}>Reality Check</span>
        <div style={{ display: "flex", gap: "16px" }}>
          <button onClick={onEditProfile} style={{ background: "none", border: "none", color: colors.inkSoft, fontSize: "13px", cursor: "pointer" }}>Edit profile</button>
          <button onClick={onBackToLanding} style={{ background: "none", border: "none", color: colors.inkFaint, fontSize: "13px", cursor: "pointer" }}>Exit</button>
        </div>
      </div>
      <h1 style={{ fontFamily: fontHead, fontSize: "26px", fontWeight: 600, margin: "18px 0 24px", color: colors.ink }}>Your Reality Check</h1>
      {analysis.stillInDevelopment && <DevelopmentBanner />}
      <div style={{ marginBottom: "28px" }}><OverallScoreCard overallScore={analysis.overallScore} dims={analysis.dims} /></div>
      <h2 style={{ fontFamily: fontHead, fontSize: "18px", fontWeight: 600, margin: "0 0 14px", color: colors.ink }}>Per-university breakdown</h2>
      {universities.length === 0 && <p style={{ fontSize: "13px", color: colors.inkFaint, marginBottom: "28px" }}>No universities selected.</p>}
      <div style={{ marginBottom: "28px" }}>
        {universities.map((uni) => {
          const result = analysis.perUniversity.find((r) => r.universityId === uni.id);
          return <UniversityResultCard key={uni.id} uni={uni} result={result} expanded={expandedUniId === uni.id} onToggle={() => setExpandedUniId(expandedUniId === uni.id ? null : uni.id)} />;
        })}
      </div>
      <AIOverviewPanel profile={profile} analysis={analysis} universities={universities} />
      <PersonalFeedbackPanel paragraphs={feedback} />
      <PriorityList priorities={priorities} />
      <button onClick={onOpenWhatIf} className="rc-btn-primary" style={{ background: `linear-gradient(135deg, ${colors.blue}, ${colors.blueDark})`, color: "#fff", border: "none", borderRadius: "10px", padding: "13px 22px", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 18px rgba(76,141,255,0.35)" }}>
        Try What If? →
      </button>
    </div>
  );
}

/* ============================== WHAT-IF SIMULATOR ============================== */

function bumpGrade(grade, steps) {
  const idx = A_LEVEL_GRADES.indexOf((grade || "").trim().toUpperCase());
  if (idx === -1 || steps === 0) return grade;
  return A_LEVEL_GRADES[Math.max(0, idx - steps)]; // A_LEVEL_GRADES ordered best→worst, so subtract to improve
}

function buildWhatIfProfile(profile, { academicBoost, extracurricularImpact, leadershipImpact }) {
  const aLevels = profile.aLevels.map((q) => {
    if (academicBoost === 0) return q;
    return {
      ...q,
      asGrade: q.asStatus !== "not_taken" && q.asGrade ? bumpGrade(q.asGrade, academicBoost) : q.asGrade,
      a2Grade: q.a2Status !== "not_taken" && q.a2Grade ? bumpGrade(q.a2Grade, academicBoost) : q.a2Grade,
    };
  });
  const activities = profile.activities.map((a) => {
    let outcome = a.outcome;
    let leadershipLevel = a.leadershipLevel;
    if (extracurricularImpact === "strong" && (!outcome || outcome.trim().length <= 15)) {
      outcome = (outcome ? outcome.trim() + " " : "") + "Developed into a documented, measurable outcome.";
    }
    if (leadershipImpact === "significant") {
      const order = ["participant", "member", "lead", "founder"];
      if (order.indexOf(leadershipLevel) < order.indexOf("lead")) leadershipLevel = "lead";
    }
    return { ...a, outcome, leadershipLevel };
  });
  return { ...profile, aLevels, activities };
}

function applyTestingBoost(analysis, boost, universities) {
  const adjustedTesting = clamp10(analysis.dims.testing.score + boost);
  const dims = { ...analysis.dims, testing: { ...analysis.dims.testing, score: adjustedTesting } };
  const overallScore = clamp10(dims.academic.score * DIM_WEIGHTS.academic + adjustedTesting * DIM_WEIGHTS.testing + dims.activities.score * DIM_WEIGHTS.activities + dims.leadership.score * DIM_WEIGHTS.leadership);
  const perUniversity = universities.map((uni) => {
    const admissionStatus = statusFromDiff(overallScore - uni.selectivity);
    const scholarshipRaw = overallScore * 0.4 + dims.academic.score * 0.35 + adjustedTesting * 0.25;
    const scholarshipStatus = statusFromDiff(scholarshipRaw - uni.scholarshipBar);
    return { universityId: uni.id, admissionStatus, scholarshipStatus };
  });
  return { overallScore: Math.round(overallScore * 10) / 10, dims, perUniversity };
}

function ComparisonBar({ label, before, after }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "5px" }}>
        <span style={{ fontFamily: fontSans, fontWeight: 600, color: colors.ink }}>{label}</span>
        <span style={{ fontFamily: fontSans, color: colors.inkSoft }}>{before.toFixed(1)} → <strong style={{ color: after > before ? colors.green : colors.ink }}>{after.toFixed(1)}</strong></span>
      </div>
      <div style={{ position: "relative", height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ position: "absolute", height: "100%", width: `${(before / 10) * 100}%`, background: colors.inkFaint, opacity: 0.5, borderRadius: "999px", transition: "width 0.3s ease" }} />
        <div style={{ position: "absolute", height: "100%", width: `${(after / 10) * 100}%`, background: `linear-gradient(90deg, ${colors.blue}, ${colors.blueDark})`, borderRadius: "999px", opacity: after > before ? 1 : 0.7, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

function WhatIfSimulator({ profile, universities, onBack }) {
  const baseline = useMemo(() => computeAnalysis(profile, universities), [profile, universities]);
  const [testingBoost, setTestingBoost] = useState(0);
  const [academicBoost, setAcademicBoost] = useState(0);
  const [extracurricularImpact, setExtracurricularImpact] = useState("current");
  const [leadershipImpact, setLeadershipImpact] = useState("current");

  const scenarioProfile = useMemo(() => buildWhatIfProfile(profile, { academicBoost, extracurricularImpact, leadershipImpact }), [profile, academicBoost, extracurricularImpact, leadershipImpact]);
  const scenarioRaw = useMemo(() => computeAnalysis(scenarioProfile, universities), [scenarioProfile, universities]);
  const scenario = useMemo(() => applyTestingBoost(scenarioRaw, testingBoost, universities), [scenarioRaw, testingBoost, universities]);

  const maxTestingBoost = Math.max(0, Math.round((10 - baseline.dims.testing.score) * 10) / 10);
  const delta = Math.round((scenario.overallScore - baseline.overallScore) * 10) / 10;

  const biggestDriver = useMemo(() => {
    const contributions = Object.keys(DIM_WEIGHTS).map((key) => ({ key, contribution: (scenario.dims[key].score - baseline.dims[key].score) * DIM_WEIGHTS[key] }));
    contributions.sort((a, b) => b.contribution - a.contribution);
    return contributions[0];
  }, [baseline, scenario]);
  const explanation = biggestDriver.contribution > 0.05 ? `The largest improvement in this scenario comes from ${DIM_LABELS[biggestDriver.key]}.` : "None of these changes move your profile much yet — try a bigger shift on one variable.";

  return (
    <div className="rc-fade-in" style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontFamily: fontHead, fontSize: "18px", fontWeight: 600, color: colors.ink }}>Reality Check</span>
        <button onClick={onBack} style={{ background: "none", border: "none", color: colors.inkSoft, fontSize: "13px", cursor: "pointer" }}>← Back to dashboard</button>
      </div>
      <h1 style={{ fontFamily: fontHead, fontSize: "26px", fontWeight: 600, margin: "18px 0 6px", color: colors.ink }}>What If?</h1>
      <p style={{ fontSize: "13px", color: colors.inkFaint, margin: "0 0 26px" }}>A scenario simulation, not a guaranteed prediction — use it to see which changes would matter most.</p>

      <div style={{ ...glass({ padding: "24px" }), marginBottom: "24px" }}>
        <Field label={`Testing score boost: +${testingBoost.toFixed(1)}`} hint={maxTestingBoost === 0 ? "Already at the top of the scale" : `e.g. improving your SAT/ACT/IELTS/TOEFL result — current testing score: ${baseline.dims.testing.score.toFixed(1)} / 10`}>
          <input type="range" min={0} max={maxTestingBoost} step={0.2} value={testingBoost} onChange={(e) => setTestingBoost(Number(e.target.value))} style={{ width: "100%" }} disabled={maxTestingBoost === 0} />
        </Field>
        <Field label="A-Level grades (AS + A2)">
          <SegmentedControl value={academicBoost} onChange={setAcademicBoost} options={[{ value: 0, label: "Current" }, { value: 1, label: "+1 grade step" }, { value: 2, label: "+2 grade steps" }]} />
        </Field>
        <Field label="Extracurricular impact">
          <SegmentedControl value={extracurricularImpact} onChange={setExtracurricularImpact} options={[{ value: "current", label: "Current" }, { value: "strong", label: "Strong" }]} />
        </Field>
        <Field label="Leadership">
          <SegmentedControl value={leadershipImpact} onChange={setLeadershipImpact} options={[{ value: "current", label: "Current" }, { value: "significant", label: "Significant" }]} />
        </Field>
      </div>

      <div style={{ ...glass({ padding: "24px" }), marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "40px", marginBottom: "22px" }}>
          <div><div style={{ fontSize: "11.5px", color: colors.inkFaint, marginBottom: "4px" }}>Current</div><div style={{ fontFamily: fontHead, fontSize: "34px", fontWeight: 600, color: colors.ink }}>{baseline.overallScore.toFixed(1)}</div></div>
          <div>
            <div style={{ fontSize: "11.5px", color: colors.inkFaint, marginBottom: "4px" }}>Scenario</div>
            <div style={{ fontFamily: fontHead, fontSize: "34px", fontWeight: 600, color: colors.blue }}>
              {scenario.overallScore.toFixed(1)}
              <span style={{ fontSize: "15px", marginLeft: "8px", color: delta > 0 ? colors.green : colors.inkFaint }}>{delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}</span>
            </div>
          </div>
        </div>
        <ComparisonBar label="Academic" before={baseline.dims.academic.score} after={scenario.dims.academic.score} />
        <ComparisonBar label="Testing" before={baseline.dims.testing.score} after={scenario.dims.testing.score} />
        <ComparisonBar label="Extracurricular activity" before={baseline.dims.activities.score} after={scenario.dims.activities.score} />
        <ComparisonBar label="Leadership" before={baseline.dims.leadership.score} after={scenario.dims.leadership.score} />
        <p style={{ fontSize: "13.5px", color: colors.ink, lineHeight: 1.55, marginTop: "16px", marginBottom: 0 }}>{explanation}</p>
      </div>

      {universities.length > 0 && (
        <div>
          <h2 style={{ fontFamily: fontHead, fontSize: "16px", fontWeight: 600, margin: "0 0 12px", color: colors.ink }}>How your shortlist would shift</h2>
          {universities.map((uni) => {
            const before = baseline.perUniversity.find((r) => r.universityId === uni.id);
            const after = scenario.perUniversity.find((r) => r.universityId === uni.id);
            return (
              <div key={uni.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: `1px solid ${colors.border}`, borderRadius: "10px", marginBottom: "8px" }}>
                <span style={{ fontFamily: fontSans, fontSize: "13.5px", color: colors.ink }}>{uni.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><StatusPill level={before.admissionStatus} /><span style={{ color: colors.inkFaint }}>→</span><StatusPill level={after.admissionStatus} /></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================== INTRO ANIMATION ============================== */

const INTRO_TEXT = "Reality Check";
const INTRO_I_INDEX = INTRO_TEXT.indexOf("i");
const INTRO_ZOOM_MS = 1600;
const INTRO_FADE_MS = 700;

function IntroOverlay({ onDone }) {
  const [phase, setPhase] = useState("hold"); // hold | zoom | fadeout
  const [targetOffset, setTargetOffset] = useState(null); // where the 'i' sits, relative to wrapRef
  const wrapRef = useRef(null);
  const zoomLayerRef = useRef(null);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  // Quietly measure where the 'i' sits (real text metrics, once the font has loaded) so the
  // zoom has a precise target — no visible marker is drawn, it's purely a math reference point.
  useEffect(() => {
    let cancelled = false;
    const measure = () => {
      if (!wrapRef.current || cancelled) return;
      const cs = window.getComputedStyle(wrapRef.current);
      const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.font = font;
      const before = INTRO_TEXT.slice(0, INTRO_I_INDEX);
      const beforeWidth = ctx.measureText(before).width;
      const iWidth = ctx.measureText(INTRO_TEXT[INTRO_I_INDEX]).width;
      const fontSize = parseFloat(cs.fontSize);
      setTargetOffset({ x: beforeWidth + iWidth / 2, y: fontSize * 0.22 });
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure).catch(measure);
    else measure();
    const t = setTimeout(measure, 200); // safety re-measure in case layout settles after fonts.ready
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  useEffect(() => {
    if (phase !== "hold") return;
    const t = setTimeout(() => startZoom(), 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, targetOffset]);

  function startZoom() {
    if (doneRef.current || !wrapRef.current || !zoomLayerRef.current) return;
    const wrapRect = wrapRef.current.getBoundingClientRect();
    const offset = targetOffset || { x: wrapRect.width / 2, y: wrapRect.height / 2 };
    const cx = wrapRect.left + offset.x;
    const cy = wrapRect.top + offset.y;
    const vw = window.innerWidth, vh = window.innerHeight;
    const dx = vw / 2 - cx;
    const dy = vh / 2 - cy;
    const scale = Math.max(vw, vh) / 14; // 14px ≈ the visual size of a single dot at this font size
    zoomLayerRef.current.style.setProperty("--dx", `${dx}px`);
    zoomLayerRef.current.style.setProperty("--dy", `${dy}px`);
    zoomLayerRef.current.style.setProperty("--zscale", scale);
    setPhase("zoom");
    // Start the fade a little before the zoom transform finishes, so the reveal
    // dissolves into the landing page instead of cutting after a hard stop.
    setTimeout(() => setPhase("fadeout"), INTRO_ZOOM_MS - 400);
    setTimeout(finish, INTRO_ZOOM_MS - 400 + INTRO_FADE_MS);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#000", zIndex: 1000, overflow: "hidden",
        opacity: phase === "fadeout" ? 0 : 1,
        transition: phase === "fadeout" ? `opacity ${INTRO_FADE_MS}ms ease-out` : "none",
      }}
    >
      <div
        ref={zoomLayerRef}
        className={phase === "zoom" || phase === "fadeout" ? "rc-intro-zoom" : ""}
        style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div ref={wrapRef} style={{ position: "relative", display: "inline-block", fontFamily: fontHead, fontWeight: 600, fontSize: "clamp(40px, 9vw, 86px)", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
          <span className="rc-intro-shine-text">{INTRO_TEXT}</span>
        </div>
      </div>

      <button
        onClick={finish}
        style={{
          position: "fixed", right: "20px", bottom: "20px", background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.22)", color: "#d8dade", borderRadius: "8px",
          padding: "8px 16px", fontSize: "13px", fontFamily: fontSans, cursor: "pointer", zIndex: 1001,
        }}
      >
        Skip
      </button>
    </div>
  );
}

/* ============================== APP ============================== */

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [view, setView] = useState("landing");
  const [profile, setProfile] = useState(initialProfile);
  const [customUniversities, setCustomUniversities] = useState([]);
  const [selectedUniversityIds, setSelectedUniversityIds] = useState(["university-of-waterloo", "university-of-edinburgh", "drake-university"]);

  const allUniversities = useMemo(() => [...UNIVERSITY_DIRECTORY, ...customUniversities], [customUniversities]);
  const selectedUnis = allUniversities.filter((u) => selectedUniversityIds.includes(u.id));

  return (
    <div style={{ background: `radial-gradient(circle at 20% -10%, ${colors.bgTop} 0%, ${colors.bgMid} 45%, ${colors.bgBottom} 100%)`, color: colors.ink, minHeight: "100vh", fontFamily: fontSans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        a, button { font-family: inherit; }
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .rc-grid-2 { grid-template-columns: 1fr !important; }
          .rc-grid-5 { grid-template-columns: repeat(2, 1fr) !important; }
          .rc-score-card { grid-template-columns: 1fr !important; text-align: center; }
          .rc-score-card > div:first-child { justify-self: center; }
        }
        @keyframes rc-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .rc-fade-in { animation: rc-fade-in 0.35s ease both; }
        @keyframes rc-shine {
          from { background-position: 250% 0; }
          to { background-position: -250% 0; }
        }
        .rc-intro-shine-text {
          background: linear-gradient(120deg, #7a7f87 0%, #d8dade 35%, #ffffff 50%, #d8dade 65%, #7a7f87 100%);
          background-size: 250% 100%;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: rc-shine 2.4s linear infinite;
          text-shadow: 0 0 26px rgba(200,204,214,0.35);
        }
        @keyframes rc-intro-zoom-kf {
          0% { transform: translate(0, 0) scale(1); filter: blur(0px); }
          10% { filter: blur(3px); }
          45% { filter: blur(13px); }
          80% { filter: blur(6px); }
          100% { transform: translate(var(--dx), var(--dy)) scale(var(--zscale)); filter: blur(0px); }
        }
        .rc-intro-zoom { animation: rc-intro-zoom-kf 1.6s cubic-bezier(0.65, 0, 0.35, 1) forwards; will-change: transform, filter; }
        .rc-btn-primary { transition: filter 0.15s ease, transform 0.1s ease; }
        .rc-btn-primary:hover:not(:disabled) { filter: brightness(1.1); }
        .rc-btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .rc-btn-ghost { transition: background 0.15s ease, border-color 0.15s ease; }
        .rc-btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,0.07); border-color: ${colors.borderStrong}; }
        .rc-card-hover { transition: box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease; }
        .rc-card-hover:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.35); transform: translateY(-2px); border-color: ${colors.borderStrong}; }
        input[type="range"] { accent-color: ${colors.blue}; }
        select option { background: #161b22; }
      `}</style>

      {showIntro && <IntroOverlay onDone={() => setShowIntro(false)} />}

      {view === "landing" && <Landing onStart={() => setView("onboarding")} />}
      {view === "onboarding" && (
        <Onboarding
          profile={profile} setProfile={setProfile}
          selectedUniversityIds={selectedUniversityIds} setSelectedUniversityIds={setSelectedUniversityIds}
          customUniversities={customUniversities} setCustomUniversities={setCustomUniversities}
          onExit={() => setView("landing")} onFinish={() => setView("analyzing")}
        />
      )}
      {view === "analyzing" && <AnalyzingScreen onDone={() => setView("dashboard")} />}
      {view === "dashboard" && (
        <Dashboard profile={profile} universities={selectedUnis} onEditProfile={() => setView("onboarding")} onBackToLanding={() => setView("landing")} onOpenWhatIf={() => setView("whatif")} />
      )}
      {view === "whatif" && <WhatIfSimulator profile={profile} universities={selectedUnis} onBack={() => setView("dashboard")} />}
    </div>
  );
}


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
