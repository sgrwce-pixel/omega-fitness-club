-- 1. One pending plan_request per user
CREATE UNIQUE INDEX IF NOT EXISTS plan_requests_one_pending_per_user
  ON public.plan_requests (user_id)
  WHERE status = 'pending';

-- 3. Length caps
ALTER TABLE public.plan_requests
  ADD CONSTRAINT plan_requests_plan_len CHECK (char_length(plan) <= 80),
  ADD CONSTRAINT plan_requests_message_len CHECK (message IS NULL OR char_length(message) <= 1000);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_full_name_len CHECK (full_name IS NULL OR char_length(full_name) <= 120),
  ADD CONSTRAINT profiles_phone_len CHECK (phone IS NULL OR char_length(phone) <= 32),
  ADD CONSTRAINT profiles_fitness_goal_len CHECK (fitness_goal IS NULL OR char_length(fitness_goal) <= 500);