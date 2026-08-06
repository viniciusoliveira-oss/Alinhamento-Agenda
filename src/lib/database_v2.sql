-- Supabase Database Setup v2 (Sem RLS complexo para facilitar o protótipo)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create teams table
create table if not exists teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create app_users table (substitui profiles e auth.users)
create table if not exists app_users (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  username text unique not null,
  password text not null,
  role text not null check (role in ('admin', 'gestor', 'supervisor', 'atendente')),
  requires_password_change boolean default true,
  team_id uuid references teams(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create situations table
create table if not exists situations (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  date text not null,
  author_name text not null,
  attendant_name text not null,
  manager_name text not null,
  team_name text not null,
  type text not null,
  predefined_reason_id text,
  period_id text not null,
  system_protocol text,
  voalle_protocol text,
  os_report text,
  situation_report text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed initial admin
insert into app_users (name, username, password, role, requires_password_change) 
values ('Administrador', 'admin', 'Mudar@123', 'admin', true)
on conflict (username) do nothing;

-- Create predefined_reasons table
create table if not exists predefined_reasons (
  id uuid default uuid_generate_v4() primary key,
  type text not null,
  label text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create periods table
create table if not exists periods (
  id uuid default uuid_generate_v4() primary key,
  label text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed data for periods and reasons
insert into periods (label) values ('Manhã'), ('Tarde'), ('Noite'), ('Madrugada');
insert into predefined_reasons (type, label) values 
  ('cancelamento', 'Cliente ausente'),
  ('cancelamento', 'Endereço incorreto'),
  ('reagendamento', 'Erro interno'),
  ('reagendamento', 'Falta de material'),
  ('erro', 'Falha de Hardware'),
  ('erro', 'Instabilidade de Rede');
