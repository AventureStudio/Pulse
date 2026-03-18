-- Function: update key result progress when check-in is created
create or replace function update_kr_on_checkin()
returns trigger as $$
begin
  update key_results set
    current_value = NEW.new_value,
    confidence = NEW.confidence,
    progress = case
      when metric_type = 'boolean' then
        case when NEW.new_value >= 1 then 100 else 0 end
      when target_value = start_value then 0
      else greatest(0, least(100,
        round(((NEW.new_value - start_value) / nullif(target_value - start_value, 0)) * 100)
      ))
    end,
    updated_at = now()
  where id = NEW.key_result_id;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_checkin_update_kr
after insert on check_ins
for each row execute function update_kr_on_checkin();

-- Function: update objective progress when key result changes
create or replace function update_objective_progress()
returns trigger as $$
begin
  update objectives set
    progress = coalesce((
      select round(avg(progress))
      from key_results
      where objective_id = NEW.objective_id
    ), 0),
    updated_at = now()
  where id = NEW.objective_id;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_kr_update_objective
after update of progress on key_results
for each row execute function update_objective_progress();

-- Generic updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger trg_objectives_updated_at before update on objectives
for each row execute function set_updated_at();

create trigger trg_key_results_updated_at before update on key_results
for each row execute function set_updated_at();
