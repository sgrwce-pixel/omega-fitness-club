-- Secure handle_new_user trigger:
-- 1. Remove automatic first-user-admin privilege escalation
-- 2. Populate profile username properly to satisfy NOT NULL & regex format constraints
-- 3. Safely handle conflict resolution on profile upsert

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username TEXT;
BEGIN
  v_username := COALESCE(
    NULLIF(TRIM(LOWER(NEW.raw_user_meta_data->>'username')), ''),
    'user_' || SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 20)
  );

  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    v_username
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    username = CASE WHEN EXCLUDED.username IS NOT NULL THEN EXCLUDED.username ELSE public.profiles.username END;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END; $$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
