-- Supabase Database Setup

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (extends Supabase Auth users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  username text unique not null,
  role text not null check (role in ('admin', 'gestor', 'supervisor', 'atendente')),
  requires_password_change boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Create teams table
create table teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for teams
alter table teams enable row level security;
create policy "Teams are viewable by everyone." on teams for select using (true);
create policy "Only admins and gestores can modify teams." on teams for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'gestor'))
);

-- Create situations table
create table situations (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  client text not null,
  type text not null check (type in ('cancelamento', 'reagendamento', 'erro')),
  reason text not null,
  description text,
  period text not null,
  userId uuid references profiles(id) on delete set null,
  teamId uuid references teams(id) on delete set null,
  status text not null default 'pendente' check (status in ('pendente', 'tratado')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for situations
alter table situations enable row level security;
create policy "Situations are viewable by authenticated users." on situations for select using (auth.role() = 'authenticated');
create policy "Users can insert situations." on situations for insert with check (auth.role() = 'authenticated');
create policy "Users can update situations." on situations for update using (auth.role() = 'authenticated');

-- Create predefined_reasons table
create table predefined_reasons (
  id uuid default uuid_generate_v4() primary key,
  type text not null,
  label text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table predefined_reasons enable row level security;
create policy "Reasons are viewable by everyone." on predefined_reasons for select using (true);

-- Create periods table
create table periods (
  id uuid default uuid_generate_v4() primary key,
  label text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table periods enable row level security;
create policy "Periods are viewable by everyone." on periods for select using (true);

-- Seed data for periods and reasons
insert into periods (label) values ('Manhã'), ('Tarde'), ('Noite'), ('Madrugada');
insert into predefined_reasons (type, label) values 
  ('cancelamento', 'Cliente ausente'),
  ('cancelamento', 'Endereço incorreto'),
  ('reagendamento', 'Erro interno'),
  ('reagendamento', 'Falta de material'),
  ('erro', 'Falha de Hardware'),
  ('erro', 'Instabilidade de Rede');
