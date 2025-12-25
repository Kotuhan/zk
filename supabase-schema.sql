-- Створення таблиці projects
-- Виконайте цей SQL в Supabase SQL Editor

-- Таблиця для зберігання проектів
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  state jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Додамо індекс для швидкого пошуку по user_id
create index if not exists projects_user_id_idx on public.projects(user_id);

-- Додамо індекс для сортування по даті оновлення
create index if not exists projects_updated_at_idx on public.projects(updated_at desc);

-- Row Level Security (RLS)
alter table public.projects enable row level security;

-- Політика: користувачі можуть читати тільки свої проекти
create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

-- Політика: користувачі можуть створювати свої проекти
create policy "Users can create their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

-- Політика: користувачі можуть оновлювати свої проекти
create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

-- Політика: користувачі можуть видаляти свої проекти
create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Тригер для автоматичного оновлення updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_projects_updated
  before update on public.projects
  for each row
  execute procedure public.handle_updated_at();
