CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gitlab_user_id INTEGER UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    display_name VARCHAR(255),
    avatar_url TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gitlab_project_id INTEGER NOT NULL,
    project_path VARCHAR(500) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_url TEXT,
    webhook_id INTEGER,
    webhook_secret VARCHAR(64),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    repo_id UUID REFERENCES repositories(id),
    gitlab_pipeline_id INTEGER,
    gitlab_issue_iid INTEGER,
    gitlab_issue_url TEXT,
    status VARCHAR(50) DEFAULT 'analyzing',
    severity VARCHAR(20) DEFAULT 'warning',
    pipeline_analysis JSONB,
    breaking_commit JSONB,
    code_context JSONB,
    ownership JSONB,
    recovery_plan JSONB,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    dismissed_by UUID REFERENCES users(id),
    dismissed_at TIMESTAMPTZ,
    dismissed_reason TEXT,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    agents_completed_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    diagnosis_seconds INTEGER,
    resolution_seconds INTEGER,
    pipeline_ref VARCHAR(255),
    pipeline_url TEXT,
    error_type VARCHAR(100),
    error_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    agent_index INTEGER NOT NULL,
    status VARCHAR(50),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    claude_tokens INTEGER,
    error_message TEXT,
    output_snapshot JSONB
);

CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    notification_email BOOLEAN DEFAULT TRUE,
    notification_slack BOOLEAN DEFAULT FALSE,
    slack_webhook_url TEXT,
    min_confidence FLOAT DEFAULT 0.6,
    lookback_hours INTEGER DEFAULT 48,
    agents_enabled JSONB DEFAULT '{"all": true}'::jsonb,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMPTZ DEFAULT NOW()
);