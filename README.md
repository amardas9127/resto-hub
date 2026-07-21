<h1 align="center">
  <img src="./public/favicon.svg" width="48" alt="RestroHub Logo" />
  <br/>
  RestroHub
</h1>

<p align="center">
  <strong>Modern Restaurant Billing & Management System</strong>
  <br/>
  Built with React + Vite · Supabase · Tailwind CSS v4
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Supabase-realtime-3ECF8E?logo=supabase&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel&logoColor=white&style=flat-square" />
</p>

---

## ✨ Overview

**RestroHub** is a full-stack restaurant management web application that covers the complete dining workflow — from a public digital menu book to kitchen order tracking and automated PDF billing.

It supports three user roles with tailored portals:

| Role                      | Access                                          | Login                     |
| ------------------------- | ----------------------------------------------- | ------------------------- |
| **Admin / Manager** | Full dashboard, analytics, menu, staff, billing | Supabase email + password |
| **Waiter**          | Table selection, order taking                   | Username + 4-digit PIN    |
| **Chef**            | Live kitchen order queue                        | Username + 4-digit PIN    |

---

## 🚀 Features

### 🏠 Public Digital Menu Book

- Landing page (`/`) accessible to guests — no login required
- Browsable menu with categories, images, and prices

### 📊 Admin Dashboard

- Real-time KPIs: daily revenue, total orders, active tables, and pending orders
- Live kitchen activity feed
- Revenue charts and order status breakdown

### 🍽️ Table Management

- Create, edit, and delete tables
- Real-time status tracking: `available`, `occupied`

### 📋 Menu Management

- Full CRUD for menu items (name, price, category, image, availability toggle)
- Image uploads stored in Supabase Storage

### 🧾 Order System

- Per-table cart persisted to Supabase (survives page refresh, syncs across devices)
- Add / remove / adjust item quantities
- Instantly pushes orders to kitchen queue via Realtime

### 👨‍🍳 Kitchen Portal (Chef View)

- Live order feed grouped by table
- Mark orders as `preparing` → `ready`

### 💵 Billing & Invoices

- Generate branded invoices with customer name, payment method, and itemized breakdown
- Configurable tax rate (default 5%) and discount support
- Print-ready invoice layout via browser print

### 👥 Staff & User Management

- Manage employee records (name, role, status)
- Create / manage sub-user login credentials (username + PIN)

### 🔐 Authentication

- Admin: Supabase Auth (email + password)
- Staff: secure PIN-based login resolved against `sub_users` table
- Route guards ensure role-based access to all pages

---

## 🗂️ Project Structure

```
restaurant-app/
├── public/
│   ├── favicon.svg          # Custom SVG favicon
│   └── icon.svg             # App icon (OG / Apple touch)
├── src/
│   ├── components/
│   │   ├── Layout.jsx        # Admin shell (sidebar + header)
│   │   ├── StaffLayout.jsx   # Staff portal shell
│   │   ├── WaiterLayout.jsx  # Waiter portal shell
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── ConfirmDialog.jsx
│   ├── context/
│   │   ├── AuthContext.jsx   # Auth state + role resolution
│   │   └── StoreContext.jsx  # Global data (tables, menu, orders, bills)
│   ├── lib/
│   │   └── supabase.js       # Supabase client initialisation
│   ├── pages/
│   │   ├── PublicMenuBook.jsx   # Guest-facing digital menu
│   │   ├── LoginPage.jsx        # Admin login
│   │   ├── StaffLoginPage.jsx   # Staff PIN login
│   │   ├── WaiterLoginPage.jsx
│   │   ├── Dashboard.jsx        # Admin analytics dashboard
│   │   ├── TablesPage.jsx       # Table management
│   │   ├── MenuPage.jsx         # Menu CRUD
│   │   ├── OrderPage.jsx        # Per-table order cart
│   │   ├── KitchenPage.jsx      # Live kitchen queue (admin view)
│   │   ├── BillsPage.jsx        # Billing & invoice generation
│   │   ├── UsersPage.jsx        # Staff credential management
│   │   ├── EmployeesPage.jsx    # Employee records
│   │   ├── ChefPortal.jsx       # Chef role view
│   │   ├── WaiterTablesPage.jsx # Waiter table picker
│   │   └── StaffPortal.jsx      # Generic staff home
│   ├── App.jsx               # Router + route guards
│   ├── main.jsx
│   └── index.css             # Global styles + Tailwind v4 config
├── supabase_schema.sql        # Full DB schema + seed data
├── supabase_migration_patch.sql
├── supabase_update_patch.sql
├── vercel.json               # SPA routing fix for Vercel
├── vite.config.js
└── package.json
```

---

## 🗄️ Database Schema (Supabase)

| Table              | Purpose                                                  |
| ------------------ | -------------------------------------------------------- |
| `tables`         | Restaurant table definitions (id, name, seats, status)   |
| `menu_items`     | Menu catalogue (name, price, category, image, available) |
| `kitchen_orders` | Orders sent to the kitchen; status lifecycle             |
| `bills`          | Completed & printed invoices                             |
| `employees`      | Staff directory                                          |
| `sub_users`      | Waiter/chef/staff login credentials (username + PIN)     |
| `orders`         | In-flight per-table cart state (synced across devices)   |

**Realtime** is enabled on `kitchen_orders`, `orders`, and `tables` for live multi-device sync.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js ≥ 18
- A free [Supabase](https://supabase.com) project

### 1 · Clone & Install

```bash
git clone <your-repo-url>
cd restaurant-app
npm install
```

### 2 · Configure Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3 · Initialise the Database

In the **Supabase Dashboard → SQL Editor**, run the full schema file:

```
supabase_schema.sql
```

This creates all tables, enables Row Level Security, sets up the `menu-items` storage bucket, enables Realtime, and inserts default seed data (4 tables, 16 menu items, 5 employees, 5 staff logins).

### 4 · Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 👤 Default Credentials (Seed Data)

> ⚠️ Change these in production via the **Users** management page.

**Staff PIN Logins** (`/staff-login`):

| Username    | PIN      | Role   |
| ----------- | -------- | ------ |
| Amit Patel  | `1234` | Waiter |
| Sneha Rao   | `2222` | Waiter |
| Ravi Kumar  | `3333` | Chef   |
| Priya Singh | `4444` | Chef   |
| Mohan Das   | `5555` | Staff  |

**Admin Login** (`/login`): Create a user in **Supabase Dashboard → Authentication → Users**.

---

## 🛣️ Routes

| Path                       | Access            | Description                 |
| -------------------------- | ----------------- | --------------------------- |
| `/`                      | Public            | Digital menu book           |
| `/login`                 | Public            | Admin login                 |
| `/staff-login`           | Public            | Staff PIN login             |
| `/dashboard`             | Admin             | Analytics overview          |
| `/tables`                | Admin             | Table management            |
| `/menu`                  | Admin             | Menu management             |
| `/orders/:tableId`       | Admin + Waiter    | Order cart for a table      |
| `/kitchen`               | Admin             | Kitchen order queue         |
| `/bills`                 | Admin             | Billing & invoices          |
| `/users`                 | Admin             | Staff credential management |
| `/staff`                 | Waiter/Chef/Staff | Role-specific portal        |
| `/staff/orders/:tableId` | Waiter            | Place order for a table     |

---

## 🛠️ Tech Stack

| Layer              | Technology            |
| ------------------ | --------------------- |
| Frontend framework | React 19 + Vite 8     |
| Routing            | React Router v7       |
| Styling            | Tailwind CSS v4       |
| Icons              | Lucide React          |
| Notifications      | React Hot Toast       |
| Date formatting    | date-fns              |
| Backend / DB       | Supabase (PostgreSQL) |
| Realtime           | Supabase Realtime     |
| Storage            | Supabase Storage      |
| Auth               | Supabase Auth         |
| Linting            | OXLint                |
| Deployment         | Vercel                |

---

## 🚢 Deployment (Vercel)

The `vercel.json` already handles SPA client-side routing:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

1. Push to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings
4. Deploy ✅

---

## 📜 License

MIT © 2026 RestroHub
