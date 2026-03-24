from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from api.core.deps import get_current_user_id, get_current_username
from api.db.store import store
from api.models.user import InviteResponse, InviteTeamMemberRequest, TeamMember, User

router = APIRouter()


@router.get('', response_model=User)
async def me(
    request: Request,
    user_id: str = Depends(get_current_user_id),
    username: str = Depends(get_current_username),
):
    del request
    user = store.get_user(user_id)
    if not user:
        user = {
            'id': user_id,
            'gitlab_user_id': 0,
            'username': username or 'user',
            'email': None,
            'display_name': username or 'User',
            'avatar_url': None,
            'created_at': None,
            'updated_at': None,
        }
    return User.model_validate(user)


@router.get('/team', response_model=list[TeamMember])
async def get_team(user_id: str = Depends(get_current_user_id)):
    del user_id
    return [TeamMember.model_validate(member) for member in store.get_team()]


@router.post('/team/invite', response_model=InviteResponse)
async def invite_team_member(body: InviteTeamMemberRequest, user_id: str = Depends(get_current_user_id)):
    store.add_team_invite({'requested_by': user_id, 'email': body.email, 'role': body.role})
    return InviteResponse(message=f'Invitation sent to {body.email}')
