# 🪙 Money Manager — Precision-Engineered Personal Finance

A production-ready, fullstack personal finance tracker designed for tracking balances, cash flow, multi-account ledgers, and monthly budget limits with bank-grade security.

Built with **Next.js 16** (App Router & Turbopack), **NestJS 11**, **Prisma ORM 6**, and **PostgreSQL 16**.

---

## 🌟 Key Features & Implemented Functionalities

### 1. 📧 Real Email Verification for Registered Accounts
- **Strict Verification Gate**: Entering an email does not grant access. Users cannot access dashboard routes (`/`, `/accounts`, etc.) or protected APIs until their email address is verified via a 6-digit OTP code or direct token link.
- **Unverified Access Protection**:
  - **API Level**: Login attempts with unverified emails are blocked with HTTP `403 Forbidden` (`EMAIL_NOT_VERIFIED`).
  - **JWT Guard**: Tokens for unverified users are rejected by `JwtStrategy`.
  - **Frontend Route Guard**: `AuthGuard` redirects any unverified session immediately to `/verify-email`.
- **Expired & Replay Protection**: Verification codes expire automatically after 15 minutes. Once used, tokens are flagged `isUsed: true` and cannot be replayed.
- **Resend Support with Cooldown**: Users can request a fresh code anytime with a 60-second spam-prevention cooldown timer.
- **Email Validation & Typo Detection**: Validates RFC email syntax, blocks 80+ burner email providers, and detects common typos (e.g., `gmial.com` &rarr; `gmail.com`).

### 2. ⚡ Instant Demo — Local Account (Zero Setup)
- **Instant 1-Click Access**: "⚡ Jump in with Instant Demo" takes users immediately to a fresh, clean dashboard without registration or email verification.
- **Strict Client-Side Isolation**: Demo data is stored **exclusively in the browser's LocalStorage** (`mm_demo_*`).
- **No Server Pollution**: Demo accounts never communicate with or contaminate the backend PostgreSQL database.
- **Full Offline Usability**: Demo accounts can create accounts, record transactions, and set budgets entirely client-side.

### 3. 🧼 Clean Slate Guarantee (Completely Removed Mock & Seed Data)
- **Zero Preloaded / Placeholder Records**: Starts with 0 accounts, 0 transactions, 0 budgets, and 0 placeholder balances.
- **No Fabricated Chart Data**: Dashboard metrics, cash flow trends, and category breakdowns reflect real user-created data only.
- **Actionable Empty States**: Every screen features helpful onboarding states (e.g., *"Create your first account"*, *"Add your first transaction"*, *"Set your first budget"*).
- **Default Category Palettes**: Clean standard categories (Salary, Housing, Groceries, Dining, etc.) are available with zero balances so dropdowns work out of the box.

### 4. 🏷️ Clear Account-Type Indicators
Users can always identify their active mode:
- **`Local Account` (Amber Badge)**: Displayed prominently in the top Header, Profile Dropdown, Sidebar, and Settings. Clearly states: *"Stored only in this browser (LocalStorage). Independent from server."*
- **`Verified Account` (Emerald Badge)**: Displayed for authenticated users with confirmed email addresses. Clearly states: *"Email verified. Ledgers synchronized to cloud database."*
- **Settings Account & Storage Card**: The Settings page displays active storage engine, email verification status, and offers a 1-click path to upgrade from Instant Demo to a Verified Cloud Account.

### 5. 📊 Financial Cockpit & Dashboard Analytics
- **Live Net Worth & Balances**: Unified real-time aggregation across all active cash, bank, and mobile wallet accounts.
- **Monthly Cash Flow Metrics**: Tracks Total Income, Total Expenses, Net Savings, and Month-over-Month % change.
- **Dynamic Cash Flow Trend**: 6-month visual trajectory of income vs. expenditures.
- **Category Spending Breakdown**: Visual distribution of monthly expenses with color-coded progress indicators.

### 6. 💳 Multi-Account Ledger & Atomic Transfers
- **Supported Account Types**: Cash, Bank Account, Mobile Wallet (bKash/Nagad), Credit Card, and Savings.
- **Multi-Currency Support**: Native handling for BDT (৳), USD ($), EUR (€), and GBP (£).
- **Atomic Transfers**: PostgreSQL transactions (`prisma.$transaction`) ensure source and destination balances remain mathematically synchronized.
- **Archiving & Ledger Safety**: Soft-archive accounts to maintain financial historical integrity. Restrictive foreign key safeguards prevent deleting accounts tied to active transactions.

### 7. 🎯 Category Budgets & Spending Caps
- **Monthly Spending Limits**: Set monthly monetary limits per expense category.
- **Live Spending Aggregation**: Dynamic tracking of spent amounts vs. allocated budget limits with visual percentage badges.
- **Overspending Alerts**: Visual warnings when categories approach or exceed spending limits.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16.4.3 (App Router, Turbopack), React 19, Tailwind CSS v4, Base UI, Lucide Icons, Recharts, date-fns |
| **Backend** | NestJS 11, TypeScript, Passport.js, JWT, bcrypt, class-validator, class-transformer |
| **Database & ORM** | PostgreSQL 16 (Alpine), Prisma ORM 6.4 |
| **API Docs & Testing** | Swagger / OpenAPI 3.0, Jest (35 backend unit tests), Node Test Runner (13 frontend unit tests) |

---

## 🚀 Step-by-Step Local Setup Guide

Both servers (Backend and Frontend) can be run concurrently in separate terminal windows.

### Prerequisites
- **Node.js**: v20 or higher (`node -v`)
- **Docker**: For running PostgreSQL (`docker --version`)

---

### Step 1: Start the PostgreSQL Database

Run PostgreSQL in a background Docker container with a single command:

```bash
sudo docker run -d --name money-manager-db \
  -e POSTGRES_USER=moneymanager \
  -e POSTGRES_PASSWORD=manager_secret_pass \
  -e POSTGRES_DB=moneymanager_dev \
  -p 5432:5432 \
  postgres:16-alpine
```

*(If the container is already created, restart it anytime with `sudo docker start money-manager-db`)*

---

### Step 2: Start the Backend Server (Terminal 1)

1. **Navigate to the backend directory**:
   ```bash
   cd /home/echologyx/Documents/money-manager/backend
   ```

2. **Sync the Prisma schema with PostgreSQL**:
   ```bash
   npx prisma db push
   ```

3. **(Optional) Seed default categories & demo account**:
   ```bash
   npx prisma db seed
   ```

4. **Start the NestJS development server**:
   ```bash
   npm run start:dev
   ```

The backend is now live:
- **API Base URL**: `http://localhost:4000/api/v1`
- **Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Health Check**: `http://localhost:4000/api/v1/health`

---

### Step 3: Start the Frontend Server (Terminal 2)

1. **Open a new terminal tab in the root project directory**:
   ```bash
   cd /home/echologyx/Documents/money-manager
   ```

2. **Start the Next.js development server**:
   ```bash
   npm run dev
   ```

3. **Open the application**:
   - Web App: [http://localhost:3000](http://localhost:3000)
   - Sign In: [http://localhost:3000/login](http://localhost:3000/login)
   - Register: [http://localhost:3000/register](http://localhost:3000/register)
   - Verify Email: [http://localhost:3000/verify-email](http://localhost:3000/verify-email)

---

## 🔑 Account Types & Access Options

| Account Type | Access Flow | Data Storage | Identification |
| :--- | :--- | :--- | :--- |
| **Instant Demo (Local Account)** | Click *"⚡ Jump in with Instant Demo"* on Login or Register | Browser LocalStorage (`mm_demo_*`) | `Local Account` (Amber Badge) |
| **Verified Account (Cloud)** | Register with email & password &rarr; Enter 6-digit OTP code at `/verify-email` | PostgreSQL Database (Cloud Synchronized) | `Verified Account` (Emerald Badge) |
| **Seeded Cloud Account** | `demo@moneymanager.local` / `DemoPassword123!` (Pre-verified) | PostgreSQL Database | `Verified Account` (Emerald Badge) |

---

## 📁 Project Structure

```
money-manager/
├── backend/                              # NestJS Backend Application
│   ├── prisma/
│   │   ├── schema.prisma                 # PostgreSQL Schema (User, EmailVerification, Account, etc.)
│   │   └── seed.ts                       # Database Seeder
│   ├── src/
│   │   ├── database/                     # Prisma Service & Connection Lifecycle
│   │   ├── modules/
│   │   │   ├── auth/                     # JWT Auth, Email Verification, Password Hashing
│   │   │   │   ├── dto/                  # verify-email.dto.ts, resend-verification.dto.ts
│   │   │   │   └── auth.service.spec.ts  # 8 Auth Unit Tests
│   │   │   ├── users/                    # Profile Management & Savings Targets
│   │   │   ├── accounts/                 # Multi-Account CRUD & Balance Constraints
│   │   │   ├── categories/               # Income/Expense Categories & Icons
│   │   │   ├── transactions/             # Double-Entry Atomic Ledger Engine
│   │   │   ├── budgets/                  # Category Limits & Actual Aggregation
│   │   │   ├── dashboard/                # Analytics, Trends & Net Worth Aggregation
│   │   │   └── health/                   # Liveness / Readiness Probes
│   │   └── main.ts                       # Application Bootstrap, Swagger, CORS, Cookie Parser
│   ├── package.json
│   └── tsconfig.json
│
├── src/                                  # Next.js 16 Frontend Application
│   ├── app/                              # App Router Pages
│   │   ├── (auth)/                       # Authentication Route Group
│   │   │   ├── login/page.tsx            # Sign In with Instant Demo & Unverified Redirect
│   │   │   ├── register/page.tsx         # Register with Strong Password Helper
│   │   │   ├── verify-email/page.tsx     # 6-Digit OTP Verification Page
│   │   │   └── layout.tsx                # Centered Card Layout & Auth Guard
│   │   ├── (dashboard)/                  # Protected Dashboard Route Group
│   │   │   ├── page.tsx                  # Clean Overview & Cash Flow Analytics
│   │   │   ├── accounts/page.tsx         # Clean Accounts Management & Empty States
│   │   │   ├── transactions/page.tsx     # Clean Transaction History & Empty States
│   │   │   ├── budgets/page.tsx          # Clean Monthly Category Budgets
│   │   │   ├── categories/page.tsx       # Category Manager & Icon Selectors
│   │   │   ├── settings/page.tsx         # Currency, Profile & Account Status Card
│   │   │   └── layout.tsx                # Dashboard Layout with Sidebar & Header
│   │   ├── layout.tsx                    # Root Layout with Fonts & Providers
│   │   └── globals.css                   # Tailwind CSS v4 Theme Variables
│   ├── components/                       # Shared UI Components (Buttons, Dialogs, Cards, Badges)
│   │   ├── auth/AuthGuard.tsx            # Unverified & Unauthenticated Route Interceptor
│   │   └── layout/                       # Header & Sidebar with Account Type Indicators
│   ├── features/                         # Feature-Driven State, Hooks & Utilities
│   │   ├── auth/                         # AuthContext, API, Types & Unit Tests
│   │   ├── accounts/                     # Clean Accounts Context & Hooks
│   │   ├── transactions/                 # Clean Transactions Context & Forms
│   │   ├── budgets/                      # Clean Budgets Context & Progress Math
│   │   ├── dashboard/                    # Chart Cards with Clean Empty States
│   │   └── settings/                     # Profile, Preferences & AccountStatusCard
│   └── lib/                              # storage-adapter.ts, API Client, Formatters
│
├── README.md                             # Project Documentation & Readiness Guide
└── package.json                          # Frontend Dependencies & Scripts
```

---

## 🧪 Testing & Quality Assurance

### Run Frontend Unit Tests
```bash
npm test
```
*Executes 9 unit tests covering storage key isolation, Instant Demo independence, strong password validation, 6-digit OTP code validation, and account badge indicators.*

### Run Frontend Type Checks
```bash
npx tsc --noEmit
```
*Ensures zero TypeScript errors across all routes, components, and hooks.*

### Run Backend Unit Tests
```bash
cd backend
npm test
```
*Executes all 35 unit tests across 8 test suites covering Auth (email verification, expiration, unverified blocks), Accounts, Transactions, Budgets, Categories, Dashboard, Users, and Health.*

### Build Backend for Production
```bash
cd backend
npm run build
```

---

## 🌐 API Endpoints Overview

All endpoints are prefixed with `/api/v1` and documented in Swagger at `http://localhost:4000/api/docs`:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new account & generate verification code | No |
| `POST` | `/auth/verify-email` | Verify email with 6-digit code or direct token | No |
| `POST` | `/auth/resend-verification` | Resend fresh 6-digit verification code | No |
| `POST` | `/auth/login` | Authenticate user (blocks unverified with 403) | No |
| `POST` | `/auth/refresh` | Rotate expired access token using refresh token | No |
| `POST` | `/auth/logout` | Revoke active refresh token | Yes (Bearer) |
| `GET` | `/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| `GET` | `/accounts` | Retrieve active accounts & calculated balances | Yes (Bearer) |
| `POST` | `/accounts` | Create new bank, cash, or mobile wallet account | Yes (Bearer) |
| `GET` | `/transactions` | List filtered transactions by month, type, or account | Yes (Bearer) |
| `POST` | `/transactions` | Record income, expense, or atomic account transfer | Yes (Bearer) |
| `GET` | `/budgets` | Get monthly category budgets with actual spending | Yes (Bearer) |
| `POST` | `/budgets` | Set or update monthly budget cap | Yes (Bearer) |
| `GET` | `/categories` | List user & default income/expense categories | Yes (Bearer) |
| `GET` | `/dashboard/summary` | Consolidated analytics, monthly trends & net worth | Yes (Bearer) |
| `GET` | `/health` | API & database connectivity health probe | No |

---

## 📄 License
This project is private and proprietary. All financial data structures and algorithms are designed for precision and personal data ownership.
