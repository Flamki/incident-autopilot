from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    id: str
    gitlab_user_id: int
    username: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class TeamMember(BaseModel):
    id: str
    name: str
    username: str
    role: str
    email: str
    expertise: List[str]
    score: float
    incidents: int
    status: str
    initials: str


class InviteTeamMemberRequest(BaseModel):
    email: EmailStr
    role: str = Field(default='Engineer')


class InviteResponse(BaseModel):
    message: str


class AuthResponse(BaseModel):
    token: str
    user: User


class RefreshResponse(BaseModel):
    token: str