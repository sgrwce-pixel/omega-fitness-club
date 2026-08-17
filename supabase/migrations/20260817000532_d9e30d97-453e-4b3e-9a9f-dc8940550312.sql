ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;

UPDATE public.profiles SET username = 'omega' WHERE id = '9affbf2a-ca6e-45d4-b758-72dc8b396eef' AND username IS NULL;

UPDATE public.profiles p SET username = 'user_' || replace(p.id::text, '-', '') WHERE p.username IS NULL;

ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles (lower(username));

ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_format CHECK (username ~ '^[a-z0-9_.]{3,32}$');

UPDATE auth.users SET email = 'omega@omega.internal' WHERE id = '9affbf2a-ca6e-45d4-b758-72dc8b396eef';
UPDATE public.profiles SET email = 'omega@omega.internal' WHERE id = '9affbf2a-ca6e-45d4-b758-72dc8b396eef';