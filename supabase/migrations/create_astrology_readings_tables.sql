-- supabase/migrations/create_astrology_readings_tables.sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create detailed readings table
create table public.astrology_readings (
  id               uuid       primary key default uuid_generate_v4(),
  user_id          uuid       references auth.users(id) on delete cascade,
  name             text       not null,
  date_of_birth    date       not null,
  time_of_birth    time       null,
  place_of_birth   jsonb      not null,   -- { city, state, country, lat, lng }
  gender           text       null,
  relationship_status text    null,
  focus_areas      text[]     null,
  struggles        text       null,
  goals            text       null,
  chart_data       jsonb      not null,   -- raw ephemeris output
  houses           jsonb      null,       -- house cusps data
  aspects          jsonb      null,       -- planetary aspects
  prompt_payload   jsonb      not null,   -- full JSON sent to OpenAI
  reading_result   text       not null,   -- OpenAI's response
  reading_type     text       default 'natal', -- natal, monthly, yearly, etc
  created_at       timestamp  default now(),
  updated_at       timestamp  default now()
);

-- Create indexes for better performance
create index idx_astrology_readings_user_id on public.astrology_readings(user_id);
create index idx_astrology_readings_created_at on public.astrology_readings(created_at);
create index idx_astrology_readings_type on public.astrology_readings(reading_type);

-- Enable RLS
alter table public.astrology_readings enable row level security;

-- Create RLS policies
create policy "Users can view own astrology readings" on public.astrology_readings
  for select using (auth.uid() = user_id);

create policy "Users can create own astrology readings" on public.astrology_readings
  for insert with check (auth.uid() = user_id);

create policy "Users can update own astrology readings" on public.astrology_readings
  for update using (auth.uid() = user_id);

create policy "Users can delete own astrology readings" on public.astrology_readings
  for delete using (auth.uid() = user_id);

-- Create function to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger
create trigger handle_astrology_readings_updated_at
  before update on public.astrology_readings
  for each row
  execute function public.handle_updated_at();

-- Create a view for easier querying
create view public.user_readings_summary as
select 
  id,
  user_id,
  name,
  date_of_birth,
  reading_type,
  created_at,
  jsonb_extract_path_text(chart_data, 'sun', 'sign') as sun_sign,
  jsonb_extract_path_text(chart_data, 'moon', 'sign') as moon_sign,
  jsonb_extract_path_text(chart_data, 'ascendant', 'sign') as rising_sign
from public.astrology_readings;