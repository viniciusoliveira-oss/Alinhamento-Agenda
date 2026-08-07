-- Create Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);

-- Create Users table
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  requires_password_change BOOLEAN NOT NULL DEFAULT true,
  team_id UUID REFERENCES teams(id)
);

-- Create Predefined Reasons table
CREATE TABLE IF NOT EXISTS predefined_reasons (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,
  label TEXT NOT NULL
);

-- Create Periods table
CREATE TABLE IF NOT EXISTS periods (
  id UUID PRIMARY KEY,
  label TEXT NOT NULL
);

-- Create Situations table
CREATE TABLE IF NOT EXISTS situations (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  author_name TEXT NOT NULL,
  attendant_name TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  type TEXT NOT NULL,
  predefined_reason_id UUID REFERENCES predefined_reasons(id),
  period_id UUID REFERENCES periods(id),
  system_protocol TEXT NOT NULL,
  voalle_protocol TEXT,
  os_report TEXT,
  situation_report TEXT,
  created_at TEXT NOT NULL
);
