<div align="center">

# Simplify 💸
### *Split bills. Not friendships.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-simplify--eight--neon.vercel.app-FF4F79?style=for-the-badge&logo=vercel&logoColor=white)](https://simplify-eight-neon.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-ArjunHirani%2Fsimplify-181717?style=for-the-badge&logo=github)](https://github.com/ArjunHirani/simplify)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)

A **production-grade**, full-stack expense-sharing platform inspired by Splitwise — rebuilt from scratch with a premium dark UI, real-time balance calculations, and scalable architecture.

![Dashboard Preview](https://simplify-eight-neon.vercel.app/dashboard-preview.png)


</div>

---

## 🚀 Live Demo

**👉 [simplify-eight-neon.vercel.app](https://simplify-eight-neon.vercel.app)**

| Credential | Value |
|---|---|
| Email | `arjun@example.com` |
| Password | `password123` |

---

## ✨ Features

### Core
- 🔐 **Authentication** — Email/password with JWT, HTTP-only cookies, bcrypt hashing, forgot/reset password flow
- 👥 **Groups** — Create groups, invite members by email, per-group expense tracking
- 💰 **Expense Splitting** — Equal, exact amount, and percentage-based splits with member selection
- 🤝 **Friends System** — Send/accept friend requests, per-friend balance tracking
- ✅ **Settlements** — Record payments via UPI, cash, card, or bank transfer with instant balance recalculation
- 📊 **Real-time Balances** — "Who owes whom" calculated dynamically from expense and settlement history
- 🔔 **Notifications** — In-app notification system with unread badge counter
- 🕐 **Activity Feed** — Unified timeline of expenses and settlements with filter tabs

### Technical
- ⚡ **Server-side protected routes** — Next.js proxy middleware blocks unauthenticated access
- 🗄️ **Full relational DB** — 8 tables with proper foreign keys, cascading deletes, and unique constraints
- 🔄 **Smart debt simplification** — Algorithm minimizes number of transactions within groups
- 📱 **Mobile-first responsive** — Sidebar on desktop, bottom navigation on mobile
- 🦴 **Skeleton loaders** — Every data-fetching screen has proper loading states
- 🛡️ **API security** — All routes return 401 without valid JWT cookie

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, TypeScript) |
| **Styling** | Inline styles with CSS-in-JS, custom design system |
| **State Management** | Zustand with localStorage persistence |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Prisma 5 |
| **Auth** | JWT + bcrypt, HTTP-only cookies |
| **Deployment** | Vercel (frontend) + Neon (database) |
| **Fonts** | Syne (display) + DM Sans (body) |

---

## 🏗️ Architecture

```
simplify/
├── app/
│   ├── (auth)/                 # Login, Register, Forgot/Reset Password
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (app)/                  # Protected app pages
│   │   ├── dashboard/page.tsx
│   │   ├── groups/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx   # Dynamic group detail
│   │   ├── friends/page.tsx
│   │   ├── activity/page.tsx
│   │   └── settings/page.tsx
│   └── api/                    # REST API routes
│       ├── auth/               # login, register, logout, forgot/reset password
│       ├── groups/             # CRUD + member management
│       ├── expenses/           # Add expense with split logic
│       ├── friends/            # Friend requests + balance calculation
│       ├── settlements/        # Record payments
│       ├── activity/           # Unified timeline
│       ├── dashboard/          # Summary stats
│       └── notifications/      # Notification system
├── components/
│   ├── layout/                 # Sidebar, Topbar, BottomNav, NotificationsDropdown
│   └── settlements/            # SettleUpModal
├── hooks/                      # useDashboard, useAuth, useHydrated
├── lib/                        # db.ts (Prisma), debtSimplification.ts
├── prisma/
│   ├── schema.prisma           # 8-table relational schema
│   ├── migrations/             # Version-controlled DB migrations
│   └── seed.ts                 # Test data seeder
├── store/                      # Zustand auth store
└── types/                      # TypeScript interfaces
```

---

## 🗃️ Database Schema

```prisma
User          → GroupMember (many-to-many through groups)
Group         → Expense (one-to-many)
Expense       → ExpenseParticipant (one-to-many, stores split amounts)
User          → Settlement (payer/receiver)
User          → Friendship (sender/receiver with status)
User          → Notification
User          → PasswordResetToken
```

**Key design decisions:**
- `ExpenseParticipant` stores both `owedAmount` and `paidAmount` separately — enables tracking partial payments
- Balances are **calculated dynamically** at query time, not stored — prevents stale data
- `PasswordResetToken` expires after 15 minutes and is deleted on use — prevents replay attacks

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (local) or Neon account (free)

### Setup

```bash
# Clone
git clone https://github.com/ArjunHirani/simplify.git
cd simplify

# Install dependencies
npm install

# Environment variables
cp .env.example .env.local
# Fill in DATABASE_URL and JWT_SECRET
```

### `.env.local`
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/simplify"
JWT_SECRET="your_secret_key_minimum_32_characters_long"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database
```bash
# Run migrations
npx prisma migrate dev --name init

# Seed test data
npm run db:seed

# Open DB GUI
npm run db:studio
```

### Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Test credentials:** `arjun@example.com` / `password123`

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with test data |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run db:reset` | Reset and re-migrate database |

---

## 🚀 Deployment

This project is deployed on **Vercel** with **Neon** as the serverless PostgreSQL provider.

### Deploy your own

1. Fork this repo
2. Create a free [Neon](https://neon.tech) database
3. Import to [Vercel](https://vercel.com) and set environment variables:
   - `DATABASE_URL` — Neon connection string
   - `JWT_SECRET` — any 32+ character random string
   - `NEXT_PUBLIC_APP_URL` — your Vercel URL
4. Run migrations: `npx prisma migrate deploy`
5. Seed data: `npm run db:seed`

---

## 🎯 Key Engineering Decisions

**Why Next.js App Router?**
Server components for initial data fetching, client components only where interactivity is needed. API routes co-located with the frontend eliminates the need for a separate backend server.

**Why Zustand over Redux?**
Minimal boilerplate, built-in persistence middleware for auth state, and simple devtools. Auth state persists across refreshes via localStorage with hydration handling to prevent flicker.

**Why calculate balances dynamically?**
Storing pre-calculated balances creates consistency issues when expenses are added or deleted. Calculating at query time with efficient Prisma queries ensures accuracy at the cost of slightly more compute — the right trade-off for this scale.

**Why HTTP-only cookies for JWT?**
XSS attacks cannot steal cookies that JavaScript cannot read. This is more secure than localStorage-based token storage, which is the most common vulnerability in auth implementations.

**Why Neon for production?**
Serverless Postgres that scales to zero — zero cost when inactive, instant cold starts, and native Prisma support. Perfect for portfolio projects that need real infrastructure.

---

## 📸 Screenshots

| Dashboard | Group Detail | Add Expense |
|---|---|---|
| Real-time balance summary | Per-member debt breakdown | Member selection + split types |

| Friends | Settle Up | Notifications |
|---|---|---|
| Balance tracking | UPI/Cash/Card payment | Real-time unread count |

---

## 👤 Author

**Arjun Hirani**
- GitHub: [@ArjunHirani](https://github.com/ArjunHirani)
- Live: [simplify-eight-neon.vercel.app](https://simplify-eight-neon.vercel.app)

---

## 📄 License

MIT — feel free to use this project as a reference or starting point.

---

<div align="center">
  <sub>Built with ❤️ as a portfolio project · Not affiliated with Splitwise</sub>
</div>
