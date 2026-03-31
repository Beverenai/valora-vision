-- Create app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'user');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS on user_roles: users can read their own roles
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Service role can insert roles (for onboarding)
CREATE POLICY "Service role can manage roles" ON public.user_roles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS on professionals: agents can INSERT their own profile
CREATE POLICY "Agents can insert own profile" ON public.professionals
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Agents can UPDATE their own profile
CREATE POLICY "Agents can update own profile" ON public.professionals
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS on agent_team_members: agents can manage their own team
CREATE POLICY "Agents can insert team members" ON public.agent_team_members
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_id AND user_id = auth.uid())
  );

CREATE POLICY "Agents can update team members" ON public.agent_team_members
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_id AND user_id = auth.uid())
  );

CREATE POLICY "Agents can delete team members" ON public.agent_team_members
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_id AND user_id = auth.uid())
  );