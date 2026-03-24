from __future__ import annotations

from typing import Any, Dict, List

from pydantic import BaseModel, Field


class DailyTrendPoint(BaseModel):
    name: str
    incidents: int
    mttr: int


class SeverityPoint(BaseModel):
    name: str
    value: int
    color: str


class AnalyticsSummary(BaseModel):
    mttr_seconds: int
    incident_count_30d: int
    active_incidents: int
    pending_approval: int
    resolved_incidents: int
    automation_rate: float
    agent_accuracy: float
    trends: List[DailyTrendPoint]
    severity_distribution: List[SeverityPoint]


class AgentMetric(BaseModel):
    agent_name: str
    runs: int
    success_rate: float
    avg_duration_ms: int
    total_tokens: int


class AgentMetricsResponse(BaseModel):
    items: List[AgentMetric] = Field(default_factory=list)