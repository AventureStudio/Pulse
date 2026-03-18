-- Users profile table (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  avatar_url text,
  role text not null default 'member' check (role in ('admin', 'manager', 'member')),
  team_id uuid,
  created_at timestamptz default now()
);

-- Teams
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  parent_team_id uuid references teams(id) on delete set null,
  created_at timestamptz default now()
);

-- Add FK for users.team_id after teams exists
alter table users add constraint users_team_id_fkey foreign key (team_id) references teams(id) on delete set null;

-- Periods (quarters, halves, etc.)
create table periods (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- Indexes
create index idx_users_team on users(team_id);
create index idx_teams_parent on teams(parent_team_id);
create index idx_periods_active on periods(is_active) where is_active = true;
