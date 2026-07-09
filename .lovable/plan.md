# Security Audit — Omega Fitness Club

Scope: RLS on all public tables, admin-role enforcement, direct-API abuse, public/anon access, exposed secrets, server-side auth checks. No changes made.

## Overall posture: GOOD
Admin authority is enforced server-side by RLS policies that check `EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')` — not by client flags. The client `isAdmin` check is only used to show/hide UI; a spoofed client cannot perform admin writes because Postgres RLS re-checks on every mutation. No service-role key in client code (`.env` only ships publishable key). No edge functions. `has_role()` EXECUTE is revoked from anon/authenticated. `user_roles` cannot be self-inserted/updated by non-admins. `site_content` public read is intentional (CMS-driven landing page).

## Findings, ranked

### 🟡 MEDIUM — `plan_requests` lets users mutate their own request after submission
Policy `users manage own requests` is `FOR ALL USING (auth.uid() = user_id)`, so a member can UPDATE their own row (e.g. flip `status` to `approved`, change `plan`) or DELETE it. Impact is limited: approval doesn't auto-create a membership — admin approval upserts `memberships`. But:
- A member could flip their pending request to `approved` to mislead the admin UI/reporting.
- A member could edit `plan` after submission with no audit trail.

Recommended: split into `INSERT` (own, status must be `pending`), `SELECT` (own), and no user UPDATE/DELETE — admins already have full access via the admin policy.

### 🟡 MEDIUM — `memberships` self-insert doesn't pin `plan` or block spam
`memberships insert own pending` requires `status='pending' AND end_date IS NULL` but doesn't constrain `plan` or prevent a user from inserting many rows. A user cannot activate themselves (only admin ALL policy allows update), so this is nuisance-level, but you may want a uniqueness or "no existing active membership" guard.

### 🟢 LOW — `profiles` UPDATE has no explicit `WITH CHECK`
`profiles update own or admin` has `WITH CHECK = NULL`, so Postgres re-uses USING as the check. That happens to enforce `auth.uid() = id` for regular users (they can't reassign their row to another user), so this is safe today. Adding an explicit `WITH CHECK` makes the intent unambiguous and safe against future edits.

### 🟢 LOW — No DELETE policy on `profiles` or `memberships` for owners
Only admin can delete. Fine if intentional (audit trail); flagging so you're aware users can't self-delete their profile/membership.

### 🟢 LOW — `plan_requests.status` accepts any string
Column is free-text; a user setting `status='approved'` (see Medium above) or an admin typo isn't constrained. Consider a CHECK constraint or enum (`pending|approved|rejected`).

### ℹ️ INFO — `site_content` is world-readable
Intentional — it drives the public landing page. Confirming this is by design.

## Direct-API abuse check (per your Q3)
Manually walked every admin-only mutation the UI performs (site_content upsert, memberships insert/update, plan_requests update, user_roles insert/update/delete) — each is gated by an RLS policy requiring the caller to exist in `user_roles` as `admin`. Hiding the UI button is defense-in-depth; the DB is the actual gate. ✅

## Secrets check (per your Q5)
`.env` and `src/integrations/supabase/client.ts` expose only `SUPABASE_PUBLISHABLE_KEY` (safe). `SUPABASE_SERVICE_ROLE_KEY` is server-only in `client.server.ts` and is not imported anywhere in the app today. ✅

## Server-function / session-trust check (per your Q6)
Project has no `createServerFn` handlers and no Supabase edge functions. All data access goes through the browser Supabase client using the user's JWT — user identity comes from `auth.uid()` inside RLS, never from client-supplied IDs. ✅

## Auth-config note (outside RLS)
Not audited here, but worth confirming in Cloud → Users → Auth Settings:
- Leaked-password (HIBP) check enabled
- Email confirmation required (no auto-confirm)
- OAuth redirect URLs limited to your domains

---

## Suggested next step
If you want, I can ship a single hardening migration covering the two Medium findings + the Low `WITH CHECK` cleanup + a `status` enum on `plan_requests`. Say the word and I'll switch to build mode with a focused plan.
