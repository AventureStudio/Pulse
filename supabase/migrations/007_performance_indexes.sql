-- Performance indexes for dashboard queries

-- Index on objectives for dashboard filtering
CREATE INDEX IF NOT EXISTS idx_objectives_period_level 
ON objectives(period_id, level, status);

-- Index on objectives for recent updates
CREATE INDEX IF NOT EXISTS idx_objectives_updated_at 
ON objectives(updated_at DESC);

-- Index on objectives for owner/team queries
CREATE INDEX IF NOT EXISTS idx_objectives_owner_team 
ON objectives(owner_id, team_id) WHERE owner_id IS NOT NULL OR team_id IS NOT NULL;

-- Index on key_results for objective counting
CREATE INDEX IF NOT EXISTS idx_key_results_objective 
ON key_results(objective_id);

-- Index on check_ins for recent activity
CREATE INDEX IF NOT EXISTS idx_check_ins_key_result_created 
ON check_ins(key_result_id, created_at DESC);

-- Index on check_ins for confidence tracking
CREATE INDEX IF NOT EXISTS idx_check_ins_confidence 
ON check_ins(key_result_id, confidence, created_at DESC);

-- Partial index for active periods
CREATE INDEX IF NOT EXISTS idx_periods_active 
ON periods(is_active) WHERE is_active = true;

-- Composite index for user team queries
CREATE INDEX IF NOT EXISTS idx_users_team_active 
ON users(team_id, onboarded) WHERE team_id IS NOT NULL;

-- Add materialized view for dashboard stats (optional, comment out if not needed)
-- CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
-- SELECT 
--   period_id,
--   level,
--   COUNT(*) as total_objectives,
--   COUNT(*) FILTER (WHERE confidence = 'on_track') as on_track_count,
--   COUNT(*) FILTER (WHERE confidence = 'at_risk') as at_risk_count,
--   COUNT(*) FILTER (WHERE confidence = 'off_track') as off_track_count,
--   AVG(progress) as avg_progress
-- FROM objectives
-- WHERE status != 'archived'
-- GROUP BY period_id, level;

-- Create unique index for materialized view refresh
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_unique 
-- ON dashboard_stats(period_id, level);

-- Function to refresh materialized view (uncomment if using materialized view)
-- CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
-- RETURNS void AS $$
-- BEGIN
--   REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
-- END;
-- $$ LANGUAGE plpgsql;

-- Analyze tables to update statistics
ANALYZE objectives;
ANALYZE key_results;
ANALYZE check_ins;
ANALYZE periods;
ANALYZE users;