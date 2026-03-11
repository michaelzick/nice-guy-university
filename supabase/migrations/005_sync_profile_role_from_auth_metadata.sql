CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  metadata_role TEXT := lower(COALESCE(
    NULLIF(NEW.raw_app_meta_data->>'role', ''),
    NULLIF(NEW.raw_user_meta_data->>'role', ''),
    ''
  ));
  next_first_name TEXT := COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), '');
  next_last_name TEXT := COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name', ''), '');
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    next_first_name,
    next_last_name,
    CASE WHEN metadata_role = 'admin' THEN 'admin' ELSE 'student' END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    first_name = CASE
      WHEN next_first_name <> '' THEN next_first_name
      ELSE public.profiles.first_name
    END,
    last_name = CASE
      WHEN next_last_name <> '' THEN next_last_name
      ELSE public.profiles.last_name
    END,
    role = CASE
      WHEN metadata_role IN ('admin', 'student') THEN metadata_role
      ELSE public.profiles.role
    END,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_from_auth_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF raw_app_meta_data, raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_from_auth_user();

UPDATE public.profiles
SET
  first_name = CASE
    WHEN COALESCE(NULLIF(auth.users.raw_user_meta_data->>'first_name', ''), '') <> ''
      THEN auth.users.raw_user_meta_data->>'first_name'
    ELSE public.profiles.first_name
  END,
  last_name = CASE
    WHEN COALESCE(NULLIF(auth.users.raw_user_meta_data->>'last_name', ''), '') <> ''
      THEN auth.users.raw_user_meta_data->>'last_name'
    ELSE public.profiles.last_name
  END,
  role = CASE
    WHEN lower(COALESCE(
      NULLIF(auth.users.raw_app_meta_data->>'role', ''),
      NULLIF(auth.users.raw_user_meta_data->>'role', ''),
      ''
    )) IN ('admin', 'student')
      THEN lower(COALESCE(
        NULLIF(auth.users.raw_app_meta_data->>'role', ''),
        NULLIF(auth.users.raw_user_meta_data->>'role', '')
      ))
    ELSE public.profiles.role
  END,
  updated_at = now()
FROM auth.users
WHERE auth.users.id = public.profiles.id;
