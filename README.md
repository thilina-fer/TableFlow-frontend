# TableFlow — Frontend

> A multi-tenant, QR-based restaurant ordering and management SaaS platform frontend, built as the RAD coursework project for ITS2020.

**Live App:** [https://table-flow-frontend.vercel.app](https://table-flow-frontend.vercel.app)
**Backend API:** [https://tableflow-backed-production.up.railway.app](https://tableflow-backed-production.up.railway.app)

---

## Overview

TableFlow lets restaurant customers scan a QR code at their table, browse the menu, place an order, and track it live — no app download or account needed. Restaurant staff manage the full order lifecycle through dedicated Kitchen, Waiter, and Cashier portals, while restaurant admins manage their menu, tables, and staff. A Super Admin portal oversees restaurant onboarding across the platform.

This repository contains the **React frontend** that consumes the TableFlow backend API.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | TailwindCSS |
| Component Library | Shadcn/ui |
| State Management | Redux Toolkit |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Real-time | Socket.io Client |
| Payments | Stripe (React Stripe.js) |
| Charts | Recharts |
| Package Manager | pnpm |
| Hosting | Vercel |

---

## Core Features

- **Customer ordering flow** — QR scan → menu → cart → order → live tracking, no login required
- **Tag-based menu filtering** (e.g. Spicy, Vegan, Bestseller)
- **Live order status timeline** updated in real time via Socket.io
- **Stripe card payments** with Stripe Elements
- **Restaurant Admin portal** — categories, menu items, tables (with QR generation), staff management
- **Role-specific staff portals** — Kitchen, Waiter, Cashier — each with live socket updates
- **Super Admin portal** — restaurant approval workflow, platform-wide restaurant management, audit log
- **Analytics dashboards** — revenue trends, top items, peak hours (restaurant + platform level)
- **Guided onboarding checklist** for new restaurant admins
- **Forced password change** flow on first login for all staff accounts

---

## User Portals

| Portal | Route | Access |
|--------|-------|--------|
| Customer Menu & Tracking | `/menu`, `/order/:id/track` | Public (QR scan) |
| Restaurant Registration | `/register` | Public |
| Staff Login | `/login` | Public |
| Restaurant Admin | `/admin/*` | Role: admin |
| Kitchen Portal | `/kitchen` | Role: kitchen |
| Waiter Portal | `/waiter` | Role: waiter |
| Cashier Portal | `/cashier` | Role: cashier |
| Super Admin | `/superadmin/*` | Super Admin token |

---

## Project Structure

```
src/
├── app/              # Redux store + typed hooks
├── api/              # Axios instance + per-feature API call functions
├── features/         # Redux slices (auth, superAdmin, cart)
├── hooks/            # Custom hooks (useSocket, etc.)
├── components/
│   ├── ui/           # Shadcn auto-generated components
│   ├── layout/       # Portal layouts (Admin, Staff, SuperAdmin)
│   ├── shared/       # Reusable components (DataTable, StatusBadge, charts, etc.)
│   ├── forms/        # React Hook Form + Shadcn field wrappers
│   └── guards/       # Route protection components
├── pages/
│   ├── public/       # Login, Register, Customer Menu, Order Tracking, Payment
│   ├── admin/        # Restaurant admin pages
│   ├── staff/        # Kitchen, Waiter, Cashier pages
│   └── superadmin/   # Super Admin pages
├── types/            # Shared TypeScript interfaces
├── lib/              # Theme tokens, constants, utility functions
└── App.tsx           # Route definitions
```

---

## Design System

- **Theme:** Clean, minimal, light — built on Shadcn/ui with a custom orange brand accent
- **Single source of truth for styling:** all colors and reusable class strings live in `src/lib/theme.ts` — no hardcoded Tailwind color classes in components
- **Typography:** Inter

---

## State Management

| Slice | Purpose |
|-------|---------|
| `authSlice` | Staff authentication state, persisted to localStorage |
| `superAdminSlice` | Super Admin authentication state |
| `cartSlice` | Customer cart — session-only, tied to table/restaurant context |

---

## Real-time Integration

The app connects to the backend Socket.io server for live updates across:
- Customer order tracking (status changes, payment confirmation)
- Kitchen portal (new orders arriving)
- Waiter portal (orders ready for delivery, claim conflicts)
- Cashier portal (payment confirmations)

Staff connections authenticate via JWT passed in the socket handshake; customer connections join an order-specific room without authentication.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=https://tableflow-backed-production.up.railway.app/api
VITE_SOCKET_URL=https://tableflow-backed-production.up.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

For local development against a local backend:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

---

## Getting Started Locally

### Prerequisites
- Node.js 18+
- pnpm
- The TableFlow backend running locally or accessible remotely

### Installation

```bash
git clone <repository-url>
cd tableflow-frontend
pnpm install
```

### Setup

1. Create `.env` using the template above
2. Start the development server:
   ```bash
   pnpm dev
   ```

App runs at `http://localhost:5173`

### Build for Production

```bash
pnpm build
pnpm preview
```

---

## Key Flows

### Customer Order Flow
```
Scan QR → /menu?table=<id>&restaurant=<id>
  → Browse menu, filter by category/tags
  → Add items to cart
  → Choose payment method (Cash / Card)
  → Place order → /order/:id/track
  → (if Card) → /order/:id/pay → Stripe checkout
  → Live status updates via Socket.io
```

### Staff First Login Flow
```
Login with temp password
  → isFirstLogin: true → forced redirect to /change-password
  → Change password → redirected to role-specific portal
```

### Restaurant Onboarding Flow
```
Admin's first login → /admin/onboarding
  → Checklist: Add Category → Add Menu Items → Add Tables → Add Staff
  → All steps complete → Dashboard unlocked
```

---

## Deployment

Deployed on **Vercel**. Build command: `pnpm build`. Output directory: `dist`.

Live App: **https://table-flow-frontend.vercel.app**

Companion backend repository deployed on Railway: **https://tableflow-backed-production.up.railway.app**

---

## Notes

- Customer-facing pages require no authentication — cart and table context are held in Redux state for the duration of the session only.
- All menu item prices displayed are for reference only; the backend recalculates totals server-side at order placement to prevent price tampering.
- The component library was built and validated independently (full Shadcn/ui component showcase) before any application page was developed.
