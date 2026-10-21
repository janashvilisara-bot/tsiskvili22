CREATE TABLE public.rsge_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type text NOT NULL CHECK (export_type IN ('hire','termination','both')),
  period_from date NOT NULL,
  period_to date NOT NULL,
  branch_id uuid,
  row_count integer NOT NULL DEFAULT 0,
  file_format text NOT NULL DEFAULT 'xlsx',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  uploaded_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.rsge_exports TO authenticated;
GRANT ALL ON public.rsge_exports TO service_role;
ALTER TABLE public.rsge_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "HR view rsge exports" ON public.rsge_exports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hr_manager'));
CREATE POLICY "HR insert rsge exports" ON public.rsge_exports FOR INSERT TO authenticated
  WITH CHECK ((public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hr_manager')) AND created_by = auth.uid());
CREATE POLICY "HR update rsge exports" ON public.rsge_exports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hr_manager'));