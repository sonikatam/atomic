# 1% Club

1% Club is a mobile-first social habit challenge MVP. Users can sign up, create group or private self challenges, add daily goals, require proof, react to friends in a group feed, and keep streaks alive.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Supabase Auth, Postgres, and Storage
- Lucide icons

## Local Setup

Install dependencies:

```bash
npm install
```

Create an env file:

```bash
cp .env.example .env
```

Add your Supabase values:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run locally:

```bash
npm run dev
```

If env vars are missing, the app runs in local mock mode with demo data. Use `maya@example.com` and any password on the login screen.

## Supabase Setup

Initialize and link the project if you have the Supabase CLI:

```bash
supabase login
supabase init
supabase link --project-ref hxteutyqvmirsjesyqhu
```

Run the migration in one of two ways:

```bash
supabase db push
```

Or paste `supabase/migrations/20260508000000_initial_schema.sql` into the Supabase SQL editor.

The migration creates:

- `profiles`
- `challenges`
- `challenge_members`
- `goals`
- `daily_checkins`
- `daily_user_status`
- `activity_feed`
- `reactions`
- `proofs` storage bucket
- Basic RLS policies and helper functions

## Product Flows

- New users sign up through Supabase Auth and get a profile row.
- Group challenges generate invite codes and show members, feed, leaderboard, proof, and today’s progress.
- Self challenges stay private and show personal goals, streaks, and calendar-style progress.
- Daily check-ins are limited to one completion per goal per day and can be unchecked on the same day.
- Photo proof uploads to the `proofs` bucket when Supabase env vars are configured.

## Reminder Architecture

`src/services/reminderService.ts` includes `sendReminderEmails()`. It scans incomplete `daily_user_status` rows for today and includes TODOs for adding a scheduled Edge Function plus Resend, Postmark, or another provider.

Future email copy:

> You still have goals left today. Don't lose your streak.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Set the framework preset to Vite.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel project settings.
5. Deploy.

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```
