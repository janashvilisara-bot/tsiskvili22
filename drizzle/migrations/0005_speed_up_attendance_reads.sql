CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON public.attendance USING btree (check_in DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at DESC);

ALTER POLICY attendance_admin_hr_manage ON public.attendance
  USING ((select public.has_role((select auth.uid()), 'admin'::app_role)) OR (select public.has_role((select auth.uid()), 'hr_manager'::app_role)));
ALTER POLICY attendance_own_update ON public.attendance
  USING (employee_id = (select public.get_current_employee_id()));
ALTER POLICY attendance_own_view ON public.attendance
  USING ((employee_id = (select public.get_current_employee_id())) OR (select public.has_role((select auth.uid()), 'admin'::app_role)) OR (select public.has_role((select auth.uid()), 'hr_manager'::app_role)));
ALTER POLICY branch_isolation ON public.attendance
  USING ((select public.has_role((select auth.uid()), 'admin'::app_role)) OR (branch_id = ANY (ARRAY(select unnest(public.get_user_branches((select auth.uid())))))));