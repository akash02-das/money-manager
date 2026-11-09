# 🪙 Money Manager — Precision-Engineered Personal Finance

A production-ready, fullstack personal finance tracker designed for tracking balances, cash flow, multi-account ledgers, and monthly budget limits with bank-grade security.

Built with **Next.js 16** (App Router & Turbopack), **NestJS 11**, **Prisma ORM 6**, and **PostgreSQL 16**.

---

## 🌟 Key Features & Implemented Functionalities

### 1. 📊 Financial Cockpit & Dashboard Analytics
- **Live Net Worth & Balances**: Unified real-time aggregation across all active cash, bank, and mobile wallet accounts.
- **Monthly Cash Flow Metrics**: Tracks Total Income, Total Expenses, Net Savings, and Month-over-Month % change.
- **Budget Health Overview**: Real-time spending progress bars indicating on-track vs. exceeded category thresholds.
- **Clean State for New Users**: Brand-new registered accounts start fresh with zero unwanted mock data, accompanied by a helpful onboarding welcome banner.

### 2. 💳 Multi-Account Ledger
- **Supported Account Types**: Cash, Bank Account, Mobile Wallet (bKash/Nagad), Credit Card, and Savings.
- **Multi-Currency Support**: Native handling for BDT (৳), USD ($), EUR (€), and GBP (£).
- **Archiving & Ledger Safety**: Soft-archive accounts to maintain financial historical integrity. Restrictive foreign key safeguards prevent deleting accounts tied to active transactions.

### 3. 💸 Transaction Engine (Double-Entry Balance Adjustments)
- **Transaction Types**: Income, Expense, and Account-to-Account Transfers.
- **Atomic Balance Consistency**: Powered by PostgreSQL transactions (`prisma.$transaction`) to guarantee source and destination account balances remain mathematically synchronized.
- **Advanced Filtering**: Filter transactions by calendar month, transaction type, or specific account.

### 4. 🎯 Category Budgets & Spending Caps
- **Monthly Spending Limits**: Set monthly monetary limits per expense category.
- **Dynamic Actual Spending Aggregation**: Live calculation of spent amounts vs. allocated budget limits with visual percentage badges.
- **Overspending Alerts**: Highlight categories approaching or exceeding budget limits.

### 5. 🏷️ Categories & Custom Lucide Icons
- **System Defaults**: Pre-seeded income and expense categories (Salary, Consulting, Housing, Groceries, Utilities, Dining, Transport, Health).
- **Fully Customizable**: Create custom categories with Lucide icons and personalized color palettes.

### 6. 🔐 Bank-Grade Authentication & Security
- **JWT Authentication with Token Rotation**: Secure short-lived access tokens (15m) paired with database-backed refresh tokens (7d) and token revocation.
- **Route Protection (`AuthGuard`)**: Enforces authentication on all dashboard routes (`/`, `/accounts`, `/transactions`, `/budgets`, `/categories`, `/settings`), redirecting unauthenticated users to `/login`.
- **Real Email Verification**:
  - Validates RFC syntax and active domain extension length.
  - **Disposable Email Blocker**: Blocks 80+ temporary burner email services (e.g., `tempmail.com`, `mailinator.com`, `guerrillamail.com`) at both UI and API layers.
  - **Domain Typo Detection**: Identifies common provider misspellings (e.g., `gmial.com` &rarr; `gmail.com`) with a 1-click *"Yes, Fix It"* prompt.
  - **6-Digit Verification Flow**: Interactive verification code generation with in-app delivery preview and 1-click auto-verification.
- **Strong Password Engine**:
  - Enforces a 5-rule criteria checklist: 8+ characters, uppercase letter, lowercase letter, number, and special symbol (`!@#$%^&*`).
  - Dynamic 5-segment strength meter (0% to 100%) transitioning from Red &rarr; Orange &rarr; Yellow &rarr; Emerald Green.
  - **1-Click Password Suggestion**: Generates cryptographically secure, high-entropy 12-character passwords (e.g., `K9#mQ2$vL8!x`) with auto-copy.
  - **Interactive Security Demo**: Built-in modal demonstrating how high-entropy passwords resist dictionary attacks.
  - **Strict Submit Gate**: *"Unlock My Dashboard"* and *"Activate My Vault"* buttons remain disabled until both email and password are fully valid.
- **Dual-Mode Resilience**:
  - **Online Mode**: Full REST API persistence connected to PostgreSQL.
  - **Local / Offline Mode**: Seamless zero-dependency local storage fallback allowing immediate testing and exploration even when the backend or database is offline.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16.4.3 (App Router, Turbopack), React 19, Tailwind CSS v4, Base UI, Lucide Icons, Recharts, date-fns |
| **Backend** | NestJS 11, TypeScript, Passport.js, JWT, bcrypt, class-validator, class-transformer |
| **Database & ORM** | PostgreSQL 16 (Alpine), Prisma ORM 6.4 |
| **API Docs & Testing** | Swagger / OpenAPI 3.0, Jest (26 unit tests across 7 test suites) |

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

---

## 🔑 Default Credentials & Quick Demo Access

| Account Type | Email | Password | Access Mode |
| :--- | :--- | :--- | :--- |
| **Seeded Demo Account** | `demo@moneymanager.local` | `DemoPassword123!` | Online (PostgreSQL) or Local |
| **Instant Demo Button** | *Click "⚡ Jump In with Instant Demo" on the login screen* | Zero setup required |
| **New Custom Account** | Register with any real email and strong password | Automatically seeds default categories |

---

## 📁 Project Structure

```
money-manager/
├── backend/                              # NestJS Backend Application
│   ├── prisma/
│   │   ├── schema.prisma                 # PostgreSQL Schema (Users, Accounts, Categories, Transactions, Budgets)
│   │   └── seed.ts                       # Database Seeder (Demo User & Default Categories)
│   ├── src/
│   │   ├── database/                     # Prisma Service & Connection Lifecycle
│   │   ├── modules/
│   │   │   ├── auth/                     # JWT Authentication, Password Hashing, Refresh Tokens
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
│   │   │   ├── login/page.tsx            # Sign In with Custom Errors & Strong Password Helpers
│   │   │   ├── register/page.tsx         # Registration with Real Email Verification & Security Meter
│   │   │   └── layout.tsx                # Centered Card Layout & Auth Guard
│   │   ├── (dashboard)/                  # Protected Dashboard Route Group
│   │   │   ├── page.tsx                  # Overview & Cash Flow Analytics
│   │   │   ├── accounts/page.tsx         # Accounts Management & Creation
│   │   │   ├── transactions/page.tsx     # Transaction History, Filters & Transfers
│   │   │   ├── budgets/page.tsx          # Monthly Category Budgets & Limit Caps
│   │   │   ├── categories/page.tsx       # Category Manager & Icon Selectors
│   │   │   ├── settings/page.tsx         # Currency & Profile Preferences
│   │   │   └── layout.tsx                # Dashboard Layout with Sidebar & Header
│   │   ├── layout.tsx                    # Root Layout with Fonts & Providers
│   │   └── globals.css                   # Tailwind CSS v4 Theme Variables
│   ├── components/                       # Shared UI Components (Buttons, Dialogs, Cards, Badges)
│   ├── features/                         # Feature-Driven State, Hooks & Utilities
│   │   ├── auth/                         # AuthContext, Token Storage, Password Tools, Verification
│   │   ├── accounts/                     # Accounts Hooks & Modals
│   │   ├── transactions/                 # Transaction Forms & Filter Logic
│   │   ├── budgets/                      # Budget Modal & Progress Math
│   │   └── dashboard/                    # Chart Cards & Metric Summaries
│   └── lib/                              # API Client, Currency Formatters & Styling Helpers
│
├── README.md                             # Project Documentation & Readiness Guide
└── package.json                          # Frontend Dependencies & Scripts
```

---

## 🧪 Testing & Quality Assurance

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
*Executes all 26 unit tests across 7 test suites covering Auth, Accounts, Transactions, Budgets, Categories, Dashboard, and Health.*

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
| `POST` | `/auth/register` | Register new account & auto-seed default categories | No |
| `POST` | `/auth/login` | Authenticate user & issue access + refresh tokens | No |
| `POST` | `/auth/refresh` | Rotate expired access token using refresh token | No |
| `POST` | `/auth/logout` | Revoke active refresh token | Yes (Bearer) |
| `GET` | `/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| `GET` | `/accounts` | Retrieve all active accounts & calculated balances | Yes (Bearer) |
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
