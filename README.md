# TaskRabbit GE — Local Services Marketplace

A full-stack local services marketplace tailored for the Georgian market (Tbilisi). Built with Next.js 15 (App Router), Tailwind CSS, TypeScript, and Supabase.

## Features

- **Three user roles**: Customer, Handyman (Tasker), Admin
- **Task creation wizard**: Category → Photo → Description → Address → Price estimate → Submit
- **Pricing in GEL (₾)**: Centralized config with automatic commission calculation
- **Handyman feed**: Filter by district and category, list/map views
- **Real-time task updates**: Supabase Realtime for status changes
- **Review system**: Post-completion ratings for handymen
- **Admin panel**: Manage categories, users, tasks, and platform settings
- **Telegram notifications**: Hooks ready for new tasks, acceptances, completions, and reviews

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Telegram notifications
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

### 3. Set up the database

Run the SQL schema in your Supabase SQL Editor:

```
supabase/schema.sql
```

This creates all tables, RLS policies, triggers, seed data, and storage bucket.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── auth/               # Login & registration
│   ├── dashboard/          # Customer dashboard
│   ├── tasks/              # Task creation & details
│   ├── handyman/           # Handyman job feed
│   └── admin/              # Admin panel
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Navbar, Footer
│   ├── tasks/              # Task wizard, detail, review
│   ├── handyman/           # Handyman feed
│   └── admin/              # Admin dashboard
├── config/
│   └── pricing.ts          # ★ Centralized pricing config
├── lib/
│   ├── supabase/           # Supabase client setup
│   ├── actions.ts          # Server actions
│   ├── auth.ts             # Auth helpers
│   ├── telegram.ts         # Telegram notification hooks
│   └── utils.ts            # Utilities
└── types/                  # TypeScript types
```

## Pricing Configuration

All pricing is centralized in `src/config/pricing.ts`:

```typescript
export const PLATFORM_COMMISSION_PERCENT = 15;  // Platform commission
export const MIN_TASK_PRICE = 30;                // Minimum task price (₾)
export const BASE_HOURLY_RATE = 45;              // Hourly rate (₾)
export const CATEGORY_PRICES = {                  // Per-category base prices
  plumbing: 80,
  "ac-installation": 150,
  "tv-mounting": 60,
  // ...
};
```

Modify these values before launch. The admin panel also allows runtime updates to commission and price limits.

## User Roles

| Role | Capabilities |
|------|-------------|
| **Customer** | Post tasks, track status, leave reviews |
| **Handyman** | Browse/accept tasks, update status, track earnings |
| **Admin** | Manage categories, view all users/tasks, configure settings |

To create an admin user, update the role in Supabase after registration:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Telegram Notifications

Configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env.local`. Notifications are sent for:

- New task posted
- Task accepted by handyman
- Task completed
- New review submitted

## Deployment

Deploy to [Vercel](https://vercel.com) or any Node.js hosting:

```bash
npm run build
npm start
```

Set environment variables in your hosting platform's dashboard.

## License

MIT
