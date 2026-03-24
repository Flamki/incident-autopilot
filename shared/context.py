from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PipelineSection(BaseModel):
    failed_job_id: Optional[int] = None
    failed_stage: Optional[str] = None
    failed_job: Optional[str] = None
    error_type: Optional[str] = None
    error_summary: Optional[str] = None
    key_log_lines: List[str] = Field(default_factory=list)
    affected_files: List[str] = Field(default_factory=list)
    confidence: float = 0.0


class IncidentContext(BaseModel):
    incident_id: str
    triggered_at: str
    trigger_type: str
    project_id: int
    project_path: str
    pipeline_id: Optional[int] = None
    pipeline_ref: Optional[str] = None
    pipeline_url: Optional[str] = None
    pipeline: Dict[str, Any] = Field(default_factory=dict)
    breaking_commit: Dict[str, Any] = Field(default_factory=dict)
    code_context: Dict[str, Any] = Field(default_factory=dict)
    ownership: Dict[str, Any] = Field(default_factory=dict)
    recovery_plan: Dict[str, Any] = Field(default_factory=dict)


def validate_context(raw: Dict[str, Any]) -> IncidentContext:
    return IncidentContext.model_validate(raw)