
-- 1. plan_requests: split ALL policy into narrow INSERT + SELECT for owners
DROP POLICY IF EXISTS "users manage own requests" ON public.plan_requests;

CREATE POLICY "users insert own pending request"
  ON public.plan_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "users read own requests"
  ON public.plan_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. memberships self-insert: block if user already has active/pending membership
DROP POLICY IF EXISTS "memberships insert own pending" ON public.memberships;

CREATE POLICY "memberships insert own pending"
  ON public.memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND end_date IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = auth.uid()
        AND m.status IN ('active', 'pending')
    )
  );

-- 3. profiles UPDATE: add explicit WITH CHECK
DROP POLICY IF EXISTS "profiles update own or admin" ON public.profiles;

CREATE POLICY "profiles update own or admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 4. status CHECK constraints
ALTER TABLE public.plan_requests
  ADD CONSTRAINT plan_requests_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.memberships
  ADD CONSTRAINT memberships_status_check
  CHECK (status IN ('pending', 'active', 'expired', 'cancelled'));
