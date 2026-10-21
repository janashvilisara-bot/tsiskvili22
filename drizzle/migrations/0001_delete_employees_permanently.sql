CREATE OR REPLACE FUNCTION public.delete_employees_permanently(p_ids uuid[])
RETURNS TABLE(user_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_users uuid[];
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager')) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  SELECT array_agg(e.user_id) INTO v_users FROM public.employees e WHERE e.id = ANY(p_ids) AND e.user_id IS NOT NULL;
  IF auth.uid() = ANY(coalesce(v_users, '{}')) THEN
    RAISE EXCEPTION 'cannot_delete_self';
  END IF;
  -- Columns with NO ACTION references: clear them first
  UPDATE public.tasks SET reviewed_by = NULL WHERE reviewed_by = ANY(p_ids);
  UPDATE public.business_trip_requests SET hr_approved_by = NULL WHERE hr_approved_by = ANY(p_ids);
  UPDATE public.business_trip_requests SET manager_approved_by = NULL WHERE manager_approved_by = ANY(p_ids);
  UPDATE public.disciplinary_actions SET issued_by = NULL WHERE issued_by = ANY(p_ids);
  UPDATE public.employee_goals SET assigned_by = NULL WHERE assigned_by = ANY(p_ids);
  UPDATE public.employees SET secondary_manager_id = NULL WHERE secondary_manager_id = ANY(p_ids);
  UPDATE public.expense_requests SET reviewed_by = NULL WHERE reviewed_by = ANY(p_ids);
  UPDATE public.performance_reviews SET reviewer_id = NULL WHERE reviewer_id = ANY(p_ids);
  DELETE FROM public.encryption_access_log WHERE employee_id = ANY(p_ids);
  DELETE FROM public.esim_requests WHERE employee_id = ANY(p_ids);
  DELETE FROM public.onboarding_task_completion WHERE employee_id = ANY(p_ids);
  DELETE FROM public.employees WHERE id = ANY(p_ids);
  RETURN QUERY SELECT unnest(coalesce(v_users, '{}'::uuid[]));
END $$;
REVOKE ALL ON FUNCTION public.delete_employees_permanently(uuid[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.delete_employees_permanently(uuid[]) TO authenticated;