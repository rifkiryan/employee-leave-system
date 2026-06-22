"use client";

import { useState } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { CircuitBackground } from "@/components/shared/CircuitBackground";
import {
  ShieldAlert,
  Zap,
  Eye,
  Layers,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  ChevronRight,
  FileCode2,
  Bug,
  Gauge,
  Accessibility,
  Package,
  Activity,
  Bot,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

// ─── Review Data ───────────────────────────────────────────────

type Severity = "Critical" | "High" | "Medium" | "Low";
type Status = "PASS" | "FAIL";

interface Finding {
  id: string;
  title: string;
  severity: Severity;
  description: string;
  codeSnippet?: string;
  file?: string;
  recommendation: string;
}

interface ReviewArea {
  name: string;
  icon: LucideIcon;
  status: Status;
  severity: Severity;
  findings: Finding[];
}

const REVIEW_META = {
  reviewer: "AI Code Review (Antigravity)",
  date: "2026-06-22",
  application: "Employee Leave Management System",
  version: "0.1.0",
  decision: "REQUEST CHANGES",
};

const SEVERITY_COUNTS = { Critical: 3, High: 4, Medium: 11, Low: 10 };

const REVIEW_AREAS: ReviewArea[] = [
  {
    name: "Functional Correctness",
    icon: Bug,
    status: "FAIL",
    severity: "High",
    findings: [
      {
        id: "FC-01",
        title: "Deviasi dari Spesifikasi (Database vs localStorage)",
        severity: "High",
        description:
          "Spesifikasi menyatakan aplikasi berjalan sepenuhnya di browser menggunakan Local Storage tanpa backend. Namun implementasi menggunakan Prisma ORM + Neon DB (Serverless PostgreSQL).",
        file: "prisma/schema.prisma, src/lib/prisma.ts, prisma/seed.ts",
        recommendation:
          "Update spesifikasi agar mencerminkan arsitektur actual, atau dokumentasikan alasan deviasi secara formal.",
      },
      {
        id: "FC-02",
        title: "Dead Code — AuthStorageService.login()",
        severity: "Medium",
        description:
          'Method login() tidak pernah dipanggil di codebase. Login page menggunakan fetch("/api/auth/login") langsung.',
        file: "src/services/auth-storage.ts",
        codeSnippet: `login(credentials: LoginCredentials): boolean {
  if (credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD) {
    this.setSession({ id: "0", ... });
    return true;
  }
  return false;
}`,
        recommendation: "Hapus method login() dari AuthStorageService.",
      },
      {
        id: "FC-03",
        title: "Duplicate Seed Logic",
        severity: "Medium",
        description:
          "Fungsi seedIfNeeded() diduplikasi di dua file API (login dan employees). Risiko inconsistency jika salah satu diubah.",
        file: "src/app/api/auth/login/route.ts, src/app/api/employees/route.ts",
        recommendation: "Extract ke satu shared utility (src/lib/seed.ts).",
      },
    ],
  },
  {
    name: "Security (OWASP)",
    icon: ShieldAlert,
    status: "FAIL",
    severity: "Critical",
    findings: [
      {
        id: "SEC-01",
        title: "Hardcoded Credentials di Source Code",
        severity: "Critical",
        description:
          'Password admin ("admin123") tersimpan dalam plaintext di source code. Siapa saja yang memiliki akses ke repository dapat melihat kredensial.',
        file: "src/constants/index.ts",
        codeSnippet: `export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "admin123";`,
        recommendation:
          "Pindahkan ke environment variable atau hapus mekanisme hardcoded admin fallback.",
      },
      {
        id: "SEC-02",
        title: "Spoofable Authorization Headers (Broken Access Control)",
        severity: "Critical",
        description:
          'Authorization bergantung pada header x-user-role dan x-user-id yang dikirim dari client-side. Attacker bisa mengirim header "x-user-role: ADMIN" dan mendapatkan akses penuh.',
        file: "src/app/api/leave/route.ts",
        codeSnippet: `const roleHeader = req.headers.get("x-user-role");
const userIdHeader = req.headers.get("x-user-id");`,
        recommendation:
          "Implementasi JWT token atau server-side session yang diverifikasi di setiap API route.",
      },
      {
        id: "SEC-03",
        title: "Admin Login Bypass tanpa Password Hashing",
        severity: "Critical",
        description:
          "Login API membandingkan password admin secara plaintext (bypass bcrypt). Ini adalah Authentication Bypass.",
        file: "src/app/api/auth/login/route.ts",
        codeSnippet: `if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
  // Bypass bcrypt comparison entirely
  return NextResponse.json({ success: true, user: { ... } });
}`,
        recommendation:
          "Hapus fallback ini. Gunakan hashed password dari database untuk semua user.",
      },
      {
        id: "SEC-04",
        title: "Session di localStorage (XSS Vulnerable)",
        severity: "High",
        description:
          "Session auth disimpan di localStorage yang rentan terhadap XSS. Jika ada XSS vulnerability, attacker bisa mencuri session.",
        file: "src/lib/storage.ts",
        recommendation: "Gunakan httpOnly cookies untuk session/JWT token.",
      },
      {
        id: "SEC-05",
        title: "Database Koneksi Sudah Diperbaiki ✅",
        severity: "Low",
        description:
          "Database sekarang menggunakan Neon DB (Serverless PostgreSQL) dengan SSL dan authenticated connection. Sudah tidak menggunakan root tanpa password.",
        file: ".env",
        recommendation:
          "Sudah diperbaiki — menggunakan Neon DB dengan koneksi terenkripsi SSL.",
      },
      {
        id: "SEC-06",
        title: "Tidak ada Rate Limiting pada Login",
        severity: "Medium",
        description: "Login endpoint tidak memiliki rate limiting. Rentan brute-force attack.",
        recommendation: "Implementasi rate limiting middleware.",
      },
    ],
  },
  {
    name: "Performance",
    icon: Gauge,
    status: "FAIL",
    severity: "High",
    findings: [
      {
        id: "PERF-01",
        title: "Dashboard 5+ Redundant API Calls",
        severity: "High",
        description:
          "countByStatus() memanggil getAll() berulang. Dashboard melakukan 3 kali fetch ke /api/leave untuk mendapatkan 3 angka count.",
        file: "src/app/dashboard/page.tsx",
        recommendation: "Buat satu API endpoint /api/leave/stats yang mengembalikan semua count sekaligus.",
      },
      {
        id: "PERF-02",
        title: "O(n²) Loop di FuturisticChart",
        severity: "High",
        description:
          "Array.find() di dalam forEach loop menghasilkan O(n×m) complexity.",
        file: "src/components/dashboard/FuturisticChart.tsx",
        codeSnippet: `approvedLeaves.forEach(l => {
  const emp = employees.find(e => e.id === l.employeeId); // O(n) setiap iterasi
});`,
        recommendation: "Bangun lookup Map terlebih dahulu: new Map(employees.map(e => [e.id, e]))",
      },
      {
        id: "PERF-03",
        title: "PrismaClient Connection Leak ✅ (Sudah Diperbaiki)",
        severity: "Low",
        description:
          "Sudah diperbaiki. PrismaClient sekarang menggunakan singleton pattern yang benar dengan globalThis caching.",
        file: "src/lib/prisma.ts",
        recommendation: "Sudah menggunakan pattern: globalForPrisma.prisma ?? new PrismaClient()",
      },
      {
        id: "PERF-04",
        title: "Client-Side Search (Full Fetch + Filter)",
        severity: "Medium",
        description:
          "EmployeeStorageService.search() fetch semua data lalu filter di client. Inefisien untuk dataset besar.",
        file: "src/services/employee-storage.ts",
        recommendation: "Implementasi server-side search dengan query parameter.",
      },
    ],
  },
  {
    name: "Architecture",
    icon: Layers,
    status: "FAIL",
    severity: "Medium",
    findings: [
      {
        id: "ARCH-01",
        title: "Hardcoded Department List di 3 Lokasi",
        severity: "Medium",
        description:
          "Department list di-hardcode di constants, FuturisticChart, dan employees page filter.",
        recommendation: "Gunakan satu source of truth dari constants/index.ts.",
      },
      {
        id: "ARCH-02",
        title: "isAdmin Check Inconsisten",
        severity: "Low",
        description:
          'Check session.username === "admin" bisa menyebabkan privilege escalation jika ada user non-admin dengan username "admin".',
        recommendation: 'Gunakan hanya session.role === "ADMIN".',
      },
    ],
  },
  {
    name: "Maintainability",
    icon: Wrench,
    status: "FAIL",
    severity: "Medium",
    findings: [
      {
        id: "MAINT-01",
        title: "FuturisticChart.tsx Terlalu Besar (676 baris)",
        severity: "Medium",
        description:
          "Satu file berisi data fetching, 3 chart calculations, SVG rendering, hover states, dan console output.",
        recommendation:
          "Pecah menjadi sub-components: AreaSpectrogram, SectorLoadBars, ClearanceRadar, DiagnosticsConsole.",
      },
      {
        id: "MAINT-02",
        title: "Magic Numbers di Chart Calculations",
        severity: "Medium",
        description:
          'Angka seperti 440, 327, 214, r="70", r="52" tidak memiliki penjelasan.',
        recommendation: "Extract ke named constants dengan komentar penjelasan.",
      },
      {
        id: "MAINT-03",
        title: "Duplicate Decorative Pattern di Setiap Page",
        severity: "Low",
        description:
          "CircuitBackground, decorative glows, dan Navbar diulang di setiap page.",
        recommendation: "Buat PageLayout wrapper component.",
      },
    ],
  },
  {
    name: "Type Safety",
    icon: FileCode2,
    status: "FAIL",
    severity: "Medium",
    findings: [
      {
        id: "TS-01",
        title: 'Penggunaan "any" Type di 6+ Lokasi',
        severity: "Medium",
        description:
          "useState<any> untuk session, error: any di catch blocks, role as any di employee API.",
        recommendation:
          "Gunakan AuthSession type untuk session, unknown untuk errors, dan proper Prisma types.",
      },
      {
        id: "TS-02",
        title: "Inconsistent Type — durationType",
        severity: "Low",
        description:
          "Di types/leave.ts: optional string. Di validator: required enum. Tidak konsisten.",
        recommendation: "Buat DurationType union type dan gunakan di kedua tempat.",
      },
    ],
  },
  {
    name: "Error Handling",
    icon: AlertTriangle,
    status: "FAIL",
    severity: "Medium",
    findings: [
      {
        id: "ERR-01",
        title: "Generic Error Messages dari API",
        severity: "Medium",
        description:
          'Semua API routes mengembalikan "Internal Server Error" tanpa informasi spesifik.',
        recommendation: "Kembalikan error code spesifik tanpa expose stack trace.",
      },
      {
        id: "ERR-02",
        title: "Error Silently Swallowed di Services",
        severity: "Medium",
        description:
          "Saat API gagal, service mengembalikan array kosong. UI menampilkan 'no data' tanpa indikasi error.",
        recommendation: "Throw error atau return result type { data, error }.",
      },
    ],
  },
  {
    name: "Validation",
    icon: ShieldCheck,
    status: "FAIL",
    severity: "High",
    findings: [
      {
        id: "VAL-01",
        title: "Tidak Ada Server-Side Date Validation",
        severity: "High",
        description:
          "Server hanya memeriksa apakah field ada, tidak memvalidasi apakah endDate >= startDate atau format tanggal valid.",
        file: "src/app/api/leave/route.ts",
        recommendation:
          "Tambahkan validasi date format, date range, dan apakah tanggal di masa depan.",
      },
      {
        id: "VAL-02",
        title: "Password Optional saat Create Employee",
        severity: "High",
        description:
          "Password bersifat optional di validator namun required di API. Form bisa submit tanpa password.",
        file: "src/validators/employee-validator.ts",
        recommendation: "Buat createEmployeeSchema (password required) dan updateEmployeeSchema (optional).",
      },
    ],
  },
  {
    name: "UI/UX",
    icon: Eye,
    status: "PASS",
    severity: "Low",
    findings: [
      {
        id: "UX-01",
        title: "Minor Contrast Issue",
        severity: "Low",
        description:
          "Beberapa teks text-slate-500/600 pada background gelap mungkin sulit dibaca.",
        recommendation: "Pastikan contrast ratio memenuhi WCAG AA (minimal 4.5:1).",
      },
    ],
  },
  {
    name: "Accessibility (A11Y)",
    icon: Accessibility,
    status: "FAIL",
    severity: "Medium",
    findings: [
      {
        id: "A11Y-01",
        title: "Missing ARIA Labels pada Filter Selects",
        severity: "Medium",
        description: "<select> elements tidak memiliki aria-label atau associated <label>.",
        file: "src/app/employees/page.tsx",
        recommendation: 'Tambahkan aria-label="Filter by department" pada setiap select.',
      },
    ],
  },
  {
    name: "Dependency Review",
    icon: Package,
    status: "FAIL",
    severity: "Low",
    findings: [
      {
        id: "DEP-01",
        title: "Unused Dependencies (uuid, next-themes)",
        severity: "Low",
        description:
          "Package uuid tidak digunakan (Prisma pakai cuid). next-themes tidak digunakan (dark mode hardcoded).",
        recommendation: "npm uninstall uuid next-themes @types/uuid",
      },
    ],
  },
  {
    name: "Logging & Observability",
    icon: Activity,
    status: "FAIL",
    severity: "High",
    findings: [
      {
        id: "LOG-01",
        title: "Tidak Ada Audit Trail untuk Approve/Reject",
        severity: "High",
        description:
          "Aksi approve/reject leave request tidak memiliki audit log. Tidak tercatat siapa yang approve, kapan, dari status apa.",
        file: "src/app/api/leave/[id]/route.ts",
        recommendation:
          "Buat tabel audit log atau minimal log structured JSON dengan event, actor, timestamp.",
      },
      {
        id: "LOG-02",
        title: "Hanya console.error, Tidak Ada Structured Logging",
        severity: "Medium",
        description: "Seluruh error handling menggunakan console.error tanpa format structured.",
        recommendation: "Gunakan structured logging library (pino, winston).",
      },
    ],
  },
  {
    name: "AI Generated Code",
    icon: Bot,
    status: "FAIL",
    severity: "Medium",
    findings: [
      {
        id: "AI-01",
        title: "Dead Code dari Iterasi Sebelumnya",
        severity: "Medium",
        description:
          "AuthStorageService.login(), STORAGE_KEY_EMPLOYEES, STORAGE_KEY_LEAVE_REQUESTS, UserPlus import — semua tidak terpakai.",
        recommendation: "Hapus semua dead code.",
      },
      {
        id: "AI-02",
        title: "Fake Security — Auth Header Pattern",
        severity: "Medium",
        description:
          "Mekanisme auth header dari client memberikan ilusi keamanan yang tidak efektif.",
        recommendation: "Ganti dengan JWT atau server-side session.",
      },
      {
        id: "AI-03",
        title: "Over-Engineering — FuturisticChart",
        severity: "Low",
        description:
          "676 baris SVG custom dengan radar rings dan console log terlalu kompleks untuk leave management dashboard.",
        recommendation: "Simplify atau gunakan charting library.",
      },
    ],
  },
];

// ─── Helper Functions ──────────────────────────────────────────

function severityColor(s: Severity) {
  switch (s) {
    case "Critical": return { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", glow: "shadow-[0_0_10px_rgba(244,63,94,0.15)]", dot: "bg-rose-500" };
    case "High": return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", glow: "shadow-[0_0_10px_rgba(245,158,11,0.15)]", dot: "bg-amber-500" };
    case "Medium": return { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", glow: "shadow-[0_0_10px_rgba(6,182,212,0.15)]", dot: "bg-cyan-500" };
    case "Low": return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", glow: "shadow-[0_0_10px_rgba(16,185,129,0.15)]", dot: "bg-emerald-500" };
  }
}

function statusBadge(s: Status) {
  if (s === "PASS") return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "PASS" };
  return { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", label: "FAIL" };
}

// ─── Components ────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: Severity }) {
  const c = severityColor(severity);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${c.bg} ${c.text} ${c.border} border`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const s = statusBadge(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${s.bg} ${s.text} ${s.border} border`}>
      {status === "PASS" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {s.label}
    </span>
  );
}

function SummaryCard({ label, count, severity }: { label: string; count: number; severity: Severity }) {
  const c = severityColor(severity);
  return (
    <div className={`relative p-5 rounded-2xl border ${c.border} ${c.bg} backdrop-blur-md ${c.glow} transition-all duration-300 hover:scale-[1.02] group overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent ${severity === "Critical" ? "via-rose-500/60" : severity === "High" ? "via-amber-500/60" : severity === "Medium" ? "via-cyan-500/60" : "via-emerald-500/60"} to-transparent`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest mb-1">{label}</p>
          <p className={`text-3xl font-extrabold font-mono ${c.text}`}>{count}</p>
        </div>
        <div className={`h-12 w-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          {severity === "Critical" && <ShieldAlert className={`h-6 w-6 ${c.text}`} />}
          {severity === "High" && <AlertTriangle className={`h-6 w-6 ${c.text}`} />}
          {severity === "Medium" && <Info className={`h-6 w-6 ${c.text}`} />}
          {severity === "Low" && <CheckCircle2 className={`h-6 w-6 ${c.text}`} />}
        </div>
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const [open, setOpen] = useState(false);
  const c = severityColor(finding.severity);

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} backdrop-blur-sm overflow-hidden transition-all duration-300`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors duration-200"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`font-mono text-[10px] font-bold ${c.text} shrink-0`}>{finding.id}</span>
          <span className="text-slate-200 font-mono text-xs truncate">{finding.title}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <SeverityBadge severity={finding.severity} />
          {open ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-in fade-in duration-200">
          <p className="text-slate-300 text-xs font-mono leading-relaxed">{finding.description}</p>

          {finding.file && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <FileCode2 className="h-3 w-3" />
              <span>{finding.file}</span>
            </div>
          )}

          {finding.codeSnippet && (
            <pre className="bg-black/60 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
              <code>{finding.codeSnippet}</code>
            </pre>
          )}

          <div className="flex gap-2 items-start p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-emerald-300/90 text-[11px] font-mono leading-relaxed">{finding.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewSection({ area }: { area: ReviewArea }) {
  const [expanded, setExpanded] = useState(area.severity === "Critical");
  const Icon = area.icon;

  return (
    <div className="bg-[#0b1226]/70 border border-cyan-500/10 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/20">
      {/* Section Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-cyan-500/[0.02] transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">{area.name}</h3>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">{area.findings.length} FINDING{area.findings.length !== 1 ? "S" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={area.status} />
          <SeverityBadge severity={area.severity} />
          {expanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
        </div>
      </button>

      {/* Findings */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
          {area.findings.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function CodeReviewPage() {
  const totalFindings = Object.values(SEVERITY_COUNTS).reduce((a, b) => a + b, 0);
  const passCount = REVIEW_AREAS.filter((a) => a.status === "PASS").length;
  const failCount = REVIEW_AREAS.filter((a) => a.status === "FAIL").length;

  return (
    <div className="min-h-screen relative bg-[#070b19] overflow-hidden text-white">
      <CircuitBackground />

      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 relative z-10">
        {/* ── Header ── */}
        <div className="mb-10 bg-slate-950/45 border border-cyan-500/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                  <ClipboardCheck className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase font-mono">
                  Code Review Report
                </h1>
              </div>
              <p className="text-slate-400 font-mono text-xs mt-1 max-w-xl leading-relaxed">
                Comprehensive security, performance, and maintainability audit for the Employee Leave Management System.
              </p>
            </div>

            {/* Decision Badge */}
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                {REVIEW_META.decision}
              </span>
              <div className="font-mono text-[10px] text-slate-500 space-y-0.5 text-right">
                <p>REVIEWER: {REVIEW_META.reviewer}</p>
                <p>DATE: {REVIEW_META.date}</p>
                <p>VERSION: {REVIEW_META.version}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Severity Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="Critical" count={SEVERITY_COUNTS.Critical} severity="Critical" />
          <SummaryCard label="High" count={SEVERITY_COUNTS.High} severity="High" />
          <SummaryCard label="Medium" count={SEVERITY_COUNTS.Medium} severity="Medium" />
          <SummaryCard label="Low" count={SEVERITY_COUNTS.Low} severity="Low" />
        </div>

        {/* ── Overview Stats Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0b1226]/70 border border-cyan-500/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <ClipboardCheck className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">Total Findings</p>
              <p className="text-2xl font-extrabold font-mono text-white">{totalFindings}</p>
            </div>
          </div>
          <div className="bg-[#0b1226]/70 border border-cyan-500/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">Areas Passed</p>
              <p className="text-2xl font-extrabold font-mono text-emerald-400">{passCount} <span className="text-sm text-slate-500">/ {REVIEW_AREAS.length}</span></p>
            </div>
          </div>
          <div className="bg-[#0b1226]/70 border border-cyan-500/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">Areas Failed</p>
              <p className="text-2xl font-extrabold font-mono text-rose-400">{failCount} <span className="text-sm text-slate-500">/ {REVIEW_AREAS.length}</span></p>
            </div>
          </div>
        </div>

        {/* ── Review Areas ── */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-cyan-400">
              Detailed Findings by Area
            </h2>
          </div>
          {REVIEW_AREAS.map((area) => (
            <ReviewSection key={area.name} area={area} />
          ))}
        </div>

        {/* ── Conclusion ── */}
        <div className="bg-[#0b1226]/70 border border-amber-500/20 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-amber-400 mb-2">Conclusion</h3>
              <p className="text-slate-300 font-mono text-xs leading-relaxed">
                Aplikasi memiliki fondasi arsitektur yang baik dengan separation of concerns yang jelas melalui pattern Page → Hook → Service → API → Database. 
                UI/UX sangat premium dengan tema cyber-neon yang konsisten. Namun terdapat <span className="text-rose-400 font-bold">3 temuan Critical</span> pada 
                area security yang merupakan <span className="text-rose-400 font-bold">release blocker</span>: hardcoded plaintext credentials, client-side authorization 
                headers yang bisa di-spoof, dan admin login bypass tanpa password hashing. Selain itu terdapat <span className="text-amber-400 font-bold">6 temuan High</span> yang 
                harus diperbaiki sebelum production.
              </p>
              <p className="text-amber-400 font-mono text-xs font-bold mt-3 uppercase tracking-widest">
                Keputusan: REQUEST CHANGES — Perbaiki seluruh temuan Critical dan High sebelum release.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
