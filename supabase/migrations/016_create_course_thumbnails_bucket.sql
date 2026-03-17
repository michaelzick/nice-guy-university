insert into storage.buckets (id, name, public)
values ('course-thumbnails', 'course-thumbnails', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Course thumbnails are viewable by everyone" on storage.objects;
create policy "Course thumbnails are viewable by everyone"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'course-thumbnails');

drop policy if exists "Admins can upload course thumbnails" on storage.objects;
create policy "Admins can upload course thumbnails"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'course-thumbnails'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins can update course thumbnails" on storage.objects;
create policy "Admins can update course thumbnails"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'course-thumbnails'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    bucket_id = 'course-thumbnails'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins can delete course thumbnails" on storage.objects;
create policy "Admins can delete course thumbnails"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'course-thumbnails'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
