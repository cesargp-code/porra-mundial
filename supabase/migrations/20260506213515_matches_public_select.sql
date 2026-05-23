DROP POLICY IF EXISTS matches_select ON public.matches;
CREATE POLICY matches_select ON public.matches FOR SELECT TO anon, authenticated USING (true);;
