-- Enable RLS
alter table users enable row level security;
alter table teams enable row level security;
alter table periods enable row level security;
alter table objectives enable row level security;
alter table key_results enable row level security;
alter table check_ins enable row level security;

-- Open policies for now (tighten later when auth is implemented)
create policy "Allow all on users" on users for all using (true) with check (true);
create policy "Allow all on teams" on teams for all using (true) with check (true);
create policy "Allow all on periods" on periods for all using (true) with check (true);
create policy "Allow all on objectives" on objectives for all using (true) with check (true);
create policy "Allow all on key_results" on key_results for all using (true) with check (true);
create policy "Allow all on check_ins" on check_ins for all using (true) with check (true);
