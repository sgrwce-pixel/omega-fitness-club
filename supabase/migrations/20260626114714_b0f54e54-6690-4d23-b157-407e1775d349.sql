
-- 1. Tighten memberships self-insert: only pending status allowed
DROP POLICY IF EXISTS "memberships insert own" ON public.memberships;
CREATE POLICY "memberships insert own pending"
ON public.memberships
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND end_date IS NULL
);

-- Prevent users from escalating their own membership via UPDATE; only admins can update
-- (no existing user-update policy, admin policy already covers admins)

-- 2. Lock down user_roles: explicit admin-only write policies
CREATE POLICY "user_roles admin insert"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles admin update"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles admin delete"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Revoke EXECUTE on has_role from authenticated/anon; keep for definer/service_role
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
