-- Tables pour la collaboration temps réel

-- Versions des objectifs pour l'historique
create table objective_versions (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid references objectives(id) on delete cascade not null,
  version_number integer not null,
  changes jsonb not null,
  author_id uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

-- Commentaires sur les objectifs
create table objective_comments (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid references objectives(id) on delete cascade not null,
  author_id uuid references users(id) on delete set null,
  content text not null,
  field_name text, -- champ spécifique commenté
  position jsonb, -- position du curseur dans le texte
  parent_comment_id uuid references objective_comments(id) on delete cascade,
  resolved boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Suggestions sur les objectifs
create table objective_suggestions (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid references objectives(id) on delete cascade not null,
  author_id uuid references users(id) on delete set null,
  field_name text not null,
  original_value text,
  suggested_value text not null,
  reasoning text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Présences utilisateurs pour les curseurs temps réel
create table user_presence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  objective_id uuid references objectives(id) on delete cascade not null,
  cursor_position jsonb,
  active_field text,
  last_seen timestamptz default now(),
  unique(user_id, objective_id)
);

-- Index pour la performance
create index idx_objective_versions_objective on objective_versions(objective_id, version_number desc);
create index idx_objective_comments_objective on objective_comments(objective_id, created_at desc);
create index idx_objective_suggestions_objective on objective_suggestions(objective_id, status);
create index idx_user_presence_objective on user_presence(objective_id, last_seen desc);

-- Trigger pour nettoyer les présences inactives
create or replace function cleanup_old_presence()
returns trigger as $$
begin
  delete from user_presence 
  where last_seen < now() - interval '5 minutes';
  return null;
end;
$$ language plpgsql;

create trigger cleanup_presence_trigger
  after insert or update on user_presence
  execute function cleanup_old_presence();

-- Activer realtime pour les nouvelles tables
alter publication supabase_realtime add table objective_versions;
alter publication supabase_realtime add table objective_comments;
alter publication supabase_realtime add table objective_suggestions;
alter publication supabase_realtime add table user_presence;

-- RLS policies
alter table objective_versions enable row level security;
alter table objective_comments enable row level security;
alter table objective_suggestions enable row level security;
alter table user_presence enable row level security;

-- Policies pour les versions
create policy "Users can view objective versions they have access to"
  on objective_versions for select
  using (exists (
    select 1 from objectives o
    where o.id = objective_versions.objective_id
  ));

create policy "Users can create objective versions"
  on objective_versions for insert
  with check (auth.uid() = author_id);

-- Policies pour les commentaires
create policy "Users can view objective comments they have access to"
  on objective_comments for select
  using (exists (
    select 1 from objectives o
    where o.id = objective_comments.objective_id
  ));

create policy "Users can create and update their own comments"
  on objective_comments for all
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Policies pour les suggestions
create policy "Users can view objective suggestions they have access to"
  on objective_suggestions for select
  using (exists (
    select 1 from objectives o
    where o.id = objective_suggestions.objective_id
  ));

create policy "Users can create their own suggestions"
  on objective_suggestions for insert
  with check (auth.uid() = author_id);

create policy "Users can update suggestions on their objectives"
  on objective_suggestions for update
  using (exists (
    select 1 from objectives o
    where o.id = objective_suggestions.objective_id
    and o.owner_id = auth.uid()
  ));

-- Policies pour la présence
create policy "Users can view presence on objectives they have access to"
  on user_presence for select
  using (exists (
    select 1 from objectives o
    where o.id = user_presence.objective_id
  ));

create policy "Users can manage their own presence"
  on user_presence for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);