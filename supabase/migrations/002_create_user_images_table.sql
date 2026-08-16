-- user_images table for saved projects
create table if not exists public.user_images (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  image_url text not null,
  name text,
  original_image_url text,
  filter_applied text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_images enable row level security;

-- Policies
create policy "Users can view their own images"
  on public.user_images for select
  using (auth.uid() = user_id);

create policy "Users can insert their own images"
  on public.user_images for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own images"
  on public.user_images for update
  using (auth.uid() = user_id);

create policy "Users can delete their own images"
  on public.user_images for delete
  using (auth.uid() = user_id);

-- Public images policy (for sharing)
create policy "Anyone can view public images"
  on public.user_images for select
  using (is_public = true);

-- Indexes
create index if not exists user_images_user_id_idx on public.user_images (user_id);
create index if not exists user_images_created_at_idx on public.user_images (created_at desc);

-- Updated at trigger
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists update_user_images_updated_at on public.user_images;
create trigger update_user_images_updated_at
  before update on public.user_images
  for each row execute procedure public.update_updated_at_column();