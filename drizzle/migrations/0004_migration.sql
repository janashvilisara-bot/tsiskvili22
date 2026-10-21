CREATE TABLE public.load_test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  virtual_users integer NOT NULL,
  duration_sec integer NOT NULL,
  total_requests integer NOT NULL DEFAULT 0,
  failed_requests integer NOT NULL DEFAULT 0,
  rps numeric NOT NULL DEFAULT 0,
  p50_ms integer, p95_ms integer, p99_ms integer, max_ms integer,
  verdict text NOT NULL,
  db_before jsonb, db_after jsonb,
  stopped_early boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.load_test_runs TO authenticated;
GRANT ALL ON public.load_test_runs TO service_role;
ALTER TABLE public.load_test_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read load tests" ON public.load_test_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert load tests" ON public.load_test_runs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND created_by = auth.uid());
CREATE POLICY "Admins delete load tests" ON public.load_test_runs FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.load_test_db_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN jsonb_build_object(
    'connections', (SELECT count(*) FROM pg_stat_activity),
    'active', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
    'max_connections', current_setting('max_connections')::int,
    'at', now());
END $$;
REVOKE ALL ON FUNCTION public.load_test_db_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.load_test_db_stats() TO authenticated;