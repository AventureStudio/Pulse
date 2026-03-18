-- Objectives
create table objectives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  level text not null check (level in ('company', 'team', 'individual')),
  owner_id uuid references users(id) on delete set null,
  team_id uuid references teams(id) on delete set null,
  period_id uuid references periods(id) on delete cascade not null,
  parent_objective_id uuid references objectives(id) on delete set null,
  status text default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
  progress integer default 0 check (progress >= 0 and progress <= 100),
  confidence text default 'on_track' check (confidence in ('on_track', 'at_risk', 'off_track')),
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Key Results
create table key_results (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid references objectives(id) on delete cascade not null,
  title text not null,
  description text default '',
  metric_type text default 'number' check (metric_type in ('number', 'percentage', 'currency', 'boolean')),
  start_value numeric default 0,
  current_value numeric default 0,
  target_value numeric not null,
  unit text default '',
  progress integer default 0 check (progress >= 0 and progress <= 100),
  confidence text default 'on_track' check (confidence in ('on_track', 'at_risk', 'off_track')),
  owner_id uuid references users(id) on delete set null,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Check-ins
create table check_ins (
  id uuid primary key default gen_random_uuid(),
  key_result_id uuid references key_results(id) on delete cascade not null,
  author_id uuid references users(id) on delete set null,
  previous_value numeric not null,
  new_value numeric not null,
  confidence text not null check (confidence in ('on_track', 'at_risk', 'off_track')),
  note text default '',
  created_at timestamptz default now()
);

-- Indexes
create index idx_objectives_period on objectives(period_id);
create index idx_objectives_owner on objectives(owner_id);
create index idx_objectives_team on objectives(team_id);
create index idx_objectives_parent on objectives(parent_objective_id);
create index idx_objectives_level_period on objectives(level, period_id);
create index idx_key_results_objective on key_results(objective_id);
create index idx_check_ins_key_result on check_ins(key_result_id);
create index idx_check_ins_created on check_ins(created_at desc);
