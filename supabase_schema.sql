-- Create a table for public profiles using Supabase Auth
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a table for bookmarks
create type bookmark_type as enum ('QURAN', 'DUA', 'HADITH');

create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type bookmark_type not null,
  
  -- Generic fields to store reference data
  -- For Quran: surah_number, ayah_number
  -- For Dua/Hadith: item_id
  reference_id text not null, 
  
  -- Identifying titles/text for quick display without re-fetching
  title text not null,
  subtitle text,
  arabic_text text,
  
  -- Unique constraint: A user can't bookmark the same item twice
  unique(user_id, type, reference_id)
);

-- Set up RLS for bookmarks
alter table bookmarks enable row level security;

create policy "Users can view their own bookmarks."
  on bookmarks for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own bookmarks."
  on bookmarks for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own bookmarks."
  on bookmarks for delete
  using ( auth.uid() = user_id );

-- Function to handle new user creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
