CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_created ON incidents(created_at DESC);
CREATE INDEX idx_agent_runs_incident ON agent_runs(incident_id);
CREATE INDEX idx_repositories_user_id ON repositories(user_id);