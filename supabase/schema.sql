-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create tasks table
create type task_status as enum ('pending', 'in_progress', 'completed');

create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  status task_status default 'pending',
  estimated_pomodoros int default 1,
  completed_pomodoros int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table tasks enable row level security;

create policy "Users can view their own tasks." on tasks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own tasks." on tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tasks." on tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tasks." on tasks
  for delete using (auth.uid() = user_id);

-- Create timers table for synchronization
create type timer_status as enum ('idle', 'running', 'paused');
create type timer_mode as enum ('pomodoro', 'short_break', 'long_break');

create table timers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null unique,
  status timer_status default 'idle',
  mode timer_mode default 'pomodoro',
  start_time timestamp with time zone, -- When the timer started (if running)
  paused_at timestamp with time zone, -- When it was paused
  remaining_time int default 1500, -- Remaining seconds when paused or initial
  duration int default 1500, -- Total duration of current mode
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table timers enable row level security;

create policy "Users can view their own timer." on timers
  for select using (auth.uid() = user_id);

create policy "Users can insert their own timer." on timers
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own timer." on timers
  for update using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.timers (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Realtime subscriptions
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table timers;
