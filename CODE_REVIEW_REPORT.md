# Code Review Report — Employee Leave Management System

---

## Reviewer Information

| Field       | Value                                    |
| ----------- | ---------------------------------------- |
| Reviewer    | AI Code Review (Antigravity)             |
| Review Date | 2026-06-22                               |
| Application | Employee Leave Management System         |
| Version     | 0.1.0                                    |
| Repository  | employee-leave-system (local)            |

---

# Review Report Summary

| Area                     | Status | Severity | Finding                                                             | Recommendation                                                        |
| ------------------------ | ------ | -------- | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Functional Correctness   | FAIL   | High     | Deviation dari spec (database vs localStorage), dead code           | Sesuaikan arsitektur atau update spec, hapus dead code                 |
| Security                 | FAIL   | Critical | Hardcoded credentials, spoofable auth headers, no server-side auth  | Implementasi JWT/session server-side, hapus hardcoded password         |
| Performance              | FAIL   | High     | Dashboard memicu 5 API call berulang, O(n²) loop, connection leak   | Gabungkan API stats, gunakan Map lookup, perbaiki Prisma singleton     |
| Architecture             | FAIL   | Medium   | Duplicate seed logic, dead service method, tight coupling            | Konsolidasi seed, hapus dead code, pisahkan concern                   |
| Maintainability          | FAIL   | Medium   | FuturisticChart 676 baris, `any` type, magic numbers, hardcoded list | Pecah component, gunakan proper types, extract constants              |
| Type Safety              | FAIL   | Medium   | Penggunaan `any` di 6+ lokasi, type casting `as any`                | Definisikan proper types untuk semua state dan error                   |
| Error Handling           | FAIL   | Medium   | Generic error message, error ditelan di beberapa tempat             | Structured error, spesifik error message, tambah retry                |
| Validation               | FAIL   | High     | Tidak ada server-side date validation, password optional saat create | Tambah server-side validation, wajibkan password untuk user baru      |
| UI/UX                    | PASS   | Low      | Konsisten, responsif, feedback bagus, minor contrast issue          | Perbaiki kontras teks pada elemen slate-500                           |
| Accessibility            | FAIL   | Medium   | Missing ARIA labels pada filter, low contrast text                  | Tambah aria-label, perbaiki color contrast ratio                      |
| Dependency Review        | FAIL   | Low      | Package `uuid` dan `next-themes` tidak terpakai                     | Hapus unused dependencies                                            |
| Logging & Observability  | FAIL   | High     | Tidak ada audit trail, hanya console.error, no structured logging   | Implementasi audit log untuk approve/reject, structured logging       |
| AI Generated Code Review | FAIL   | Medium   | Dead code, fake security, over-engineering, duplicate logic         | Hapus dead code, perbaiki security, simplify chart component          |

---

# 1. Functional Correctness

## Status: FAIL — Severity: High

### 1.1 Requirement Coverage

> **Temuan: Deviasi signifikan dari spesifikasi**

Spesifikasi menyatakan:

> *"The application runs entirely in the browser and stores data using Local Storage. No backend API and no database are required."*

Namun implementasi menggunakan **Prisma ORM + Neon DB (Serverless PostgreSQL)** dengan full REST API routes. Ini adalah deviasi arsitektural besar dari spesifikasi original.

**File terkait:**
- `prisma/schema.prisma` — PostgreSQL database schema (Neon DB)
- `src/lib/prisma.ts` — PrismaClient instantiation
- `src/app/api/` — Seluruh API routes

**Rekomendasi:** Update spesifikasi agar mencerminkan arsitektur actual, atau dokumentasikan alasan deviasi secara formal.

### 1.2 Dead Code — `AuthStorageService.login()`

```typescript
// src/services/auth-storage.ts (line 6-14)
login(credentials: LoginCredentials): boolean {
    if (
      credentials.username === ADMIN_USERNAME &&
      credentials.password === ADMIN_PASSWORD
    ) {
      this.setSession({ id: "0", username: credentials.username, role: "ADMIN", name: "System Administrator" });
      return true;
    }
    return false;
},
```

Method `login()` **tidak pernah dipanggil** di codebase. Login page menggunakan `fetch("/api/auth/login")` langsung. Method ini adalah sisa dari arsitektur localStorage yang lama.

**Rekomendasi:** Hapus method `login()` dari `AuthStorageService`.

### 1.3 Business Rule — Validasi End Date

Spesifikasi menyatakan:

> *"End Date must be greater than Start Date"*

Implementasi menggunakan `>=` (greater than or equal):

```typescript
// src/validators/leave-validator.ts (line 19)
.refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
```

Ini dilakukan untuk mendukung fitur half-day leave (di mana startDate = endDate). Ini adalah deviasi yang reasonable namun perlu didokumentasikan.

### 1.4 Duplicate Seed Logic

Fungsi `seedIfNeeded()` diduplikasi di dua file:
- `src/app/api/auth/login/route.ts` (line 6-21)
- `src/app/api/employees/route.ts` (line 6-21)

Kedua fungsi melakukan hal yang sama persis. Ini berisiko menyebabkan inconsistency jika salah satu diubah tanpa mengubah yang lain.

**Rekomendasi:** Extract ke satu shared utility, misalnya `src/lib/seed.ts`.

---

# 2. Security Review (OWASP)

## Status: FAIL — Severity: Critical

### 2.1 🔴 CRITICAL: Hardcoded Credentials

```typescript
// src/constants/index.ts (line 1-2)
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "admin123";
```

Password admin tersimpan dalam **plaintext** di source code. Ini adalah pelanggaran OWASP serius.

**Dampak:** Siapa saja yang memiliki akses ke repository dapat melihat kredensial admin.

**Rekomendasi:** Pindahkan ke environment variable, atau hapus mekanisme hardcoded admin fallback sepenuhnya.

### 2.2 🔴 CRITICAL: Spoofable Authorization Headers (Fake Security)

Seluruh authorization check di API routes bergantung pada **client-sent HTTP headers**:

```typescript
// src/services/leave-storage.ts (line 4-10)
function getAuthHeaders() {
  const session = AuthStorageService.getSession();
  return {
    "x-user-role": session?.role || "",
    "x-user-id": session?.id || "",
  };
}
```

```typescript
// src/app/api/leave/route.ts (line 10-11)
const roleHeader = req.headers.get("x-user-role");
const userIdHeader = req.headers.get("x-user-id");
```

**Dampak:** Attacker bisa mengirim request langsung ke API dengan header `x-user-role: ADMIN` atau `x-user-role: MANAGER` dan mendapatkan akses penuh. Ini termasuk **Broken Access Control (OWASP #1)**.

**Rekomendasi:** Implementasi **JWT token** atau **server-side session** yang diverifikasi di setiap API route. Jangan pernah percaya header yang dikirim client.

### 2.3 🔴 CRITICAL: Hardcoded Admin Bypass di Login API

```typescript
// src/app/api/auth/login/route.ts (line 35-48)
if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Bypass bcrypt comparison entirely
    return NextResponse.json({
        success: true,
        user: { ... }
    });
}
```

Login API membandingkan password secara **plaintext** untuk admin fallback, melewati bcrypt sepenuhnya. Ini adalah **Authentication Bypass**.

**Rekomendasi:** Hapus fallback ini. Gunakan hashed password yang tersimpan di database untuk semua user termasuk admin.

### 2.4 HIGH: Session di localStorage (XSS Vulnerable)

```typescript
// src/lib/storage.ts
localStorage.setItem(key, JSON.stringify(value));
```

Session auth disimpan di `localStorage`, yang rentan terhadap **Cross-Site Scripting (XSS)** attacks. Jika ada XSS vulnerability, attacker bisa mencuri session.

**Rekomendasi:** Gunakan `httpOnly` cookies untuk menyimpan session/JWT token.

### 2.5 LOW: Database Koneksi Sudah Diperbaiki ✅

```
# .env
DATABASE_URL="postgresql://neondb_owner:****@ep-xxx.neon.tech/neondb?sslmode=require"
```

Database sekarang menggunakan **Neon DB (serverless PostgreSQL)** dengan SSL dan authenticated connection yang proper.

**Rekomendasi:** Sudah diperbaiki — menggunakan Neon DB dengan SSL dan authentication yang proper.

### 2.6 MEDIUM: Tidak ada Rate Limiting

Login endpoint tidak memiliki rate limiting. Attacker bisa melakukan **brute-force** attack.

**Rekomendasi:** Implementasi rate limiting (e.g., `next-rate-limit` atau middleware custom).

### 2.7 MEDIUM: `approvedOnly` Bypasses Authorization

```typescript
// src/app/api/leave/route.ts (line 15-16)
if (approvedOnly) {
    whereClause = { status: "APPROVED" };
}
```

Saat `approvedOnly=true`, seluruh role check dilewati. Siapapun (bahkan unauthenticated request) bisa mengambil semua data leave yang approved.

**Rekomendasi:** Tetap validasi authentication sebelum memberikan data.

---

# 3. Performance Review

## Status: FAIL — Severity: High

### 3.1 HIGH: Dashboard Melakukan 5+ Redundant API Calls

```typescript
// src/app/dashboard/page.tsx (line 33-39)
const [totalEmployees, pendingLeave, approvedLeave, rejectedLeave] = await Promise.all([
    EmployeeStorageService.count(),          // GET /api/employees
    LeaveStorageService.countByStatus("PENDING"),   // GET /api/leave → filter
    LeaveStorageService.countByStatus("APPROVED"),  // GET /api/leave → filter
    LeaveStorageService.countByStatus("REJECTED"),  // GET /api/leave → filter
]);
```

`countByStatus()` memanggil `getAll()` yang memanggil `getByStatus()` → `getAll()`. Artinya **3 kali fetch ke `/api/leave`** untuk mendapatkan 3 angka yang bisa didapat dari 1 request.

**Rekomendasi:** Buat satu API endpoint `/api/leave/stats` yang mengembalikan count per status sekaligus.

### 3.2 HIGH: O(n²) Loop di FuturisticChart

```typescript
// src/components/dashboard/FuturisticChart.tsx
approvedLeaves.forEach(l => {
    const emp = employees.find(e => e.id === l.employeeId);  // O(n) setiap iterasi
    ...
});
```

Pattern `Array.find()` di dalam loop menghasilkan **O(n×m)** complexity. Dengan data besar, ini akan menjadi bottleneck.

**Rekomendasi:** Bangun lookup Map terlebih dahulu:

```typescript
const empMap = new Map(employees.map(e => [e.id, e]));
approvedLeaves.forEach(l => {
    const emp = empMap.get(l.employeeId);
    ...
});
```

### 3.3 HIGH: PrismaClient Connection Leak ✅ (Sudah Diperbaiki)

Masalah connection leak pada PrismaClient telah diperbaiki. Implementasi sekarang menggunakan singleton pattern yang benar:

```typescript
// src/lib/prisma.ts (sudah diperbaiki)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

> **Catatan:** Fix ini memastikan hanya satu instance PrismaClient yang dibuat selama hot-reload di development mode, mencegah connection pool exhaustion.

### 3.4 MEDIUM: Client-Side Search dan Filter

```typescript
// src/services/employee-storage.ts (line 88-93)
async search(query: string): Promise<Employee[]> {
    const all = await this.getAll();  // Fetch ALL employees
    const lowerQuery = query.toLowerCase();
    return all.filter(...);           // Filter di client
}
```

Semua data di-fetch, baru di-filter di client. Untuk dataset besar, ini sangat inefisien.

**Rekomendasi:** Implementasi server-side search dengan query parameter.

---

# 4. Architecture Review

## Status: FAIL — Severity: Medium

### 4.1 Separation of Concerns — Baik ✅

Layering sudah cukup baik:

```
Page (UI) → Hook (state management) → Service (API calls) → API Route → Prisma (DB)
```

### 4.2 MEDIUM: Tight Coupling — Hardcoded Department List

Department list di-hardcode di **3 lokasi berbeda**:
- `src/constants/index.ts` (line 9-15)
- `src/components/dashboard/FuturisticChart.tsx` (line 113)
- `src/app/employees/page.tsx` (filter options)

**Rekomendasi:** Gunakan satu source of truth dari `constants/index.ts` dan import di semua tempat.

### 4.3 LOW: `isAdmin` Check Inconsisten

```typescript
// src/app/employees/page.tsx
setIsAdmin(session.role === "ADMIN" || session.username === "admin");

// src/components/shared/Navbar.tsx
if (session?.role === "ADMIN" || session?.username === "admin") {
```

Check `session.username === "admin"` adalah fallback yang tidak perlu jika role sudah benar. Ini bisa menyebabkan privilege escalation jika ada user dengan username "admin" tapi role bukan ADMIN.

**Rekomendasi:** Gunakan hanya `session.role === "ADMIN"`.

---

# 5. Maintainability Review

## Status: FAIL — Severity: Medium

### 5.1 MEDIUM: FuturisticChart.tsx Terlalu Besar (676 baris)

Satu file ini mengandung:
- Data fetching logic
- 3 chart calculations
- SVG area chart rendering
- Department load bars
- Concentric radar rings
- Console log output
- Multiple interactive hover states

**Rekomendasi:** Pecah menjadi sub-components:
- `AreaSpectrogram.tsx`
- `SectorLoadBars.tsx`
- `ClearanceRadar.tsx`
- `DiagnosticsConsole.tsx`

### 5.2 MEDIUM: Magic Numbers

```typescript
// FuturisticChart.tsx
const width = 600;
const height = 240;
const paddingLeft = 40;
// ...
strokeDasharray="440"   // Apa artinya 440?
strokeDashoffset={440 - (440 * ...)}
// r="70", r="52", r="34" — Mengapa angka-angka ini?
```

**Rekomendasi:** Extract ke named constants dengan penjelasan.

### 5.3 LOW: Duplicate Decorative Pattern

Setiap page file mengulang pattern yang sama:

```tsx
<CircuitBackground />
<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 ..." />
<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 ..." />
<Navbar />
```

**Rekomendasi:** Buat `PageLayout` wrapper component.

---

# 6. Type Safety Review

## Status: FAIL — Severity: Medium

### 6.1 MEDIUM: Penggunaan `any` Type

| File | Line | Usage |
|------|------|-------|
| `dashboard/page.tsx` | 17 | `useState<any>(null)` untuk session |
| `leave/page.tsx` | 28 | `useState<any>(null)` untuk userSession |
| `api/employees/route.ts` | 77 | `role: role as any` |
| Semua API routes | catch blocks | `error: any` |
| `leave-storage.ts` | 12 | `mapDbRequestToFrontend(req: any)` |

**Rekomendasi:**
- Gunakan `AuthSession` type untuk session state
- Gunakan `unknown` dan type narrowing untuk errors
- Gunakan proper Prisma types untuk DB responses

### 6.2 LOW: Inconsistent Type — `LeaveRequest.durationType`

```typescript
// src/types/leave.ts
durationType?: string;  // Optional dan string

// src/validators/leave-validator.ts
durationType: z.enum(["FULL", "HALF"]),  // Required enum
```

Type definition dan validator tidak konsisten.

**Rekomendasi:** Buat `DurationType` enum/union dan gunakan di kedua tempat.

---

# 7. Error Handling Review

## Status: FAIL — Severity: Medium

### 7.1 MEDIUM: Generic Error Messages dari API

Semua API routes mengembalikan pesan yang sama saat error:

```typescript
return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
```

User tidak mendapat informasi yang berguna untuk troubleshooting.

**Rekomendasi:** Kembalikan error code yang spesifik (tanpa expose stack trace):

```typescript
return NextResponse.json({
    error: "LEAVE_CREATE_FAILED",
    message: "Unable to create leave request. Please try again."
}, { status: 500 });
```

### 7.2 MEDIUM: Error Silently Swallowed

```typescript
// src/services/employee-storage.ts
async getAll(): Promise<Employee[]> {
    try { ... }
    catch (error) {
        console.error("...", error);
        return [];  // Mengembalikan array kosong seolah tidak ada data
    }
}
```

Saat API gagal, service mengembalikan array kosong. UI akan menampilkan "no data" tanpa indikasi bahwa terjadi error.

**Rekomendasi:** Throw error atau return result type `{ data: T[], error?: string }`.

### 7.3 LOW: Tidak ada Retry Mechanism

Tidak ada retry untuk API calls yang gagal karena network issue.

---

# 8. Validation Review

## Status: FAIL — Severity: High

### 8.1 HIGH: Tidak Ada Server-Side Date Validation

```typescript
// src/app/api/leave/route.ts (line 80-81)
if (!startDate || !endDate || !reason) {
    return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
}
// Tidak ada validasi: apakah endDate >= startDate?
// Tidak ada validasi: apakah tanggal valid?
// Tidak ada validasi: apakah tanggal di masa depan?
```

Server hanya memeriksa apakah field ada, tidak memvalidasi nilainya.

**Rekomendasi:** Tambahkan validasi server-side:

```typescript
const start = new Date(startDate);
const end = new Date(endDate);
if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
}
if (end < start) {
    return NextResponse.json({ error: "End date cannot be before start date." }, { status: 400 });
}
```

### 8.2 HIGH: Password Optional saat Create Employee

```typescript
// src/validators/employee-validator.ts (line 14)
password: z.string().optional(),
```

Password bersifat optional di validator, namun API mengharuskannya. Ini bisa menyebabkan form submit tanpa password dan gagal di server.

**Rekomendasi:** Buat dua schema: `createEmployeeSchema` (password required) dan `updateEmployeeSchema` (password optional).

### 8.3 MEDIUM: Tidak Ada Validasi Duplicate Leave Request

User bisa mengajukan leave request untuk tanggal yang sama berulang kali tanpa warning.

**Rekomendasi:** Check overlapping dates sebelum create.

---

# 9. UI/UX Review

## Status: PASS — Severity: Low

### 9.1 Consistency ✅

- Theme cyber-neon konsisten di seluruh halaman
- Penggunaan warna, font mono, dan gradient seragam
- Component styling konsisten (cards, tables, buttons)

### 9.2 Feedback ✅

- Loading spinner saat data dimuat
- Toast notification untuk success dan error
- Confirmation dialog untuk aksi destructive (delete, logout, approve/reject)
- Button disabled state saat submitting

### 9.3 Navigation ✅

- Navbar responsif dengan mobile drawer
- Active state pada nav items
- Logo clickable kembali ke dashboard

### 9.4 LOW: Contrast Issue

Beberapa teks menggunakan `text-slate-500` atau `text-slate-600` pada background gelap, yang mungkin sulit dibaca.

**Rekomendasi:** Pastikan contrast ratio memenuhi WCAG AA (minimal 4.5:1).

---

# 10. Accessibility Review (A11Y)

## Status: FAIL — Severity: Medium

### 10.1 MEDIUM: Missing ARIA Labels pada Filter Selects

```html
<!-- src/app/employees/page.tsx -->
<select value={selectedDepartment} onChange={...}>
```

`<select>` elements tidak memiliki `aria-label` atau associated `<label>`.

**Rekomendasi:** Tambahkan `aria-label`:

```html
<select aria-label="Filter by department" ...>
```

### 10.2 LOW: Semantic HTML

- ✅ Menggunakan `<button>`, `<form>`, `<table>` semantik
- ✅ `<header>` untuk navbar
- ✅ `<main>` untuk content area
- ✅ `<nav>` untuk navigation links
- ⚠️ SheetTitle menggunakan `sr-only` — baik untuk screen readers

### 10.3 LOW: Keyboard Navigation

- ✅ Form elements navigable via Tab
- ⚠️ Custom CyberDatePicker mungkin tidak fully keyboard accessible

---

# 11. Dependency Review

## Status: FAIL — Severity: Low

### 11.1 LOW: Unused Dependencies

| Package | Status |
|---------|--------|
| `uuid` | Tidak digunakan — Prisma menggunakan `cuid()` untuk ID generation |
| `next-themes` | Tidak digunakan — tema dark di-hardcode langsung |

**Rekomendasi:** Hapus dari `package.json`:

```bash
npm uninstall uuid next-themes @types/uuid
```

### 11.2 LOW: Dependency Audit

Jalankan `npm audit` secara berkala untuk memeriksa known vulnerabilities.

---

# 12. Logging & Observability

## Status: FAIL — Severity: High

### 12.1 HIGH: Tidak Ada Audit Trail

Aksi approve/reject leave request tidak memiliki audit log:

```typescript
// src/app/api/leave/[id]/route.ts
// Tidak ada logging: siapa yang approve, kapan, dari status apa ke apa
const updatedRequest = await prisma.leaveRequest.update({ ... });
```

**Rekomendasi:** Buat tabel audit log atau minimal log structured:

```typescript
console.log(JSON.stringify({
    event: "LEAVE_STATUS_CHANGED",
    leaveId: id,
    changedBy: userIdHeader,
    fromStatus: existingRequest.status,
    toStatus: status,
    timestamp: new Date().toISOString()
}));
```

### 12.2 MEDIUM: Hanya `console.error`

Seluruh error handling menggunakan `console.error` tanpa structured format. Sulit untuk monitoring dan alerting di production.

**Rekomendasi:** Gunakan structured logging library (e.g., `pino`, `winston`).

### 12.3 LOW: Sensitive Data Logging Risk

```typescript
console.error("Login error:", error);
```

Error object mungkin berisi informasi sensitif. Pastikan password dan token tidak pernah masuk ke log.

---

# 13. AI Generated Code Review

## Status: FAIL — Severity: Medium

### 13.1 MEDIUM: Dead Code

| Dead Code | File | Alasan |
|-----------|------|--------|
| `AuthStorageService.login()` | `auth-storage.ts` | Tidak pernah dipanggil, login menggunakan API |
| `STORAGE_KEY_EMPLOYEES` constant | `constants/index.ts` | Data employees tidak lagi di localStorage |
| `STORAGE_KEY_LEAVE_REQUESTS` constant | `constants/index.ts` | Data leave tidak lagi di localStorage |
| `UserPlus` import | `Navbar.tsx` | Imported tapi tidak digunakan |

**Rekomendasi:** Hapus semua dead code.

### 13.2 MEDIUM: Fake Security

Mekanisme auth header yang dikirim dari client memberikan **ilusi keamanan** yang tidak efektif. Seolah-olah ada authorization, namun siapapun bisa mengirim header arbitrary.

### 13.3 MEDIUM: Over-Engineering

`FuturisticChart.tsx` (676 baris) dengan SVG custom, radar rings, dan console log output terlalu kompleks untuk sebuah leave management dashboard. Ini tipikal AI-generated code yang over-elaborate.

### 13.4 LOW: Duplicate Logic

- Seed function diduplikasi di 2 file API
- `getAuthHeaders()` diduplikasi di `employee-storage.ts` dan `leave-storage.ts`
- Department list di-hardcode di 3 lokasi

**Rekomendasi:** Extract ke shared utilities.

---

# Final Recommendation

## 🔶 REQUEST CHANGES

Aplikasi ini memiliki UI/UX yang sangat baik dan arsitektur layering yang reasonable, namun terdapat **isu keamanan kritikal** yang harus diperbaiki sebelum production:

1. **Hardcoded credentials** di source code
2. **Spoofable authorization** via client-side headers
3. **Admin bypass** yang mengabaikan password hashing

Isu-isu ini dikategorikan sebagai **Release Blocker**.

---

## Total Findings

| Severity | Count |
| -------- | ----- |
| Critical | 3     |
| High     | 6     |
| Medium   | 11    |
| Low      | 8     |

---

## Conclusion

Aplikasi Employee Leave Management System memiliki **fondasi arsitektur yang baik** dengan separation of concerns yang jelas melalui pattern Page → Hook → Service → API → Database. UI/UX juga sangat premium dengan tema cyber-neon yang konsisten.

Namun, terdapat **3 temuan Critical** pada area security yang merupakan **release blocker**:
1. Hardcoded plaintext credentials di source code
2. Client-side authorization headers yang bisa di-spoof
3. Admin login bypass tanpa password hashing

Selain itu, terdapat **6 temuan High** yang harus diperbaiki sebelum production, terutama pada area performance (redundant API calls, connection leak) dan validation (tidak ada server-side date validation).

**Keputusan: REQUEST CHANGES** — Perbaiki seluruh temuan Critical dan High sebelum release.

---

# Appendix: Database Migration Log

## Migration: MySQL → Neon DB (Serverless PostgreSQL)

| Item | Before | After |
|------|--------|-------|
| Database | MySQL (localhost) | Neon DB (Serverless PostgreSQL) |
| Provider | `mysql` | `postgresql` |
| Connection | `mysql://root:@localhost:3306/employee_leave_system` | `postgresql://neondb_owner:****@ep-rapid-snow-aoi7eye9-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| Authentication | Root tanpa password | Authenticated user dengan SSL |
| Hosting | Local | Cloud (AWS ap-southeast-1) |
| Connection Pooling | None | Neon Pooler |
| Prisma Singleton | ❌ Bug (connection leak) | ✅ Fixed (proper singleton pattern) |
| Seed Script | Inline di API routes | Dedicated `prisma/seed.ts` |

### Files Changed
- `prisma/schema.prisma` — Provider diubah dari `mysql` ke `postgresql`
- `src/lib/prisma.ts` — Singleton pattern diperbaiki
- `prisma/seed.ts` — Seed script baru untuk admin user
- `.env` — Connection string diupdate ke Neon DB
- `package.json` — Ditambah script `seed` dan konfigurasi prisma seed
