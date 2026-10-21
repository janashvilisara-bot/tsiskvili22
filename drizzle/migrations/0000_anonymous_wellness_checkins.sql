CREATE POLICY "Authenticated can submit anonymous checkins"
ON public.wellness_checkins
FOR INSERT
TO authenticated
WITH CHECK (employee_id IS NULL AND is_anonymous = true);

GRANT INSERT ON public.wellness_checkins TO authenticated;

CREATE OR REPLACE FUNCTION public.validate_wellness_checkin()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.mood_rating IS NULL OR NEW.mood_rating < 1 OR NEW.mood_rating > 5 THEN
    RAISE EXCEPTION 'mood_rating must be between 1 and 5';
  END IF;
  IF NEW.stress_level IS NOT NULL AND (NEW.stress_level < 1 OR NEW.stress_level > 5) THEN
    RAISE EXCEPTION 'stress_level must be between 1 and 5';
  END IF;
  IF NEW.notes IS NOT NULL AND char_length(NEW.notes) > 1000 THEN
    RAISE EXCEPTION 'notes too long';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_wellness_checkin ON public.wellness_checkins;
CREATE TRIGGER trg_validate_wellness_checkin
BEFORE INSERT OR UPDATE ON public.wellness_checkins
FOR EACH ROW EXECUTE FUNCTION public.validate_wellness_checkin();