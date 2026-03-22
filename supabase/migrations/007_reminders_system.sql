-- Reminders table
create table reminders (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid references objectives(id) on delete cascade not null,
  key_result_id uuid references key_results(id) on delete cascade,
  trigger_type text not null check (trigger_type in ('due_date', 'no_update', 'progress_stale')),
  frequency text not null check (frequency in ('daily', 'weekly', 'bi-weekly', 'monthly')),
  is_active boolean default true,
  last_sent_at timestamptz,
  next_send_at timestamptz not null,
  escalation_rules jsonb default '[]',
  custom_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reminder logs table
create table reminder_logs (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid references reminders(id) on delete cascade not null,
  status text not null check (status in ('pending', 'sent', 'completed', 'cancelled')),
  recipient_id uuid references users(id) on delete set null,
  escalation_level text not null check (escalation_level in ('owner', 'team_lead', 'manager', 'admin')),
  sent_at timestamptz,
  read_at timestamptz,
  action_taken boolean default false,
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_reminders_objective on reminders(objective_id);
create index idx_reminders_key_result on reminders(key_result_id);
create index idx_reminders_next_send on reminders(next_send_at, is_active);
create index idx_reminder_logs_reminder on reminder_logs(reminder_id);
create index idx_reminder_logs_recipient on reminder_logs(recipient_id);
create index idx_reminder_logs_status on reminder_logs(status);

-- Function to calculate next reminder date based on frequency
create or replace function calculate_next_reminder_date(current_date timestamptz, frequency text)
returns timestamptz as $$
begin
  case frequency
    when 'daily' then return current_date + interval '1 day';
    when 'weekly' then return current_date + interval '1 week';
    when 'bi-weekly' then return current_date + interval '2 weeks';
    when 'monthly' then return current_date + interval '1 month';
    else return current_date + interval '1 week';
  end case;
end;
$$ language plpgsql;

-- Function to get escalation recipients based on objective hierarchy
create or replace function get_escalation_recipients(obj_id uuid, escalation_level text)
returns uuid[] as $$
declare
  recipients uuid[];
  obj_record record;
begin
  select * into obj_record from objectives o
  left join teams t on o.team_id = t.id
  where o.id = obj_id;
  
  case escalation_level
    when 'owner' then
      recipients := array[obj_record.owner_id];
    when 'team_lead' then
      -- Get team manager/lead users
      select array_agg(u.id) into recipients
      from users u
      where u.team_id = obj_record.team_id
      and u.role in ('manager', 'admin');
    when 'manager' then
      -- Get parent team managers
      with recursive team_hierarchy as (
        select id, parent_team_id, 1 as level
        from teams
        where id = obj_record.team_id
        union all
        select t.id, t.parent_team_id, th.level + 1
        from teams t
        join team_hierarchy th on t.id = th.parent_team_id
        where th.level < 3
      )
      select array_agg(distinct u.id) into recipients
      from users u
      join team_hierarchy th on u.team_id = th.id
      where u.role in ('manager', 'admin')
      and th.level > 1;
    when 'admin' then
      select array_agg(u.id) into recipients
      from users u
      where u.role = 'admin';
  end case;
  
  return coalesce(recipients, array[]::uuid[]);
end;
$$ language plpgsql;

-- Function to process reminder escalation
create or replace function process_reminder_escalation(reminder_uuid uuid)
returns void as $$
declare
  reminder_record record;
  escalation_rule jsonb;
  recipients uuid[];
  recipient_id uuid;
begin
  -- Get reminder with escalation rules
  select * into reminder_record
  from reminders r
  where r.id = reminder_uuid and r.is_active = true;
  
  if not found then
    return;
  end if;
  
  -- Process each escalation rule
  for escalation_rule in select * from jsonb_array_elements(reminder_record.escalation_rules)
  loop
    if (escalation_rule->>'isActive')::boolean then
      recipients := get_escalation_recipients(
        reminder_record.objective_id,
        escalation_rule->>'level'
      );
      
      -- Create reminder log entries for each recipient
      foreach recipient_id in array recipients
      loop
        insert into reminder_logs (
          reminder_id,
          status,
          recipient_id,
          escalation_level
        ) values (
          reminder_uuid,
          'pending',
          recipient_id,
          escalation_rule->>'level'
        );
      end loop;
    end if;
  end loop;
  
  -- Update reminder last_sent_at and next_send_at
  update reminders
  set 
    last_sent_at = now(),
    next_send_at = calculate_next_reminder_date(now(), frequency),
    updated_at = now()
  where id = reminder_uuid;
end;
$$ language plpgsql;

-- Trigger to auto-update reminders updated_at
create or replace function update_reminder_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_reminder_updated_at
  before update on reminders
  for each row execute function update_reminder_updated_at();

-- Enable RLS
alter table reminders enable row level security;
alter table reminder_logs enable row level security;

-- RLS policies (open for now, to be tightened with proper auth)
create policy "Allow all on reminders" on reminders for all using (true) with check (true);
create policy "Allow all on reminder_logs" on reminder_logs for all using (true) with check (true);