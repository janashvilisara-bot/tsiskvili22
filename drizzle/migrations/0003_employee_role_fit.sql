CREATE TABLE public.employee_role_fit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  current_fit integer,
  summary text,
  top_matches jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_sufficient boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX employee_role_fit_emp_idx ON public.employee_role_fit(employee_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.employee_role_fit TO authenticated;
GRANT ALL ON public.employee_role_fit TO service_role;
ALTER TABLE public.employee_role_fit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/HR read role fit" ON public.employee_role_fit FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hr_manager'));
CREATE POLICY "Admin/HR insert role fit" ON public.employee_role_fit FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hr_manager'));
CREATE POLICY "Admin/HR delete role fit" ON public.employee_role_fit FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hr_manager'));