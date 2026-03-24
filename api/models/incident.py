from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class Incident(BaseModel):
    id: str
    user_id: str
    repo_id: str
    gitlab_pipeline_id: Optional[int] = None
    gitlab_issue_iid: Optional[int] = None
    gitlab_issue_url: Optional[str] = None
    status: str
    severity: str
    pipeline_analysis: Dict[str, Any] = Field(default_factory=dict)
    breaking_commit: Dict[str, Any] = Field(default_factory=dict)
    code_context: Dict[str, Any] = Field(default_factory=dict)
    ownership: Dict[str, Any] = Field(default_factory=dict)
    recovery_plan: Dict[str, Any] = Field(default_factory=dict)
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    dismissed_by: Optional[str] = None
    dismissed_at: Optional[str] = None
    dismissed_reason: Optional[str] = None
    triggered_at: Optional[str] = None
    agents_completed_at: Optional[str] = None
    resolved_at: Optional[str] = None
    diagnosis_seconds: Optional[int] = None
    resolution_seconds: Optional[int] = None
    pipeline_ref: Optional[str] = None
    pipeline_url: Optional[str] = None
    error_type: Optional[str] = None
    error_summary: Optional[str] = None
    created_at: Optional[str] = None
    title: Optional[str] = None
    type: Optional[str] = None


class AgentRun(BaseModel):
    id: str
    incident_id: str
    agent_name: str
    agent_index: int
    status: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    duration_ms: Optional[int] = None
    claude_tokens: Optional[int] = None
    error_message: Optional[str] = None
    output_snapshot: Optional[Dict[str, Any]] = None


class RetryAgentRequest(BaseModel):
    agent_name: str


class DismissIncidentRequest(BaseModel):
    reason: Optional[str] = None


class IncidentListResponse(BaseModel):
    items: List[Incident]
    total: int
    limit: int
    offset: int