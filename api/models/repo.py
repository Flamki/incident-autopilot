from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class Repository(BaseModel):
    id: str
    user_id: str
    gitlab_project_id: int
    project_path: str
    project_name: str
    project_url: Optional[str] = None
    webhook_id: Optional[int] = None
    webhook_secret: Optional[str] = None
    is_active: bool = True
    created_at: Optional[str] = None
    health: Optional[int] = None
    branch: Optional[str] = None
    active_incidents: Optional[int] = None
    agents: Optional[int] = None
    type: Optional[str] = None


class CreateRepositoryRequest(BaseModel):
    gitlab_project_id: int
    project_path: Optional[str] = None
    project_name: Optional[str] = None
    project_url: Optional[str] = None
    webhook_id: Optional[int] = None
    webhook_secret: Optional[str] = None
    branch: Optional[str] = 'main'
    type: Optional[str] = 'Service'


class RepoTestResponse(BaseModel):
    status: str
    latency: int


class GitLabProjectSummary(BaseModel):
    id: int
    path_with_namespace: str
    name: str
    web_url: Optional[str] = None
    default_branch: Optional[str] = None
