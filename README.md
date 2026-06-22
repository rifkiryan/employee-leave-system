# 🏢 Employee Leave Management System

> Sistem manajemen cuti karyawan berbasis web dengan tema **Modern Futuristic / Cyberpunk**, dibangun menggunakan Next.js, Prisma ORM, dan Neon DB (Serverless PostgreSQL).

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_DB-green?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss)

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Kredensial Login](#-kredensial-login)
- [Struktur Project](#-struktur-project)
- [Database](#-database)
- [Code Review](#-code-review)
- [Screenshots](#-screenshots)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔐 **Authentication** | Login dengan role-based access (Admin, Manager, Employee) |
| 👥 **Manajemen Karyawan** | CRUD karyawan dengan departemen dan posisi |
| 📝 **Pengajuan Cuti** | Form pengajuan cuti dengan validasi tanggal dan jenis durasi (Full/Half Day) |
| ✅ **Approval Workflow** | Manager dapat approve/reject cuti karyawan di departemennya |
| 📊 **Dashboard Analytics** | Statistik real-time dengan chart interaktif (Spectrogram, Sector Load, Radar Telemetry) |
| 🔍 **Code Review Page** | Halaman dedicated untuk laporan code review lengkap |
| 🎨 **Cyberpunk UI** | Tema futuristik dengan PCB circuit animation, glassmorphism, dan neon effects |

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | TailwindCSS 4, Shadcn UI, Custom CSS Animations |
| **Backend** | Next.js API Routes (REST) |
| **Database** | Neon DB (Serverless PostgreSQL) |
| **ORM** | Prisma 5.22 |
| **Auth** | bcryptjs (password hashing) |
| **Validation** | Zod, React Hook Form |
| **UI Components** | Lucide Icons, Sonner (Toast), Custom SVG Charts |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- Akun **[Neon DB](https://neon.tech)** (gratis)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/rifkiryan/employee-leave-system.git
cd employee-leave-system

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env dan masukkan DATABASE_URL dari Neon DB Console

# 4. Generate Prisma Client
npx prisma generate

# 5. Push schema ke database
npx prisma db push

# 6. Seed admin user
npm run seed

# 7. Jalankan development server
npm run dev
```

Buka **http://localhost:3000** di browser.

---

## 🔑 Kredensial Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

> **Note:** Jalankan `npm run seed` untuk membuat akun admin di database.

---

## 📁 Struktur Project

```
employee-leave-system/
├── prisma/
│   ├── schema.prisma          # Database schema (PostgreSQL)
│   └── seed.ts                # Seed script untuk admin user
├── src/
│   ├── app/
│   │   ├── api/               # REST API Routes
│   │   │   ├── auth/login/    # Authentication endpoint
│   │   │   ├── employees/     # Employee CRUD
│   │   │   └── leave/         # Leave request CRUD
│   │   ├── code-review/       # Code review report page
│   │   ├── dashboard/         # Dashboard dengan analytics
│   │   ├── employees/         # Employee management page
│   │   ├── leave/             # Leave request page
│   │   └── login/             # Login page
│   ├── components/
│   │   ├── dashboard/         # StatCard, FuturisticChart
│   │   ├── employee/          # EmployeeTable, EmployeeForm
│   │   ├── leave/             # LeaveRequestTable, LeaveRequestForm
│   │   ├── shared/            # Navbar, CircuitBackground
│   │   └── ui/                # Shadcn UI components
│   ├── constants/             # App constants
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Prisma client, utilities
│   ├── services/              # API service layer
│   ├── types/                 # TypeScript type definitions
│   └── validators/            # Zod validation schemas
├── CODE_REVIEW_REPORT.md      # Laporan code review lengkap
├── implementation_report.md   # Laporan implementasi & redesign
└── package.json
```

---

## 🗄 Database

### Neon DB (Serverless PostgreSQL)

Project ini menggunakan **Neon DB** sebagai database cloud dengan fitur:
- ⚡ **Serverless** — auto-scaling, pay-per-use
- 🔒 **SSL Encryption** — koneksi terenkripsi
- 🌏 **Cloud Hosted** — AWS ap-southeast-1
- 🔄 **Connection Pooling** — via Neon Pooler

### Schema

```prisma
model User {
  id            String          @id @default(cuid())
  username      String          @unique
  password      String          // bcrypt hashed
  role          Role            @default(EMPLOYEE)
  name          String
  department    String?
  position      String?
  leaveRequests LeaveRequest[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model LeaveRequest {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(...)
  startDate    DateTime
  endDate      DateTime
  reason       String
  status       String   @default("PENDING")
  durationType String   @default("FULL")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Seed Database

```bash
npm run seed
# atau
npx prisma db seed
```

---

## 📝 Code Review

Laporan code review lengkap tersedia di:
- 📄 **File:** [`CODE_REVIEW_REPORT.md`](./CODE_REVIEW_REPORT.md)
- 🌐 **Web:** Halaman `/code-review` di aplikasi

### Ringkasan Temuan

| Severity | Jumlah |
|----------|--------|
| 🔴 Critical | 3 |
| 🟠 High | 4 |
| 🔵 Medium | 11 |
| 🟢 Low | 10 |

**Keputusan:** REQUEST CHANGES — Perbaiki seluruh temuan Critical dan High sebelum release.

---

## 📸 Screenshots

### Login Page
Halaman login dengan tema cyberpunk, rotating RGB border effect, dan PCB circuit animation background.

### Dashboard
Dashboard analytics dengan stat cards, spectrogram chart, sector load bars, dan radar telemetry.

### Employee Management
Tabel karyawan dengan fitur CRUD, search, dan filter departemen.

### Leave Request
Halaman pengajuan dan manajemen cuti dengan approval workflow.

### Code Review
Halaman interaktif yang menampilkan hasil code review dengan severity badges dan expandable findings.

---

## 📄 License

This project is for training purposes only.

---

## 👤 Author

**Rifki Ryan**

- GitHub: [@rifkiryan](https://github.com/rifkiryan)
