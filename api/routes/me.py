from __future__ import annotations

from fastapi import APIRouter, Depends

from api.core.deps import get_current_user_id
from api.db.store import store
from api.models.user import InviteResponse, InviteTeamMemberRequest, TeamMember, User

router = APIRouter()


@router.get('', response_model=User)
async def me(user_id: str = Depends(get_current_user_id)):
    user = store.get_user(user_id)
    return User.model_validate(user)


@router.get('/team', response_model=list[TeamMember])
async def get_team(user_id: str = Depends(get_current_user_id)):
    del user_id
    return [TeamMember.model_validate(member) for member in store.get_team()]


@router.post('/team/invite', response_model=InviteResponse)
async def invite_team_member(body: InviteTeamMemberRequest, user_id: str = Depends(get_current_user_id)):
    store.add_team_invite({'requested_by': user_id, 'email': body.email, 'role': body.role})
    return InviteResponse(message=f'Invitation sent to {body.email}')