-- Create user-images storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-images',
  'user-images',
  true,
  52428800, -- 50MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

-- RLS policies for storage.objects (per-user folder access)
-- Users can only access their own folder (user_id/)

-- Policy: Users can view their own files
create policy "Users can view their own images"
  on storage.objects for select
  using (
    bucket_id = 'user-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can upload to their own folder
create policy "Users can upload their own images"
  on storage.objects for insert
  with check (
    bucket_id = 'user-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own files
create policy "Users can update their own images"
  on storage.objects for update
  using (
    bucket_id = 'user-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own files
create policy "Users can delete their own images"
  on storage.objects for delete
  using (
    bucket_id = 'user-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Public access for public images (optional, if you make images public)
create policy "Public can view public images"
  on storage.objects for select
  using (
    bucket_id = 'user-images' and
    public = true
  );